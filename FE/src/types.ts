export interface ChatMessage {
    id: string;
    type: 'CHAT' | 'PRIVATE_CHAT' | 'ROOM_CHAT' | 'ROOM_NOTIFICATION' | 'SYSTEM';
    userId: number;
    username: string;
    text: string;
    timestamp: string;
    isSelf: boolean;
}

export interface OnlineUser {
    id: number;
    username: string;
}

export interface UserProfile {
    status: string;
    avatarUrl: string | null;
    joinedAt: string;
    messagesSent: number;
}

export interface ServerMessage {
    type: string;
    payload: Record<string, unknown>;
}
