import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TaskStatus, type Task } from '../types/task';

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'code' | 'createdAt'>) => void;
  updateTask: (id: string, fields: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, targetStatus: TaskStatus) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [
        {
          id: '1',
          code: 'TSK-1001',
          status: TaskStatus.OPEN,
          reporter: 'João Silva',
          createdAt: new Date().toISOString()
        }
      ],

      addTask: (data) => {
        const newTask: Task = {
          ...data,
          id: crypto.randomUUID(),
          code: `TSK-${Math.floor(1000 + Math.random() * 9000)}`,
          createdAt: new Date().toISOString()
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
      },

      updateTask: (id, fields) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...fields, updatedAt: new Date().toISOString() } : t
          )
        }));
      },

      deleteTask: (id) => {
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
      },

      moveTask: (taskId, targetStatus) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, status: targetStatus, updatedAt: new Date().toISOString() } : t
          )
        }));
      }
    }),
    { name: 'svar-kanban-storage' }
  )
);