export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface JwtPayload {
  iss: string;
  sub: string; // Email do usuário
  id: string; // UUID do usuário no JWT
  role: string; // Ex: "ADMIN", "USER"
  name: string;
  exp: number; // Data de expiração (timestamp)
}

export interface UserAuthInfo {
  id: string;
  name: string;
  email: string;
  role: string;
}