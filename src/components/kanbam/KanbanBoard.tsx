import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd";
import { useTasks } from "@/hooks/useTasks";
import { KANBAN_COLUMNS, TaskStatus, type Task } from "@/types/task";
import { toast } from "sonner";
import { getIcon, getIconColor } from "./utils/task-status.config";
import { VirtualizedTaskList } from "./virtualized-task-list";
import { TaskCardVirtualized } from "./TaskCardVirtualized";
import { Skeleton } from "../ui/skeleton";

interface IKanbanBoard {
  tasks: Task[];
}

export default function KanbanBoard({ tasks }: IKanbanBoard) {
  const { loading, moveTaskStatus } = useTasks();

  // 4. Handler do Drag & Drop no Board
  const handleDragEnd = (result: DropResult) => {
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

    setTimeout(() => {
      moveTaskStatus(draggableId, targetStatus);
    }, 0);
  };

  // Garante que é o primeiro carregamento inicial (sem tarefas na memória)
  const isInitialLoading = loading && (!tasks || tasks.length === 0);

  return (
    <>
      {/* Wrapper Fixo: h-screen e overflow-hidden para travar a janela inteira */}
      <div className="flex-1 h-full w-full bg-slate-50 dark:bg-slate-950 p-6 font-sans antialiased text-slate-800 dark:text-slate-100 transition-colors duration-200 overflow-hidden flex flex-col min-h-0">
        <div className="w-full mx-auto space-y-4 flex flex-col h-full overflow-hidden">
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
                    {/* <Droppable droppableId={col.id}>
                      {(provided, snapshot) => (
                        <VirtualizedTaskList
                          columnTasks={columnTasks}
                          provided={provided}
                          isDraggingOver={snapshot.isDraggingOver}
                        />
                      )}
                    </Droppable> */}
                    {isInitialLoading ? (
                      <div className="flex-1 space-y-2.5 overflow-hidden mt-1 [mask-image:linear-gradient(to_bottom,black_50%,transparent_100%)]">
                        {Array.from({ length: 7 }).map((_, index) => (
                          <div
                            key={index}
                            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 space-y-3 shadow-xs shrink-0"
                          >
                            <div className="flex items-center justify-between">
                              <Skeleton className="h-3 w-16" />
                              <Skeleton className="h-3 w-3 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <div className="flex items-center justify-between pt-1">
                              <Skeleton className="h-5 w-16 rounded-md" />
                              <Skeleton className="h-6 w-6 rounded-full" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        {/* Virtualização com suporte a Clone para Drag & Drop */}
                        <Droppable
                          droppableId={col.id}
                          renderClone={(provided, snapshot, rubric) => {
                            const taskIndex = rubric.source.index;
                            const task = columnTasks[taskIndex];

                            if (!task) return null;

                            return (
                              <TaskCardVirtualized
                                task={task}
                                index={taskIndex}
                                provided={provided}
                                isDragging={snapshot.isDragging}
                              />
                            );
                          }}
                        >
                          {(provided, snapshot) => (
                            <VirtualizedTaskList
                              columnTasks={columnTasks}
                              provided={provided}
                              isDraggingOver={snapshot.isDraggingOver}
                            />
                          )}
                        </Droppable>
                      </>
                    )}
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
