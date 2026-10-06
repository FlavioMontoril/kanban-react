import { create } from "zustand";
import type { ChatRoom, Message, UserAuth } from "@/types/chat/chat";
import { authApi } from "@/services/authService";
import type { UserResponse } from "@/types/user";

interface ChatState {
  rooms: ChatRoom[];
  activeRoom: ChatRoom | null;
  messages: Message[];
  systemUsers: UserAuth[];

  usersMap: Record<string, UserResponse>;

  isLoadingRooms: boolean;
  isLoadingMessages: boolean;

  setRooms: (rooms: ChatRoom[]) => void;
  addRoom: (room: ChatRoom) => void;
  setActiveRoom: (room: ChatRoom | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;

  fetchUserById: (id: string) => Promise<UserResponse | null>;

  setSystemUsers: (users: UserAuth[]) => void;
  setIsLoadingRooms: (loading: boolean) => void;
  setIsLoadingMessages: (loading: boolean) => void;

  clearChatState: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  rooms: [],
  activeRoom: null,
  messages: [],
  systemUsers: [],
  usersMap: {},
  isLoadingRooms: false,
  isLoadingMessages: false,

  setRooms: (rooms) => set({ rooms }),
  addRoom: (room) => set((state) => ({ rooms: [room, ...state.rooms] })),
  setActiveRoom: (room) => set({ activeRoom: room }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setSystemUsers: (systemUsers) => set({ systemUsers }),
  setIsLoadingRooms: (isLoadingRooms) => set({ isLoadingRooms }),
  setIsLoadingMessages: (isLoadingMessages) => set({ isLoadingMessages }),

  fetchUserById: async (id: string) => {
    if (!id) return null;

    // Se já estiver no cache, retorna imediatamente sem fazer chamada HTTP
    const cachedUser = get().usersMap[id];
    if (cachedUser) return cachedUser;

    try {
      // Busca na API de Auth e salva no usersMap
      const user = await authApi.findUserById(id);
      if (user) {
        set((state) => ({
          usersMap: { ...state.usersMap, [user.id]: user },
        }));
      }
      return user;
    } catch (error) {
      console.error(`Erro ao buscar usuário ID ${id}:`, error);
      return null;
    }
  },

  clearChatState: () =>
    set({
      rooms: [],
      activeRoom: null,
      messages: [],
      systemUsers: [],
      isLoadingRooms: false,
      isLoadingMessages: false,
    }),
}));