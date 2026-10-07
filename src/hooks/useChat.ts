import { useEffect, useCallback } from "react";
import { useChatStore } from "@/store/useChatStore";
import { useWebSocket } from "@/providers/WebSocketProvider";
import { chatService } from "@/services/chatService";
import type { CreateRoomPayload } from "@/types/chat-types";

export function useChat() {
  const { isConnected } = useWebSocket();
  const {
    rooms,
    usersMap,
    activeRoom,
    messages,
    systemUsers,
    isLoadingRooms,
    isLoadingMessages,
    fetchUserById,
    setRooms,
    addRoom,
    setActiveRoom,
    setMessages,
    addMessage,
    setIsLoadingRooms,
    setIsLoadingMessages,
  } = useChatStore();

  // Busca inicial de salas do usuário
  const fetchInitialData = useCallback(async () => {
    setIsLoadingRooms(true);
    try {
      const roomsData = await chatService.getUserRooms();
      setRooms(roomsData || []);
    } catch (error) {
      console.error("[useChat] Erro ao carregar salas de conversa:", error);
      setRooms([]);
    } finally {
      setIsLoadingRooms(false);
    }
  }, [setRooms, setIsLoadingRooms]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // HISTÓRICO DE MENSAGENS: Busca REST ao trocar de sala ativa
  useEffect(() => {
    if (!activeRoom) return;

    setIsLoadingMessages(true);
    chatService
      .getRoomMessagesHistory(activeRoom.id)
      .then((history) => {
        const orderedHistory = history.reverse();
        setMessages(orderedHistory);

        orderedHistory.forEach((msg) => {
          if (msg.senderId) fetchUserById(String(msg.senderId));
        });
      })
      .catch((err) => {
        console.error("[useChat] Erro ao buscar histórico:", err);
        setMessages([]);
      })
      .finally(() => setIsLoadingMessages(false));
  }, [activeRoom, setMessages, setIsLoadingMessages, fetchUserById]);

  // 5. ENVIO DE MENSAGEM (REST POST + Atualização do Remetente)
  const sendMessage = useCallback(
    async (content: string) => {
      if (!activeRoom || !content.trim()) return;

      try {
        const sentMessage = await chatService.sendMessage({
          roomId: activeRoom.id,
          content: content.trim(),
        });

        // Atualiza a tela local do remetente
        addMessage(sentMessage);
      } catch (error) {
        console.error("[useChat] Erro ao enviar mensagem:", error);
      }
    },
    [activeRoom, addMessage],
  );

  // 6. CRIAÇÃO DE SALA (REST POST + Atualização do Criador)
  const createRoom = useCallback(
    async (payload: CreateRoomPayload) => {
      const room = await chatService.createRoom(payload);

      const exists = rooms.some((r) => r.id === room.id);
      if (!exists) {
        addRoom(room);
      }

      setActiveRoom(room);
      return room;
    },
    [rooms, addRoom, setActiveRoom],
  );

  return {
    rooms,
    usersMap,
    activeRoom,
    messages,
    systemUsers,
    isConnected,
    isLoadingRooms,
    isLoadingMessages,
    fetchUserById,
    setActiveRoom,
    sendMessage,
    createRoom,
  };
}
