import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8080', // Ajuste a porta se necessário
  headers: {
    'Content-Type': 'application/json',
  },
});