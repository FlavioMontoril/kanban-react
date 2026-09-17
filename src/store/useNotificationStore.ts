import type { Task } from "@/types/task";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type NotificationType = "CREATED" | "ARCHIVED" | "STATUS_CHANGED";

export interface AppNotification {
  id: string;
  type: NotificationType;
  task: Task;
  createdAt: string;
  read: boolean;
}

interface NotificationState {
  notifications: AppNotification[];
  addNotification: (task: Task, type: NotificationType) => void;
  addNotifications: (newTasks: Task[], type: NotificationType) => void;
  removeNotification: (notificationId: string) => void;
  markAsRead: (notificationId: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],

      // Adiciona uma única notificação
      addNotification: (task, type) =>
        set((state) => {
          const newNotification: AppNotification = {
            id: `${task.id}-${type}-${Date.now()}`,
            type,
            task,
            createdAt: new Date().toISOString(),
            read: false,
          };

          return {
            notifications: [newNotification, ...state.notifications],
          };
        }),

      // Adiciona uma lista de notificações (ex: lista de tarefas arquivadas)
      addNotifications: (newTasks, type) =>
        set((state) => {
          // const existingIds = new Set(
          //   state.notifications.map((n) => `${n.task.id}-${n.type}`)
          // );

          // const filteredNotifications: AppNotification[] = newTasks
          //   .filter((task) => !existingIds.has(`${task.id}-${type}`))
          //   .map((task) => ({
          //     id: `${task.id}-${type}-${Date.now()}`,
          //     type,
          //     task,
          //     createdAt: new Date().toISOString(),
          //   }));

          const newNotifications: AppNotification[] = newTasks.map((task) => ({
            // Gera um ID único baseado no timestamp exato para permitir múltiplos eventos da mesma task
            id: `${task.id}-${type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            type,
            task,
            createdAt: new Date().toISOString(),
            read: false,
          }));

          return {
            notifications: [...newNotifications, ...state.notifications],
          };
        }),

      removeNotification: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.filter(
            (n) => n.id !== notificationId,
          ),
        })),

      markAsRead: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification,
          ),
        })),

      clearAll: () => set({ notifications: [] }),
    }),
    {
      name: "kanban-notifications-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
