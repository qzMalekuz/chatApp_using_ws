import { WebSocket } from "ws";
import {
    Message,
    ChatPayload,
    SetUsernamePayload,
    PrivateChatPayload,
    RoomJoinPayload,
} from "../types";
import { findUserByWs } from "../services/userService";
import { broadcast, sendPrivateMessage } from "../services/chatService";
import { joinRoom, leaveRoom, broadcastToRoom } from "../services/roomService";
import { sendError } from "../utils/send";

/**
 * Parse a raw WebSocket message and route it to the appropriate service.
 *
 * Expected message format: `{ "type": "CHAT", "payload": { ... } }`
 *
 * @param ws  - The sender's WebSocket connection.
 * @param raw - The raw string received from the client.
 */
export function handleMessage(ws: WebSocket, raw: string): void {
    // ── 1. Parse the incoming JSON ────────────────────────────
    let parsed: Message;

    try {
        parsed = JSON.parse(raw);
    } catch {
        return sendError(ws, "Invalid JSON");
    }

    // ── 2. Validate the sender and the message structure ──────
    const { type, payload } = parsed;
    const sender = findUserByWs(ws);

    if (!sender) return sendError(ws, "User not found");
    if (!type || !payload) return sendError(ws, "Missing type or payload");

    // ── 3. Route to the correct handler ───────────────────────
    switch (type) {

        case "CHAT": {
            const { text } = payload as ChatPayload;
            if (!text) return sendError(ws, "Missing text");

            broadcast({
                type: "CHAT",
                payload: { id: sender.id, username: sender.username, text },
            });
            break;
        }

        case "SET_USERNAME": {
            const { username } = payload as SetUsernamePayload;
            if (!username) return sendError(ws, "Missing username");

            sender.username = username;

            broadcast({
                type: "USERNAME_CHANGED",
                payload: { id: sender.id, username: sender.username },
            });
            break;
        }

        case "PRIVATE_CHAT": {
            const { to, text } = payload as PrivateChatPayload;
            if (!to || !text) return sendError(ws, "Missing 'to' or 'text'");

            sendPrivateMessage(sender, to, text);
            break;
        }

        case "ROOM_JOIN": {
            const { room } = payload as RoomJoinPayload;
            if (!room) return sendError(ws, "Room name required");

            joinRoom(sender, room);
            break;
        }

        case "ROOM_LEAVE": {
            leaveRoom(sender);
            break;
        }

        case "ROOM_CHAT": {
            const { text } = payload as ChatPayload;
            if (!text) return sendError(ws, "Message required");
            if (!sender.room) return sendError(ws, "Join a room first");

            broadcastToRoom(sender.room, {
                type: "ROOM_CHAT",
                payload: { id: sender.id, username: sender.username, text },
            });
            break;
        }

        default:
            sendError(ws, "Unknown message type: " + type);
    }
}
