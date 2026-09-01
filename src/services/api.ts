import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL as string;

export const api = axios.create({
  baseURL, // Ajuste a porta se necessário
  headers: {
    'Content-Type': 'application/json',
  },
});