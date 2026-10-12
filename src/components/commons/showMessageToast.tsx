import { toast } from "sonner";
import { MessageSquare, X } from "lucide-react";
import type { ChatRoom, Message } from "@/types/chat-types";
import { getAvatarUrl } from "@/lib/getAvatarUrl";
import { useFloatingChatStore } from "@/store/useFloatingChatStore";
import { useChatStore } from "@/store/useChatStore";
import { useChatNotificationStore } from "@/store/useChatNotificationStore";

interface ShowMessageToastOptions {
  userId: string | number;
  room: ChatRoom;
  message: Message;
  senderName: string;
  senderAvatar?: string | null;
  onOpenChat?: () => void;
}

export function showMessageToast({
  userId,
  room,
  message,
  senderName,
  senderAvatar,
  onOpenChat,
}: ShowMessageToastOptions) {
  const avatarUrl = getAvatarUrl(senderAvatar);

  toast.custom((t) => (
    <div
      onClick={() => {
        toast.dismiss(t);

        // Define a sala ativa e abre o balão flutuante para o usuário logado
        useChatStore.getState().setActiveRoom(room);
        useFloatingChatStore.getState().openFloatingChat(userId, room);
        useChatNotificationStore.getState().clearUnreadForRoom(room.id);

        if (onOpenChat) onOpenChat();
      }}
      className="relative group flex items-center gap-3.5 w-full max-w-sm p-3.5 bg-slate-900/85 backdrop-blur-2xl border border-indigo-500/20 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] text-slate-100 transition-all duration-300 hover:border-indigo-500/40 cursor-pointer"
    >
      <div className="relative flex-shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={senderName}
            className="w-10 h-10 rounded-xl object-cover border border-indigo-500/30"
          />
        ) : (
          <div className="p-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 backdrop-blur-md">
            <MessageSquare className="w-5 h-5" />
          </div>
        )}
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500" />
        </span>
      </div>

      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
            Nova mensagem
          </span>
        </div>
        <p className="text-xs font-bold truncate text-slate-100">{senderName}</p>
        <p className="text-xs text-slate-300 truncate mt-0.5">{message.content}</p>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toast.dismiss(t);
        }}
        className="absolute top-2.5 right-2.5 p-1 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  ));
}