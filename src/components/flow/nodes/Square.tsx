import {
  Handle,
  Position,
  type NodeProps,
  type Node,
} from "@xyflow/react";
import { Trash2, User, Info, History, FolderKanban, Calendar } from "lucide-react";
import { useFlowStore } from "../store/useFlowStore";
import { TaskStatus, type Task } from "@/types/task";
import { memo } from "react";
import { STATUS_CONFIG } from "@/components/kanbam/utils/border-color";

export type SquareNodeData = {
  task?: Task;
};

export type SquareNode = Node<SquareNodeData, "square">;

function Square({ data, id }: NodeProps<Node<SquareNodeData>>) {
  const deleteSquareNode = useFlowStore((state) => state.deleteNodeCascade);
  const addChildNode = useFlowStore((state) => state.addChildNode);
  const edges = useFlowStore((state) => state.edges);
  const nodes = useFlowStore((state) => state.nodes);

  const hasDetailsChild = edges.some(
    (edge) =>
      edge.source === id &&
      nodes.some(
        (node) => node.id === edge.target && node.type === "detailsSquare",
      ),
  );
  const hasHistoryChild = edges.some(
    (edge) =>
      edge.source === id &&
      nodes.some(
        (node) => node.id === edge.target && node.type === "historySquare",
      ),
  );

  const task = data.task;
  const status = task?.status
    ? STATUS_CONFIG[task.status]
    : STATUS_CONFIG[TaskStatus.OPEN];

  // Formatação simples para a data de criação
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  const formattedCreatedAt = formatDate(task?.createdAt);

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-violet-500 dark:border-violet-800 rounded-2xl w-[285px] h-[185px] relative flex flex-col shadow-xl transition-all hover:shadow-2xl dark:hover:border-violet-500">
      {/* Handles de Conexão */}
      <Handle
        id="left"
        type="source"
        position={Position.Left}
        className="!-left-2.5 !w-3 !h-3 !border-2 !bg-white dark:!bg-slate-900 !border-violet-500 !z-50 shadow-sm"
      />
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        className="!-right-2.5 !w-3 !h-3 !border-2 !bg-white dark:!bg-slate-900 !border-violet-500 !z-50 shadow-sm"
      />

      <div className="w-full h-full flex flex-col overflow-hidden rounded-[15px]">
        {/* Cabeçalho */}
        <div className="bg-violet-600 dark:bg-violet-700 h-9 px-3 flex items-center justify-between flex-none">
          <div className="flex items-center gap-1.5 text-white/90">
            <FolderKanban size={13} className="text-violet-200" />
            <span className="font-mono text-[11px] font-bold tracking-wider uppercase">
              {task?.code || `#${id.slice(0, 6)}`}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                addChildNode(id, "historySquare");
              }}
              className={`p-1 rounded-lg transition-colors border-none bg-transparent ${
                hasHistoryChild
                  ? "text-white/30 cursor-not-allowed"
                  : "text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              }`}
              title={hasHistoryChild ? "Histórico já exibido" : "Exibir histórico"}
            >
              <History size={14} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                addChildNode(id, "detailsSquare");
              }}
              className={`p-1 rounded-lg transition-colors border-none bg-transparent ${
                hasDetailsChild
                  ? "text-white/30 cursor-not-allowed"
                  : "text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              }`}
              title={hasDetailsChild ? "Detalhes já exibidos" : "Exibir detalhes"}
            >
              <Info size={14} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                deleteSquareNode(id);
              }}
              className="text-white/70 hover:text-rose-200 hover:bg-rose-500/20 p-1 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
              title="Fechar tarefa"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Conteúdo Central */}
        <div className="flex-1 p-3 flex flex-col justify-between bg-slate-50/50 dark:bg-slate-900/50 gap-2">
          {/* Título da Tarefa */}
          <div>
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 leading-relaxed tracking-tight">
              {task?.title || "Sem título informado"}
            </h4>
          </div>

          {/* Rodapé: Status, Relator e Data de Criação */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between gap-2">
              {/* Status Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium border ${status.bg} ${status.text} shadow-xs`}
              >
                <span className="shrink-0">{status.icon}</span>
                <span className="truncate">{status.label}</span>
              </span>

              {/* Data de Criação */}
              {formattedCreatedAt && (
                <div 
                  className="flex items-center gap-1 text-[10px] font-mono text-slate-400 dark:text-slate-500"
                  title="Data de criação"
                >
                  <Calendar size={11} className="shrink-0" />
                  <span>{formattedCreatedAt}</span>
                </div>
              )}
            </div>

            {/* Relator */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/50 w-full">
                <User size={11} className="text-slate-400 shrink-0" />
                <span className="truncate max-w-[180px] font-medium">
                  {task?.reporter || "Sem relator"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const SquareComponent = memo(Square);