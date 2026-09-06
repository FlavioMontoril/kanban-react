import { useEffect } from "react";
import type { Task } from "@/types/task";
import {
  Background,
  ConnectionMode,
  Controls,
  MiniMap,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { Square } from "./nodes/Square";
import { useFlowStore } from "./store/useFlowStore";
import colors from "tailwindcss/colors";
import { MousePointerClick, Workflow } from "lucide-react";

interface ITaskFlow {
  data: Task[];
}

const NODE_TYPES = {
  square: Square,
};

export function TaskFlow({ data }: ITaskFlow) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setNodes,
    selectedTaskId,
  } = useFlowStore();

  // Sincroniza o nó da tarefa selecionada com o estado do Zustand
  useEffect(() => {
    // Se não houver tarefa selecionada, limpa os nós do fluxo
    if (!selectedTaskId || !data || data.length === 0) {
      setNodes([]);
      return;
    }

    const task = data.find((t) => t.id === selectedTaskId);

    if (task) {
      // Se o nó atual já for o nó da tarefa selecionada, não sobrescreve
      // para não perder as alterações de posição ou tamanho feitas pelo usuário
      const currentNode = nodes[0];
      if (currentNode && currentNode.id === task.id) {
        return;
      }

      // Cria o novo nó no Zustand
      setNodes([
        {
          id: task.id,
          type: "square",
          position: { x: 0, y: 0 },
          style: { width: 280, height: 160 },
          data: { task },
        },
      ]);
    }
  }, [selectedTaskId, data, setNodes]);

  return (
    <div className="w-full h-full relative bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
      {!selectedTaskId && (
        <div className="absolute z-10 flex flex-col items-center justify-center p-8 text-center max-w-sm rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-xl transition-all">
          <div className="p-3 bg-violet-50 dark:bg-violet-950/50 rounded-2xl text-violet-600 dark:text-violet-400 mb-4 border border-violet-200/50 dark:border-violet-800/50">
            <Workflow size={32} />
          </div>

          <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
            Nenhuma tarefa no fluxo
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 mb-4 leading-relaxed">
            Selecione uma tarefa no painel lateral para visualizar seus detalhes
            e conexões de fluxo.
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <MousePointerClick size={14} className="text-violet-500" />
            <span>Use o botão no canto superior direito</span>
          </div>
        </div>
      )}
      <ReactFlow
        key={selectedTaskId ||
          //  "all-nodes"
          "empty-flow"
          } // Força re-render para centralizar ao trocar
        nodeTypes={NODE_TYPES}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        connectionMode={ConnectionMode.Loose}
        fitView
        minZoom={0.1}
        maxZoom={2.5} // Limita o zoom máximo no tamanho 100% natural do card
        fitViewOptions={{
          maxZoom: 1, // Impede que o fitView dê zoom excessivo em nós únicos
          padding: 0.3, // Mantém uma margem elegante em volta do nó
        }}
      >
        <Background gap={12} size={2} color={colors.zinc[300]} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
