import { create } from "zustand";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import type { JwtPayload, UserAuthInfo } from "@/types/authentication";

const TOKEN_KEY = "auth_token";

// Helper para decodificar o token com segurança
const getUserFromToken = (token: string | null): UserAuthInfo | null => {
  if (!token) return null;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    
    // Verifica se o token expirou
    if (decoded.exp * 1000 < Date.now()) {
      Cookies.remove(TOKEN_KEY);
      return null;
    }

    return {
      id: decoded.id || "",
      name: decoded.name,
      email: decoded.sub,
      role: decoded.role,
    };
  } catch (error) {
    console.error("Erro ao decodificar o token JWT:", error);
    return null;
  }
};

interface AuthState {
  token: string | null;
  user: UserAuthInfo | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  getUserInfo: () => UserAuthInfo | null;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const initialToken = Cookies.get(TOKEN_KEY) || null;
  const initialUser = getUserFromToken(initialToken);

  return {
    token: initialToken,
    user: initialUser,
    isAuthenticated: Boolean(initialToken && initialUser),

    login: (token: string) => {
      Cookies.set(TOKEN_KEY, token, {
        expires: 7,
        sameSite: "strict",
        secure: window.location.protocol === "https:",
      });

      const user = getUserFromToken(token);

      set({
        token,
        user,
        isAuthenticated: Boolean(user),
      });
    },

    logout: () => {
      Cookies.remove(TOKEN_KEY);
      set({
        token: null,
        user: null,
        isAuthenticated: false,
      });
    },

    // Função utilitária para extrair/obter os dados a qualquer momento
    getUserInfo: () => get().user,
  };
});