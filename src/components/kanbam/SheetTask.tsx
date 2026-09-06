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
import {
  Circle,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  ListFilter,
  User,
} from "lucide-react";
import { useFlowStore } from "../flow/store/useFlowStore";

interface ITaskSheet {
  data: Task[];
}

const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  [TaskStatus.OPEN]: {
    label: "Aberta",
    bg: "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800",
    text: "text-indigo-700 dark:text-indigo-300",
    icon: <Circle size={12} className="stroke-[2.5]" />,
  },
  [TaskStatus.IN_PROGRESS]: {
    label: "Em Progresso",
    bg: "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-300",
    icon: <Clock size={12} className="stroke-[2.5]" />,
  },
  [TaskStatus.UNDER_REVIEW]: {
    label: "Em Revisão",
    bg: "bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800",
    text: "text-purple-700 dark:text-purple-300",
    icon: <Eye size={12} className="stroke-[2.5]" />,
  },
  [TaskStatus.DONE]: {
    label: "Concluído",
    bg: "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-300",
    icon: <CheckCircle2 size={12} className="stroke-[2.5]" />,
  },
  [TaskStatus.CANCELED]: {
    label: "Cancelado",
    bg: "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800",
    text: "text-red-700 dark:text-red-300",
    icon: <XCircle size={12} className="stroke-[2.5]" />,
  },
};

export function SheetTask({ data }: ITaskSheet) {
  const totalTasks = useMemo(() => data.length, [data]);

  const setSelectedTaskId = useFlowStore((state) => state.setSelectedTaskId);
  const selectedTaskId = useFlowStore((state) => state.selectedTaskId);

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
          <div className="flex items-center justify-between">
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
        </SheetHeader>

        {/* CONTAINER EM COLUNA ÚNICA (flex flex-col w-full) */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
          {data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm">
              <p>Nenhuma tarefa disponível.</p>
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