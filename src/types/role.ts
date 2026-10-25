export type RoleOptions = "ADMIN" | "COMMON" | "GUEST" | "MASTER";

export interface RoleResponse {
  id: string;
  name: RoleOptions;
  createdAt: string;
}