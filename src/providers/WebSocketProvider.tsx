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
import { useAuthStore } from "@/store/useAuthStore";

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

  // Pegamos o estado de login do AuthContext para disparar o useEffect automaticamente pós-login
  const { isAuthenticated } = useAuthStore(); // Ou leia o token diretamente

  useEffect(() => {
    const currentToken = Cookies.get("auth_token");

    // Se deslogar, desconecta o socket existente
    if (!currentToken) {
      console.log("[WebSocketProvider] Token de autenticação não encontrado.");
      if (clientRef.current?.active) {
        clientRef.current.deactivate();
        setIsConnected(false);
      }
      return;
    }

    // Se já estiver conectado com o cliente ativo, não reconecta
    if (clientRef.current?.active && clientRef.current?.connected) {
      return;
    }

    console.log("[WebSocketProvider] 🔌 Iniciando conexão...");

    const WS_URL= import.meta.env.VITE_WS_URL;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL, null, {withCredentials: true} as any),

      //Definimos o Header Authorization diretamente no objeto de configuração
      connectHeaders: {
        Authorization: `Bearer ${currentToken}`,
      },
      
      // webSocketFactory: () => new SockJS(WS_URL),

      // beforeConnect: () => {
      //   const token = Cookies.get("auth_token");
      //   if (token) {
      //     client.connectHeaders = { Authorization: `Bearer ${token}` };
      //   }
      // },

      reconnectDelay: 5000, // Tenta reconectar a cada 5 segundos se a conexão cair
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

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
     // Desativa apenas se o componente for realmente desmontado ao deslogar
      if (!Cookies.get("auth_token")) {
        console.log("[WebSocketProvider] 🔌 Encerrando cliente STOMP...");
        client.deactivate();
        setIsConnected(false);
        clientRef.current = null;
      }
    };
    //Ao colocar `isAuthenticated` ou a checagem do cookie na dependência,
    // o useEffect roda novamente no momento exato em que o usuário faz login!
  }, [isAuthenticated]);

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
