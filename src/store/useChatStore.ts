import { create } from "zustand";
import type { ChatRoom, Message, UserAuth } from "@/types/chat/chat";

interface ChatState {
  rooms: ChatRoom[];
  activeRoom: ChatRoom | null;
  messages: Message[];
  systemUsers: UserAuth[];
  isLoadingRooms: boolean;
  isLoadingMessages: boolean;

  setRooms: (rooms: ChatRoom[]) => void;
  addRoom: (room: ChatRoom) => void;
  setActiveRoom: (room: ChatRoom | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setSystemUsers: (users: UserAuth[]) => void;
  setIsLoadingRooms: (loading: boolean) => void;
  setIsLoadingMessages: (loading: boolean) => void;
  clearChatState: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  rooms: [],
  activeRoom: null,
  messages: [],
  systemUsers: [],
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