import { WebSocket } from "ws";
import { User } from "../types";

let connectedUsers: User[] = [];
let nextUserId = 0;

export function addUser(ws: WebSocket, username?: string, ip = "unknown_ip"): User {
    nextUserId++;

    const newUser: User = {
        id: nextUserId,
        username: username || `Guest_${nextUserId}`,
        status: "",
        avatarUrl: null,
        room: null,
        rooms: [],
        ws,
        isAlive: true,
        lastMessageTimestamps: [],
        ip,
        recentMessageIds: [],
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

export function getPublicUserList(): { id: number; username: string; status: string; avatarUrl: string | null }[] {
    return connectedUsers.map((user) => ({
        id: user.id,
        username: user.username,
        status: user.status,
        avatarUrl: user.avatarUrl,
    }));
}

export function getActiveConnectionsByIp(ip: string): number {
    return connectedUsers.filter((user) => user.ip === ip).length;
}

export function getActiveConnectionsByUsername(username: string): number {
    return connectedUsers.filter((user) => user.username === username).length;
}
