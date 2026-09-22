import axios from 'axios';
import Cookies from "js-cookie";

const baseURL = import.meta.env.VITE_API_BASE_URL as string;

if (!baseURL) {
  throw new Error("A variável de ambiente VITE_API_BASE_URL não está configurada.");
}

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Lê o token do cookie e injeta no cabeçalho de saída
api.interceptors.request.use((config) => {
  const token = Cookies.get("auth_token");
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});