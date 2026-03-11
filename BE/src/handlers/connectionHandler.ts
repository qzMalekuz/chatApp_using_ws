import { WebSocket } from "ws";
import { addUser, removeUser } from "../services/userService";
import { broadcast } from "../services/chatService";
import { handleMessage, leaveAllRooms } from "./messageHandler";


export function handleConnection(ws: WebSocket, username?: string, ip?: string): void {
    console.log("Client Connected");

    const newUser = addUser(ws, username, ip);

    broadcast({
        type: "USER_JOINED",
        payload: {
            id: newUser.id,
            username: newUser.username,
            timestamp: new Date().toISOString(),
        },
    });

    // Mark client as alive on pong response (for heartbeat)
    ws.on("pong", () => {
        newUser.isAlive = true;
    });

    ws.on("message", (data: Buffer, isBinary: boolean) => {
        if (isBinary) {
            return;
        }
        try {
            handleMessage(ws, data.toString());
        } catch (error) {
            console.error("Unexpected error in handleMessage:", error);
        }
    });

    ws.on("close", () => {
        handleDisconnection(ws);
    });
}

function handleDisconnection(ws: WebSocket): void {
    const departedUser = removeUser(ws);

    if (!departedUser) return;
    leaveAllRooms(departedUser);

    broadcast({
        type: "USER_LEFT",
        payload: {
            id: departedUser.id,
            username: departedUser.username,
            timestamp: new Date().toISOString(),
        },
    });
}
