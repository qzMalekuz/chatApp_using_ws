import { User } from "../types";
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_MESSAGES } from "../config";

const LIGHTWEIGHT_TYPES = new Set(["TYPING_START", "TYPING_STOP", "GET_USERS", "ROOM_MEMBERS"]);

export function isRateLimited(user: User, messageType: string): boolean {
    const now = Date.now();
    const maxMessages = LIGHTWEIGHT_TYPES.has(messageType) ? RATE_LIMIT_MAX_MESSAGES * 3 : RATE_LIMIT_MAX_MESSAGES;

    // Remove timestamps outside the current window
    user.lastMessageTimestamps = user.lastMessageTimestamps.filter(
        (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
    );

    if (user.lastMessageTimestamps.length >= maxMessages) {
        return true;
    }

    user.lastMessageTimestamps.push(now);
    return false;
}
