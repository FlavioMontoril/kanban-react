import { useEffect } from "react";
import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd";
import { useTasks } from "@/hooks/useTasks";
import { KANBAN_COLUMNS, TaskStatus, type Task } from "@/types/task";
import { toast } from "sonner";
import { TaskCard } from "./TaskCard";
import { getIcon, getIconColor } from "./utils/border-color";
import { VirtualizedTaskList } from "./virtualized-task-list";

interface IKanbanBoard {
  tasks: Task[];
}

export default function KanbanBoard({ tasks }: IKanbanBoard) {
  const { loading, fetchTasks, moveTaskStatus } = useTasks();

  // 1. Carrega as tarefas vindas do backend Spring Boot na montagem
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // 4. Handler do Drag & Drop no Board
  const handleDragEnd = async (result: DropResult) => {
    const { destination, draggableId } = result;

    if (!destination) return;

    const task = tasks.find((t) => t.id === draggableId);

    if (!task) return;

    // Tarefa cancelada não pode ser movimentada
    if (task.status === TaskStatus.CANCELED) {
      toast.error("Ação não permitida", {
        description: "Tarefas canceladas não podem ter o status alterado.",
      });
      return;
    }

    const targetStatus = destination.droppableId as TaskStatus;

    if (task.status === targetStatus) {
      return;
    }

    await moveTaskStatus(draggableId, targetStatus);
  };

  // 5. Cálculo das métricas e contadores de tarefas
  const stats = {
    total: tasks.length,
    open: tasks.filter((t) => t.status === TaskStatus.OPEN).length,
    inProgress: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
    underReview: tasks.filter((t) => t.status === TaskStatus.UNDER_REVIEW)
      .length,
    done: tasks.filter((t) => t.status === TaskStatus.DONE).length,
    cancelado: tasks.filter((t) => t.status === TaskStatus.CANCELED).length,
  };

  return (
    <>
      {/* Wrapper Fixo: h-screen e overflow-hidden para travar a janela inteira */}
      <div className="flex-1 h-full w-full bg-slate-50 dark:bg-slate-950 p-0 md:p-6 font-sans antialiased text-slate-800 dark:text-slate-100 transition-colors duration-200 overflow-hidden flex flex-col min-h-0">
        <div className="w-full mx-auto space-y-4 flex flex-col h-full overflow-hidden">
          {/* Cabeçalho (Fixo) */}
          <header className="flex-none flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight bg-linear-to from-slate-900 via-indigo-950 to-indigo-900 dark:from-slate-100 dark:via-indigo-200 dark:to-indigo-400 bg-clip-text text-black dark:text-slate-200">
                Kanban Board
              </h1>
              <div className="flex items-center">
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  {`Gerenciador de Tarefas Inteligente -`}
                </p>
                <p className="text-md text-violet-800 dark:text-slate-400 mt-0.5 font-bold">
                  {` Total de: ${stats.total}`}
                </p>
              </div>
            </div>
          </header>

          {/* Status de Sincronização */}
          {loading && (
            <div className="flex-none text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 animate-pulse">
              Sincronizando tarefas com o servidor...
            </div>
          )}

          {/* Quadro Kanban (Flex-1 + min-h-0 para respeitar limites estritos) */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <main className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-stretch w-full min-h-0 overflow-hidden">
              {KANBAN_COLUMNS.map((col) => {
                const columnTasks = tasks.filter((t) => t.status === col.id);

                return (
                  <div
                    key={col.id}
                    className="bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 flex flex-col h-full min-h-0 overflow-hidden"
                  >
                    {/* Título da Coluna */}
                    <div className="flex-none flex justify-between items-center mb-2 px-1">
                      <div className="flex items-center gap-2">
                        <div className={`${getIconColor(col.id)} rounded-3xl`}>
                          {getIcon(col.id)}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200">
                            {col.label}
                          </h3>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-200/80 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        {columnTasks.length}
                      </span>
                    </div>

                    {/* Área Droppable (Contida dentro da coluna sem transbordar) */}
                    {/* <Droppable droppableId={col.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 h-full overflow-y-auto rounded-xl transition-colors p-1 custom-scrollbar ${
                            snapshot.isDraggingOver
                              ? "bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-200 dark:ring-indigo-800 "
                              : ""
                          }`}
                        >
                          {columnTasks.map((task, index) => (
                            <TaskCard key={task.id} task={task} index={index} />
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable> */}
                    {/* Virtualização*/}
                    <Droppable droppableId={col.id}>
                      {(provided, snapshot) => (
                        <VirtualizedTaskList
                          columnTasks={columnTasks}
                          provided={provided}
                          isDraggingOver={snapshot.isDraggingOver}
                        />
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </main>
          </DragDropContext>
        </div>
      </div>
    </>
  );
}
