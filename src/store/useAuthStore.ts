import { create } from "zustand";
import type { UserAuthInfo } from "@/types/authentication";

interface AuthState {
  user: UserAuthInfo | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  loginState: (user: UserAuthInfo) => void;
  logoutState: () => void;
  setCheckingAuth: (checking: boolean) => void; // Indica se estamos validando a sessão ao abrir/recarregar a página
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isCheckingAuth: true,

  loginState: (user) =>
    set({
      user,
      isAuthenticated: true,
      isCheckingAuth: false,
    }),

  logoutState: () =>
    set({
      user: null,
      isAuthenticated: false,
      isCheckingAuth: false,
    }),

  setCheckingAuth: (isCheckingAuth: boolean) => set({ isCheckingAuth }),
}));
