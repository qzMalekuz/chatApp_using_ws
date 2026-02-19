import { WebSocket } from "ws";
import { User } from "../types";

let connectedUsers: User[] = [];
let nextUserId = 0;

export function addUser(ws: WebSocket, username?: string): User {
    nextUserId++;

    const newUser: User = {
        id: nextUserId,
        username: username || `Guest_${nextUserId}`,
        room: null,
        ws,
        isAlive: true,
        lastMessageTimestamps: [],
    };

    connectedUsers.push(newUser);
    return newUser;
}

export function removeUser(ws: WebSocket): User | undefined {
    const disconnectedUser = connectedUsers.find((user) => user.ws === ws);

    if (disconnectedUser) {
        connectedUsers = connectedUsers.filter((user) => user.ws !== ws);
    }

    return disconnectedUser;
}

export function findUserByWs(ws: WebSocket): User | undefined {
    return connectedUsers.find((user) => user.ws === ws);
}

export function findUserById(id: number): User | undefined {
    return connectedUsers.find((user) => user.id === id);
}

export function getAllUsers(): ReadonlyArray<User> {
    return connectedUsers;
}

export function getPublicUserList(): { id: number; username: string }[] {
    return connectedUsers.map((user) => ({
        id: user.id,
        username: user.username,
    }));
}
