import { create } from "zustand";
import type { UserResponse } from "@/types/user";
import type { RoleResponse } from "@/types/role";

interface UserState {
  users: UserResponse[];
  roles: RoleResponse[];
  setUsers: (users: UserResponse[]) => void;
  setRoles: (roles: RoleResponse[]) => void;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  roles: [],
  setUsers: (users) => set({ users }),
  setRoles: (roles) => set({ roles }),
}));