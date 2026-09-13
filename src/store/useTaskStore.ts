import { create } from "zustand";
import type { PageResponse, Task, TaskStatus } from "../types/task";
import type { DateRange } from "react-day-picker";

interface TaskState {
  tasks: Task[];
  pageData: PageResponse<Task> | null;
  selectedStatus: TaskStatus | null;
  search: string;
  dateRange: DateRange | undefined;
  currentPage: number;
  size: number;
  setTasks: (tasks: Task[]) => void;
  setPageData: (pageData: PageResponse<Task> | null) => void;
  setSearch: (search: string) => void; // 🎯 Nova ação de busca
  setCurrentPage: (page: number) => void; // 👈 Ação para atualizar a página
  setStatus: (selectedStatus: TaskStatus | null) => void;
  setDateRange: (range: DateRange | undefined) => void; // 👈 Nova ação
  updateTaskLocal: (id: string, updatedTask: Partial<Task>) => void;
  moveTaskLocal: (taskId: string, targetStatus: TaskStatus) => void;
  removeTasksLocal: (taskIds: string[]) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  pageData: null,
  selectedStatus: null,
  search: "",
  dateRange: undefined,
  currentPage: 0,
  size: 20,

  setTasks: (tasks) => set({ tasks }),

  setPageData: (pageData) => set({ pageData, currentPage: pageData?.page }),
  setSearch: (search: string) => set({ search, currentPage: 0 }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setStatus: (status: TaskStatus | null) => set({ selectedStatus: status }),
  setDateRange: (range) => set({ dateRange: range }),
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

  removeTasksLocal: (taskIds) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => !taskIds.includes(task.id)),
    })),
}));
