export interface UserAuth {
  id: number;
  name: string;
  email: string;
}

export interface ChatParticipant {
  id: string;
  userId: number;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: string;
}

export interface ChatRoom {
  id: string;
  name?: string;
  isGroup: boolean;
  createdAt: string;
  participants: ChatParticipant[];
  lastMessage?: string;
  lastMessageAt?: string;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: number;
  content: string;
  timestamp: string;
}

export interface CreateRoomPayload {
  name?: string;
  isGroup: boolean;
  participantUserIds: number[];
}

export interface SendMessagePayload {
  roomId: string;
  content: string;
}
