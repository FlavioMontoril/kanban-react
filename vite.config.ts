import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Configurações do servidor de desenvolvimento local
  server: {
    // Fixa a porta do servidor dev em 5173 para alinhar com o mapeamento do Docker (5173:8080)
    port: 5173,
    // Impede que o Vite troque para a porta 5174 se a 5173 estiver ocupada, garantindo previsibilidade
    strictPort: true,
    // Configuração para monitorizar alterações de ficheiros no sistema de ficheiros
    watch: {
      // Força o uso de polling para detectar mudanças de ficheiros dentro de containers Docker/Linux
      usePolling: true,
    },
  },
  define: {
    // Evita erros em bibliotecas que procuram 'process.env' no browser
    "process.env": {},
    // Resolve o problema do SockJS procurando o objeto 'global'
    global: "globalThis",
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
