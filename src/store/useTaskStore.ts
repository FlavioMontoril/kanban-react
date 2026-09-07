import { create } from "zustand";
import type { PageResponse, Task, TaskStatus } from "../types/task";

interface TaskState {
  tasks: Task[];
  pageData: PageResponse<Task> | null;
  currentPage: number;
  size: number;
  setTasks: (tasks: Task[]) => void;
  setPageData: (pageData: PageResponse<Task> | null) => void;
  setCurrentPage: (page: number) => void; // 👈 Ação para atualizar a página
  updateTaskLocal: (id: string, updatedTask: Partial<Task>) => void;
  moveTaskLocal: (taskId: string, targetStatus: TaskStatus) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  pageData: null,
  currentPage: 0,
  size: 20,

  setTasks: (tasks) => set({ tasks }),

  setPageData: (pageData) => set({ pageData, currentPage: pageData?.page }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  // Atualização otimista/local de campos
  updateTaskLocal: (id, updatedTask) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...updatedTask } : t,
      ),
    })),

  // Atualização otimista do status ao arrastar o card
  moveTaskLocal: (taskId, targetStatus) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status: targetStatus } : t,
      ),
    })),
}));
