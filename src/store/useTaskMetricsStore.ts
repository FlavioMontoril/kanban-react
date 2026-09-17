import { create } from "zustand";
import type { TaskMetrics } from "@/types/task";

interface TaskMetricsState {
  metrics: TaskMetrics[];
  loadingMetrics: boolean;
  errorMetrics: string | null;
  setMetrics: (metrics: TaskMetrics[]) => void;
  setLoadingMetrics: (loading: boolean) => void;
  setErrorMetrics: (error: string | null) => void;
}

export const useTaskMetricsStore = create<TaskMetricsState>((set) => ({
  metrics: [],
  loadingMetrics: false,
  errorMetrics: null,
  setMetrics: (metrics) => set({ metrics }),
  setLoadingMetrics: (loadingMetrics) => set({ loadingMetrics }),
  setErrorMetrics: (errorMetrics) => set({ errorMetrics }),
}));