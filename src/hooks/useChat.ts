import { useEffect, useCallback } from "react";
import { useChatStore } from "@/store/useChatStore";
import { useWebSocket } from "@/providers/WebSocketProvider";
import { chatService } from "@/services/chatService";
import { api } from "@/services/api";
import type { CreateRoomPayload, Message, UserAuth } from "@/types/chat/chat";

export function useChat() {
  const { isConnected, subscribe, publish } = useWebSocket();
  const {
    rooms,
    activeRoom,
    messages,
    systemUsers,
    isLoadingRooms,
    isLoadingMessages,
    setRooms,
    addRoom,
    setActiveRoom,
    setMessages,
    addMessage,
    setSystemUsers,
    setIsLoadingRooms,
    setIsLoadingMessages,
  } = useChatStore();

  const fetchInitialData = useCallback(async () => {
    setIsLoadingRooms(true);
    try {
      const [roomsData, usersRes] = await Promise.allSettled([
        chatService.getUserRooms(),
        api.get<UserAuth[]>("/api/v1/users"),
      ]);

      if (roomsData.status === "fulfilled") {
        setRooms(roomsData.value);
      } else {
        setRooms([]);
      }

      if (usersRes.status === "fulfilled") {
        setSystemUsers(usersRes.value.data);
      } else {
        setSystemUsers([]);
      }
    } catch (error) {
      console.error("[useChat] Erro ao carregar dados iniciais:", error);
      setRooms([]);
      setSystemUsers([]);
    } finally {
      setIsLoadingRooms(false);
    }
  }, [setRooms, setSystemUsers, setIsLoadingRooms]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (!activeRoom || !isConnected) return;

    setIsLoadingMessages(true);
    chatService
      .getRoomMessagesHistory(activeRoom.id)
      .then((history) => setMessages(history.reverse()))
      .catch((err) => {
        console.error("[useChat] Erro ao buscar histórico:", err);
        setMessages([]);
      })
      .finally(() => setIsLoadingMessages(false));

    const subscription = subscribe(`/topic/room/${activeRoom.id}`, (newMessage: Message) => {
      addMessage(newMessage);
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [activeRoom, isConnected, subscribe, setMessages, addMessage, setIsLoadingMessages]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!activeRoom || !content.trim()) return;

      publish("/app/chat.sendMessage", {
        roomId: activeRoom.id,
        content: content.trim(),
      });
    },
    [activeRoom, publish]
  );

  const createRoom = useCallback(
    async (payload: CreateRoomPayload) => {
      const newRoom = await chatService.createRoom(payload);
      addRoom(newRoom);
      setActiveRoom(newRoom);
      return newRoom;
    },
    [addRoom, setActiveRoom]
  );

  return {
    rooms,
    activeRoom,
    messages,
    systemUsers,
    isConnected,
    isLoadingRooms,
    isLoadingMessages,
    setActiveRoom,
    sendMessage,
    createRoom,
  };
}