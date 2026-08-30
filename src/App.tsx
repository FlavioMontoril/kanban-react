import { useState, useEffect } from "react";
import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd";
import { useTaskStore } from "./store/useTaskStore";
import { KANBAN_COLUMNS, TaskStatus, type Task } from "./types/task";
import { TaskCard } from "./components/TaskCard";
import {
  Plus,
  LayoutList,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  Sun,
  Moon,
} from "lucide-react";
import { TaskModal } from "./components/kanbam/TaskModal";

export default function App() {
  const { tasks, addTask, updateTask, deleteTask, moveTask } = useTaskStore();

  // 1. Inicializa o estado do tema lendo do localStorage (padrão 'false' se não existir)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem("app-theme");
    return savedTheme === "dark";
  });

  // 2. Efeito para sincronizar a classe 'dark' na tag <html> e salvar no localStorage
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("app-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("app-theme", "light");
    }
  }, [isDarkMode]);

  // Função para alternar o tema
  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit" | "view";
    task: Task | null;
  }>({
    isOpen: false,
    mode: "create",
    task: null,
  });

  const handleDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;
    const targetStatus = destination.droppableId as TaskStatus;
    moveTask(draggableId, targetStatus);
  };

  const stats = {
    total: tasks.length,
    inProgress: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
    underReview: tasks.filter((t) => t.status === TaskStatus.UNDER_REVIEW)
      .length,
    done: tasks.filter((t) => t.status === TaskStatus.DONE).length,
    cancelado: tasks.filter((t) => t.status === TaskStatus.CANCELED).length,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-8 font-sans antialiased text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="w-full mx-auto space-y-6">
        {/* Cabeçalho com Botão do Modo Escuro */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 dark:from-slate-100 dark:via-indigo-200 dark:to-indigo-400 bg-clip-text text-transparent">
              Kanban Board
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Gerenciador de Tarefas Inteligente
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Botão para alternar Modo Escuro salvo no localStorage */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title={
                isDarkMode
                  ? "Alternar para Modo Claro"
                  : "Alternar para Modo Escuro"
              }
            >
              {isDarkMode ? (
                <Sun size={18} className="text-amber-400" />
              ) : (
                <Moon size={18} />
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                setModalState({ isOpen: true, mode: "create", task: null })
              }
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition cursor-pointer"
            >
              <Plus size={18} /> Nova Tarefa
            </button>
          </div>
        </header>

        {/* Métricas */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
              <LayoutList size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Total
              </p>
              <h3 className="text-xl font-black">{stats.total}</h3>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-xl text-amber-600 dark:text-amber-400">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Em Progresso
              </p>
              <h3 className="text-xl font-black">{stats.inProgress}</h3>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/50 rounded-xl text-purple-600 dark:text-purple-400">
              <Eye size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Em Revisão
              </p>
              <h3 className="text-xl font-black">{stats.underReview}</h3>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Concluído
              </p>
              <h3 className="text-xl font-black">{stats.done}</h3>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-red-50 dark:bg-red-950/50 rounded-xl text-red-600 dark:text-red-400">
              <XCircle size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Cancelado
              </p>
              <h3 className="text-xl font-black">{stats.cancelado}</h3>
            </div>
          </div>
        </section>

        {/* Board Kanban */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <main className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start w-full">
            {KANBAN_COLUMNS.map((col) => {
              const columnTasks = tasks.filter((t) => t.status === col.id);

              return (
                <div
                  key={col.id}
                  className="bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 flex flex-col min-h-[500px]"
                >
                  <div className="flex justify-between items-center mb-3 px-1">
                    <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200">
                      {col.label}
                    </h3>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-200/80 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      {columnTasks.length}
                    </span>
                  </div>

                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 rounded-xl transition-colors p-1 ${
                          snapshot.isDraggingOver
                            ? "bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-200 dark:ring-indigo-800"
                            : ""
                        }`}
                      >
                        {columnTasks.map((task, index) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            index={index}
                            onView={(t) =>
                              setModalState({
                                isOpen: true,
                                mode: "view",
                                task: t,
                              })
                            }
                            onEdit={(t) =>
                              setModalState({
                                isOpen: true,
                                mode: "edit",
                                task: t,
                              })
                            }
                            onDelete={deleteTask}
                          />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </main>
        </DragDropContext>
      </div>

      <TaskModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        task={modalState.task}
        onClose={() =>
          setModalState({ isOpen: false, mode: "create", task: null })
        }
        onSave={(formData) => {
          if (modalState.mode === "create") {
            addTask(formData);
          } else if (modalState.mode === "edit" && modalState.task) {
            updateTask(modalState.task.id, formData);
          }
        }}
      />
    </div>
  );
}
