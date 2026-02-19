import { WebSocket } from "ws";
import { addUser, removeUser } from "../services/userService";
import { broadcast } from "../services/chatService";
import { handleMessage } from "./messageHandler";


export function handleConnection(ws: WebSocket): void {
    console.log("Client Connected");

    const newUser = addUser(ws);

    broadcast({
        type: "USER_JOINED",
        payload: { id: newUser.id, username: newUser.username },
    });

    ws.on("message", (data: Buffer) => {
        handleMessage(ws, data.toString());
    });

    ws.on("close", () => {
        handleDisconnection(ws);
    });
}

function handleDisconnection(ws: WebSocket): void {
    const departedUser = removeUser(ws);

    if (!departedUser) return;

    broadcast({
        type: "USER_LEFT",
        payload: { id: departedUser.id, username: departedUser.username },
    });
}
