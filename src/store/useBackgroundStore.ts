import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BackgroundOption {
  id: string;
  label: string;
  url: string | null;
}

interface BackgroundStore {
  bgImage: string | null;
  customOption: BackgroundOption | null; // Guarda apenas UMA foto do utilizador
  setBgImage: (url: string | null) => void;
  setCustomBgImage: (file: File) => void;
  removeCustomBgImage: () => void;
}

export const useBackgroundStore = create<BackgroundStore>()(
  persist(
    (set) => ({
      bgImage: null,
      customOption: null,

      setBgImage: (url) => set({ bgImage: url }),

      // Subtitui a foto anterior por esta nova foto
      setCustomBgImage: (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          const newCustomOption: BackgroundOption = {
            id: "custom-single-bg",
            label: file.name,
            url: base64String,
          };

          set({
            bgImage: base64String,
            customOption: newCustomOption, // Substitui automaticamente a foto antiga
          });
        };
        reader.readAsDataURL(file);
      },

      // Elimina a foto personalizada e volta ao fundo padrão
      removeCustomBgImage: () => {
        set({
          customOption: null,
          bgImage: null,
        });
      },
    }),
    {
      name: "kanban-background-storage",
    }
  )
);