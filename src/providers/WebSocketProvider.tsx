/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
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
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      reconnectDelay: 5000, // Tenta reconectar a cada 5 segundos se a conexão cair
      onConnect: () => {
        console.log("Conectado ao WebSocket via STOMP");
        setIsConnected(true);
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
      onWebSocketClose: () => {
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.error("Erro no STOMP:", frame.headers["message"]);
        setIsConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      setIsConnected(false);
    };
  }, []);

  // Função genérica para qualquer componente se inscrever em qualquer tópico
  const subscribe = (destination: string, callback: (message: any) => void) => {
    if (!clientRef.current || !isConnected) return null;

    return clientRef.current.subscribe(destination, (message) => {
      callback(JSON.parse(message.body));
    });
  };

  return (
    <WebSocketContext.Provider value={{ isConnected, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
