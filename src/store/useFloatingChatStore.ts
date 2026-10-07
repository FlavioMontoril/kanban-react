// src/store/useFloatingChatStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ChatRoom } from "@/types/chat-types";

interface RoomPosition {
  x: number;
  y: number;
}

interface FloatingChatState {
  activeRooms: ChatRoom[];
  expandedRoomId: string | null;
  positions: Record<string, RoomPosition>;

  openFloatingChat: (room: ChatRoom) => void;
  toggleExpandRoom: (roomId: string) => void;
  closeChatModal: () => void;
  removeRoomBubble: (roomId: string) => void;
  updateRoomPosition: (roomId: string, deltaX: number, deltaY: number) => void;
  clearAll: () => void;
}

export const useFloatingChatStore = create<FloatingChatState>()(
  persist(
    (set) => ({
      activeRooms: [],
      expandedRoomId: null,
      positions: {},

      openFloatingChat: (room) =>
        set((state) => {
          const exists = state.activeRooms.some((r) => r.id === room.id);
          return {
            activeRooms: exists ? state.activeRooms : [...state.activeRooms, room],
            expandedRoomId: room.id,
          };
        }),

      toggleExpandRoom: (roomId) =>
        set((state) => ({
          expandedRoomId: state.expandedRoomId === roomId ? null : roomId,
        })),

      closeChatModal: () => set({ expandedRoomId: null }),

      removeRoomBubble: (roomId) =>
        set((state) => ({
          activeRooms: state.activeRooms.filter((r) => r.id !== roomId),
          expandedRoomId: state.expandedRoomId === roomId ? null : state.expandedRoomId,
        })),

      updateRoomPosition: (roomId, deltaX, deltaY) =>
        set((state) => {
          const currentPos = state.positions[roomId] || { x: 20, y: 100 };
          return {
            positions: {
              ...state.positions,
              [roomId]: {
                x: Math.max(0, currentPos.x + deltaX),
                y: Math.max(0, currentPos.y + deltaY),
              },
            },
          };
        }),

      clearAll: () => set({ activeRooms: [], expandedRoomId: null, positions: {} }),
    }),
    {
      name: "floating-chat-storage", // Chave no localStorage
      storage: createJSONStorage(() => localStorage),
      // Salva apenas os balões ativos e suas posições (mantém o modal minimizado ao recarregar)
      partialize: (state) => ({
        activeRooms: state.activeRooms,
        positions: state.positions,
      }),
    }
  )
);