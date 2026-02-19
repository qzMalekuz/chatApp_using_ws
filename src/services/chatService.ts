import { Message, User } from "../types";
import { sendError, sendJson } from "../utils/send";
import { getAllUsers, findUserById } from "./userService";

/**
 * Broadcast a message to every connected user.
 */
export function broadcast(message: Message): void {
    const json = JSON.stringify(message);
    getAllUsers().forEach((u) => u.ws.send(json));
}

/**
 * Send a private message from one user to another (both parties receive it).
 */
export function sendPrivateMessage(
    fromUser: User,
    toUserId: number,
    text: string
): void {
    const receiver = findUserById(toUserId);

    if (!receiver) {
        return sendError(fromUser.ws, "Receiver not found");
    }

    const privateMessage: Message = {
        type: "PRIVATE_CHAT",
        payload: {
            from: fromUser.id,
            username: fromUser.username,
            text,
        },
    };

    sendJson(receiver.ws, privateMessage);
    sendJson(fromUser.ws, privateMessage);
}
