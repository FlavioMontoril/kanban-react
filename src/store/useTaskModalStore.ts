import { create } from "zustand";
import type { Task } from "@/types/task";

export type ModalMode = "create" | "edit" | "view" | "updateStatus";

interface TaskModalState {
  isOpen: boolean;
  mode: ModalMode;
  task: Task | null;
  
  openModal: (mode: ModalMode, task?: Task | null) => void;
  closeModal: () => void;
}

export const useTaskModalStore = create<TaskModalState>((set) => ({
  isOpen: false,
  mode: "create",
  task: null,

  openModal: (mode, task = null) => set({ isOpen: true, mode, task }),
  closeModal: () => set({ isOpen: false, task: null }),
}));