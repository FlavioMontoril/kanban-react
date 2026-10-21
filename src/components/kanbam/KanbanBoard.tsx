import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd";
import { useTasks } from "@/hooks/useTasks";
import { KANBAN_COLUMNS, TaskStatus, type Task } from "@/types/task";
import { toast } from "sonner";
import { getIcon, getIconColor } from "./utils/task-status.config";
import { VirtualizedTaskList } from "./virtualized-task-list";
import { TaskCardVirtualized } from "./TaskCardVirtualized";
import { Skeleton } from "../ui/skeleton";
import { useUserStore } from "@/store/useUserStore";
import { Plus } from "lucide-react";
import { useTaskModalStore } from "@/store/useTaskModalStore";
import { useBackgroundStore } from "@/store/useBackgroundStore";
import { memo } from "react";

interface IKanbanBoard {
  tasks: Task[];
}

export const KanbanBoard = memo(({ tasks }: IKanbanBoard) => {
  const { openModal } = useTaskModalStore();
  const { loading, moveTaskStatus } = useTasks();
  const { users } = useUserStore();

  // Consumir a store otimizada
  const { bgImage } = useBackgroundStore();

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

    if (task.status === targetStatus) return;

    setTimeout(() => {
      moveTaskStatus(draggableId, targetStatus);
    }, 0);
  };

  // Garante que é o primeiro carregamento inicial (sem tarefas na memória)
  const isInitialLoading = loading && (!tasks || tasks.length === 0);

  return (
    <>
      <div className="relative pt-20 md:pt-20 flex-1 h-full w-full p-4 overflow-hidden flex flex-col min-h-0">
        <div className="w-full mx-auto space-y-4 flex flex-col h-full overflow-hidden">
          {/* Header com os controlos */}
          <div className="flex-none flex items-center justify-between">
            <div className="flex-1 text-center">
              {loading && (
                <span
                  className={`text-xs font-semibold animate-pulse ${
                    bgImage
                      ? "text-indigo-200 bg-slate-900/40 py-1 px-3 rounded-full backdrop-blur-md border border-white/10"
                      : "text-indigo-600 dark:text-indigo-400"
                  }`}
                >
                  Sincronizando tarefas com o servidor...
                </span>
              )}
            </div>
          </div>

          {/* Quadro Kanban */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <main className="flex-1 flex items-stretch w-full min-h-0 gap-1 overflow-x-auto overflow-y-hidden pb-2 custom-scrollbar-horizontal">
              {KANBAN_COLUMNS.map((col) => {
                const columnTasks = tasks.filter((t) => t.status === col.id);

                return (
                  <div
                    key={col.id}
                    className={`flex-1 min-w-[465px] sm:min-w-[300px] max-w-[360px] mx-auto shrink-0 border rounded-lg flex flex-col h-full min-h-0  overflow-hidden transition-colors ${
                      bgImage
                        ? "bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-white/20 dark:border-slate-800/80 shadow-lg"
                        : "bg-slate-100/70 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex-none flex justify-between items-center bg-white border-b p-3">
                      <div className="flex items-center gap-2">
                        <div className={`${getIconColor(col.id)} rounded-3xl`}>
                          {getIcon(col.id)}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                            {col.label}
                          </h3>
                        </div>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-200/80 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          {columnTasks.length}
                        </span>
                      </div>
                      <button
                        onClick={() => openModal("create")}
                        title="Criar tarefa"
                        className="text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-transform hover:scale-110"
                      >
                        <Plus size={18} />
                      </button>
                    </div>

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
                      <Droppable
                        droppableId={col.id}
                        renderClone={(provided, snapshot, rubric) => {
                          const taskIndex = rubric.source.index;
                          const task = columnTasks[taskIndex];

                          if (!task) return null;

                          // Busca o avatar do único usuário responsável por essa tarefa
                          const taskUserAvatar = users.find(
                            (user) => user.id === task.userId,
                          );

                          return (
                            <TaskCardVirtualized
                              task={task}
                              user={taskUserAvatar!}
                              index={taskIndex}
                              provided={provided}
                              isDragging={snapshot.isDragging}
                            />
                          );
                        }}
                      >
                        {(provided, snapshot) => (
                          <VirtualizedTaskList
                            users={users}
                            columnTasks={columnTasks}
                            provided={provided}
                            isDraggingOver={snapshot.isDraggingOver}
                          />
                        )}
                      </Droppable>
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
});
