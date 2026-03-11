import { WebSocket } from "ws";
import {
    Message,
    ChatPayload,
    SetUsernamePayload,
    UpdateProfilePayload,
    PrivateChatPayload,
    RoomJoinPayload,
    RoomLeavePayload,
    RoomChatPayload,
    TypingPayload,
    RoomMembersPayload,
    VoiceChatPayload,
} from "../types";
import { findUserByWs, getPublicUserList } from "../services/userService";
import { broadcast, sendPrivateMessage } from "../services/chatService";
import { joinRoom, leaveRoom, leaveAllRooms, broadcastToRoom, getRoomMembers } from "../services/roomService";
import { sendError, sendJson } from "../utils/send";
import { validateAvatarUrl, validateRoomName, validateStatus, validateText, validateUsername } from "../utils/validate";
import { isRateLimited } from "../utils/rateLimit";
import { asSafeInteger, isValidEnvelope } from "../utils/messageSchema";
import { MAX_RAW_MESSAGE_BYTES } from "../config";


export function handleMessage(ws: WebSocket, raw: string): void {
    if (raw.length > MAX_RAW_MESSAGE_BYTES) {
        sendError(ws, "Payload too large");
        ws.close(1009, "Payload too large");
        return;
    }

    let parsed: unknown;

    try {
        parsed = JSON.parse(raw);
    } catch {
        return sendError(ws, "Invalid JSON");
    }

    if (!isValidEnvelope(parsed)) {
        return sendError(ws, "Invalid message envelope");
    }

    const { type, payload } = parsed as Message;
    const sender = findUserByWs(ws);

    if (!sender) return sendError(ws, "User not found");
    if (!type || !payload) return sendError(ws, "Missing type or payload");

    if (isRateLimited(sender, type)) {
        return sendError(ws, "Rate limit exceeded. Please slow down.");
    }

    const messageId = (payload as { messageId?: unknown }).messageId;
    if (typeof messageId === "string" && messageId.length <= 64) {
        if (sender.recentMessageIds.includes(messageId)) {
            return sendError(ws, "Duplicate message");
        }
        sender.recentMessageIds.push(messageId);
        if (sender.recentMessageIds.length > 100) {
            sender.recentMessageIds.shift();
        }
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

        case "UPDATE_PROFILE": {
            const { status, avatarUrl } = payload as UpdateProfilePayload;

            if (status !== undefined) sender.status = validateStatus(String(status));
            const safeAvatarUrl = validateAvatarUrl(avatarUrl);
            if (safeAvatarUrl !== undefined) sender.avatarUrl = safeAvatarUrl;

            broadcast({
                type: "USER_UPDATED",
                payload: { id: sender.id, status: sender.status, avatarUrl: sender.avatarUrl, timestamp },
            });
            break;
        }

        case "PRIVATE_CHAT": {
            const { to, text } = payload as PrivateChatPayload;
            const cleanText = validateText(text || "");
            const targetId = asSafeInteger(to);
            if (!targetId || !cleanText) return sendError(ws, "Missing 'to' or invalid message");

            sendPrivateMessage(sender, targetId, cleanText);
            break;
        }

        case "ROOM_JOIN": {
            const { room } = payload as RoomJoinPayload;
            const safeRoom = validateRoomName(room || "");
            if (!safeRoom) return sendError(ws, "Room name required");

            joinRoom(sender, safeRoom);
            break;
        }

        case "ROOM_LEAVE": {
            const { room } = payload as RoomLeavePayload;
            if (room) {
                const safeRoom = validateRoomName(room);
                if (!safeRoom) return sendError(ws, "Invalid room name");
                leaveRoom(sender, safeRoom);
            } else {
                leaveAllRooms(sender);
            }
            break;
        }

        case "ROOM_CHAT": {
            const { text, room } = payload as RoomChatPayload;
            const cleanText = validateText(text || "");
            if (!cleanText) return sendError(ws, "Invalid or empty message");

            // Use specified room or fall back to primary room
            const validatedRoom = room ? validateRoomName(room) : sender.room;
            const targetRoom = validatedRoom || sender.room;
            if (!targetRoom) return sendError(ws, "Join a room first");
            if (!sender.rooms.includes(targetRoom)) return sendError(ws, "Not a member of that room");

            broadcastToRoom(targetRoom, {
                type: "ROOM_CHAT",
                payload: { id: sender.id, username: sender.username, text: cleanText, room: targetRoom, timestamp },
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
            const safeRoom = validateRoomName(room || "");
            if (!safeRoom) return sendError(ws, "Room name required");

            sendJson(ws, {
                type: "ROOM_MEMBERS",
                payload: { room: safeRoom, members: getRoomMembers(safeRoom), timestamp },
            });
            break;
        }

        case "TYPING_START": {
            const { room } = payload as TypingPayload;
            const target = room ? validateRoomName(room) : sender.room;
            if (!target) return sendError(ws, "Specify a room or join one first");

            broadcastToRoom(target, {
                type: "TYPING_START",
                payload: { id: sender.id, username: sender.username, room: target },
            });
            break;
        }

        case "TYPING_STOP": {
            const { room } = payload as TypingPayload;
            const target = room ? validateRoomName(room) : sender.room;
            if (!target) return sendError(ws, "Specify a room or join one first");

            broadcastToRoom(target, {
                type: "TYPING_STOP",
                payload: { id: sender.id, username: sender.username, room: target },
            });
            break;
        }

        case "VOICE_CHAT": {
            const { audioData, duration } = payload as VoiceChatPayload;
            if (!audioData || typeof audioData !== 'string') return sendError(ws, "Missing audio data");
            if (audioData.length > 2_000_000) return sendError(ws, "Audio too large (max ~1.5MB)");
            if (!audioData.startsWith('data:audio')) return sendError(ws, "Invalid audio format");

            broadcast({
                type: "VOICE_CHAT",
                payload: { id: sender.id, username: sender.username, audioData, duration: duration ?? 0, timestamp },
            });
            break;
        }

        case "ROOM_VOICE": {
            const { audioData, duration, room } = payload as VoiceChatPayload;
            if (!audioData || typeof audioData !== 'string') return sendError(ws, "Missing audio data");
            if (audioData.length > 2_000_000) return sendError(ws, "Audio too large (max ~1.5MB)");
            if (!audioData.startsWith('data:audio')) return sendError(ws, "Invalid audio format");

            const targetRoom = room ? validateRoomName(room) : sender.room;
            if (!targetRoom) return sendError(ws, "Join a room first");
            if (!sender.rooms.includes(targetRoom)) return sendError(ws, "Not a member of that room");

            broadcastToRoom(targetRoom, {
                type: "ROOM_VOICE",
                payload: { id: sender.id, username: sender.username, audioData, duration: duration ?? 0, room: targetRoom, timestamp },
            });
            break;
        }

        case "PRIVATE_VOICE": {
            const { to, audioData, duration } = payload as VoiceChatPayload;
            if (!audioData || typeof audioData !== 'string') return sendError(ws, "Missing audio data");
            if (audioData.length > 2_000_000) return sendError(ws, "Audio too large (max ~1.5MB)");
            if (!audioData.startsWith('data:audio')) return sendError(ws, "Invalid audio format");
            const targetId = asSafeInteger(to);
            if (!targetId) return sendError(ws, "Missing 'to'");

            sendPrivateMessage(sender, targetId, `🎤 Voice message`, audioData, duration ?? 0);
            break;
        }

        default:
            sendError(ws, "Unknown message type: " + type);
    }
}

export { leaveAllRooms };
