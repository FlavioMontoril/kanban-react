import {
  Handle,
  Position,
  // NodeResizer,
  type NodeProps,
  type Node,
} from "@xyflow/react";
import { Trash2, User, Info } from "lucide-react";
import { useFlowStore } from "../store/useFlowStore";
import { TaskStatus, type Task } from "@/types/task";
import { memo } from "react";
import { STATUS_CONFIG } from "@/components/kanbam/utils/border-color";

export type SquareNodeData = {
  task?: Task;
};

export type SquareNode = Node<SquareNodeData, "square">;

function Square({ data, id }: NodeProps<Node<SquareNodeData>>) {
  const deleteSquareNode = useFlowStore((state) => state.deleteSquareNode);
  const addChildNode = useFlowStore((state) => state.addChildNode);

  const task = data.task;

  const status = task?.status
    ? STATUS_CONFIG[task.status]
    : STATUS_CONFIG[TaskStatus.OPEN];

  return (
    <>
      {/* <NodeResizer
        minWidth={220}
        minHeight={150}
        keepAspectRatio={false}
        lineClassName="!border-violet-400/50"
        handleClassName="!bg-violet-500 !border-2 !border-white !w-2.5 !h-2.5 !rounded-full"
      /> */}

      {/* DEFINIDO LARGURA E ALTURA PADRÃO AQUI (w-[280px] h-[160px]) */}
      {/* Removido o 'overflow-hidden' daqui para não cortar os Handles */}
      <div className="bg-white dark:bg-slate-900 border-2 border-violet-400 dark:border-violet-500 rounded-2xl w-full h-full relative flex flex-col shadow-lg transition-colors">
        {/* Handles com z-index alto colocados na raiz do card */}
        <Handle
          id="left"
          type="target"
          position={Position.Left}
          className="!-left-2.5 !w-3 !h-3 !border-2 !bg-white !border-violet-300 !z-50"
        />

        <Handle
          id="right"
          type="source"
          position={Position.Right}
          className="!-right-2.5 !w-3 !h-3 !border-2 !bg-white !border-violet-300 !z-50"
        />

        {/* Div interna para aplicar o arredondamento e scroll do conteúdo sem cortar os Handles */}
        <div className="w-full h-full flex flex-col overflow-hidden rounded-[14px]">
          {/* Cabeçalho */}
          <div className="bg-violet-500 dark:bg-violet-600 h-9 px-3 flex items-center justify-between flex-none">
            <span className="font-mono text-xs font-bold text-white tracking-wide">
              {task?.code || `#${id.slice(0, 6)}`}
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => addChildNode(id, "detailsSquare")}
                className="text-white/80 hover:text-white hover:bg-violet-600/60 dark:hover:bg-violet-700/60 p-1 rounded-md transition-colors cursor-pointer border-none bg-transparent"
                title="Adicionar nó conectado"
              >
                <Info size={15} />
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteSquareNode(id);
                }}
                className="text-white/80 hover:text-white hover:bg-violet-600/60 dark:hover:bg-violet-700/60 p-1 rounded-md transition-colors cursor-pointer border-none bg-transparent"
                title="Apagar nó"
              >
                <Trash2 size={15} />
              </button>
            </div>
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
      </div>
    </>
  );
}

export const SquareComponent = memo(Square);
