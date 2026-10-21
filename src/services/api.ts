import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL as string || "";

// if (!baseURL) {
//   throw new Error(
//     "A variável de ambiente VITE_API_BASE_URL não está configurada.",
//   );
// }

export const api = axios.create({
  baseURL,
  withCredentials: true, //OBRIGATÓRIO: Instrui o Axios/Navegador a enviar cookies HttpOnly em todas as requisições
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de Resposta: Captura 401 Unauthorized (sessão expirada) e redireciona para login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);
