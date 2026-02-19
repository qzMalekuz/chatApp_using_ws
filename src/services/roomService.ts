import { Message, User } from "../types";
import { findUserById } from "./userService";

// ─── In-memory Room Store ───────────────────────────────────
// Maps room name → array of user IDs who are currently in that room.

let rooms: Record<string, number[]> = {};

// ─── Public API ─────────────────────────────────────────────

/**
 * Add a user to a chat room and notify existing room members.
 * Creates the room automatically if it doesn't exist yet.
 *
 * @param user     - The user joining the room.
 * @param roomName - The name of the room to join.
 */
export function joinRoom(user: User, roomName: string): void {
    // Create the room if this is the first member
    if (!rooms[roomName]) {
        rooms[roomName] = [];
    }

    rooms[roomName].push(user.id);
    user.room = roomName;

    broadcastToRoom(roomName, {
        type: "ROOM_NOTIFICATION",
        payload: { message: `${user.username} joined ${roomName}` },
    });
}

/**
 * Remove a user from their current room and notify remaining members.
 * Automatically deletes the room when the last member leaves.
 *
 * @param user - The user leaving their room.
 */
export function leaveRoom(user: User): void {
    if (!user.room) return;

    const currentRoom = user.room;

    // Remove the user from the room's member list
    rooms[currentRoom] = rooms[currentRoom].filter(
        (memberId) => memberId !== user.id
    );

    broadcastToRoom(currentRoom, {
        type: "ROOM_NOTIFICATION",
        payload: { message: `${user.username} left ${currentRoom}` },
    });

    // Clean up empty rooms to avoid memory leaks
    if (rooms[currentRoom].length === 0) {
        delete rooms[currentRoom];
    }

    user.room = null;
}

/**
 * Send a message to every user who is currently in the given room.
 *
 * @param roomName - The target room.
 * @param message  - The message envelope to send.
 */
export function broadcastToRoom(roomName: string, message: Message): void {
    if (!rooms[roomName]) return;

    const serialised = JSON.stringify(message);

    rooms[roomName].forEach((memberId) => {
        const member = findUserById(memberId);
        if (member) member.ws.send(serialised);
    });
}
