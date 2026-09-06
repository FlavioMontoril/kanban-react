import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TaskStatus, type Task } from "@/types/task";
import { ListFilter, User, Plus } from "lucide-react";
import { useFlowStore } from "../flow/store/useFlowStore";
import { useTaskModalStore } from "@/store/useTaskModalStore";
import { STATUS_CONFIG } from "./utils/border-color";

interface ITaskSheet {
  data: Task[];
}

export function SheetTask({ data }: ITaskSheet) {
  const { openModal } = useTaskModalStore();
  const { selectedTaskId, setSelectedTaskId } = useFlowStore();

  const totalTasks = useMemo(() => data.length, [data]);

  return (
    <Sheet>
      <SheetTrigger>
        <Button
          variant="outline"
          className="flex items-center gap-2 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition cursor-pointer shadow-xs"
        >
          <ListFilter size={16} />
          <span>Ver Lista em Painel</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-400">
            {totalTasks}
          </span>
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md bg-white dark:bg-slate-950 border-l border-slate-200/80 dark:border-slate-800 p-0 flex flex-col h-full antialiased font-sans">
        {/* Cabeçalho */}
        <SheetHeader className="p-6 pb-4 border-b border-slate-200/80 dark:border-slate-800/80 flex-none bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center gap-2">
            <SheetTitle className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Lista de Tarefas
            </SheetTitle>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800">
              {totalTasks} no total
            </span>
          </div>
          <SheetDescription className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Clique em uma tarefa para exibi-la no fluxo.
          </SheetDescription>

          {data.length > 0 && (
            <button
              type="button"
              onClick={() => openModal("create")}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 text-sm rounded-xl shadow-md transition cursor-pointer"
            >
              <Plus size={16} /> Criar nova tarefa
            </button>
          )}
        </SheetHeader>

        {/* CONTAINER EM COLUNA ÚNICA (flex flex-col w-full) */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
          {data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm">
              <p>Nenhuma tarefa disponível.</p>

              <button
                type="button"
                onClick={() => openModal("create")}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 text-sm rounded-xl shadow-md transition cursor-pointer"
              >
                <Plus size={16} /> Criar
              </button>
            </div>
          ) : (
            data.map((task) => {
              const status =
                STATUS_CONFIG[task.status] || STATUS_CONFIG[TaskStatus.OPEN];
              const isSelected = selectedTaskId === task.id;

              return (
                <SheetClose key={task.id}>
                  <div
                    onClick={() => setSelectedTaskId(task.id)}
                    className={`w-full p-4 rounded-xl border transition-all duration-200 flex flex-col gap-2.5 cursor-pointer flex-none ${
                      isSelected
                        ? "border-violet-500 bg-violet-50/50 dark:bg-violet-950/30 ring-2 ring-violet-500/20"
                        : "border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-violet-400 dark:hover:border-violet-500 hover:shadow-xs"
                    }`}
                  >
                    {/* Topo do Card */}
                    <div className="flex items-center justify-between gap-2 w-full">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {task.code || `#${task.id.slice(0, 6)}`}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${status.bg} ${status.text}`}
                      >
                        {status.icon}
                        {status.label}
                      </span>
                    </div>

                    {/* Título */}
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug w-full">
                      {task.title}
                    </h4>

                    {/* Rodapé do Card */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400 w-full">
                      <div className="flex items-center gap-1.5">
                        <User size={13} className="text-slate-400" />
                        <span className="font-medium truncate max-w-[200px]">
                          {task.reporter || "Não atribuído"}
                        </span>
                      </div>
                    </div>
                  </div>
                </SheetClose>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
