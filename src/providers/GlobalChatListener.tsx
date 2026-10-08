// import { useAuthStore } from "@/store/useAuthStore";
// import { useWebSocket } from "./WebSocketProvider";
// import { useChatStore } from "@/store/useChatStore";
// import { useEffect } from "react";
// import type { ChatRoom, Message } from "@/types/chat-types";
// import { chatService } from "@/services/chatService";
// import { useChatNotificationStore } from "@/store/useChatNotificationStore";
// import { useUserStore } from "@/store/useUserStore";
// import { showMessageToast } from "@/components/commons/showMessageToast";

// export function GlobalChatListener({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const { user } = useAuthStore();
//   const { isConnected, subscribe } = useWebSocket();
//   const { rooms, activeRoom, addRoom, fetchUserById, addMessage, setRooms } =
//     useChatStore();

//   const { users } = useUserStore();
//   const { incrementUnread } = useChatNotificationStore();

//   // ESCUTA EM TEMPO REAL: Novas salas/conversas criadas (/topic/user/{userId}/rooms)
//   useEffect(() => {
//     if (!user?.id || !isConnected) return;

//     const subscription = subscribe(
//       `/topic/user/${user.id}/rooms`,
//       (newRoom: ChatRoom) => {
//         console.log("[EVENTO DE SALA RECEBIDO]: ", newRoom);
//         addRoom(newRoom);
//       },
//     );

//     return () => {
//       if (subscription) subscription.unsubscribe();
//     };
//   }, [user?.id, isConnected, subscribe, addRoom]);

//   // 3. ESCUTA EM TEMPO REAL: Mensagens recebidas em tempo real (/topic/user/{userId}/messages)
//   useEffect(() => {
//     if (!user?.id || !isConnected) return;

//     const subscription = subscribe(
//       `/topic/user/${user.id}/messages`,
//       async (newMessage: Message) => {
//         console.log("[EVENTO DE MENSAGEM RECEBIDO]: ", newMessage);

//         const isFromOtherUser = String(newMessage.senderId) !== String(user.id);
//         const isCurrentActiveRoom = activeRoom?.id === newMessage.roomId;

//         // 1. Verifica se a sala da mensagem recebida já existe na barra lateral do destinatário
//         const roomExists = rooms.some((r) => r.id === newMessage.roomId);

//         // 2. Se a sala não existir na barra lateral, busca as salas atualizadas via API
//         if (!roomExists) {
//           try {
//             const updatedRooms = await chatService.getUserRooms();
//             setRooms(updatedRooms || []);
//           } catch (err) {
//             console.error("[useChat] Erro ao atualizar lista de salas:", err);
//           }
//         }

//         // 2. Busca dados do remetente caso ainda não estejam na store local
//         if (newMessage.senderId) {
//           fetchUserById(String(newMessage.senderId));
//         }

//         // 3. Se a sala estiver aberta na tela atual, insere a mensagem diretamente no chat
//         if (isCurrentActiveRoom) {
//           addMessage(newMessage);
//         }

//         // 4. Se a mensagem veio de outra pessoa e a sala NÃO está aberta na tela, gera notificação + Toast
//         if (isFromOtherUser && !isCurrentActiveRoom) {
//           incrementUnread(newMessage.roomId);

//           const senderUser = users.find(
//             (u) => String(u.id) === String(newMessage.senderId),
//           );

//           showMessageToast({
//             message: newMessage,
//             senderName: senderUser?.name || senderUser?.email || "Usuário",
//             senderAvatar: senderUser?.avatar,
//           });
//         }
//       },
//     );

//     return () => {
//       if (subscription) subscription.unsubscribe();
//     };
//   }, [user?.id, activeRoom, isConnected, subscribe, addMessage, fetchUserById]);

//   return <>{children}</>;
// }

