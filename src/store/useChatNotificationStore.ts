import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ChatNotificationState {
  // Mapeia roomId -> quantidade de mensagens não lidas
  unreadByRoom: Record<string, number>;
  
  // Incrementa 1 não lida para determinada sala
  incrementUnread: (roomId: string) => void;
  
  // Limpa as não lidas de uma sala ao abri-la
  clearUnreadForRoom: (roomId: string) => void;
  
  // Total de não lidas somando todas as salas
  getTotalUnread: () => number;

  // Reseta tudo
  clearAll: () => void;
}

export const useChatNotificationStore = create<ChatNotificationState>()(
  persist(
    (set, get) => ({
      unreadByRoom: {},

      incrementUnread: (roomId) =>
        set((state) => ({
          unreadByRoom: {
            ...state.unreadByRoom,
            [roomId]: (state.unreadByRoom[roomId] || 0) + 1,
          },
        })),

      clearUnreadForRoom: (roomId) =>
        set((state) => {
          const updated = { ...state.unreadByRoom };
          delete updated[roomId];
          return { unreadByRoom: updated };
        }),

      getTotalUnread: () => {
        const counts = Object.values(get().unreadByRoom);
        return counts.reduce((acc, curr) => acc + curr, 0);
      },

      clearAll: () => set({ unreadByRoom: {} }),
    }),
    {
      name: "kanban-chat-notifications-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);