export interface UserResponse {
  id: string;
  name: string;
  email: string;
  avatar: string;
  roleId: string;
}

export interface UserRequest {
  name: string;
  email: string;
  password: string;
  avatar?: File | null;
  roleId: string;
}
