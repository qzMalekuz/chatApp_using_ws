import { Message, User } from "../types";
import { findUserById } from "./userService";

let rooms: Record<string, number[]> = {};

/**
 * Add a user to a room and notify other room members.
 */
export function joinRoom(user: User, roomName: string): void {
    if (!rooms[roomName]) {
        rooms[roomName] = [];
    }

    rooms[roomName].push(user.id);
    user.room = roomName;

    roomBroadcast(roomName, {
        type: "ROOM_NOTIFICATION",
        payload: { message: `${user.username} joined ${roomName}` },
    });
}

/**
 * Remove a user from their current room and notify remaining members.
 */
export function leaveRoom(user: User): void {
    if (!user.room) return;

    rooms[user.room] = rooms[user.room].filter((id) => id !== user.id);

    roomBroadcast(user.room, {
        type: "ROOM_NOTIFICATION",
        payload: { message: `${user.username} left ${user.room}` },
    });

    if (rooms[user.room].length === 0) {
        delete rooms[user.room];
    }
    user.room = null;
}

/**
 * Send a message to every user in a given room.
 */
export function roomBroadcast(roomName: string, message: Message): void {
    if (!rooms[roomName]) return;

    const json = JSON.stringify(message);

    rooms[roomName].forEach((id) => {
        const user = findUserById(id);
        if (user) user.ws.send(json);
    });
}
