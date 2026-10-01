import { create } from "zustand";
import type { UserPresenceDTO, UserResponse } from "@/types/user";
import type { RoleResponse } from "@/types/role";

interface UserState {
  users: UserResponse[];
  roles: RoleResponse[];
  setUsers: (users: UserResponse[]) => void;
  setRoles: (roles: RoleResponse[]) => void;
  updateUserPresence: (presence: UserPresenceDTO) => void;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  roles: [],
  setUsers: (users) => set({ users }),
  setRoles: (roles) => set({ roles }),
  updateUserPresence: (presence) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === presence.id
          ? { ...user, connected: presence.connected }
          : user
      ),
    })),
}));