import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";

interface FlowState {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addSquareNode: () => void;
  deleteSquareNode: () => void;
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  selectedTaskId: string | null; // ID da tarefa selecionada
  setSelectedTaskId: (id: string | null) => void;
}

// const INITIAL_NODES: Node[] = [
//   {
//     id: "node-create",
//     type: "create",
//     position: { x: 150, y: 200 },
//     data: {},
//   },
// ];

export const useFlowStore = create<FlowState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      selectedTaskId: null,

      setSelectedTaskId: (id) => set({ selectedTaskId: id }),

      setNodes: (nodes) => {
        set({
          nodes: typeof nodes === "function" ? nodes(get().nodes) : nodes,
        });
      },

      // Sincroniza/sorescreve o estado das conexões
      setEdges: (edges) => {
        set({
          edges: typeof edges === "function" ? edges(get().edges) : edges,
        });
      },

      onNodesChange: (changes) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes),
        });
      },

      onEdgesChange: (changes) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
      },

      onConnect: (connection) => {
        set({
          edges: addEdge(connection, get().edges),
        });
      },

      addSquareNode: () => {
        const { nodes, edges } = get();
        const hasSquareNode = nodes.some((node) => node.type === "square");

        if (hasSquareNode) return;

        const squareId = crypto.randomUUID();

        const newSquareNode: Node = {
          id: squareId,
          type: "square",
          position: { x: 450, y: 200 },
          data: {},
        };

        const newEdge: Edge = {
          id: `e-create-${squareId}`,
          source: "node-create",
          target: squareId,
          sourceHandle: "right",
          targetHandle: "left",
        };

        set({
          nodes: [...nodes, newSquareNode],
          edges: [...edges, newEdge],
        });
      },

      deleteSquareNode: () => {
        const { nodes, edges } = get();

        // Encontra o nó Square
        const squareNode = nodes.find((node) => node.type === "square");
        if (!squareNode) return;

        // Filtra removendo o nó Square e as conexões ligadas a ele
        set({
          nodes: nodes.filter((node) => node.type !== "square"),
          edges: edges.filter(
            (edge) =>
              edge.source !== squareNode.id && edge.target !== squareNode.id,
          ),
        });
      },
    }),
    {
      name: "@react-flow/storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
