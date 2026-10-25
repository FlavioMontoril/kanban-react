import React, { useState, useRef, useEffect, lazy, Suspense } from "react";
import { useChat } from "@/hooks/useChat";
import { useAuthStore } from "@/store/useAuthStore";
import { ChatType, type ChatRoom } from "@/types/chat-types";
import {
  SquareArrowRightExit,
  X,
  Plus,
  Search,
  Send,
  MessageSquare,
  Users,
  Check,
  MessagesCircle,
  ArrowLeft,
  Smile,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAvatarUrl } from "@/lib/getAvatarUrl";
import { useChatNotificationStore } from "@/store/useChatNotificationStore";
import { useAuth } from "@/hooks/useAuth";
import { useTaskStore } from "@/store/useTaskStore";
import { renderFormattedMessage } from "@/lib/renderFormattedMessage";
import { toast } from "sonner";
import type { Task } from "@/types/task";
import { TaskDetailsModal } from "@/components/commons/TaskDetailsModal";
import type { EmojiClickData, Theme } from "emoji-picker-react";

const EmojiPicker = lazy(() => import("emoji-picker-react"));

export default function ChatPage() {
  const {
    rooms,
    activeRoom,
    messages,
    isConnected,
    isLoadingRooms,
    setActiveRoom,
    sendMessage,
    createRoom,
  } = useChat();
  const { user } = useAuthStore();
  const { users, fetchUsers } = useAuth();
  const { tasks } = useTaskStore();

  const { unreadByRoom, clearUnreadForRoom } = useChatNotificationStore();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTaskSuggestions, setShowTaskSuggestions] = useState(false);
  const [taskSearchQuery, setTaskSearchQuery] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();

  const isGroupMode = selectedUserIds.length > 1;

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useEffect(() => {
    if (!users) return;
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleOpenTaskDetails = (taskId: string) => {
    const foundTask = tasks.find((t) => t.id === taskId);

    if (foundTask) {
      setSelectedTask(foundTask);
      setIsTaskModalOpen(true);
    } else {
      toast.error("Tarefa não encontrada", {
        description: `A tarefa não está disponível ou foi removida.`,
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessageInput(value);

    adjustTextareaHeight();

    const lastHashIndex = value.lastIndexOf("#");

    if (lastHashIndex !== -1 && lastHashIndex >= value.length - 15) {
      const query = value.slice(lastHashIndex + 1);

      if (!query.includes(" ")) {
        setTaskSearchQuery(query.toLowerCase());
        setShowTaskSuggestions(true);
        return;
      }
    }

    setShowTaskSuggestions(false);
  };

  const handleSelectRoom = (room: ChatRoom) => {
    setActiveRoom(room);
    clearUnreadForRoom(room.id);
    clearUnreadForRoom(String(room.id));
  };

  const getUserFromUserStore = (userId?: string | number) => {
    if (!userId) return null;
    return users.find((u) => String(u.id) === String(userId)) || null;
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim()) return;

    sendMessage(messageInput);
    setMessageInput("");

    setShowEmojiPicker(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleCreateRoom = async () => {
    if (selectedUserIds.length === 0) return;

    try {
      const room = await createRoom({
        name: isGroupMode ? groupName : undefined,
        type: isGroupMode ? "GROUP" : "DIRECT",
        targetUserIds: selectedUserIds,
      });

      setIsModalOpen(false);
      setSelectedUserIds([]);
      setGroupName("");

      if (room) {
        handleSelectRoom(room);
      }
    } catch (err) {
      console.error("Erro ao criar/buscar sala:", err);
    }
  };

  const getRoomDisplayName = (room: ChatRoom) => {
    const isGroupRoom = room.type === ChatType.GROUP;

    if (isGroupRoom) {
      return room.name || "Grupo sem nome";
    }

    const otherParticipant = room.participants?.find(
      (p) => String(p.userId) !== String(user?.id),
    );

    const targetUser = getUserFromUserStore(otherParticipant?.userId);

    if (targetUser?.name) return targetUser.name;
    if (targetUser?.email) return targetUser.email;

    return otherParticipant?.userId
      ? `Usuário (${String(otherParticipant.userId).slice(0, 8)})`
      : "Conversa Direta";
  };

  const getRoomAvatar = (room: ChatRoom) => {
    if (room.type === ChatType.GROUP) return null;

    const otherParticipant = room.participants.find(
      (p) => String(p.userId) !== String(user?.id),
    );
    const targetUser = getUserFromUserStore(otherParticipant?.userId);
    return getAvatarUrl(targetUser?.avatar);
  };

  const filteredRooms = rooms.filter((room) =>
    getRoomDisplayName(room).toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const activeRoomMessages = messages.filter(
    (msg) => msg.roomId === activeRoom?.id,
  );

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessageInput((prev) => prev + emojiData.emoji);
  };

  return (
    <>
      {/* Container Raiz Principal - Restringe totalmente a largura no celular */}
      <div className="flex h-[100dvh] w-full max-w-full bg-slate-50 dark:bg-zinc-950 overflow-hidden font-sans text-slate-800 dark:text-zinc-100 fixed inset-0">
        {/* SIDEBAR DE CONVERSAS */}
        <aside
          className={`${
            activeRoom ? "hidden md:flex" : "flex"
          } w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-col shrink-0 h-full overflow-hidden`}
        >
          {/* Topo da Sidebar */}
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800/80 flex justify-between items-center bg-white/50 dark:bg-zinc-900/50 backdrop-blur shrink-0">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Mensagens
              </h1>
              <MessagesCircle />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer"
              >
                <Plus size={16} />
                <span>Novo</span>
              </button>

              <button
                title="Sair do Chat"
                onClick={() => navigate("/")}
                className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
              >
                <SquareArrowRightExit size={18} />
              </button>
            </div>
          </div>

          {/* Input de Pesquisa */}
          <div className="p-3 shrink-0">
            <div className="relative flex items-center">
              <Search
                className="absolute left-3 text-slate-400 dark:text-zinc-500"
                size={16}
              />
              <input
                type="text"
                placeholder="Buscar conversas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-zinc-800/60 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 border border-transparent dark:border-zinc-700/40 transition-all"
              />
            </div>
          </div>

          {/* Lista de Salas */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/40">
            {isLoadingRooms ? (
              <div className="p-8 text-center text-xs text-slate-400 dark:text-zinc-500 animate-pulse">
                Carregando conversas...
              </div>
            ) : filteredRooms.length > 0 ? (
              filteredRooms.map((room) => {
                const isSelected = activeRoom?.id === room.id;
                const displayName = getRoomDisplayName(room);
                const avatarUrl = getRoomAvatar(room);

                const isDirect = room.type === ChatType.DIRECT;

                const otherParticipant = room.participants?.find(
                  (p) => String(p.userId) !== String(user?.id),
                );

                const targetUser = isDirect
                  ? getUserFromUserStore(otherParticipant?.userId)
                  : null;

                const isOnline = Boolean(targetUser?.connected);

                const unreadCount =
                  unreadByRoom[room.id] || unreadByRoom[String(room.id)] || 0;

                return (
                  <div
                    key={room.id}
                    onClick={() => handleSelectRoom(room)}
                    className={`p-3.5 mx-2 my-1 rounded-xl cursor-pointer transition-all flex items-center gap-3 ${
                      isSelected
                        ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-medium"
                        : "hover:bg-slate-100/80 dark:hover:bg-zinc-800/50 text-slate-700 dark:text-zinc-300"
                    }`}
                  >
                    <div className="relative shrink-0">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={displayName}
                          className="w-11 h-11 rounded-full object-cover shadow-xs border border-slate-200 dark:border-zinc-700 shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-semibold text-sm shadow-xs shrink-0">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {isDirect && (
                        <span
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-900 ${
                            isOnline ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                          title={isOnline ? "Online" : "Offline"}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h2 className="text-sm font-semibold truncate text-slate-900 dark:text-zinc-100">
                          {displayName}
                        </h2>

                        {unreadCount > 0 && (
                          <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full animate-pulse shrink-0">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 truncate flex items-center gap-1">
                        {room.type === ChatType.GROUP ? (
                          <>
                            <Users size={12} className="inline shrink-0" />
                            <span>Grupo</span>
                          </>
                        ) : (
                          <span>Conversa direta</span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 dark:text-zinc-500">
                Nenhuma conversa encontrada.
              </div>
            )}
          </div>
        </aside>

        {/* ÁREA DE MENSAGENS */}
        <main
          className={`${
            !activeRoom ? "hidden md:flex" : "flex"
          } flex-1 flex-col h-full w-full max-w-full bg-slate-100/60 dark:bg-zinc-950 relative overflow-hidden min-w-0`}
        >
          {activeRoom ? (
            <>
              {/* Header do Chat Ativo */}
              <header className="p-3 md:p-4 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between shrink-0 shadow-xs w-full min-w-0">
                <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                  {/* Botão de Voltar no Mobile */}
                  <button
                    onClick={() => setActiveRoom(null)}
                    className="p-1.5 -ml-1 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 md:hidden shrink-0"
                    title="Voltar para conversas"
                  >
                    <ArrowLeft size={20} />
                  </button>

                  {getRoomAvatar(activeRoom) ? (
                    <img
                      src={getRoomAvatar(activeRoom)!}
                      alt={getRoomDisplayName(activeRoom)}
                      className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover shadow-xs border border-slate-200 dark:border-zinc-700 shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                      {getRoomDisplayName(activeRoom).charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h2 className="font-bold text-slate-900 dark:text-zinc-100 text-sm md:text-base leading-tight truncate">
                      {getRoomDisplayName(activeRoom)}
                    </h2>
                    <span className="text-xs text-slate-500 dark:text-zinc-400 block truncate">
                      {activeRoom.type === ChatType.GROUP
                        ? `${activeRoom.participants.length} participantes`
                        : "Mensagem Direta"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveRoom(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer hidden md:flex"
                    title="Fechar conversa"
                  >
                    <X size={18} />
                  </button>
                </div>
              </header>

              {/* LISTA DE MENSAGENS (overflow-x-hidden impede a rolagem horizontal) */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 md:p-6 space-y-4 w-full min-w-0">
                {activeRoomMessages.map((msg) => {
                  const isMe = String(msg.senderId) === String(user?.id);

                  const senderUser = getUserFromUserStore(msg.senderId);
                  const senderAvatar = getAvatarUrl(senderUser?.avatar);
                  const senderName =
                    senderUser?.name || user?.name || "Usuário";

                  const currentUserData = getUserFromUserStore(user?.id);
                  const myAvatar = getAvatarUrl(currentUserData?.avatar);

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-1.5 md:gap-2.5 w-full min-w-0 ${
                        isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isMe && (
                        <div className="shrink-0 mb-0.5">
                          {senderAvatar ? (
                            <img
                              src={senderAvatar}
                              alt={senderName}
                              className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover shadow-xs border border-slate-200 dark:border-zinc-700 shrink-0"
                            />
                          ) : (
                            <div
                              className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-tr from-slate-400 to-slate-600 dark:from-zinc-700 dark:to-zinc-800 text-white font-semibold text-xs flex items-center justify-center shadow-xs shrink-0"
                              title={senderName}
                            >
                              {senderName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Balão de mensagem: limita tamanho e força quebra de palavra */}
                      <div
                        className={`max-w-[78%] md:max-w-md px-3 py-2 md:px-4 md:py-2.5 rounded-2xl text-sm shadow-xs transition-all min-w-0 overflow-hidden break-words [overflow-wrap:anywhere] ${
                          isMe
                            ? "bg-indigo-600 text-white rounded-br-xs"
                            : "bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 text-slate-800 dark:text-zinc-100 rounded-bl-xs"
                        }`}
                      >
                        <span
                          className={`block text-[11px] font-bold truncate ${
                            isMe
                              ? "text-white dark:text-white"
                              : "text-indigo-500"
                          } mb-0.5`}
                        >
                          {isMe ? "Você" : senderName}
                        </span>

                        <div className="whitespace-pre-wrap leading-relaxed break-words break-all [overflow-wrap:anywhere] text-xs md:text-sm">
                          {renderFormattedMessage(
                            msg.content,
                            handleOpenTaskDetails,
                          )}
                        </div>

                        <span
                          className={`text-[10px] block text-right mt-1 font-medium ${
                            isMe
                              ? "text-indigo-200"
                              : "text-slate-400 dark:text-zinc-500"
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {isMe && (
                        <div className="shrink-0 mb-0.5">
                          {myAvatar ? (
                            <img
                              src={myAvatar}
                              alt="Seu perfil"
                              className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover shadow-xs border border-slate-200 dark:border-zinc-700 shrink-0"
                            />
                          ) : (
                            <div
                              className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center shadow-xs shrink-0"
                              title="Você"
                            >
                              {(user?.name || "V").charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>

              {/* Input de Envio de Mensagem */}
              <footer className="p-2 md:p-4 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 shrink-0 relative w-full min-w-0">
                {/* POPOVER DO SELETOR DE EMOJIS */}
                {showEmojiPicker && (
                  <div className="absolute bottom-full mb-2 right-2 left-2 md:left-auto md:right-16 z-40 max-w-[300px] mx-auto shadow-2xl rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800">
                    <Suspense
                      fallback={
                        <div className="w-[300px] h-[320px] flex items-center justify-center bg-white dark:bg-zinc-900 text-xs text-slate-400">
                          Carregando emojis...
                        </div>
                      }
                    >
                      <EmojiPicker
                        theme={"auto" as Theme}
                        onEmojiClick={handleEmojiClick}
                        lazyLoadEmojis
                        searchPlaceHolder="Buscar emoji..."
                        width="100%"
                        height={320}
                      />
                    </Suspense>
                  </div>
                )}

                {/* AUTOCOMPLETE DROPDOWN (#) */}
                {showTaskSuggestions && (
                  <div className="absolute bottom-full mb-2 left-2 right-2 md:left-6 md:right-6 max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden z-30 max-h-56 overflow-y-auto">
                    <div className="p-2.5 border-b border-slate-100 dark:border-zinc-800 text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider flex justify-between items-center">
                      <span>Vincular Tarefa (#)</span>
                      <span className="text-[10px] font-normal text-slate-400">
                        Clique para inserir
                      </span>
                    </div>

                    {tasks &&
                    tasks.filter(
                      (t) =>
                        (t.title || "")
                          .toLowerCase()
                          .includes(taskSearchQuery) ||
                        (t.code || "")
                          .toLowerCase()
                          .includes(taskSearchQuery) ||
                        String(t.id).toLowerCase().includes(taskSearchQuery),
                    ).length > 0 ? (
                      tasks
                        .filter(
                          (t) =>
                            (t.title || "")
                              .toLowerCase()
                              .includes(taskSearchQuery) ||
                            (t.code || "")
                              .toLowerCase()
                              .includes(taskSearchQuery) ||
                            String(t.id)
                              .toLowerCase()
                              .includes(taskSearchQuery),
                        )
                        .map((task) => {
                          const taskCode =
                            task.code || `#${task.id.slice(0, 6)}`;

                          return (
                            <button
                              key={task.id}
                              type="button"
                              onClick={() => {
                                const lastHashIndex =
                                  messageInput.lastIndexOf("#");

                                const displayLabel = task.code
                                  ? `${task.title} (${task.code})`
                                  : task.title;

                                const taskMentionText = `#[${displayLabel}](${task.id}) `;

                                const newText =
                                  messageInput.slice(0, lastHashIndex) +
                                  taskMentionText;
                                setMessageInput(newText);
                                setShowTaskSuggestions(false);
                              }}
                              className="w-full text-left p-2.5 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-between text-xs transition-colors cursor-pointer border-b border-slate-50 dark:border-zinc-800/50 last:border-none gap-2"
                            >
                              <div className="flex items-center gap-2 truncate min-w-0 flex-1">
                                <span className="text-slate-800 dark:text-zinc-100 font-semibold truncate">
                                  {task.title || "Sem título"}
                                </span>

                                <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-bold shrink-0 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800/50">
                                  {taskCode}
                                </span>
                              </div>

                              {task.status && (
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-500 font-semibold shrink-0 uppercase">
                                  {task.status}
                                </span>
                              )}
                            </button>
                          );
                        })
                    ) : (
                      <div className="p-3 text-xs text-slate-400 dark:text-zinc-500 text-center">
                        Nenhuma tarefa encontrada com "#{taskSearchQuery}"
                      </div>
                    )}
                  </div>
                )}

                <form
                  onSubmit={handleSend}
                  className="flex items-center gap-1.5 md:gap-2 w-full max-w-5xl mx-auto min-w-0"
                >
                  <div className="flex flex-1 items-center relative min-w-0">
                    <textarea
                      ref={textareaRef}
                      rows={1}
                      placeholder={
                        isConnected
                          ? "Digite sua mensagem..."
                          : "Conectando ao chat..."
                      }
                      value={messageInput}
                      onChange={handleInputChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (isConnected && messageInput.trim()) {
                            handleSend(e);
                          }
                        }
                      }}
                      disabled={!isConnected}
                      className="resize-none overflow-hidden w-full pr-8 whitespace-normal px-3 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 border border-transparent dark:border-zinc-700/50 disabled:opacity-50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowEmojiPicker((prev) => !prev);
                        setShowTaskSuggestions(false);
                      }}
                      className="absolute right-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1 rounded-lg cursor-pointer"
                      title="Inserir emoji"
                    >
                      <Smile size={18} />
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!isConnected || !messageInput.trim()}
                    className="p-2 md:px-5 md:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:hover:bg-indigo-600 shrink-0 shadow-xs cursor-pointer"
                  >
                    <Send size={16} />
                    <span className="hidden md:inline">Enviar</span>
                  </button>
                </form>
              </footer>
            </>
          ) : (
            /* Estado Vazio (Apenas Desktop) */
            <div className="flex-1 flex flex-col justify-between p-4 h-full">
              <div className="flex justify-end">
                <button
                  title="Sair do Chat"
                  onClick={() => navigate("/")}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
                >
                  <SquareArrowRightExit size={20} />
                </button>
              </div>

              <div className="flex flex-col items-center justify-center text-center p-6 my-auto">
                <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 border border-indigo-100 dark:border-indigo-900/50">
                  <MessageSquare size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100 mb-1">
                  Sua caixa de entrada
                </h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-sm">
                  Selecione uma conversa ao lado ou inicie um novo bate-papo
                  individual ou em grupo.
                </p>
              </div>
            </div>
          )}
        </main>

        {/* MODAL CRIAR CONVERSA / GRUPO */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden transform transition-all">
              <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center">
                <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                  Nova Conversa
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg p-1 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {isGroupMode && (
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">
                      Nome do Grupo
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Projetos, Squad Alfa..."
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 border border-transparent dark:border-zinc-700/50"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-2">
                    Selecione{" "}
                    {isGroupMode ? "os integrantes" : "o destinatário"}:
                  </label>

                  <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                    {users.filter((u) => u.id !== user?.id).length > 0 ? (
                      users
                        .filter((u) => u.id !== user?.id)
                        .map((u) => {
                          const isChecked = selectedUserIds.includes(u.id);
                          const uAvatar = getAvatarUrl(u.avatar);
                          return (
                            <div
                              key={u.id}
                              onClick={() => {
                                setSelectedUserIds((prev) =>
                                  isChecked
                                    ? prev.filter((id) => id !== u.id)
                                    : [...prev, u.id],
                                );
                              }}
                              className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                                isChecked
                                  ? "bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/50"
                                  : "border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/40"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                {uAvatar ? (
                                  <img
                                    src={uAvatar}
                                    alt={u.name}
                                    className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-zinc-700 shrink-0"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold text-xs flex items-center justify-center shrink-0">
                                    {(u.name || u.email || "U")
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                    {u.name || "Sem nome"}
                                  </p>
                                  <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                                    {u.email}
                                  </p>
                                </div>
                              </div>

                              <div
                                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                                  isChecked
                                    ? "bg-indigo-600 border-indigo-600 text-white"
                                    : "border-slate-300 dark:border-zinc-700"
                                }`}
                              >
                                {isChecked && <Check size={12} />}
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-400 dark:text-zinc-500 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
                        Nenhum outro usuário encontrado.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-200/60 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateRoom}
                  disabled={
                    selectedUserIds.length === 0 ||
                    (isGroupMode && !groupName.trim())
                  }
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all disabled:opacity-40 shadow-xs cursor-pointer"
                >
                  {isGroupMode ? "Criar Grupo" : "Iniciar Conversa"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <TaskDetailsModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
      />
    </>
  );
}
