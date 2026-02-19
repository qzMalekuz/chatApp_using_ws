import { Message, User } from "../types";
import { sendError, sendJson } from "../utils/send";
import { getAllUsers, findUserById } from "./userService";

export function broadcast(message: Message): void {
    const serialised = JSON.stringify(message);

    getAllUsers().forEach((connectedUser) => {
        connectedUser.ws.send(serialised);
    });
}

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
            timestamp: new Date().toISOString(),
        },
    };

    sendJson(receiver.ws, directMessage);
    sendJson(sender.ws, directMessage);
}
