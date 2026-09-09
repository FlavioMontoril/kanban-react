import type { TaskHistories } from "@/types/task-history";
import { create } from "zustand";

interface TaskHistoryState {
  // Estado mapeado por taskId: { [taskId: string]: TaskHistories[] }
  histories: TaskHistories[];

  // Ações de gerenciamento de estado
  setTaskHistories: (data: TaskHistories[]) => void;
  clearHistories: () => void;
}

export const useTaskHistoryStore = create<TaskHistoryState>((set) => ({
  histories: [],

  // Salva ou atualiza o histórico de uma tarefa específica
  setTaskHistories: (data) => set({ histories: data }),

  // Limpa o estado global de históricos
  clearHistories: () => set({ histories: [] }),
}));
