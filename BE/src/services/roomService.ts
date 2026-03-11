import { WebSocket } from "ws";
import { Message, User } from "../types";
import { findUserById } from "./userService";
import { validateRoomName } from "../utils/validate";

// rooms: roomName → Set of userId
const rooms: Record<string, Set<number>> = {};

export function joinRoom(user: User, roomName: string): void {
    const safeRoom = validateRoomName(roomName);
    if (!safeRoom) return;
    // Already in this room — ignore
    if (user.rooms.includes(safeRoom)) return;

    if (!rooms[safeRoom]) {
        rooms[safeRoom] = new Set();
    }

    rooms[safeRoom].add(user.id);
    user.rooms.push(safeRoom);
    user.room = safeRoom;   // track last joined as primary (for backward compat)

    broadcastToRoom(safeRoom, {
        type: "ROOM_NOTIFICATION",
        payload: {
            message: `${user.username} joined ${safeRoom}`,
            timestamp: new Date().toISOString(),
        },
    });
}

export function leaveRoom(user: User, roomName?: string): void {
    const target = roomName ? validateRoomName(roomName) : user.room;
    if (!target) return;
    if (!user.rooms.includes(target)) return;

    rooms[target]?.delete(user.id);

    broadcastToRoom(target, {
        type: "ROOM_NOTIFICATION",
        payload: {
            message: `${user.username} left ${target}`,
            timestamp: new Date().toISOString(),
        },
    });

    if (rooms[target] && rooms[target].size === 0) {
        delete rooms[target];
    }

    user.rooms = user.rooms.filter(r => r !== target);
    // Update primary room reference
    user.room = user.rooms[user.rooms.length - 1] ?? null;
}

export function leaveAllRooms(user: User): void {
    for (const room of [...user.rooms]) {
        leaveRoom(user, room);
    }
}

export function broadcastToRoom(roomName: string, message: Message): void {
    if (!rooms[roomName]) return;

    const serialised = JSON.stringify(message);

    rooms[roomName].forEach((memberId) => {
        const member = findUserById(memberId);
        if (member && member.ws.readyState === WebSocket.OPEN) {
            member.ws.send(serialised);
        }
    });
}

export function getRoomMembers(roomName: string): { id: number; username: string }[] {
    if (!rooms[roomName]) return [];

    const result: { id: number; username: string }[] = [];
    rooms[roomName].forEach((memberId) => {
        const member = findUserById(memberId);
        if (member) result.push({ id: member.id, username: member.username });
    });
    return result;
}
