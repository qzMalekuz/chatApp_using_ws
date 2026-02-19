import { Message, User } from "../types";
import { findUserById } from "./userService";

let rooms: Record<string, number[]> = {};

export function joinRoom(user: User, roomName: string): void {
    // Already in this room — ignore
    if (user.room === roomName) return;

    // Leave current room first if in one
    if (user.room) leaveRoom(user);

    if (!rooms[roomName]) {
        rooms[roomName] = [];
    }

    rooms[roomName].push(user.id);
    user.room = roomName;

    broadcastToRoom(roomName, {
        type: "ROOM_NOTIFICATION",
        payload: {
            message: `${user.username} joined ${roomName}`,
            timestamp: new Date().toISOString(),
        },
    });
}

export function leaveRoom(user: User): void {
    if (!user.room) return;

    const currentRoom = user.room;

    rooms[currentRoom] = rooms[currentRoom].filter(
        (memberId) => memberId !== user.id
    );

    broadcastToRoom(currentRoom, {
        type: "ROOM_NOTIFICATION",
        payload: {
            message: `${user.username} left ${currentRoom}`,
            timestamp: new Date().toISOString(),
        },
    });

    if (rooms[currentRoom].length === 0) {
        delete rooms[currentRoom];
    }

    user.room = null;
}

export function broadcastToRoom(roomName: string, message: Message): void {
    if (!rooms[roomName]) return;

    const serialised = JSON.stringify(message);

    rooms[roomName].forEach((memberId) => {
        const member = findUserById(memberId);
        if (member) member.ws.send(serialised);
    });
}

export function getRoomMembers(roomName: string): { id: number; username: string }[] {
    if (!rooms[roomName]) return [];

    return rooms[roomName]
        .map((memberId) => {
            const member = findUserById(memberId);
            return member ? { id: member.id, username: member.username } : null;
        })
        .filter((m): m is { id: number; username: string } => m !== null);
}
