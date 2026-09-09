import { memo, useEffect, useRef } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { Trash2, History, ArrowRight } from "lucide-react";
import { useFlowStore } from "../store/useFlowStore";
import type { SquareNodeData } from "./Square";
import { useTaskHistoryStore } from "@/store/useTaskHistories";
import { STATUS_CONFIG } from "@/components/kanbam/utils/border-color";

function HistorySquare({ data, id }: NodeProps<Node<SquareNodeData>>) {
  const deleteSquareNode = useFlowStore((state) => state.deleteNodeCascade);
  const histories = useTaskHistoryStore((state) => state.histories);
  const task = data?.task;
  const scrollRef = useRef<HTMLDivElement>(null);

  // 💡 Bloqueia nativamente a propagação do evento wheel para o React Flow
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const handleWheel = (e: WheelEvent) => {
      // Impede o React Flow de interceptar o evento e fazer zoom
      e.stopPropagation();
    };

    // Registra com passive: false para capturar antes do canvas do React Flow
    scrollEl.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      scrollEl.removeEventListener("wheel", handleWheel);
    };
  }, []);

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
    <div className="bg-white dark:bg-slate-900 border-2 border-amber-500 dark:border-amber-600 rounded-2xl w-[300px] max-h-[260px] relative flex flex-col shadow-xl transition-all hover:shadow-2xl">
      <Handle
        id="right"
        type="target"
        position={Position.Right}
        className="!-right-2.5 !w-3 !h-3 !border-2 !bg-white !border-amber-500 !z-50 cursor-crosshair"
      />

      <div className="w-full h-full flex flex-col overflow-hidden rounded-[14px]">
        {/* Cabeçalho */}
        <div className="bg-amber-500 dark:bg-amber-600 h-9 px-3 flex items-center justify-between flex-none">
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
            className="text-white/80 hover:text-white hover:bg-amber-600/60 p-1 rounded-md transition-colors cursor-pointer border-none bg-transparent"
            title="Apagar nó de histórico"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Mapeamento dos Históricos */}
        <div
          // onWheel={(e) => e.stopPropagation()}
          // onPointerDownCapture={(e) => e.stopPropagation()}
          ref={scrollRef}
          className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto custom-scrollbar"
        >
          {histories.length === 0 ? (
            <div className="nowheel nodrag nopan text-center py-4 text-xs text-slate-400">
              Nenhuma alteração registrada.
            </div>
          ) : (
            histories.map((item) => {
              const prev = STATUS_CONFIG[item.previousStatus];
              const curr = STATUS_CONFIG[item.currentStatus];

              return (
                <div
                  key={item.id}
                  className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{formatDate(item.movedAt)}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] font-semibold">
                    <span
                      className={`px-1.5 py-0.5 rounded-md ${prev?.bg} ${prev?.text}`}
                    >
                      {prev?.label || item.previousStatus}
                    </span>
                    <ArrowRight size={10} className="text-slate-400 shrink-0" />
                    <span
                      className={`px-1.5 py-0.5 rounded-md ${curr?.bg} ${curr?.text}`}
                    >
                      {curr?.label || item.currentStatus}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export const HistorySquareComponents = memo(HistorySquare);
