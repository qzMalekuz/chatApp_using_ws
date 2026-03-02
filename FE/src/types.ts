export interface ChatMessage {
    id: string;
    type: 'CHAT' | 'PRIVATE_CHAT' | 'ROOM_CHAT' | 'ROOM_NOTIFICATION' | 'SYSTEM';
    userId: number;
    username: string;
    text: string;
    timestamp: string;
    isSelf: boolean;
    // Rich media extensions (local-only optimistic messages)
    audioUrl?: string;
    imageUrl?: string;
    videoUrl?: string;
    fileInfo?: { name: string; size: string };
    pollData?: { question: string; options: string[]; votes: number[] };
    locationData?: { lat: number; lng: number };
}

export interface OnlineUser {
    id: number;
    username: string;
    status?: string;
    avatarUrl?: string | null;
}

export interface UserProfile {
    status: string;
    avatarUrl: string | null;
    bannerUrl: string | null;
    joinedAt: string;
    messagesSent: number;
}

export interface ServerMessage {
    type: string;
    payload: Record<string, unknown>;
}
