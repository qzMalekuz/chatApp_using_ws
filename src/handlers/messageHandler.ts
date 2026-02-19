import { WebSocket } from "ws";
import {
    Message,
    ChatPayload,
    SetUsernamePayload,
    PrivateChatPayload,
    RoomJoinPayload,
    TypingPayload,
    RoomMembersPayload,
} from "../types";
import { findUserByWs, getPublicUserList } from "../services/userService";
import { broadcast, sendPrivateMessage } from "../services/chatService";
import { joinRoom, leaveRoom, broadcastToRoom, getRoomMembers } from "../services/roomService";
import { sendError, sendJson } from "../utils/send";
import { validateText, validateUsername } from "../utils/validate";
import { isRateLimited } from "../utils/rateLimit";


export function handleMessage(ws: WebSocket, raw: string): void {
    let parsed: Message;

    try {
        parsed = JSON.parse(raw);
    } catch {
        return sendError(ws, "Invalid JSON");
    }

    const { type, payload } = parsed;
    const sender = findUserByWs(ws);

    if (!sender) return sendError(ws, "User not found");
    if (!type || !payload) return sendError(ws, "Missing type or payload");

    if (isRateLimited(sender)) {
        return sendError(ws, "Rate limit exceeded. Please slow down.");
    }

    const timestamp = new Date().toISOString();

    switch (type) {

        case "CHAT": {
            const { text } = payload as ChatPayload;
            const cleanText = validateText(text || "");
            if (!cleanText) return sendError(ws, "Invalid or empty message (max 500 chars)");

            broadcast({
                type: "CHAT",
                payload: { id: sender.id, username: sender.username, text: cleanText, timestamp },
            });
            break;
        }

        case "SET_USERNAME": {
            const { username } = payload as SetUsernamePayload;
            const cleanUsername = validateUsername(username || "");
            if (!cleanUsername) return sendError(ws, "Invalid username (alphanumeric/underscore, max 20 chars)");

            sender.username = cleanUsername;

            broadcast({
                type: "USERNAME_CHANGED",
                payload: { id: sender.id, username: sender.username, timestamp },
            });
            break;
        }

        case "PRIVATE_CHAT": {
            const { to, text } = payload as PrivateChatPayload;
            const cleanText = validateText(text || "");
            if (!to || !cleanText) return sendError(ws, "Missing 'to' or invalid message");

            sendPrivateMessage(sender, to, cleanText);
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
            const cleanText = validateText(text || "");
            if (!cleanText) return sendError(ws, "Invalid or empty message");
            if (!sender.room) return sendError(ws, "Join a room first");

            broadcastToRoom(sender.room, {
                type: "ROOM_CHAT",
                payload: { id: sender.id, username: sender.username, text: cleanText, timestamp },
            });
            break;
        }

        case "GET_USERS": {
            sendJson(ws, {
                type: "USER_LIST",
                payload: { users: getPublicUserList(), timestamp },
            });
            break;
        }

        case "ROOM_MEMBERS": {
            const { room } = payload as RoomMembersPayload;
            if (!room) return sendError(ws, "Room name required");

            sendJson(ws, {
                type: "ROOM_MEMBERS",
                payload: { room, members: getRoomMembers(room), timestamp },
            });
            break;
        }

        case "TYPING_START": {
            const { room } = payload as TypingPayload;
            const target = room || sender.room;
            if (!target) return sendError(ws, "Specify a room or join one first");

            broadcastToRoom(target, {
                type: "TYPING_START",
                payload: { id: sender.id, username: sender.username, room: target },
            });
            break;
        }

        case "TYPING_STOP": {
            const { room } = payload as TypingPayload;
            const target = room || sender.room;
            if (!target) return sendError(ws, "Specify a room or join one first");

            broadcastToRoom(target, {
                type: "TYPING_STOP",
                payload: { id: sender.id, username: sender.username, room: target },
            });
            break;
        }

        default:
            sendError(ws, "Unknown message type: " + type);
    }
}
