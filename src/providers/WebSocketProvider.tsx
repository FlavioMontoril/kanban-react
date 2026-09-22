import Cookies from "js-cookie";
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

interface WebSocketContextType {
  isConnected: boolean;
  subscribe: (
    destination: string,
    callback: (message: any) => void,
  ) => StompSubscription | null;
}

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  subscribe: () => null,
});

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    // Evita reconectar se o cliente já estiver ativo
    if (clientRef.current?.active) {
      console.log("[WebSocketProvider] Conexão já ativa.");
      return;
    }

      const currentToken = Cookies.get("auth_token");
      if (!currentToken) {
        return; // Não conecta se não estiver logado
      }

    console.log("[WebSocketProvider] 🔌 Iniciando conexão...");
    
    const WS_URL = import.meta.env.VITE_WS_URL;

    const client = new Client({
      webSocketFactory: () => {
        const currentToken = Cookies.get("auth_token");
        return new SockJS(currentToken ? `${WS_URL}?token=${currentToken}` : WS_URL);
      },
      beforeConnect: () => {
        const currentToken = Cookies.get("auth_token");
        if (currentToken) {
          client.connectHeaders = { Authorization: `Bearer ${currentToken}` };
        }
      },
      reconnectDelay: 5000, // Tenta reconectar a cada 5 segundos se a conexão cair
      onConnect: () => {
        console.log("[WebSocketProvider] ✅ Conectado ao WebSocket via STOMP.");
        setIsConnected(true);
      },
      onDisconnect: () => {
        console.log("[WebSocketProvider] ⚠️ Desconectado do WebSocket.");
        setIsConnected(false);
      },
      onWebSocketClose: () => {
        console.log(
          "[WebSocketProvider] ⚠️ Conexão STOMP fechada/desconectada.",
        );
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.error(
          "[WebSocketProvider] ❌ Erro de WebSocket STOMP:",
          frame.headers["message"],
        );
        setIsConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      console.log("[WebSocketProvider] 🔌 Desativando conexão...");
      client.deactivate();
      setIsConnected(false);
    };
  }, []);

  // Função genérica para qualquer componente se inscrever em qualquer tópico
  const subscribe = useCallback(
    (destination: string, callback: (message: any) => void) => {
      if (!clientRef.current || !clientRef.current.connected) {
        console.warn(
          `[WebSocketProvider] Tentativa de inscrição em "${destination}" falhou: Socket desconectado.`,
        );
        return null;
      }

      return clientRef.current.subscribe(destination, (message) => {
        try {
          const parsedData = JSON.parse(message.body);
          callback(parsedData);
        } catch (err) {
          console.error(
            `[WebSocketProvider] Erro ao processar mensagem do tópico ${destination}:`,
            err,
          );
        }
      });
    },
    [],
  );

  return (
    <WebSocketContext.Provider value={{ isConnected, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
