import React, { useState, useRef, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { useAuthStore } from "@/store/useAuthStore";
import type { ChatRoom } from "@/types/chat/chat";

export default function ChatPage() {
  const { user } = useAuthStore();
  const currentUserId = user?.id ? Number(user.id) : 0;

  const {
    rooms,
    activeRoom,
    messages,
    systemUsers,
    isConnected,
    isLoadingRooms,
    setActiveRoom,
    sendMessage,
    createRoom,
  } = useChat();

  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Estados locais do Modal de Nova Conversa / Grupo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll para a última mensagem recebida/enviada
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    sendMessage(messageInput);
    setMessageInput("");
  };

  const handleCreateRoom = async () => {
    if (selectedUserIds.length === 0) return;

    try {
      await createRoom({
        name: isGroupMode ? groupName : undefined,
        isGroup: isGroupMode,
        participantUserIds: [...selectedUserIds, currentUserId],
      });
      setIsModalOpen(false);
      setSelectedUserIds([]);
      setGroupName("");
    } catch (err) {
      console.error("Erro ao criar sala:", err);
    }
  };

  const getRoomDisplayName = (room: ChatRoom) => {
    if (room.isGroup) return room.name || "Grupo sem nome";
    const otherParticipant = room.participants.find(
      (p) => p.userId !== currentUserId,
    );
    const foundUser = systemUsers.find(
      (u) => u.id === otherParticipant?.userId,
    );
    return foundUser
      ? foundUser.name
      : `Usuário #${otherParticipant?.userId || ""}`;
  };

  const filteredRooms = rooms.filter((room) =>
    getRoomDisplayName(room).toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const availableUsers = systemUsers.filter((u) => u.id !== currentUserId);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* SIDEBAR DE SALAS */}
      <div className="w-1/3 max-w-sm border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              Chat
            </h1>
            <span
              className={`w-2.5 h-2.5 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
              title={isConnected ? "Conectado ao WebSocket" : "Desconectado"}
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
          >
            + Novo
          </button>
        </div>

        {/* Campo de Pesquisa */}
        <div className="p-3">
          <input
            type="text"
            placeholder="Buscar conversa ou grupo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:outline-none"
          />
        </div>

        {/* Lista de Conversas / Fallback Vazio */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingRooms ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Carregando conversas...
            </div>
          ) : filteredRooms.length > 0 ? (
            filteredRooms.map((room) => {
              const isSelected = activeRoom?.id === room.id;
              return (
                <div
                  key={room.id}
                  onClick={() => setActiveRoom(room)}
                  className={`p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer transition flex items-center gap-3 ${
                    isSelected
                      ? "bg-blue-50 dark:bg-gray-800/60"
                      : "hover:bg-gray-50 dark:hover:bg-gray-900"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {getRoomDisplayName(room).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-semibold truncate text-gray-900 dark:text-gray-100">
                      {getRoomDisplayName(room)}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {room.isGroup ? "Grupo" : "Conversa Direta"}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Nenhuma conversa encontrada.
            </div>
          )}
        </div>
      </div>

      {/* PAINEL DE MENSAGENS */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
        {activeRoom ? (
          <>
            {/* Header da Sala */}
            <div className="p-4 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                {getRoomDisplayName(activeRoom).charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-bold text-gray-900 dark:text-gray-100">
                  {getRoomDisplayName(activeRoom)}
                </h2>
                <span className="text-xs text-gray-500">
                  {activeRoom.isGroup
                    ? `${activeRoom.participants.length} participantes`
                    : "Conversa Direta"}
                </span>
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => {
                const isMe = msg.senderId === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl text-sm ${
                        isMe
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none shadow-sm"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <span
                        className={`text-[10px] block text-right mt-1 ${isMe ? "text-blue-200" : "text-gray-400"}`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>

            {/* Form de Envio */}
            <form
              onSubmit={handleSend}
              className="p-4 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 flex gap-2"
            >
              <input
                type="text"
                placeholder="Digite sua mensagem..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                disabled={!isConnected}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!isConnected || !messageInput.trim()}
                className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                Enviar
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <p>Selecione uma conversa para começar</p>
          </div>
        )}
      </div>

      {/* MODAL CRIAR CONVERSA / GRUPO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Nova Conversa
            </h2>

            <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800 pb-2">
              <button
                onClick={() => {
                  setIsGroupMode(false);
                  setSelectedUserIds([]);
                }}
                className={`text-sm font-semibold ${!isGroupMode ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
              >
                1:1 Direta
              </button>
              <button
                onClick={() => {
                  setIsGroupMode(true);
                  setSelectedUserIds([]);
                }}
                className={`text-sm font-semibold ${isGroupMode ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
              >
                Criar Grupo
              </button>
            </div>

            {isGroupMode && (
              <input
                type="text"
                placeholder="Nome do Grupo"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none"
              />
            )}

            {/* SELEÇÃO DE USUÁRIOS COM FALLBACK DE LISTA VAZIA */}
            <div className="max-h-48 overflow-y-auto space-y-2">
              <p className="text-xs text-gray-500 font-semibold">
                Selecione o(s) integrante(s):
              </p>

              {availableUsers.length > 0 ? (
                availableUsers.map((u) => {
                  const userIdNumber = Number(u.id); // Força tipo number estrito

                  return (
                    <label
                      key={u.id}
                      className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-sm"
                    >
                      <input
                        type={isGroupMode ? "checkbox" : "radio"}
                        name="userSelect"
                        checked={selectedUserIds.includes(userIdNumber)}
                        onChange={(e) => {
                          if (isGroupMode) {
                            setSelectedUserIds((prev) =>
                              e.target.checked
                                ? [...prev, userIdNumber]
                                : prev.filter((id) => id !== userIdNumber),
                            );
                          } else {
                            setSelectedUserIds([userIdNumber]);
                          }
                        }}
                      />
                      <span className="text-gray-800 dark:text-gray-200">
                        {u.name}
                      </span>
                    </label>
                  );
                })
              ) : (
                <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-800 rounded-lg">
                  Nenhum usuário disponível para iniciar conversa.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateRoom}
                disabled={selectedUserIds.length === 0}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
