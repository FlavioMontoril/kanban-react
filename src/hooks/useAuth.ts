import { authApi } from "@/services/authService";
import { useAuthStore } from "@/store/useAuthStore";
import { useUserStore } from "@/store/useUserStore";
import type { LoginRequest } from "@/types/authentication";
import type { UserRequest } from "@/types/user";
import { useCallback, useState } from "react";

export function useAuth() {
  const { roles, users, setRoles, setUsers } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { loginState, logoutState, setCheckingAuth } = useAuthStore();

  const loginUser = async (data: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.login(data);
      if (response === 200) {
        await checkSession();
      }
      return response;
    } catch (err: any) {
      const message =
        err.response?.data?.message || "E-mail ou senha incorretos";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Restaura a sessão ao dar F5 na página
  const checkSession = useCallback(async () => {
    try {
      setCheckingAuth(true);
      const user = await authApi.getMe(); // O browser envia o cookie HttpOnly automaticamente
      loginState(user);
    } catch {
      // Se der 401 ou erro, limpa o estado (cookie expirou ou não existe)
      logoutState();
    } finally {
      setCheckingAuth(false);
    }
  }, [loginState, logoutState, setCheckingAuth]);

  const logoutUser = async () => {
    try {
      await authApi.logout(); // Chama o backend para expirar o cookie HttpOnly
    } finally {
      logoutState(); // Limpa a store no frontend
    }
  };

  const createUser = async (data: FormData | UserRequest) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.createUser(data);
      fetchUsers();
    } catch (err: any) {
      const message = err.response?.data?.message || "Erro ao criar utilizador";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const avatarUpload = async (userId: string, data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.updateAvatar(userId, data);
      fetchUsers();
    } catch (err: any) {
      const message = err.response?.data?.message || "Erro ao criar utilizador";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = useCallback(async () => {
    try {
      const data = await authApi.findAllUsers();
      setUsers(data);
      return data;
    } catch (err: unknown) {
      console.error("Erro ao carregar utilizadores:", err);
      return [];
    }
  }, [setUsers]);

  const fetchRoles = useCallback(async () => {
    try {
      const data = await authApi.findAllRoles();
      setRoles(data);
      return data;
    } catch (err) {
      console.error("Erro ao carregar roles:", err);
      return [];
    }
  }, [setRoles]);

  return {
    users,
    roles,
    loading,
    error,
    checkSession,
    avatarUpload,
    createUser,
    fetchRoles,
    fetchUsers,
    loginUser,
    logoutUser,
  };
}
