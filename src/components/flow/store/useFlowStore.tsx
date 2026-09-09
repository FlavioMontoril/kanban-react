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
  addChildNode: (parentId: string, nodeType: string) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addSquareNode: () => void;
  deleteSquareNode: (nodeId: string) => void;
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

      // Cria um nó conectado ao nó pai
      addChildNode: (parentId: string, nodeType: string) => {
        const { nodes, edges } = get();
        const parentNode = nodes.find((n) => n.id === parentId);

        if (!parentNode) return;

        const childId = crypto.randomUUID();
        const parentTask = parentNode.data?.task;

        const newChildNode: Node = {
          id: childId,
          type: nodeType,
          position: {
            x: parentNode.position.x + 320,
            y: parentNode.position.y + 40,
          },
          data: { task: parentTask },
        };

        const newEdge: Edge = {
          id: `edge-${parentId}-${childId}`,
          source: parentId,
          target: childId,
          sourceHandle: "right",
          targetHandle: "left",
          // type: "smoothstep",
          animated: true,
          style: { stroke: "#8b5cf6", strokeWidth: 2 },
        };

        set({
          nodes: [...nodes, newChildNode],
          edges: [...edges, newEdge],
        });
      },

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

      deleteSquareNode: (nodeId: string) => {
        const { nodes, edges, selectedTaskId } = get();

        const isMainTaskNode = nodeId === selectedTaskId;

        // Filtra removendo o nó Square e as conexões ligadas a ele
        set({
          selectedTaskId: isMainTaskNode ? null : selectedTaskId,
          nodes: nodes.filter((node) => node.id !== nodeId),
          edges: edges.filter(
            (edge) => edge.source !== nodeId && edge.target !== nodeId,
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
