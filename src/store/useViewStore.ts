import { create } from "zustand";

export type OptionsView = "kanban" | "flow" | string;

interface ViewState {
  selectedView: OptionsView;
  setSelectedView: (view: OptionsView) => void;
}

export const useViewStore = create<ViewState>((set) => ({
  selectedView: (localStorage.getItem("view-mode") as OptionsView) || "kanban",

  setSelectedView: (view: OptionsView) => {
    localStorage.setItem("view-mode", view);
    set({ selectedView: view });
  },
}));