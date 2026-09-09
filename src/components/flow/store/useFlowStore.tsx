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
  selectedTaskId: string | null;
  hasHydrated: boolean;

  setHasHydrated: (state: boolean) => void;
  setSelectedTaskId: (id: string | null) => void;
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;

  // Handlers padrão do React Flow
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  // Operações de Nós (Genéricas e escaláveis para N filhos)
  addChildNode: (parentId: string, nodeType: string) => void;
  deleteNodeCascade: (nodeId: string) => void;
}

// Auxiliar recursivo para encontrar o nó e todos os seus descendentes (filhos, netos, etc.)
// const getDescendantNodeIds = (nodeId: string, edges: Edge[]): string[] => {
//   const childEdges = edges.filter((edge) => edge.source === nodeId);
//   const childIds = childEdges.map((edge) => edge.target);

//   return childIds.reduce<string[]>(
//     (acc, childId) => [
//       ...acc,
//       childId,
//       ...getDescendantNodeIds(childId, edges),
//     ],
//     [],
//   );
// };

export const useFlowStore = create<FlowState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      selectedTaskId: null,
      hasHydrated: false,

      setSelectedTaskId: (id) => set({ selectedTaskId: id }),

      setNodes: (nodes) => {
        set({
          nodes: typeof nodes === "function" ? nodes(get().nodes) : nodes,
        });
      },

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

      // Cria um nó conectado ao nó pai
      addChildNode: (parentId: string, nodeType: string) => {
        const { nodes, edges } = get();
        const parentNode = nodes.find((n) => n.id === parentId);

        if (!parentNode) return;

        // 1. Mapeia os IDs de todos os filhos que já estão conectados a este pai
        const existingChildIds = new Set(
          edges.filter((e) => e.source === parentId).map((e) => e.target),
        );

        // 2. Trava a execução se já existir um filho do mesmo tipo (ex: "detailsSquare")
        const alreadyHasType = nodes.some(
          (n) => existingChildIds.has(n.id) && n.type === nodeType,
        );

        if (alreadyHasType) return; // Impede a criação duplicada ao clicar várias vezes

        // Conta quantos filhos o pai já possui para calcular o deslocamento vertical (Y)
        const currentChildrenCount = existingChildIds.size;
        // const currentChildrenCount = edges.filter(
        //   (edge) => edge.source === parentId,
        // ).length;

        const childId = crypto.randomUUID();
        const parentTask = parentNode.data?.task;

        const isLeftNode = nodeType === "historySquare";

        // 1. Defina o deslocamento para a esquerda do Pai
        // const parentShiftLeft = isLeftNode ? 0 : 150; // Só desloca o pai para a esquerda se for nó à direita (detailsSquare)        // 2. O novo nó filho é posicionando à direita da nova posição do pai
        const offsetX = isLeftNode ? -450 : 400; // -350 para a esquerda, +350 para a direita
        const offsetY = isLeftNode ? -200 : currentChildrenCount * 200;

        const newChildNode: Node = {
          id: childId,
          type: nodeType,
          position: {
            x: parentNode.position.x + offsetX,
            y: parentNode.position.y + offsetY,
          },
          data: { parentTaskId: parentNode.id, task: parentTask },
        };

        const newEdge: Edge = {
          id: `edge-${parentId}-${childId}`,
          source: parentId,
          target: childId,
          // Conecta a handle esquerda do pai com a direita do nó de histórico
          sourceHandle: isLeftNode ? "left" : "right",
          targetHandle: isLeftNode ? "right" : "left",
          // type: "smoothstep",
          animated: true,
          style: { stroke: "#8b5cf6", strokeWidth: 2 },
        };

        // 3. Atualiza os nós: Movel o pai para a esquerda e insere o filho
        // const updatedNodes = nodes.map((node) => {
        //   if (node.id === parentId && parentShiftLeft > 0) {
        //     return {
        //       ...node,
        //       position: {
        //         ...node.position,
        //         x: node.position.x - parentShiftLeft, // 👈 Move o nó pai para a esquerda
        //       },
        //     };
        //   }
        //   return node;
        // });

        set({
          nodes: [...nodes, newChildNode],
          edges: [...edges, newEdge],
        });
      },

      // Remove o nó selecionado e TODOS os seus descendentes (em cascata)
      // deleteNodeCascade: (nodeId: string) => {
      //   const { nodes, edges, selectedTaskId } = get();

      //   // Identifica o próprio nó e todos os filhos/netos a serem removidos
      //   const idsToRemove = new Set([
      //     nodeId,
      //     ...getDescendantNodeIds(nodeId, edges),
      //   ]);

      //   set({
      //     selectedTaskId: idsToRemove.has(selectedTaskId ?? "")
      //       ? null
      //       : selectedTaskId,
      //     nodes: nodes.filter((node) => !idsToRemove.has(node.id)),
      //     edges: edges.filter(
      //       (edge) =>
      //         !idsToRemove.has(edge.source) && !idsToRemove.has(edge.target),
      //     ),
      //   });
      // },

      deleteNodeCascade: (nodeId: string) => {
        const { nodes, edges, selectedTaskId } = get();

        // 1. Descobre os IDs dos filhos diretos conectados a este nó
        const childIds = edges
          .filter((e) => e.source === nodeId)
          .map((e) => e.target);

        // 2. Cria uma lista contendo o nó clicado + seus filhos diretos
        const idsToRemove = new Set([nodeId, ...childIds]);

        // 3. Remove os nós e as conexões de uma só vez
        set({
          selectedTaskId: idsToRemove.has(selectedTaskId ?? "")
            ? null
            : selectedTaskId,
          nodes: nodes.filter((node) => !idsToRemove.has(node.id)),
          edges: edges.filter(
            (edge) =>
              !idsToRemove.has(edge.source) && !idsToRemove.has(edge.target),
          ),
        });
      },

      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: "@react-flow/storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // Marca como concluído assim que ler o localStorage
        state?.setHasHydrated(true);
      },
    },
  ),
);
