/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Client, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuthStore } from "@/store/useAuthStore";

interface AuthWebSocketContextType {
  isConnected: boolean;
  subscribe: <T = unknown>(
    destination: string,
    callback: (message: T) => void,
  ) => StompSubscription | null;
}

const AuthWebSocketContext = createContext<AuthWebSocketContextType>({
  isConnected: false,
  subscribe: () => null,
});

export const AuthWebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const clientRef = useRef<Client | null>(null);
  const [isConnectedState, setIsConnectedState] = useState<boolean>(false);
  const { isAuthenticated } = useAuthStore();
  const isConnected = isAuthenticated && isConnectedState;

  useEffect(() => {
    if (!isAuthenticated) {
      console.log(
        "[AuthWebSocketProvider] Token de autenticação não encontrado.",
      );
      if (clientRef.current?.active) {
        clientRef.current.deactivate();
      }
      clientRef.current = null;
      return;
    }

    // Se a instância já estiver ativa e conectada, reutiliza a conexão existente
    if (clientRef.current?.active && clientRef.current?.connected) {
      return;
    }

    console.log("[AuthWebSocketProvider] 🔌 Iniciando conexão...");

    const AUTH_WS_ENV = import.meta.env.VITE_AUTH_WS_URL || "/ws";

    // Se já for uma URL completa (ex: "http://localhost:8081/ws"), usa ela.
    // Se for apenas o caminho relativo (ex: "/ws"), concatena com o origin do Nginx ("http://localhost/ws").
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const wsEndpoint =
      AUTH_WS_ENV.startsWith("http") || AUTH_WS_ENV.startsWith("ws")
        ? AUTH_WS_ENV
        : `${origin}${AUTH_WS_ENV.startsWith("/") ? "" : "/"}${AUTH_WS_ENV}`;

    const client = new Client({
      // Habilita withCredentials no SockJS para enviar o cookie HttpOnly no Handshake HTTP
      webSocketFactory: () =>
        new SockJS(wsEndpoint, null, {
          withCredentials: true,
        } as SockJS.Options),

      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: () => {
        console.log(
          "[AuthWebSocket] ✅ Conectado ao WebSocket de Autenticação.",
        );
        setIsConnectedState(true);
      },
      onDisconnect: () => setIsConnectedState(false),
      onWebSocketClose: () => setIsConnectedState(false),
      onStompError: (frame) => {
        console.error(
          "[AuthWebSocket] ❌ Erro STOMP Auth:",
          frame.headers["message"],
        );
        setIsConnectedState(false);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      setIsConnectedState(false);
    };
  }, [isAuthenticated]);

  const subscribe = useCallback(
    <T = unknown,>(destination: string, callback: (message: T) => void) => {
      if (!clientRef.current || !clientRef.current.connected) {
        return null;
      }

      return clientRef.current.subscribe(destination, (message) => {
        try {
          const parsedData = JSON.parse(message.body);
          callback(parsedData);
        } catch (err) {
          console.error(`[AuthWebSocket] Erro no tópico ${destination}:`, err);
        }
      });
    },
    [],
  );

  return (
    <AuthWebSocketContext.Provider value={{ isConnected, subscribe }}>
      {children}
    </AuthWebSocketContext.Provider>
  );
};

export const useAuthWebSocket = () => useContext(AuthWebSocketContext);
