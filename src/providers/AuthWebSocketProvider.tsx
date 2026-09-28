import Cookies from "js-cookie";
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
  subscribe: (
    destination: string,
    callback: (message: any) => void,
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
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const currentToken = Cookies.get("auth_token");

    if (!currentToken) {
      if (clientRef.current?.active) {
        clientRef.current.deactivate();
        setIsConnected(false);
      }
      return;
    }

    if (clientRef.current?.active && clientRef.current?.connected) {
      return;
    }

    // 🎯 URL do WebSocket da API de Autenticação (ex: http://localhost:8081/ws)
    const AUTH_WS_URL = import.meta.env.VITE_AUTH_WS_URL;

    const client = new Client({
      webSocketFactory: () => new SockJS(AUTH_WS_URL),

      beforeConnect: () => {
        const token = Cookies.get("auth_token");
        if (token) {
          client.connectHeaders = { Authorization: `Bearer ${token}` };
        }
      },

      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: () => {
        console.log("[AuthWebSocket] ✅ Conectado ao WebSocket de Autenticação.");
        setIsConnected(true);
      },
      onDisconnect: () => setIsConnected(false),
      onWebSocketClose: () => setIsConnected(false),
      onStompError: (frame) => {
        console.error("[AuthWebSocket] ❌ Erro STOMP Auth:", frame.headers["message"]);
        setIsConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      setIsConnected(false);
    };
  }, [isAuthenticated]);

  const subscribe = useCallback(
    (destination: string, callback: (message: any) => void) => {
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