import { WebSocket } from "ws";

// ─── Core Models ────────────────────────────────────────────

/** A connected chat user with their WebSocket reference. */
export interface User {
    id: number;
    username: string;
    room: string | null; // null when the user hasn't joined any room
    ws: WebSocket;
}

/** Generic message envelope sent over WebSocket. */
export interface Message {
    type: string;
    payload: Record<string, unknown>;
}

// ─── Incoming Payload Shapes ────────────────────────────────

/** Payload for global and room chat messages. */
export interface ChatPayload {
    text?: string;
}

/** Payload for changing the display name. */
export interface SetUsernamePayload {
    username?: string;
}

/** Payload for direct messages between two users. */
export interface PrivateChatPayload {
    to?: number;   // recipient user ID
    text?: string;
}

/** Payload for joining a chat room. */
export interface RoomJoinPayload {
    room?: string; // room name to join
}
