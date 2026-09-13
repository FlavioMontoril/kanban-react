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

      addNotifications: (newTasks) =>
        set((state) => {
          const existingIds = new Set(state.notifications.map((t) => t.id));
          const filteredNewTasks = newTasks.filter((t) => !existingIds.has(t.id));
          return { notifications: [...filteredNewTasks, ...state.notifications] };
        }),

      markAsRead: (taskId) =>
        set((state) => ({
          notifications: state.notifications.filter((t) => t.id !== taskId),
        })),

      clearAll: () => set({ notifications: [] }),
    }),
    {
      name: 'kanban-notifications-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);