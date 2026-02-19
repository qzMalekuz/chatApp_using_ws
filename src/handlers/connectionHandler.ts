import { WebSocket } from "ws";
import { addUser, removeUser } from "../services/userService";
import { broadcast } from "../services/chatService";
import { handleMessage } from "./messageHandler";

/**
 * Handle a new WebSocket connection.
 */
export function handleConnection(ws: WebSocket): void {
    console.log("Client Connected");

    const user = addUser(ws);

    broadcast({
        type: "USER_JOINED",
        payload: { id: user.id, username: user.username },
    });

    ws.on("message", (data: Buffer) => {
        handleMessage(ws, data.toString());
    });

    ws.on("close", () => {
        handleClose(ws);
    });
}

/**
 * Handle a WebSocket disconnection.
 */
function handleClose(ws: WebSocket): void {
    const user = removeUser(ws);

    if (!user) return;

    broadcast({
        type: "USER_LEFT",
        payload: { id: user.id, username: user.username },
    });
}
