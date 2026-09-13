import type { Task } from '@/types/task';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface NotificationState {
  notifications: Task[];
  addNotifications: (newTasks: Task[]) => void;
  markAsRead: (taskId: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],

      // Adiciona as novas tarefas recebidas via WebSocket ao topo da lista (evitando duplicados)
      addNotifications: (newTasks) =>
        set((state) => {
          const existingIds = new Set(state.notifications.map((t) => t.id));
          const filteredNewTasks = newTasks.filter((t) => !existingIds.has(t.id));
          return { notifications: [...filteredNewTasks, ...state.notifications] };
        }),

      // Remove uma notificação específica ao clicar/marcar como lida
      markAsRead: (taskId) =>
        set((state) => ({
          notifications: state.notifications.filter((t) => t.id !== taskId),
        })),

      // Limpa todas as notificações de uma vez
      clearAll: () => set({ notifications: [] }),
    }),
    {
      name: 'kanban-notifications-storage', // Chave onde os dados serão salvos no LocalStorage
      storage: createJSONStorage(() => localStorage), // (Opcional) Define o localStorage explicitamente
    }
  )
);