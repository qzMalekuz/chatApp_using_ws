import { MAX_MESSAGE_LENGTH, MAX_ROOM_NAME_LENGTH, MAX_STATUS_LENGTH, MAX_USERNAME_LENGTH } from "../config";

const HTML_TAG_REGEX = /<[^>]*>/g;
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
const ROOM_REGEX = /^[a-zA-Z0-9_-]+$/;
const CONTROL_CHARS_REGEX = /[\u0000-\u001f\u007f-\u009f]/g;

export function sanitize(input: string): string {
    return input
        .replace(CONTROL_CHARS_REGEX, "")
        .replace(HTML_TAG_REGEX, "")
        .trim();
}

export function validateText(text: string): string | null {
    const cleaned = sanitize(text);

    if (cleaned.length === 0) return null;
    if (cleaned.length > MAX_MESSAGE_LENGTH) return null;

    return cleaned;
}

export function validateUsername(username: string): string | null {
    const cleaned = sanitize(username);

    if (cleaned.length === 0) return null;
    if (cleaned.length > MAX_USERNAME_LENGTH) return null;
    if (!USERNAME_REGEX.test(cleaned)) return null;

    return cleaned;
}

export function validateRoomName(roomName: string): string | null {
    const cleaned = sanitize(roomName);

    if (cleaned.length === 0) return null;
    if (cleaned.length > MAX_ROOM_NAME_LENGTH) return null;
    if (!ROOM_REGEX.test(cleaned)) return null;

    return cleaned.toLowerCase();
}

export function validateStatus(status: string): string {
    const cleaned = sanitize(status);
    return cleaned.substring(0, MAX_STATUS_LENGTH);
}

export function validateAvatarUrl(url: unknown): string | null | undefined {
    if (url === undefined) return undefined;
    if (url === null) return null;
    if (typeof url !== "string") return undefined;
    const trimmed = url.trim();
    if (!trimmed) return null;
    if (trimmed.length > 2_048) return undefined;

    try {
        const parsed = new URL(trimmed);
        if (!["http:", "https:", "data:"].includes(parsed.protocol)) return undefined;
        return trimmed;
    } catch {
        return undefined;
    }
}
