import { WebSocket } from "ws";
import { User } from "../types";

let users: User[] = [];
let nextUserId = 0;

/**
 * Create and register a new user for the given WebSocket connection.
 */
export function addUser(ws: WebSocket): User {
    nextUserId++;
    const user: User = {
        id: nextUserId,
        username: `Guest_${nextUserId}`,
        room: null,
        ws,
    };
    users.push(user);
    return user;
}

/**
 * Remove a user by their WebSocket reference.
 */
export function removeUser(ws: WebSocket): User | undefined {
    const user = users.find((u) => u.ws === ws);
    if (user) {
        users = users.filter((u) => u.ws !== ws);
    }
    return user;
}

/**
 * Find a user by their WebSocket reference.
 */
export function findUserByWs(ws: WebSocket): User | undefined {
    return users.find((u) => u.ws === ws);
}

/**
 * Find a user by their numeric ID.
 */
export function findUserById(id: number): User | undefined {
    return users.find((u) => u.id === id);
}

/**
 * Return the full (read-only) list of connected users.
 */
export function getAllUsers(): ReadonlyArray<User> {
    return users;
}
