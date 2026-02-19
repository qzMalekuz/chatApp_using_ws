import { WebSocket } from "ws";
import { User } from "../types";

// ─── In-memory User Store ───────────────────────────────────

/** All currently connected users. */
let connectedUsers: User[] = [];

/** Auto-incrementing counter for unique user IDs. */
let nextUserId = 0;

// ─── Public API ─────────────────────────────────────────────

/**
 * Register a new user for the given WebSocket connection.
 * Assigns an auto-incremented ID and a default "Guest_N" username.
 *
 * @param ws - The newly connected WebSocket.
 * @returns  The created User object.
 */
export function addUser(ws: WebSocket): User {
    nextUserId++;

    const newUser: User = {
        id: nextUserId,
        username: `Guest_${nextUserId}`,
        room: null,
        ws,
    };

    connectedUsers.push(newUser);
    return newUser;
}

/**
 * Unregister a user by their WebSocket reference.
 *
 * @param ws - The disconnected WebSocket.
 * @returns  The removed User, or `undefined` if not found.
 */
export function removeUser(ws: WebSocket): User | undefined {
    const disconnectedUser = connectedUsers.find((user) => user.ws === ws);

    if (disconnectedUser) {
        connectedUsers = connectedUsers.filter((user) => user.ws !== ws);
    }

    return disconnectedUser;
}

/**
 * Look up a user by their WebSocket reference.
 *
 * @param ws - The WebSocket to search for.
 * @returns  The matching User, or `undefined` if not found.
 */
export function findUserByWs(ws: WebSocket): User | undefined {
    return connectedUsers.find((user) => user.ws === ws);
}

/**
 * Look up a user by their numeric ID.
 *
 * @param id - The user ID to search for.
 * @returns  The matching User, or `undefined` if not found.
 */
export function findUserById(id: number): User | undefined {
    return connectedUsers.find((user) => user.id === id);
}

/**
 * Get a read-only snapshot of every connected user.
 * Useful for broadcasting to all clients.
 *
 * @returns An immutable array of Users.
 */
export function getAllUsers(): ReadonlyArray<User> {
    return connectedUsers;
}
