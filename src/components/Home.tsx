import { Toaster } from "sonner";
import KanbanBoard from "./kanbam/KanbanBoard";
import { useEffect, useMemo, useState } from "react";
import { useTasks } from "../hooks/useTasks";
import { TaskModal } from "./kanbam/TaskModal";
import { useTaskModalStore } from "../store/useTaskModalStore";
import { TableTask } from "./kanbam/TaskTable";
import { TaskFlow } from "./flow/TaskFlow";
import { useFlowStore } from "./flow/store/useFlowStore";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import { endOfDay, isAfter, isBefore, parseISO, startOfDay } from "date-fns";
import { AppHeader } from "./AppHeader";
import { useNotificationSubscriptions } from "../hooks/useNotificationSubscriptions";
import { EstatisticasTasks } from "./commons/EstatisticasTasks";
import { TaskMetrics } from "./TaskMetrics";
import { AnimatePresence } from "framer-motion";
import { SplashScreen } from "./commons/SplashScreen";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/useAuthStore";

export function Home() {
  useNotificationSubscriptions();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("app-theme") === "dark";
  });
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    return !sessionStorage.getItem("has-seen-splash");
  });

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const nextTheme = !prev;
      localStorage.setItem("app-theme", nextTheme ? "dark" : "light");
      return nextTheme;
    });
  };

  const { setSelectedTaskId, selectedTaskId } = useFlowStore();
  const { isOpen, mode, task, closeModal } = useTaskModalStore();
  const { users, fetchUsers, fetchRoles } = useAuth();
  const {user} = useAuthStore()

  const {
    tasks: dataTasks,
    pageData,
    selectedStatus,
    selectedView,
    search,
    dateRange,
    setStatus,
    fetchTasksHistories,
  } = useTasks();

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  useEffect(() => {
    let isMounted = true;

    if (selectedTaskId) {
      fetchTasksHistories(selectedTaskId).then(() => {
        if (!isMounted) return;
      });
    }

    return () => {
      isMounted = false; // Cancela atualizações de requisições antigas
    };
  }, [selectedTaskId, fetchTasksHistories]);

  useEffect(() => {
    localStorage.setItem("view-mode", selectedView);
    if (selectedView !== "Workflows") {
      setSelectedTaskId(null);
      setStatus(null);
    }
  }, [selectedView, setSelectedTaskId, setStatus]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleFinishSplash = () => {
    // Marca na sessão que a splash já foi vista antes de escondê-la
    sessionStorage.setItem("has-seen-splash", "true");
    setShowSplash(false);
  };

  const tasks = useMemo(
    () => (Array.isArray(dataTasks) ? dataTasks : []),
    [dataTasks],
  );

  const filtrados = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((a) => {
      if (selectedStatus && a.status !== selectedStatus) return false;

      if (dateRange?.from && a.createdAt) {
        const dataCriacao = parseISO(a.createdAt);
        const inicio = startOfDay(dateRange.from);
        const fim = dateRange.to
          ? endOfDay(dateRange.to)
          : endOfDay(dateRange.from);

        if (isBefore(dataCriacao, inicio) || isAfter(dataCriacao, fim)) {
          return false;
        }
      }

      if (!q) return true;

      return [a.assignee, a.status, a.code, a.title, a.description, a.reporter]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [tasks, search, selectedStatus, dateRange]);

  const taskPerView = selectedView === "kanban" ? tasks : pageData;

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && (
          <SplashScreen key="splash-screen" onFinish={handleFinishSplash} />
        )}
      </AnimatePresence>
      <section className={isDarkMode ? "dark" : ""}>
        <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col gap-3">
          <Toaster position="top-center" richColors />
          <AppHeader user={user!} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
          {selectedView !== "metrics" && (
            <EstatisticasTasks tasks={taskPerView!} />
          )}
          <main className="flex-1 min-h-0 overflow-hidden">
            {selectedView === "kanban" && <KanbanBoard tasks={filtrados} />}
            {selectedView === "Workflows" && (
              <ResizablePanelGroup
                key={selectedTaskId ? "split-mode" : "full-mode"}
                orientation="horizontal"
                className="min-h-[200px] w-full"
              >
                <ResizablePanel
                  defaultSize={selectedTaskId ? 30 : 100}
                  minSize={290}
                >
                  <TableTask data={dataTasks} />
                </ResizablePanel>
                {selectedTaskId && (
                  <>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize="70%">
                      <TaskFlow
                        data={tasks.find((t) => t.id === selectedTaskId)}
                      />
                    </ResizablePanel>
                  </>
                )}
              </ResizablePanelGroup>
            )}
            {selectedView === "metrics" && <TaskMetrics />}
          </main>
        </div>

        <TaskModal
          isOpen={isOpen}
          mode={mode}
          users={users}
          task={task}
          onClose={closeModal}
        />
      </section>
    </>
  );
}
