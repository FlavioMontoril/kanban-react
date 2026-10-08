export interface UserResponse {
  id: string;
  name: string;
  email: string;
  avatar: string;
  connected: boolean;
  roleId: string;
}

export interface UserRequest {
  name: string;
  email: string;
  password: string;
  avatar?: File | null;
  roleId: string;
}

export interface UserPresenceDTO {
    id: string;
    name: string;
    avatar: string | null;
    connected: boolean;
}