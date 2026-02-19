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
import { joinRoom, leaveRoom, roomBroadcast } from "../services/roomService";
import { sendError } from "../utils/send";

/**
 * Parse and dispatch an incoming WebSocket message to the correct service.
 */
export function handleMessage(ws: WebSocket, raw: string): void {
    let msg: Message;

    try {
        msg = JSON.parse(raw);
    } catch {
        return sendError(ws, "Invalid JSON");
    }

    const { type, payload } = msg;
    const user = findUserByWs(ws);

    if (!user) return sendError(ws, "User not found");
    if (!type || !payload) return sendError(ws, "Missing type or payload");

    switch (type) {
        case "CHAT": {
            const { text } = payload as ChatPayload;
            if (!text) return sendError(ws, "Missing text");

            broadcast({
                type: "CHAT",
                payload: { id: user.id, username: user.username, text },
            });
            break;
        }

        case "SET_USERNAME": {
            const { username } = payload as SetUsernamePayload;
            if (!username) return sendError(ws, "Missing username");

            user.username = username;
            broadcast({
                type: "USERNAME_CHANGED",
                payload: { id: user.id, username: user.username },
            });
            break;
        }

        case "PRIVATE_CHAT": {
            const { to, text } = payload as PrivateChatPayload;
            if (!to || !text) return sendError(ws, "Missing 'to' or 'text'");

            sendPrivateMessage(user, to, text);
            break;
        }

        case "ROOM_JOIN": {
            const { room } = payload as RoomJoinPayload;
            if (!room) return sendError(ws, "Room name required");

            joinRoom(user, room);
            break;
        }

        case "ROOM_LEAVE": {
            leaveRoom(user);
            break;
        }

        case "ROOM_CHAT": {
            const { text } = payload as ChatPayload;
            if (!text) return sendError(ws, "Message required");
            if (!user.room) return sendError(ws, "Join a room first");

            roomBroadcast(user.room, {
                type: "ROOM_CHAT",
                payload: { id: user.id, username: user.username, text },
            });
            break;
        }

        default:
            sendError(ws, "Unknown message type: " + type);
    }
}
