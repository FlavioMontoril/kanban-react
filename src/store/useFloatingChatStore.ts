import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ChatRoom } from "@/types/chat-types";

interface RoomPosition {
  x: number;
  y: number;
}

interface UserFloatingState {
  activeRooms: ChatRoom[];
  positions: Record<string, RoomPosition>;
}

interface FloatingChatState {
  userStates: Record<string, UserFloatingState>;
  expandedRoomId: string | null;

  openFloatingChat: (
    userId: string | number | undefined,
    room: ChatRoom
  ) => void;
  toggleExpandRoom: (roomId: string) => void;
  closeChatModal: () => void;
  removeRoomBubble: (
    userId: string | number | undefined,
    roomId: string
  ) => void;
  updateRoomPosition: (
    userId: string | number | undefined,
    roomId: string,
    deltaX: number,
    deltaY: number
  ) => void;
  clearAllForUser: (userId: string | number | undefined) => void;

  getUserState: (userId?: string | number) => UserFloatingState;
}

export const useFloatingChatStore = create<FloatingChatState>()(
  persist(
    (set, get) => ({
      userStates: {},
      expandedRoomId: null,

      getUserState: (userId) => {
        if (!userId) return { activeRooms: [], positions: {} };
        const key = String(userId);
        return get().userStates[key] || { activeRooms: [], positions: {} };
      },

      openFloatingChat: (userId, room) =>
        set((state) => {
          if (!userId) return state;
          const key = String(userId);
          const currentUserState = state.userStates[key] || {
            activeRooms: [],
            positions: {},
          };

          const exists = currentUserState.activeRooms.some(
            (r) => r.id === room.id
          );

          return {
            userStates: {
              ...state.userStates,
              [key]: {
                ...currentUserState,
                activeRooms: exists
                  ? currentUserState.activeRooms
                  : [...currentUserState.activeRooms, room],
              },
            },
            expandedRoomId: room.id,
          };
        }),

      toggleExpandRoom: (roomId) =>
        set((state) => ({
          expandedRoomId: state.expandedRoomId === roomId ? null : roomId,
        })),

      closeChatModal: () => set({ expandedRoomId: null }),

      removeRoomBubble: (userId, roomId) =>
        set((state) => {
          if (!userId) return state;
          const key = String(userId);
          const currentUserState = state.userStates[key];

          if (!currentUserState) return state;

          return {
            userStates: {
              ...state.userStates,
              [key]: {
                ...currentUserState,
                activeRooms: currentUserState.activeRooms.filter(
                  (r) => r.id !== roomId
                ),
              },
            },
            expandedRoomId:
              state.expandedRoomId === roomId ? null : state.expandedRoomId,
          };
        }),

      updateRoomPosition: (userId, roomId, deltaX, deltaY) =>
        set((state) => {
          if (!userId) return state;
          const key = String(userId);
          const currentUserState = state.userStates[key] || {
            activeRooms: [],
            positions: {},
          };

          const currentPos = currentUserState.positions[roomId] || {
            x: 20,
            y: 100,
          };

          return {
            userStates: {
              ...state.userStates,
              [key]: {
                ...currentUserState,
                positions: {
                  ...currentUserState.positions,
                  [roomId]: {
                    x: Math.max(0, currentPos.x + deltaX),
                    y: Math.max(0, currentPos.y + deltaY),
                  },
                },
              },
            },
          };
        }),

      clearAllForUser: (userId) =>
        set((state) => {
          if (!userId) return state;
          const key = String(userId);
          const newUserStates = { ...state.userStates };
          delete newUserStates[key];

          return {
            userStates: newUserStates,
            expandedRoomId: null,
          };
        }),
    }),
    {
      name: "floating-chat-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userStates: state.userStates,
      }),
    }
  )
);