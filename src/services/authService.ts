import type { UserRequest, UserResponse } from "@/types/user";
import { apiAuth } from "./apiAuth";
import type { LoginRequest, LoginResponse } from "@/types/authentication";
import type { RoleResponse } from "@/types/role";

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiAuth.post<LoginResponse>("/api/auth/login", data);
    return response.data;
  },

  createUser: async (data: FormData | UserRequest): Promise<void> => {
    const response = await apiAuth.post("/api/users/create", data);
    return response.data;
  },

  findAllUsers: async (): Promise<UserResponse[]> => {
    const response = await apiAuth.get<UserResponse[]>("/api/users");
    return response.data;
  },

  findAllRoles: async (): Promise<RoleResponse[]> => {
    const response = await apiAuth.get<RoleResponse[]>("/api/roles");
    return response.data;
  },

  /**
   * Busca uma role específica pelo ID
   */
  findRoleById: async (roleId: string): Promise<RoleResponse> => {
    const response = await apiAuth.get<RoleResponse>(`/api/roles/${roleId}`);
    return response.data;
  },
};
