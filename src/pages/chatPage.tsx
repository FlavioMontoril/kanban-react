import React, { useState, useRef, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { useAuthStore } from "@/store/useAuthStore";
import { ChatType, type ChatRoom } from "@/types/chat-types";
import { useUserStore } from "@/store/useUserStore";
import {
  SquareArrowRightExit,
  X,
  Plus,
  Search,
  Send,
  MessageSquare,
  Users,
  User as UserIcon,
  Check,
  MessagesCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAvatarUrl } from "@/lib/getAvatarUrl";
import { useChatNotificationStore } from "@/store/useChatNotificationStore";

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
  const { users } = useUserStore();

  // Integrated unread messages store
  const { unreadByRoom, clearUnreadForRoom } = useChatNotificationStore();

  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Estados locais do Modal de Nova Conversa / Grupo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // Auto-scroll para a última mensagem
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handler para selecionar a sala e zerar as mensagens não lidas dela
  const handleSelectRoom = (room: ChatRoom) => {
    setActiveRoom(room);
    clearUnreadForRoom(room.id);
    clearUnreadForRoom(String(room.id));
  };

  // Busca EXCLUSIVAMENTE na useUserStore() sem misturar com useAuthStore
  const getUserFromUserStore = (userId?: string | number) => {
    if (!userId) return null;
    return users.find((u) => String(u.id) === String(userId)) || null;
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    sendMessage(messageInput);
    setMessageInput("");
  };

  const handleCreateRoom = async () => {
    if (selectedUserIds.length === 0) return;

    const targetUserIds = isGroupMode
      ? selectedUserIds
      : selectedUserIds.filter((id) => id !== user?.id);

    try {
      const room = await createRoom({
        name: isGroupMode ? groupName : undefined,
        type: isGroupMode ? "GROUP" : "DIRECT",
        targetUserIds: targetUserIds,
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

  // Nome exibido na sala buscando direto no useUserStore
  const getRoomDisplayName = (room: ChatRoom) => {
    const isGroupRoom = room.type === ChatType.GROUP;

    if (isGroupRoom) {
      return room.name || "Grupo sem nome";
    }

    const otherParticipant = room.participants?.find(
      (p) => String(p.userId) !== String(user?.id)
    );

    const targetUser = getUserFromUserStore(otherParticipant?.userId);

    if (targetUser?.name) return targetUser.name;
    if (targetUser?.email) return targetUser.email;

    return otherParticipant?.userId
      ? `Usuário (${String(otherParticipant.userId).slice(0, 8)})`
      : "Conversa Direta";
  };

  // URL do avatar da sala acessando estritamente useUserStore
  const getRoomAvatar = (room: ChatRoom) => {
    if (room.type === ChatType.GROUP) return null;

    const otherParticipant = room.participants.find(
      (p) => String(p.userId) !== String(user?.id)
    );
    const targetUser = getUserFromUserStore(otherParticipant?.userId);
    return getAvatarUrl(targetUser?.avatar);
  };

  const filteredRooms = rooms.filter((room) =>
    getRoomDisplayName(room).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 1. Filtra as mensagens atreladas exclusivamente à sala selecionada
const activeRoomMessages = messages.filter(
  (msg) => msg.roomId === activeRoom?.id
);

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-zinc-950 overflow-hidden font-sans text-slate-800 dark:text-zinc-100">
      {/* SIDEBAR DE CONVERSAS */}
      <aside className="w-80 md:w-96 border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0">
        {/* Topo da Sidebar */}
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800/80 flex justify-between items-center bg-white/50 dark:bg-zinc-900/50 backdrop-blur">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Mensagens
            </h1>
            <MessagesCircle />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            <span>Novo</span>
          </button>
        </div>

        {/* Input de Pesquisa */}
        <div className="p-3">
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

              // 1. Identifica se é conversa direta
              const isDirect = room.type === ChatType.DIRECT;

              // 2. Localiza o outro participante da sala
              const otherParticipant = room.participants?.find(
                (p) => String(p.userId) !== String(user?.id)
              );

              // 3. Busca os dados do participante na store de usuários para ler o 'connected'
              const targetUser = isDirect
                ? getUserFromUserStore(otherParticipant?.userId)
                : null;

              const isOnline = Boolean(targetUser?.connected);

              // 4. Quantidade de mensagens não lidas para esta sala
              const unreadCount = unreadByRoom[room.id] || unreadByRoom[String(room.id)] || 0;

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
                        className="w-11 h-11 rounded-full object-cover shadow-xs border border-slate-200 dark:border-zinc-700"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-semibold text-sm shadow-xs">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {/* Renderiza o badge de conexão apenas em chats diretos */}
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

                      {/* BADGE DE MENSAGENS NÃO LIDAS */}
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
      <main className="flex-1 flex flex-col h-full bg-slate-100/60 dark:bg-zinc-950 relative overflow-hidden">
        {activeRoom ? (
          <>
            {/* Header do Chat Ativo */}
            <header className="p-4 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-3">
                {getRoomAvatar(activeRoom) ? (
                  <img
                    src={getRoomAvatar(activeRoom)!}
                    alt={getRoomDisplayName(activeRoom)}
                    className="w-10 h-10 rounded-full object-cover shadow-xs border border-slate-200 dark:border-zinc-700"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {getRoomDisplayName(activeRoom).charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  <h2 className="font-bold text-slate-900 dark:text-zinc-100 text-sm md:text-base leading-tight">
                    {getRoomDisplayName(activeRoom)}
                  </h2>
                  <span className="text-xs text-slate-500 dark:text-zinc-400">
                    {activeRoom.type === ChatType.GROUP
                      ? `${activeRoom.participants.length} participantes`
                      : "Mensagem Direta"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveRoom(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Fechar conversa"
                >
                  <X size={18} />
                </button>
              </div>
            </header>

            {/* MENSAGENS */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {activeRoomMessages.map((msg) => {
                const isMe = String(msg.senderId) === String(user?.id);

                const senderUser = getUserFromUserStore(msg.senderId);
                const senderAvatar = getAvatarUrl(senderUser?.avatar);
                const senderName = senderUser?.name || user?.name || "Usuário";

                const currentUserData = getUserFromUserStore(user?.id);
                const myAvatar = getAvatarUrl(currentUserData?.avatar);

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2.5 ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    {!isMe && (
                      <div className="shrink-0 mb-0.5">
                        {senderAvatar ? (
                          <img
                            src={senderAvatar}
                            alt={senderName}
                            className="w-8 h-8 rounded-full object-cover shadow-xs border border-slate-200 dark:border-zinc-700"
                          />
                        ) : (
                          <div
                            className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-400 to-slate-600 dark:from-zinc-700 dark:to-zinc-800 text-white font-semibold text-xs flex items-center justify-center shadow-xs"
                            title={senderName}
                          >
                            {senderName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    )}

                    <div
                      className={`max-w-[75%] md:max-w-md px-4 py-2.5 rounded-2xl text-sm shadow-xs transition-all ${
                        isMe
                          ? "bg-indigo-600 text-white rounded-br-xs"
                          : "bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 text-slate-800 dark:text-zinc-100 rounded-bl-xs"
                      }`}
                    >
                      <span
                        className={`block text-[11px] font-bold ${isMe ? "text-white dark:text-white" : "text-indigo-500"} mb-0.5`}
                      >
                        {isMe ? "Você" : senderName}
                      </span>

                      <p className="whitespace-pre-wrap leading-relaxed break-words">
                        {msg.content}
                      </p>

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
                            className="w-8 h-8 rounded-full object-cover shadow-xs border border-slate-200 dark:border-zinc-700"
                          />
                        ) : (
                          <div
                            className="w-8 h-8 rounded-full bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center shadow-xs"
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
            <footer className="p-3 md:p-4 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 shrink-0">
              <form
                onSubmit={handleSend}
                className="flex items-center gap-2 w-full max-w-5xl mx-auto"
              >
                <input
                  type="text"
                  placeholder={
                    isConnected
                      ? "Digite sua mensagem..."
                      : "Conectando ao chat..."
                  }
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  disabled={!isConnected}
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 border border-transparent dark:border-zinc-700/50 disabled:opacity-50 transition-all"
                />
                <button
                  type="submit"
                  disabled={!isConnected || !messageInput.trim()}
                  className="p-2.5 md:px-5 md:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:hover:bg-indigo-600 shrink-0 shadow-xs cursor-pointer"
                >
                  <Send size={16} />
                  <span className="hidden md:inline">Enviar</span>
                </button>
              </form>
            </footer>
          </>
        ) : (
          /* Estado Vazio */
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
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-zinc-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setIsGroupMode(false);
                    setSelectedUserIds([]);
                  }}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    !isGroupMode
                      ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                      : "text-slate-500 dark:text-zinc-400 hover:text-slate-800"
                  }`}
                >
                  <UserIcon size={14} />
                  <span>Direta (1:1)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsGroupMode(true);
                    setSelectedUserIds([]);
                  }}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isGroupMode
                      ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                      : "text-slate-500 dark:text-zinc-400 hover:text-slate-800"
                  }`}
                >
                  <Users size={14} />
                  <span>Criar Grupo</span>
                </button>
              </div>

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
                  Selecione {isGroupMode ? "os integrantes" : "o destinatário"}:
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
                              if (isGroupMode) {
                                setSelectedUserIds((prev) =>
                                  isChecked
                                    ? prev.filter((id) => id !== u.id)
                                    : [...prev, u.id]
                                );
                              } else {
                                setSelectedUserIds([u.id]);
                              }
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
                                  className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-zinc-700"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold text-xs flex items-center justify-center">
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
  );
}