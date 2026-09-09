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

import { useFlowStore } from "./store/useFlowStore";
import colors from "tailwindcss/colors";
import { MousePointerClick, Workflow } from "lucide-react";
import { DetailsSquareComponents } from "./nodes/DetailsSquare";
import { SquareComponent } from "./nodes/Square";

interface ITaskFlow {
  data: Task[];
  isDarkMode?: boolean;
}

const NODE_TYPES = {
  square: SquareComponent,
  detailsSquare: DetailsSquareComponents,
};

export function TaskFlow({ data, isDarkMode }: ITaskFlow) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setNodes,
    setEdges,
    selectedTaskId,
  } = useFlowStore();

  // Sincroniza o nó da tarefa selecionada com o estado do Zustand
  useEffect(() => {
    // Se não houver tarefa selecionada, limpa a tela
    if (!selectedTaskId || !data || data.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const task = data.find((t) => t.id === selectedTaskId);

    if (task) {
      // ⚡ Pega os nós atuais sem se inscrever às re-renderizações de drag
      const currentNodes = useFlowStore.getState().nodes;
      const currentMainNode = currentNodes.find((n) => n.type === "square");

      // Se já estiver exibindo exatamente esse nó pai, não faz nada para preservar a posição/filhos
      if (currentMainNode && currentMainNode.id === task.id) {
        return;
      }

      // Ao trocar para uma nova tarefa, substitui o fluxo pelo nó pai da nova task
      setNodes([
        {
          id: task.id,
          type: "square",
          position: { x: 0, y: 0 },
          style: { width: 280, height: 160 },
          data: { task },
        },
      ]);

      // Limpa as conexões da tarefa anterior
      setEdges([]);
    }
  }, [selectedTaskId, data, setNodes, setEdges]);

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
        // key={
        //   selectedTaskId ||
        //   //  "all-nodes"
        //   "empty-flow"
        // } // Força re-render para centralizar ao trocar
        nodeTypes={NODE_TYPES}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        connectionMode={ConnectionMode.Loose}
        colorMode={isDarkMode ? "dark" : "light"} // Comentar se nao quiser usasr modo noturno
        fitView
        minZoom={0.1}
        maxZoom={2.5} // Limita o zoom máximo no tamanho 100% natural do card
        fitViewOptions={{
          maxZoom: 1, // Impede que o fitView dê zoom excessivo em nós únicos
          padding: 0.3, // Mantém uma margem elegante em volta do nó
        }}
      >
        {/* <Background gap={12} size={2} color={colors.zinc[300]} />
        <Controls />
        <MiniMap /> */}
        <Background
          gap={12}
          size={2}
          color={isDarkMode ? colors.zinc[700] : colors.zinc[300]}
        />
        <Controls className="bg-white dark:[&>button]:!bg-slate-900 border border-slate-200 dark:border-slate-200 fill-slate-700 dark:fill-slate-200 text-slate-700 dark:text-slate-200 shadow-lg rounded-xl overflow-hidden [&>button]:border-slate-200 dark:[&>button]:border-slate-800 dark:[&>button]:hover:!bg-slate-500" />

        {/* 🗺️ MiniMap estilizado com cores condicionalmente ajustadas */}
        <MiniMap
          className="bg-white dark:!bg-slate-900 border border-slate-200 dark:border-slate-800 !shadow-lg rounded-2xl overflow-hidden"
          maskColor={
            isDarkMode ? "rgba(15, 23, 42, 0.7)" : "rgba(241, 245, 249, 0.7)"
          }
          nodeColor={isDarkMode ? colors.violet[500] : colors.indigo[500]}
        />
      </ReactFlow>
    </div>
  );
}
