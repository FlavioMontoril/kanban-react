import { authApi } from "@/services/authService";
import { useAuthStore } from "@/store/useAuthStore";
import { useUserStore } from "@/store/useUserStore";
import type { LoginRequest } from "@/types/authentication";
import type { UserRequest } from "@/types/user";
import { useCallback, useState } from "react";

export function useAuth() {
  const {roles, users, setRoles, setUsers} = useUserStore()
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuthStore();

  const loginUser = async (data: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.login(data);
      if (response.token) {
        // Grava o cookie e atualiza a Zustand Store
        login(response.token);
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

  const fetchUsers = useCallback(async () => {
    try {
      const data = await authApi.findAllUsers();
      setUsers(data);
      return data;
    } catch (err: unknown) {
      console.error("Erro ao carregar utilizadores:", err);
      return [];
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const data = await authApi.findAllRoles();
      setRoles(data);
      return data;
    } catch (err) {
      console.error("Erro ao carregar roles:", err);
      return [];
    }
  }, []);

  return {
    users,
    roles,
    login,
    loading,
    error,
    createUser,
    fetchRoles,
    fetchUsers,
    loginUser,
  };
}
