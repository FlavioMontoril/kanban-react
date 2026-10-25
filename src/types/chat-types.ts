export interface UserAuth {
  id: string;
  name: string;
  email: string;
}

export interface ChatParticipant {
  id: string;
  userId: string;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: string;
}

export interface ChatRoom {
  id: string;
  name?: string;
  type: ChatType;
  createdAt: string;
  participants: ChatParticipant[];
  lastMessage?: string;
  lastMessageAt?: string;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  timestamp: string;
}

export interface CreateRoomPayload {
  name?: string;
  type: 'DIRECT' | 'GROUP';
  targetUserIds: string[];
}

export interface SendMessagePayload {
  roomId: string;
  content: string;
}

export enum ChatType {
    DIRECT = "DIRECT",
    GROUP = "GROUP",
}

