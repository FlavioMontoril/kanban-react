import { useAuthStore } from "@/store/useAuthStore";
import { useWebSocket } from "./WebSocketProvider";
import { useChatStore } from "@/store/useChatStore";
import { useEffect, useRef } from "react";
import type { ChatRoom, Message } from "@/types/chat-types";
import { chatService } from "@/services/chatService";
import { useChatNotificationStore } from "@/store/useChatNotificationStore";
import { useUserStore } from "@/store/useUserStore";
import { showMessageToast } from "@/components/commons/showMessageToast";
import { useFloatingChatStore } from "@/store/useFloatingChatStore";

export function GlobalChatListener({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const { isConnected, subscribe } = useWebSocket();

  const isFetchingRoomsRef = useRef(false);

  useEffect(() => {
    if (!user?.id || !isConnected) return;

    const currentUserIdStr = String(user.id).trim();

    const subRooms = subscribe(
      `/topic/user/${user.id}/rooms`,
      (newRoom: ChatRoom) => {
        console.log("[EVENTO DE SALA RECEBIDO]: ", newRoom);
        useChatStore.getState().addRoom(newRoom);
      }
    );

    const subMessages = subscribe(
      `/topic/user/${user.id}/messages`,
      async (newMessage: Message) => {
        console.log("[EVENTO DE MENSAGEM RECEBIDO]: ", newMessage);

        const senderIdStr = newMessage.senderId
          ? String(newMessage.senderId).trim()
          : "";
        const messageRoomIdStr = String(newMessage.roomId).trim();

        // É de outro usuário se senderId existir e for diferente do ID do usuário logado
        const isFromOtherUser =
          Boolean(senderIdStr) && senderIdStr !== currentUserIdStr;

        const chatStore = useChatStore.getState();
        const notificationStore = useChatNotificationStore.getState();
        const userStore = useUserStore.getState();

        const isOnChatPage = window.location.pathname.startsWith("/chat");

        const activeRoomIdStr = chatStore.activeRoom?.id
          ? String(chatStore.activeRoom.id).trim()
          : "";
        const floatingRoomIdStr = useFloatingChatStore.getState().expandedRoomId
          ? String(useFloatingChatStore.getState().expandedRoomId).trim()
          : "";

        const isMainChatActive =
          isOnChatPage && activeRoomIdStr === messageRoomIdStr;
        const isFloatingModalOpen = floatingRoomIdStr === messageRoomIdStr;

        const isRoomVisibleToUser = isMainChatActive || isFloatingModalOpen;

        console.log("[GlobalChatListener Debug]", {
          currentUserId: currentUserIdStr,
          senderId: senderIdStr,
          isFromOtherUser,
          isMainChatActive,
          isFloatingModalOpen,
          isRoomVisibleToUser,
        });

        // 1. Sempre adiciona a mensagem ao histórico local da store
        chatStore.addMessage(newMessage);

        // 2. Procura a sala correspondente na store local com comparação insensível ao tipo
        let targetRoom = chatStore.rooms.find(
          (r) => String(r.id).trim() === messageRoomIdStr
        );

        // Se a sala não estiver na memória, busca via API
        if (!targetRoom && !isFetchingRoomsRef.current) {
          isFetchingRoomsRef.current = true;
          try {
            const updatedRooms = await chatService.getUserRooms();
            if (updatedRooms) {
              chatStore.setRooms(updatedRooms);
              targetRoom = updatedRooms.find(
                (r) => String(r.id).trim() === messageRoomIdStr
              );
            }
          } catch (err) {
            console.error("[GlobalChatListener] Erro ao carregar salas:", err);
          } finally {
            isFetchingRoomsRef.current = false;
          }
        }

        // Garante buscar dados do usuário remetente
        if (newMessage.senderId) {
          chatStore.fetchUserById(String(newMessage.senderId));
        }

        // 3. Notifica e exibe o Toast apenas se for de outro usuário e a conversa NÃO estiver ativa
        if (isFromOtherUser && !isRoomVisibleToUser) {
          notificationStore.incrementUnread(messageRoomIdStr);

          if (targetRoom) {
            const senderUser = userStore.users.find(
              (u) => String(u.id).trim() === senderIdStr
            );

            showMessageToast({
              userId: user.id,
              room: targetRoom,
              message: newMessage,
              senderName: senderUser?.name || senderUser?.email || "Usuário",
              senderAvatar: senderUser?.avatar,
            });
          }
        }
      }
    );

    return () => {
      if (subRooms && typeof subRooms.unsubscribe === "function") {
        subRooms.unsubscribe();
      }
      if (subMessages && typeof subMessages.unsubscribe === "function") {
        subMessages.unsubscribe();
      }
    };
  }, [user?.id, isConnected, subscribe]);

  return <>{children}</>;
}