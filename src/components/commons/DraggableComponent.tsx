// import { useEffect, useRef, useState, type CSSProperties } from "react";
// import { useDraggable } from "@dnd-kit/core";
// import { X } from "lucide-react";

// export function DraggableComponent({ id }: { id: string }) {
//   const { attributes, listeners, setNodeRef, transform, isDragging } =
//     useDraggable({ id });

//   const [position, setPosition] = useState({ x: 300, y: 100 });
//   const [visible, setVisible] = useState(true);

//   const ref = useRef<HTMLDivElement | null>(null);

//   // Guarda o deslocamento atual antes de soltar o clique
//   const lastTransform = useRef(transform);
//   if (transform) {
//     lastTransform.current = transform;
//   }

//   const handlePointerUp = () => {
//     const currentTransform = transform || lastTransform.current;
//     if (!currentTransform || !ref.current) return;

//     const rect = ref.current.getBoundingClientRect();
//     const maxX = window.innerWidth - rect.width;
//     const maxY = window.innerHeight - rect.height;

//     setPosition((prev) => ({
//       x: Math.max(0, Math.min(prev.x + currentTransform.x, maxX)),
//       y: Math.max(0, Math.min(prev.y + currentTransform.y, maxY)),
//     }));

//     lastTransform.current = null;
//   };

//   useEffect(() => {
//     const handleResize = () => {
//       if (!ref.current) return;
//       const rect = ref.current.getBoundingClientRect();
//       setPosition((prev) => ({
//         x: Math.min(prev.x, window.innerWidth - rect.width),
//         y: Math.min(prev.y, window.innerHeight - rect.height),
//       }));
//     };

//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   if (!visible) return null;

//   const style: CSSProperties = {
//     position: "fixed",
//     top: position.y,
//     left: position.x,
//     transform: transform
//       ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
//       : undefined,
//     cursor: isDragging ? "grabbing" : "grab",
//     touchAction: "none",
//   };

//   return (
//     <div
//       ref={(node) => {
//         setNodeRef(node);
//         ref.current = node;
//       }}
//       {...listeners}
//       {...attributes}
//       onPointerUp={handlePointerUp}
//       data-stopwatch-id={id}
//       style={style}
//       className="flex group items-center justify-center z-100 focus:outline-none hover:drop-shadow-[0_4px_12px_rgba(59,130,246,0.8)] fixed"
//     >
//       <img
//         src="/comentario.png"
//         alt="comentario"
//         className="h-10 sm:h-12 w-auto object-contain"
//       />
//       <button
//         onPointerDown={(e) => e.stopPropagation()}
//         onClick={() => setVisible(false)}
//         className="absolute invisible group-hover:visible top-0 -right-1  text-white bg-red-500 drop-shadow-[0_4px_10px_rgba(220,38,38,1)] h-4 rounded-full flex items-center cursor-pointer"
//       >
//         <X size={15} strokeWidth={2.5} />
//       </button>
//     </div>
//   );
// }

