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
  publish: (destination: string, body: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  subscribe: () => null,
  publish: () => {},
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

    // Se deslogar ou não tiver token, garante encerramento da conexão
    if (!currentToken) {
      console.log("[WebSocketProvider] Token de autenticação não encontrado.");
      if (clientRef.current?.active) {
        clientRef.current.deactivate();
      }
      clientRef.current = null;
      setIsConnected(false);
      return;
    }

    // Se a instância já estiver ativa e conectada, reutiliza a conexão existente
    if (clientRef.current?.active && clientRef.current?.connected) {
      return;
    }

    console.log("[WebSocketProvider] 🔌 Iniciando conexão...");

    const WS_URL = import.meta.env.VITE_WS_URL;

    const client = new Client({
      webSocketFactory: () =>
        new SockJS(WS_URL, null, { withCredentials: true } as any),

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
        // Força atualização no próximo tick do React para garantir que o clientRef já esteja pronto
        setTimeout(() => {
          setIsConnected(true);
        }, 0);
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
      // Se o usuário deslogar (sem token no cookie), encerra a conexão
      if (!Cookies.get("auth_token") && clientRef.current) {
        console.log("[WebSocketProvider] 🔌 Encerrando cliente STOMP...");
        clientRef.current.deactivate();
        clientRef.current = null;
        setIsConnected(false);
      }
    };
    //Ao colocar `isAuthenticated` ou a checagem do cookie na dependência,
    // o useEffect roda novamente no momento exato em que o usuário faz login!
  }, [isAuthenticated]);

  const publish = useCallback((destination: string, body: any) => {
    if (!clientRef.current || !clientRef.current.connected) {
      console.warn(
        `[WebSocketProvider] Tentativa de envio para "${destination}" falhou: Socket desconectado.`,
      );
      return;
    }

    clientRef.current.publish({
      destination,
      body: JSON.stringify(body),
    });
  }, []);

  // Função genérica para qualquer componente se inscrever em qualquer tópico
  const subscribe = useCallback(
    (destination: string, callback: (message: any) => void) => {
      let sub: StompSubscription | null = null;
      let isUnsubscribed = false;

      const doSubscribe = () => {
        if (isUnsubscribed) return;

        // Se o cliente STOMP estiver ativo e conectado, realiza a subscrição imediatamente
        if (clientRef.current && clientRef.current.connected) {
          try {
            sub = clientRef.current.subscribe(destination, (message) => {
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
          } catch (err) {
            console.error(
              `[WebSocketProvider] Erro ao inscrever em ${destination}:`,
              err,
            );
          }
        } else {
          // Se ainda não estiver conectado, tenta novamente a cada 300ms até a conexão estabilizar
          setTimeout(doSubscribe, 300);
        }
      };

      doSubscribe();

      // Retorna um objeto de subscrição seguro para o cleanup do useEffect
      return {
        unsubscribe: () => {
          isUnsubscribed = true;
          if (sub && typeof sub.unsubscribe === "function") {
            sub.unsubscribe();
          }
        },
      } as StompSubscription;
    },
    [],
  );

  return (
    <WebSocketContext.Provider value={{ isConnected, subscribe, publish }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
