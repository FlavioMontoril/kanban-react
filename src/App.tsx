import { Toaster } from "sonner";
import KanbanBoard from "./components/kanbam/KanbanBoard";
import { TabsViews } from "./components/commons/tasbs-views";
import { useEffect, useState } from "react";
import { Moon, Plus, Sun } from "lucide-react";
import { useTasks } from "./hooks/useTasks";
import { TaskModal } from "./components/kanbam/TaskModal";
import { useTaskModalStore } from "./store/useTaskModalStore";
import { TableTask } from "./components/kanbam/TaskTable";
import { TaskFlow } from "./components/flow/TaskFlow";
import { useFlowStore } from "./components/flow/store/useFlowStore";
import type { TaskStatus } from "./types/task";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./components/ui/resizable";

type optionsView = "kanban" | "Workflows" | string;

export default function App() {
  const [selectedView, setSelectedView] = useState<optionsView>(() => {
    return localStorage.getItem("view-mode") || "kanban";
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("app-theme") === "dark";
  });

  const [tableStatus, setTableStatus] = useState<TaskStatus | null>(null);

  const { setSelectedTaskId, selectedTaskId } = useFlowStore();
  const { isOpen, mode, task, openModal, closeModal } = useTaskModalStore();
  const {
    tasks: dataTasks,
    users,
    fetchUsers,
    fetchTasks,
    fetchTasksPaged,
    fetchTasksHistories,
    currentPage: page,
    size,
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

  // 1. Carrega as tarefas vindas do backend Spring Boot na montagem
  useEffect(() => {
    if (selectedView === "Workflows") {
      const cleanStatus = (tableStatus && tableStatus) || undefined;
      fetchTasksPaged(cleanStatus, page, size);
    } else {
      fetchTasks();
    }
  }, [fetchTasks, fetchTasksPaged, tableStatus, page, size]);

  useEffect(() => {
    localStorage.setItem("view-mode", selectedView);
    if (selectedView !== "Workflows") {
      setSelectedTaskId(null);
      setTableStatus(null);
    }
  }, [selectedView]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const nextTheme = !prev;
      localStorage.setItem("app-theme", nextTheme ? "dark" : "light");
      return nextTheme;
    });
  };

  const tasks = Array.isArray(dataTasks) ? dataTasks : [];

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col ">
        <Toaster position="top-center" richColors />
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <TabsViews value={selectedView} onSelect={setSelectedView} />
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title={
                isDarkMode
                  ? "Alternar para Modo Claro"
                  : "Alternar para Modo Escuro"
              }
            >
              {isDarkMode ? (
                <Sun size={18} className="text-amber-400" />
              ) : (
                <Moon size={18} className="hover:text-black" />
              )}
            </button>
          </div>
          <button
            type="button"
            onClick={() => openModal("create")}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 text-sm rounded-xl shadow-md transition cursor-pointer"
          >
            <Plus size={16} /> Nova Tarefa
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          {selectedView === "kanban" && <KanbanBoard tasks={tasks} />}
          {selectedView === "Workflows" && (
            <ResizablePanelGroup
              key={selectedTaskId ? "split-mode" : "full-mode"}
              orientation="horizontal"
              className="min-h-[200px] w-full rounded-lg border"
            >
              <ResizablePanel
                defaultSize={selectedTaskId ? 30 : 100}
                minSize={500}
              >
                <TableTask
                  onSelectStaus={(status) => setTableStatus(status ?? null)}
                  data={tasks}
                />
              </ResizablePanel>
              {selectedTaskId && (
                <>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize="70%">
                    <TaskFlow data={tasks} />
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          )}
        </div>
      </div>

      {/* Modal para Criação/Edição/Visualização */}
      <TaskModal
        isOpen={isOpen}
        mode={mode}
        users={users}
        task={task}
        onClose={closeModal}
      />
    </div>
  );
}