import { type CSSProperties, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { X, Send, Minus, MessageSquare } from "lucide-react";
import { useFloatingChatStore } from "@/store/useFloatingChatStore";
import { useChatNotificationStore } from "@/store/useChatNotificationStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useUserStore } from "@/store/useUserStore";
import { ChatType, type ChatRoom } from "@/types/chat-types";
import { getAvatarUrl } from "@/lib/getAvatarUrl";
import { useChat } from "@/hooks/useChat";

interface DraggableComponentProps {
  id: string;
  room: ChatRoom;
  index?: number;
}

export function DraggableComponent({ id, room, index = 0 }: DraggableComponentProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });

  const [messageInput, setMessageInput] = useState("");

  const { expandedRoomId, toggleExpandRoom, closeChatModal, removeRoomBubble, positions } =
    useFloatingChatStore();
  const { unreadByRoom, clearUnreadForRoom } = useChatNotificationStore();
  const { messages, sendMessage, setActiveRoom } = useChat();
  const { user } = useAuthStore();
  const { users } = useUserStore();

  const isExpanded = expandedRoomId === room.id;
  const unreadCount = unreadByRoom[room.id] || 0;

  // Recupera posição salva ou usa espaçamento inicial em cascata por balão
  const pos = positions[room.id] || { x: 20 + index * 15, y: 100 + index * 65 };

  const handleBubbleClick = () => {
    setActiveRoom(room);
    clearUnreadForRoom(room.id);
    toggleExpandRoom(room.id);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    sendMessage(messageInput.trim());
    setMessageInput("");
  };

  const getUserFromStore = (userId?: string | number) =>
    users.find((u) => String(u.id) === String(userId)) || null;

  const isGroup = room.type === ChatType.GROUP;
  const otherParticipant = room.participants?.find(
    (p) => String(p.userId) !== String(user?.id)
  );
  const targetUser = !isGroup ? getUserFromStore(otherParticipant?.userId) : null;
  const displayName = isGroup
    ? room.name || "Grupo"
    : targetUser?.name || targetUser?.email || "Conversa Direta";
  const avatarUrl = !isGroup ? getAvatarUrl(targetUser?.avatar) : null;

  const style: CSSProperties = {
    position: "fixed",
    top: pos.y,
    left: pos.x,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    zIndex: isDragging || isExpanded ? 9999 : 100,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="fixed flex flex-col items-end gap-2 focus:outline-none select-none"
    >
      {/* JANELA DO CHAT FLUTUANTE DA SALA */}
      {isExpanded && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          className="w-80 sm:w-90 h-96 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-800 dark:text-zinc-100 transition-all animate-in fade-in zoom-in-95 cursor-default select-text"
        >
          {/* Header da Janela */}
          <div className="p-3 bg-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-6 h-6 rounded-full object-cover border border-slate-700"
                />
              ) : (
                <MessageSquare size={16} className="text-indigo-400 shrink-0" />
              )}
              <h3 className="text-xs font-bold truncate">{displayName}</h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={closeChatModal}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                title="Minimizar"
              >
                <Minus size={14} />
              </button>
              <button
                type="button"
                onClick={() => removeRoomBubble(room.id)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                title="Fechar"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Histórico de Mensagens */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50 dark:bg-zinc-950 text-xs">
            {messages.map((msg) => {
              const isMe = String(msg.senderId) === String(user?.id);
              const sender = getUserFromStore(msg.senderId);
              const senderName = sender?.name || "Usuário";

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  {!isMe && (
                    <span className="text-[10px] font-bold text-indigo-500 mb-0.5">
                      {senderName}
                    </span>
                  )}
                  <div
                    className={`max-w-[80%] px-3 py-1.5 rounded-xl ${
                      isMe
                        ? "bg-indigo-600 text-white"
                        : "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-100"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Form de Envio */}
          <form
            onSubmit={handleSend}
            className="p-2 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 flex gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder="Digite sua mensagem..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-slate-100 dark:bg-zinc-800 rounded-xl focus:outline-none text-slate-900 dark:text-zinc-100 border border-transparent focus:border-indigo-500/50"
            />
            <button
              type="submit"
              disabled={!messageInput.trim()}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-40 cursor-pointer"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      {/* BALÃO FLUTUANTE ARRASTÁVEL DO AVATAR */}
      <div
        {...listeners}
        {...attributes}
        onClick={handleBubbleClick}
        style={{ touchAction: "none" }}
        className={`relative group flex items-center justify-center ${
          isDragging ? "cursor-grabbing scale-105" : "cursor-grab hover:scale-105"
        } transition-transform hover:drop-shadow-[0_4px_12px_rgba(79,70,229,0.5)]`}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-12 h-12 rounded-full object-cover border-2 border-indigo-600 shadow-xl pointer-events-none"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center border-2 border-indigo-400 shadow-xl pointer-events-none">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Badge vermelho para mensagens não lidas */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -left-1 bg-rose-500 text-white text-[10px] font-bold h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full animate-pulse shadow-md border-2 border-white dark:border-slate-900 pointer-events-none z-10">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        {/* Botão de Fechar */}
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            removeRoomBubble(room.id);
          }}
          className="absolute invisible group-hover:visible top-0 -right-1 text-white bg-red-500 hover:bg-red-600 drop-shadow-[0_4px_10px_rgba(220,38,38,1)] h-4 w-4 rounded-full flex items-center justify-center cursor-pointer z-20 transition-all"
          title="Fechar conversa"
        >
          <X size={12} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}