import { memo } from "react";
import {
  Handle,
  Position,
  type NodeProps,
  type Node,
} from "@xyflow/react";
import {
  Trash2,
  Calendar,
  History,
  Clock,
} from "lucide-react";
import { useFlowStore } from "../store/useFlowStore";
import type { SquareNodeData } from "./Square";

function HistorySquare({ data, id }: NodeProps<Node<SquareNodeData>>) {
  const deleteSquareNode = useFlowStore((state) => state.deleteNodeCascade);
  const task = data?.task;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500 dark:border-emerald-600 rounded-2xl w-[280px] h-[180px] relative flex flex-col shadow-xl transition-colors">
      {/* Handle de Conexão à DIREITA (Liga à esquerda do nó pai) */}
      <Handle
        id="right"
        type="target"
        position={Position.Right}
        className="!-right-2.5 !w-2 !h-2 !border-2 !bg-white !border-emerald-500 !z-50 cursor-crosshair"
      />

      <div className="w-full h-full flex flex-col overflow-hidden rounded-[14px]">
        {/* Cabeçalho */}
        <div className="bg-emerald-600 dark:bg-emerald-700 h-9 px-3 flex items-center justify-between flex-none">
          <div className="flex items-center gap-1.5 text-white">
            <History size={14} />
            <span className="font-mono text-xs font-bold tracking-wide">
              Histórico: {task?.code || `#${id.slice(0, 5)}`}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              deleteSquareNode(id);
            }}
            className="text-white/80 hover:text-white hover:bg-emerald-500/60 p-1 rounded-md transition-colors cursor-pointer border-none bg-transparent"
            title="Apagar nó de histórico"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Conteúdo do Histórico */}
        <div className="flex-1 p-3 flex flex-col justify-between gap-2 overflow-y-auto custom-scrollbar">
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px]">
                <Calendar size={12} /> Criado em:
              </span>
              <span className="font-mono text-[11px] text-slate-700 dark:text-slate-200">
                {formatDate(task?.createdAt)}
              </span>
            </div>

            {task?.updatedAt && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px]">
                  <Clock size={12} /> Atualizado:
                </span>
                <span className="font-mono text-[11px] text-slate-700 dark:text-slate-200">
                  {formatDate(task?.updatedAt)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const HistorySquareComponents = memo(HistorySquare);