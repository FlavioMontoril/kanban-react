import { create } from "zustand";

export type OptionsView = "kanban" | "Workflows" | string;

interface ViewState {
  selectedView: OptionsView;
  setSelectedView: (view: OptionsView) => void;
}

export const useViewStore = create<ViewState>((set) => ({
  // 🎯 Inicializa lendo do localStorage diretamente
  selectedView: (localStorage.getItem("view-mode") as OptionsView) || "kanban",

  setSelectedView: (view: OptionsView) => {
    localStorage.setItem("view-mode", view);
    set({ selectedView: view });
  },
}));