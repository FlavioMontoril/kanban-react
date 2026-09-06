import { Toaster } from "sonner";
import KanbanBoard from "./components/kanbam/KanbanBoard";
import { TabsViews } from "./components/commons/tasbs-views";
import { useEffect, useState } from "react";
import { Moon, Plus, Sun } from "lucide-react";
import { useTasks } from "./hooks/useTasks";
import { TaskModal } from "./components/kanbam/TaskModal";
import { useTaskModalStore } from "./store/useTaskModalStore";
import { TableTask } from "./components/kanbam/TaskTable";
import { SheetTask } from "./components/kanbam/SheetTask";
import { TaskFlow } from "./components/flow/TaskFlow";
import { useFlowStore } from "./components/flow/store/useFlowStore";

type optionsView = "kanban" | "tabela" | "fluxo" | string;

export default function App() {
  const [selectedView, setSelectedView] = useState<optionsView>(() => {
    return localStorage.getItem("view-mode") || "kanban";
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("app-theme") === "dark";
  });

  const { tasks: dataTasks } = useTasks();
  const { isOpen, mode, task, openModal, closeModal } = useTaskModalStore();
  const { setSelectedTaskId } = useFlowStore();

  useEffect(() => {
    localStorage.setItem("view-mode", selectedView);
    if (selectedView !== "fluxo") {
      setSelectedTaskId(null);
    }
  }, [selectedView]);

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

          {selectedView === "fluxo" ? (
            <>
              <SheetTask data={tasks} />
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => openModal("create")}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 text-sm rounded-xl shadow-md transition cursor-pointer"
              >
                <Plus size={16} /> Nova Tarefa
              </button>
            </>
          )}
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          {selectedView === "kanban" && <KanbanBoard tasks={tasks} />}
          {selectedView === "tabela" && <TableTask data={tasks} />}
          {selectedView === "fluxo" && <TaskFlow data={tasks} />}
        </div>
      </div>

      {/* Modal para Criação/Edição/Visualização */}
      <TaskModal isOpen={isOpen} mode={mode} task={task} onClose={closeModal} />
    </div>
  );
}
