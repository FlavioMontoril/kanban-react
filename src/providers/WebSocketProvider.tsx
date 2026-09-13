import React, { createContext, useContext, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { toast } from "sonner";
import { useTaskStore } from "../store/useTaskStore";
import { useNotificationStore } from "../store/useNotificationStore";
import type { Task } from "@/types/task";

interface WebSocketContextType {
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
});

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { removeTasksLocal } = useTaskStore();
  const addNotifications = useNotificationStore(
    (state) => state.addNotifications,
  );
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      reconnectDelay: 5000, // Tenta reconectar a cada 5 segundos se a conexão cair
      onConnect: () => {
        console.log("Conectado ao WebSocket via STOMP");

        // Escuta o tópico de arquivamento de tarefas
        client.subscribe("/topic/tasks-archived", (message) => {
          const archivedTasks: Task[] = JSON.parse(message.body);
          const archivedTaskIds = archivedTasks.map((t) => t.id);

          // 1. Atualiza a lista da tela (Kanban/Tabela)
          removeTasksLocal(archivedTaskIds);

          // 2. Adiciona à store de Notificações (Sino)
          addNotifications(archivedTasks);

          // 3. Notificação Toast
          toast.info(
            `${archivedTasks.length} tarefa(s) foram arquivadas automaticamente.`,
          );
        });
      },
      onStompError: (frame) => {
        console.error("Erro no STOMP:", frame.headers["message"]);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [removeTasksLocal, addNotifications]);

  return (
    <WebSocketContext.Provider
      value={{ isConnected: !!clientRef.current?.connected }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
