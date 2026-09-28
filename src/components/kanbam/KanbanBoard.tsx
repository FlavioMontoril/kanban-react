import { useState, useRef, type ChangeEvent } from "react";
import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd";
import { useTasks } from "@/hooks/useTasks";
import { KANBAN_COLUMNS, TaskStatus, type Task } from "@/types/task";
import { toast } from "sonner";
import { getIcon, getIconColor } from "./utils/task-status.config";
import { VirtualizedTaskList } from "./virtualized-task-list";
import { TaskCardVirtualized } from "./TaskCardVirtualized";
import { Skeleton } from "../ui/skeleton";
import { useUserStore } from "@/store/useUserStore";
import {
  Plus,
  Image as ImageIcon,
  RotateCcw,
  Upload,
  Trash2,
} from "lucide-react";
import { useTaskModalStore } from "@/store/useTaskModalStore";
import { useBackgroundStore } from "@/store/useBackgroundStore";

interface IKanbanBoard {
  tasks: Task[];
}

export default function KanbanBoard({ tasks }: IKanbanBoard) {
  const { openModal } = useTaskModalStore();
  const { loading, moveTaskStatus } = useTasks();
  const { users } = useUserStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Consumir a store otimizada
  const {
    bgImage,
    customOption,
    setBgImage,
    setCustomBgImage,
    removeCustomBgImage,
  } = useBackgroundStore();

  const [showBgSelector, setShowBgSelector] = useState(false);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Formato inválido", {
          description: "Por favor, selecione um ficheiro de imagem válido.",
        });
        return;
      }
      setCustomBgImage(file);
      setShowBgSelector(false);
      toast.success("Plano de fundo atualizado!");
    }
    // Reseta o valor do input para permitir enviar o mesmo ficheiro novamente se necessário
    e.target.value = "";
  };

  const handleRemoveCustomBg = (e: React.MouseEvent) => {
    e.stopPropagation(); // Impede ativar o clique do container
    removeCustomBgImage();
    toast.success("Imagem removida com sucesso");
  };

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
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      <div
        className={`relative flex-1 h-full w-full font-sans antialiased text-slate-800 dark:text-slate-100 transition-colors duration-300 overflow-hidden flex flex-col min-h-0 ${
          bgImage
            ? "bg-cover bg-center bg-no-repeat rounded-2xl  border-2"
            : "bg-slate-50 bg-red-400  dark:bg-slate-950"
        }`}
        style={bgImage ? { backgroundImage: `url('${bgImage}')` } : {}}
      >
        {/* {bgImage && (
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        )} */}

        <div className="relative z-10 flex-1 h-full w-full p-6 overflow-hidden flex flex-col min-h-0">
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

              <div className="relative flex justify-end">
                <button
                  onClick={() => setShowBgSelector(!showBgSelector)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm cursor-pointer ${
                    bgImage
                      ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md dark:hover:bg-slate-800 border border-white/20 text-slate-800 dark:text-slate-100"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                  }`}
                >
                  <ImageIcon size={14} />
                  <span>Plano de Fundo</span>
                </button>

                {showBgSelector && (
                  <div className="absolute top-9 right-0 z-50 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-2 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">
                      Plano de Fundo
                    </p>

                    {/* Botão de carregar do Computador */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full text-left px-2 py-2 rounded-lg text-xs flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 font-semibold transition-colors border border-indigo-200/50 dark:border-indigo-800/50 cursor-pointer"
                    >
                      <Upload size={14} />
                      <span>
                        {customOption
                          ? "Trocar foto do PC..."
                          : "Enviar foto do PC..."}
                      </span>
                    </button>

                    <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                    <div className="space-y-1">
                      {/* Opção 1: Padrão */}
                      <div
                        onClick={() => {
                          setBgImage(null);
                          setShowBgSelector(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          bgImage === null
                            ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <span>Padrão (Sem Imagem)</span>
                        <RotateCcw size={12} className="opacity-60 shrink-0" />
                      </div>

                      {/* Opção 2: Única foto personalizada (se existir) */}
                      {customOption && (
                        <div
                          onClick={() => {
                            setBgImage(customOption.url);
                            setShowBgSelector(false);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            bgImage === customOption.url
                              ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <span className="truncate max-w-[160px]">
                            {customOption.label}
                          </span>

                          {/* Botão de eliminação visível */}
                          <button
                            type="button"
                            onClick={handleRemoveCustomBg}
                            title="Eliminar foto"
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded transition-colors shrink-0"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quadro Kanban */}
            <DragDropContext onDragEnd={handleDragEnd}>
              <main className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-stretch w-full min-h-0 overflow-hidden">
                {KANBAN_COLUMNS.map((col) => {
                  const columnTasks = tasks.filter((t) => t.status === col.id);

                  return (
                    <div
                      key={col.id}
                      className={`border rounded-2xl p-3 flex flex-col h-full min-h-0 overflow-hidden transition-colors ${
                        bgImage
                          ? "bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-white/20 dark:border-slate-800/80 shadow-lg"
                          : "bg-slate-100/70 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800"
                      }`}
                    >
                      <div className="flex-none flex justify-between items-center mb-2 px-1">
                        <div className="flex items-center gap-2">
                          <div
                            className={`${getIconColor(col.id)} rounded-3xl`}
                          >
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
      </div>
    </>
  );
}
