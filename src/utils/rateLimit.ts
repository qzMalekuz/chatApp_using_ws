import { User } from "../types";
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_MESSAGES } from "../config";

export function isRateLimited(user: User): boolean {
    const now = Date.now();

    // Remove timestamps outside the current window
    user.lastMessageTimestamps = user.lastMessageTimestamps.filter(
        (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
    );

    if (user.lastMessageTimestamps.length >= RATE_LIMIT_MAX_MESSAGES) {
        return true;
    }

    user.lastMessageTimestamps.push(now);
    return false;
}
