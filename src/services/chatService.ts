import type { ChatRoom, CreateRoomPayload, Message, SendMessagePayload } from "@/types/chat-types";
import { api } from "./api";


export const chatService = {
  async getUserRooms(): Promise<ChatRoom[]> {
    const response = await api.get<ChatRoom[]>("/api/v1/chats/rooms");
    return response.data;
  },

  async createRoom(payload: CreateRoomPayload): Promise<ChatRoom> {
    const response = await api.post<ChatRoom>("/api/v1/chats/rooms", payload);
    return response.data;
  },

  async getRoomMessagesHistory(roomId: string): Promise<Message[]> {
    const response = await api.get(`/api/v1/chats/rooms/${roomId}/messages?size=50`);
    // O Spring Data Pageable retorna os itens no atributo 'content'
    return response.data.content || response.data;
  },

  async sendMessage(payload: SendMessagePayload): Promise<Message> {
    const response = await api.post<Message>("/api/v1/chats/messages", payload);
    return response.data;
  },
};