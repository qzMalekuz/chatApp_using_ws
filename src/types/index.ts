import { WebSocket } from "ws";

// ─── Core Models ────────────────────────────────────────────

export interface User {
    id: number;
    username: string;
    room: string | null;
    ws: WebSocket;
    isAlive: boolean;
    lastMessageTimestamps: number[];
}

export interface Message {
    type: string;
    payload: Record<string, unknown>;
}

// ─── Incoming Payload Shapes ────────────────────────────────

export interface ChatPayload {
    text?: string;
}

export interface SetUsernamePayload {
    username?: string;
}

export interface PrivateChatPayload {
    to?: number;
    text?: string;
}

export interface RoomJoinPayload {
    room?: string;
}

export interface TypingPayload {
    room?: string;
}

export interface RoomMembersPayload {
    room?: string;
}
