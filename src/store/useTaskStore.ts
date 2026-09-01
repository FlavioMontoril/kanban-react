import { create } from "zustand";
import type { Task, TaskStatus } from "../types/task";

interface TaskState {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  updateTaskLocal: (id: string, updatedTask: Partial<Task>) => void;
  moveTaskLocal: (taskId: string, targetStatus: TaskStatus) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],

  // Define toda a lista de tarefas (vinda da API)
  setTasks: (tasks) => set({ tasks }),

  // Atualização otimista/local de campos
  updateTaskLocal: (id, updatedTask) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updatedTask } : t)),
    })),

  // Atualização otimista do status ao arrastar o card
  moveTaskLocal: (taskId, targetStatus) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status: targetStatus } : t
      ),
    })),
}));