import { WebSocket } from "ws";
import { addUser, removeUser } from "../services/userService";
import { broadcast } from "../services/chatService";
import { handleMessage } from "./messageHandler";

/**
 * Called when a new WebSocket client connects.
 * Creates a user, announces their arrival, and wires up event listeners.
 *
 * @param ws - The newly connected WebSocket.
 */
export function handleConnection(ws: WebSocket): void {
    console.log("Client Connected");

    const newUser = addUser(ws);

    // Let everyone know a new user has joined
    broadcast({
        type: "USER_JOINED",
        payload: { id: newUser.id, username: newUser.username },
    });

    // Listen for incoming messages from this client
    ws.on("message", (data: Buffer) => {
        handleMessage(ws, data.toString());
    });

    // Clean up when this client disconnects
    ws.on("close", () => {
        handleDisconnection(ws);
    });
}

/**
 * Called when a WebSocket client disconnects.
 * Removes the user from the store and announces their departure.
 *
 * @param ws - The disconnected WebSocket.
 */
function handleDisconnection(ws: WebSocket): void {
    const departedUser = removeUser(ws);

    if (!departedUser) return;

    broadcast({
        type: "USER_LEFT",
        payload: { id: departedUser.id, username: departedUser.username },
    });
}
