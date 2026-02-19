import { Message, User } from "../types";
import { sendError, sendJson } from "../utils/send";
import { getAllUsers, findUserById } from "./userService";

/**
 * Broadcast a message to **every** connected user.
 *
 * @param message - The message envelope to send.
 */
export function broadcast(message: Message): void {
    const serialised = JSON.stringify(message);

    getAllUsers().forEach((connectedUser) => {
        connectedUser.ws.send(serialised);
    });
}

/**
 * Send a direct message between two users.
 * Both the sender and the receiver get a copy of the message.
 *
 * @param sender      - The user who is sending the message.
 * @param receiverId  - The ID of the intended recipient.
 * @param text        - The message body.
 */
export function sendPrivateMessage(
    sender: User,
    receiverId: number,
    text: string
): void {
    const receiver = findUserById(receiverId);

    if (!receiver) {
        return sendError(sender.ws, "Receiver not found");
    }

    const directMessage: Message = {
        type: "PRIVATE_CHAT",
        payload: {
            from: sender.id,
            username: sender.username,
            text,
        },
    };

    // Both parties receive the message so each side can display it
    sendJson(receiver.ws, directMessage);
    sendJson(sender.ws, directMessage);
}