import { useAuthStore } from "@/store/useAuthStore";
import { useWebSocket } from "./WebSocketProvider";
import { useChatStore } from "@/store/useChatStore";
import { useEffect } from "react";
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
  const { addRoom } = useChatStore();

  // ESCUTA EM TEMPO REAL: Novas salas/conversas criadas (/topic/user/{userId}/rooms)
  useEffect(() => {
    if (!user?.id || !isConnected) return;

    const subscription = subscribe(
      `/topic/user/${user.id}/rooms`,
      (newRoom: ChatRoom) => {
        console.log("[EVENTO DE SALA RECEBIDO]: ", newRoom);
        addRoom(newRoom);
      },
    );

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [user?.id, isConnected, subscribe, addRoom]);

  // 3. ESCUTA EM TEMPO REAL: Mensagens recebidas em tempo real (/topic/user/{userId}/messages)
  // ESCUTA MENSAGENS EM TEMPO REAL
  useEffect(() => {
    if (!user?.id || !isConnected) return;

    const subscription = subscribe(
      `/topic/user/${user.id}/messages`,
      async (newMessage: Message) => {
        console.log("[EVENTO DE MENSAGEM RECEBIDO]: ", newMessage);

        const currentUserId = String(user.id).trim();
        const senderId = String(newMessage.senderId || "").trim();
        const isFromOtherUser = senderId !== "" && senderId !== currentUserId;

        const chatStore = useChatStore.getState();
        const notificationStore = useChatNotificationStore.getState();
        const userStore = useUserStore.getState();
        const floatingChatStore = useFloatingChatStore.getState();

        // 1. Verifica se o utilizador está na rota do chat
        const isOnChatPage = window.location.pathname.startsWith("/chat");

        // 2. A sala está selecionada na página /chat?
        const isMainChatActive =
          isOnChatPage && chatStore.activeRoom?.id === newMessage.roomId;

        // 3. A janela flutuante desta sala está expandida/aberta?
        const isFloatingModalOpen =
          floatingChatStore.expandedRoomId === newMessage.roomId;

        // A conversa só é considerada visível se o utilizador estiver na página /chat OU com o modal flutuante expandido
        const isRoomVisibleToUser = isMainChatActive || isFloatingModalOpen;

        let currentRooms = chatStore.rooms;
        let targetRoom = currentRooms.find((r) => r.id === newMessage.roomId);

        // Se a sala não constar na lista local, procura via API
        if (!targetRoom) {
          try {
            const updatedRooms = await chatService.getUserRooms();
            if (updatedRooms) {
              chatStore.setRooms(updatedRooms);
              currentRooms = updatedRooms;
              targetRoom = updatedRooms.find((r) => r.id === newMessage.roomId);
            }
          } catch (err) {
            console.error("[GlobalChatListener] Erro ao carregar salas:", err);
          }
        }

        if (newMessage.senderId) {
          chatStore.fetchUserById(String(newMessage.senderId));
        }

        // Adiciona sempre a mensagem ao histórico local
        chatStore.addMessage(newMessage);

        // Notifica + Exibe Toast se for de outro utilizador e a janela NÃO estiver visível/expandida
        if (isFromOtherUser && !isRoomVisibleToUser) {
          notificationStore.incrementUnread(newMessage.roomId);

         if (targetRoom) {
            // Se o utilizador NÃO estiver na rota de chat, adiciona o balão flutuante
            if (!isOnChatPage) {
              const currentFloatingStore = useFloatingChatStore.getState();
              const isBubbleOnScreen = currentFloatingStore.activeRooms.some(
                (r) => r.id === targetRoom!.id
              );

              if (!isBubbleOnScreen) {
                // Adiciona a sala às bolhas ativas mantendo o modal minimizado de início
                useFloatingChatStore.setState((state) => ({
                  activeRooms: [...state.activeRooms, targetRoom!],
                }));
              }
            }

            const senderUser = userStore.users.find(
              (u) => String(u.id) === String(newMessage.senderId)
            );

            showMessageToast({
              room: targetRoom,
              message: newMessage,
              senderName: senderUser?.name || senderUser?.email || "Usuário",
              senderAvatar: senderUser?.avatar,
            });
          }
        }
      },
    );

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [user?.id, isConnected, subscribe]);

  return <>{children}</>;
}
