import { WebSocket } from "ws";
import { Message } from "../types";

/**
 * Serialise a Message object to JSON and send it to a single client.
 *
 * @param ws      - The recipient's WebSocket connection.
 * @param message - The message envelope to send.
 */
export function sendJson(ws: WebSocket, message: Message): void {
    ws.send(JSON.stringify(message));
}

/**
 * Send a standardised error payload to a single client.
 *
 * @param ws           - The recipient's WebSocket connection.
 * @param errorMessage - A human-readable error description.
 */
export function sendError(ws: WebSocket, errorMessage: string): void {
    sendJson(ws, {
        type: "ERROR",
        payload: { message: errorMessage },
    });
}
