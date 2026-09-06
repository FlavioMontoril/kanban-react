import {
  Handle,
  Position,
  NodeResizer,
  type NodeProps,
  type Node,
} from "@xyflow/react";
import {
  Trash2,
  User,
  Circle,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useFlowStore } from "../store/useFlowStore";
import { TaskStatus, type Task } from "@/types/task";

export type SquareNodeData = {
  task?: Task;
};

// Mapeamento visual para o badge de status dentro do Nó
const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  [TaskStatus.OPEN]: {
    label: "Aberta",
    bg: "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800",
    text: "text-indigo-700 dark:text-indigo-300",
    icon: <Circle size={10} className="stroke-[2.5]" />,
  },
  [TaskStatus.IN_PROGRESS]: {
    label: "Em Progresso",
    bg: "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-300",
    icon: <Clock size={10} className="stroke-[2.5]" />,
  },
  [TaskStatus.UNDER_REVIEW]: {
    label: "Em Revisão",
    bg: "bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800",
    text: "text-purple-700 dark:text-purple-300",
    icon: <Eye size={10} className="stroke-[2.5]" />,
  },
  [TaskStatus.DONE]: {
    label: "Concluído",
    bg: "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-300",
    icon: <CheckCircle2 size={10} className="stroke-[2.5]" />,
  },
  [TaskStatus.CANCELED]: {
    label: "Cancelado",
    bg: "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800",
    text: "text-red-700 dark:text-red-300",
    icon: <XCircle size={10} className="stroke-[2.5]" />,
  },
};

export type SquareNode = Node<SquareNodeData, "square">;

export function Square({ data, id }: NodeProps<Node<SquareNodeData>>) {
  const deleteSquareNode = useFlowStore((state) => state.deleteSquareNode);
  const task = data.task;

  const status = task?.status
    ? STATUS_CONFIG[task.status]
    : STATUS_CONFIG[TaskStatus.OPEN];

  return (
    <>
      <NodeResizer
        minWidth={220}
        minHeight={150}
        keepAspectRatio={false}
        lineClassName="!border-violet-400/50"
        handleClassName="!bg-violet-500 !border-2 !border-white !w-2.5 !h-2.5 !rounded-full"
      />

      {/* DEFINIDO LARGURA E ALTURA PADRÃO AQUI (w-[280px] h-[160px]) */}
      <div className="bg-white dark:bg-slate-900 border-2 border-violet-400 dark:border-violet-500 rounded-2xl w-full h-full relative flex flex-col shadow-lg overflow-hidden transition-colors">
        
        {/* Cabeçalho */}
        <div className="bg-violet-500 dark:bg-violet-600 h-9 px-3 flex items-center justify-between flex-none">
          <span className="font-mono text-xs font-bold text-white tracking-wide">
            {task?.code || `#${id.slice(0, 6)}`}
          </span>

          <button
            type="button"
            onClick={deleteSquareNode}
            className="text-white/80 hover:text-white hover:bg-violet-600/60 dark:hover:bg-violet-700/60 p-1 rounded-md transition-colors cursor-pointer border-none bg-transparent"
            title="Apagar nó"
          >
            <Trash2 size={15} />
          </button>

          <Handle
            id="left"
            type="target"
            position={Position.Left}
            className="!-left-1.5 !w-3 !h-3 !border-2 !bg-white !border-violet-500"
          />

          <Handle
            id="right"
            type="source"
            position={Position.Right}
            className="!-right-1.5 !w-3 !h-3 !border-2 !bg-violet-500 !border-white"
          />
        </div>

        {/* Conteúdo */}
        <div className="flex-1 p-3 flex flex-col justify-between gap-2 overflow-y-auto custom-scrollbar">
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-tight">
              {task?.title || "Sem título informado"}
            </h4>
          </div>

          <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${status.bg} ${status.text}`}
              >
                {status.icon}
                {status.label}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <User size={12} className="text-slate-400" />
              <span className="truncate max-w-[140px]">
                {task?.reporter || "Não atribuído"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
