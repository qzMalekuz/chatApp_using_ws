import { WebSocket } from "ws";

export interface User {
    id: number;
    username: string;
    room: string | null;
    ws: WebSocket;
}

export interface Message {
    type: string;
    payload: Record<string, unknown>;
}

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
