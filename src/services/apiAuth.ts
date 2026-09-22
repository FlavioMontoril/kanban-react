import axios from 'axios';
import Cookies from "js-cookie";

const baseURL = import.meta.env.VITE_API_AUTH_BASE_URL as string;

if (!baseURL) {
  throw new Error("A variável de ambiente VITE_API_AUTH_BASE_URL não está configurada.");
}

export const apiAuth = axios.create({
  baseURL,
  // headers: {
  //   'Content-Type': 'application/json',
  // },
});

// Injeta o token JWT obtido dos Cookies em cada requisição
apiAuth.interceptors.request.use((config) => {
  const token = Cookies.get("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// // Injeta o token obtido do localStorage (ou do local onde ele estiver armazenado no client)
// apiAuth.interceptors.request.use((config) => {
//   // Substitua 'auth_token' pela chave correta utilizada no seu localStorage/sessionStorage
//   const token = localStorage.getItem("auth_token"); 

//   if (token) {
//     // Caso a API exija o formato Padrão Bearer no header Authorization:
//     config.headers.Authorization = `Bearer ${token}`;

//     // SE o seu backend exigir um nome de cabeçalho customizado (ex: 'X-Auth-Token'), use:
//     // config.headers['X-Auth-Token'] = token;
//   }

//   // Tratamento do Content-Type conforme o tipo de corpo da requisição
//   if (config.data instanceof FormData) {
//     delete config.headers["Content-Type"];
//   } else if (!config.headers["Content-Type"]) {
//     config.headers["Content-Type"] = "application/json";
//   }

//   return config;
// });
