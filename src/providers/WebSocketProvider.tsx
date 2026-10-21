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
  subscribe: <T = unknown>(
    destination: string,
    callback: (message: T) => void,
  ) => StompSubscription | null;
  publish: (destination: string, body: unknown) => void;
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
  const [isConnectedState, setIsConnectedState] = useState<boolean>(false);
  const { isAuthenticated } = useAuthStore();
  const isConnected = isAuthenticated && isConnectedState;

  useEffect(() => {
    if (!isAuthenticated) {
      console.log("[WebSocketProvider] Token de autenticação não encontrado.");
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

    console.log("[WebSocketProvider] 🔌 Iniciando conexão...");

    // Se a variável contiver apenas '/ws', concatena com a origem do navegador
    // ✅ Monta explicitamente a URL absoluta do endpoint HTTP/SockJS no Nginx
    // Exemplo final: "http://ip:port/ws-kanban"
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const wsEndpoint = `${origin}/ws-kanban/`;

    // const WS_URL = import.meta.env.VITE_WS_URL || "/ws-kanban";

    const client = new Client({
      webSocketFactory: () =>
        new SockJS(wsEndpoint, null, { withCredentials: true } as SockJS.Options),

      reconnectDelay: 5000, // Tenta reconectar a cada 5 segundos se a conexão cair
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: () => {
        console.log("[WebSocketProvider] ✅ Conectado ao WebSocket via STOMP.");
        // Força atualização no próximo tick do React para garantir que o clientRef já esteja pronto
        setTimeout(() => {
          setIsConnectedState(true);
        }, 0);
      },
      onDisconnect: () => {
        console.log("[WebSocketProvider] ⚠️ Desconectado do WebSocket.");
        setIsConnectedState(false);
      },
      onWebSocketClose: () => {
        console.log(
          "[WebSocketProvider] ⚠️ Conexão STOMP fechada/desconectada.",
        );
        setIsConnectedState(false);
      },
      onStompError: (frame) => {
        console.error(
          "[WebSocketProvider] ❌ Erro de WebSocket STOMP:",
          frame.headers["message"],
        );
        setIsConnectedState(false);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      // Se o usuário deslogar (sem token no cookie), encerra a conexão
      if (!isAuthenticated && clientRef.current) {
        console.log("[WebSocketProvider] 🔌 Encerrando cliente STOMP...");
        clientRef.current.deactivate();
        clientRef.current = null;
        setIsConnectedState(false);
      }
    };
    //Ao colocar `isAuthenticated` ou a checagem do cookie na dependência,
    // o useEffect roda novamente no momento exato em que o usuário faz login!
  }, [isAuthenticated]);

  const publish = useCallback((destination: string, body: unknown) => {
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
    <T = unknown,>(destination: string, callback: (message: T) => void) => {
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
