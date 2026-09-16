import { Toaster } from "sonner";
import KanbanBoard from "./components/kanbam/KanbanBoard";
import { useEffect, useMemo, useState } from "react";
import { useTasks } from "./hooks/useTasks";
import { TaskModal } from "./components/kanbam/TaskModal";
import { useTaskModalStore } from "./store/useTaskModalStore";
import { TableTask } from "./components/kanbam/TaskTable";
import { TaskFlow } from "./components/flow/TaskFlow";
import { useFlowStore } from "./components/flow/store/useFlowStore";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./components/ui/resizable";
import { endOfDay, isAfter, isBefore, parseISO, startOfDay } from "date-fns";
import { AppHeader } from "./components/AppHeader";
import { useNotificationSubscriptions } from "./hooks/useNotificationSubscriptions";
import { EstatisticasTasks } from "./components/commons/EstatisticasTasks";

export default function App() {
  useNotificationSubscriptions();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("app-theme") === "dark";
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
  const {
    tasks: dataTasks,
    users,
    selectedStatus,
    selectedView,
    search,
    dateRange,
    setStatus,
    fetchUsers,
    fetchTasksHistories,
  } = useTasks();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  return (
    <section className={isDarkMode ? "dark" : ""}>
      <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col gap-3">
        <Toaster position="top-center" richColors />
        <AppHeader isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        <EstatisticasTasks tasks={tasks} />
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
                minSize={500}
              >
                <TableTask data={filtrados} />
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
  );
}
