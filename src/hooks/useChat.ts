// import { useEffect, useCallback } from "react";
// import { useChatStore } from "@/store/useChatStore";
// import { useWebSocket } from "@/providers/WebSocketProvider";
// import { chatService } from "@/services/chatService";
// import { api } from "@/services/api";
// import type { CreateRoomPayload, Message, UserAuth } from "@/types/chat/chat";

// export function useChat() {
//   const { isConnected, subscribe, publish } = useWebSocket();
//   const {
//     rooms,
//     activeRoom,
//     messages,
//     systemUsers,
//     isLoadingRooms,
//     isLoadingMessages,
//     setRooms,
//     addRoom,
//     setActiveRoom,
//     setMessages,
//     addMessage,
//     setSystemUsers,
//     setIsLoadingRooms,
//     setIsLoadingMessages,
//   } = useChatStore();

//   const fetchInitialData = useCallback(async () => {
//     setIsLoadingRooms(true);
//     try {
//       const [roomsData, usersRes] = await Promise.allSettled([
//         chatService.getUserRooms(),
//         api.get<UserAuth[]>("/api/v1/users"),
//       ]);

//       if (roomsData.status === "fulfilled") {
//         setRooms(roomsData.value);
//       } else {
//         setRooms([]);
//       }

//       if (usersRes.status === "fulfilled") {
//         setSystemUsers(usersRes.value.data);
//       } else {
//         setSystemUsers([]);
//       }
//     } catch (error) {
//       console.error("[useChat] Erro ao carregar dados iniciais:", error);
//       setRooms([]);
//       setSystemUsers([]);
//     } finally {
//       setIsLoadingRooms(false);
//     }
//   }, [setRooms, setSystemUsers, setIsLoadingRooms]);

//   useEffect(() => {
//     fetchInitialData();
//   }, [fetchInitialData]);

//   useEffect(() => {
//     if (!activeRoom || !isConnected) return;

//     setIsLoadingMessages(true);
//     chatService
//       .getRoomMessagesHistory(activeRoom.id)
//       .then((history) => setMessages(history.reverse()))
//       .catch((err) => {
//         console.error("[useChat] Erro ao buscar histórico:", err);
//         setMessages([]);
//       })
//       .finally(() => setIsLoadingMessages(false));

//     const subscription = subscribe(`/topic/room/${activeRoom.id}`, (newMessage: Message) => {
//       addMessage(newMessage);
//     });

//     return () => {
//       if (subscription) subscription.unsubscribe();
//     };
//   }, [activeRoom, isConnected, subscribe, setMessages, addMessage, setIsLoadingMessages]);

//   const sendMessage = useCallback(
//     (content: string) => {
//       if (!activeRoom || !content.trim()) return;

//       publish("/app/chat.sendMessage", {
//         roomId: activeRoom.id,
//         content: content.trim(),
//       });
//     },
//     [activeRoom, publish]
//   );

//   const createRoom = useCallback(
//     async (payload: CreateRoomPayload) => {
//       const newRoom = await chatService.createRoom(payload);
//       addRoom(newRoom);
//       setActiveRoom(newRoom);
//       return newRoom;
//     },
//     [addRoom, setActiveRoom]
//   );

//   return {
//     rooms,
//     activeRoom,
//     messages,
//     systemUsers,
//     isConnected,
//     isLoadingRooms,
//     isLoadingMessages,
//     setActiveRoom,
//     sendMessage,
//     createRoom,
//   };
// }

import { useEffect, useCallback } from "react";
import { useChatStore } from "@/store/useChatStore";
import { useWebSocket } from "@/providers/WebSocketProvider";
import { chatService } from "@/services/chatService";
import type { ChatRoom, CreateRoomPayload, Message } from "@/types/chat/chat";
import { useAuthStore } from "@/store/useAuthStore";

export function useChat() {
  const { user } = useAuthStore(); // Obtém o usuário logado para montar a rota do canal
  const { isConnected, subscribe } = useWebSocket();
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

  // Busca inicial das salas
  const fetchInitialData = useCallback(async () => {
    setIsLoadingRooms(true);
    try {
      // Busca apenas as salas do usuário na API de Chat
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

  // ESCUTA EM TEMPO REAL: Novas salas criadas (/topic/user/{userId}/rooms)
  useEffect(() => {
    if (!user?.id || !isConnected) return;

    const subscription = subscribe(
      `/topic/user/${user.id}/rooms`,
      (newRoom: ChatRoom) => {
        addRoom(newRoom); // Atualiza a barra lateral instantaneamente
      },
    );

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [user?.id, isConnected, subscribe, addRoom]);

  // ESCUTA EM TEMPO REAL: Novas mensagens da sala ativa (/topic/room/{roomId})
  useEffect(() => {
    if (!activeRoom || !isConnected) return;

    setIsLoadingMessages(true);
    chatService
      .getRoomMessagesHistory(activeRoom.id)
      .then((history) => {
        const orderedHistory = history.reverse();
        setMessages(orderedHistory);

        orderedHistory.forEach((msg) => {
          if (msg.senderId) fetchUserById(msg.senderId);
        });
      })
      .catch((err) => {
        console.error("[useChat] Erro ao buscar histórico:", err);
        setMessages([]);
      })
      .finally(() => setIsLoadingMessages(false));

    const subscription = subscribe(
      `/topic/room/${activeRoom.id}`,
      (newMessage: Message) => {
        addMessage(newMessage);

        if (newMessage.senderId) {
          fetchUserById(String(newMessage.senderId));
        }
      },
    );

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [
    activeRoom,
    isConnected,
    subscribe,
    setMessages,
    addMessage,
    setIsLoadingMessages,
    fetchUserById,
  ]);

  // Envio de mensagem via HTTP POST REST (Conforme padronizado no backend)
  const sendMessage = useCallback(
    async (content: string) => {
      if (!activeRoom || !content.trim()) return;

      try {
        const sentMessage = await chatService.sendMessage({
          roomId: activeRoom.id,
          content: content.trim(),
        });

        // Adiciona a mensagem localmente no remetente (otimista)
        addMessage(sentMessage);
      } catch (error) {
        console.error("[useChat] Erro ao enviar mensagem:", error);
      }
    },
    [activeRoom, addMessage],
  );

  const createRoom = useCallback(
    async (payload: CreateRoomPayload) => {
      const newRoom = await chatService.createRoom(payload);
      addRoom(newRoom);
      setActiveRoom(newRoom);
      return newRoom;
    },
    [addRoom, setActiveRoom],
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
