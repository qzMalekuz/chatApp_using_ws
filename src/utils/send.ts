import { WebSocket } from "ws";
import { Message } from "../types";

/**
 * Send a JSON-serialised message to a single WebSocket client.
 */
export function sendJson(ws: WebSocket, message: Message): void {
    ws.send(JSON.stringify(message));
}

/**
 * Send an error payload to a single WebSocket client.
 */
export function sendError(ws: WebSocket, msg: string): void {
    sendJson(ws, {
        type: "ERROR",
        payload: { message: msg },
    });
}
