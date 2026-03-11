import { WebSocket } from "ws";

// ─── Core Models ────────────────────────────────────────────

export interface User {
    id: number;
    username: string;
    status: string;
    avatarUrl: string | null;
    room: string | null;      // primary/active room (kept for ROOM_CHAT compat)
    rooms: string[];          // all joined rooms
    ws: WebSocket;
    isAlive: boolean;
    lastMessageTimestamps: number[];
    ip: string;
    recentMessageIds: string[];
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

export interface UpdateProfilePayload {
    status?: string;
    avatarUrl?: string | null;
}

export interface PrivateChatPayload {
    to?: number;
    text?: string;
}

export interface RoomJoinPayload {
    room?: string;
}

export interface RoomLeavePayload {
    room?: string;
}

export interface TypingPayload {
    room?: string;
}

export interface RoomMembersPayload {
    room?: string;
}

export interface RoomChatPayload {
    text?: string;
    room?: string;   // optional — if omitted uses sender.room for backward compat
}

export interface VoiceChatPayload {
    audioData?: string;  // base64-encoded audio
    to?: number;         // for private voice
    duration?: number;   // seconds
    room?: string;       // for ROOM_VOICE
}
