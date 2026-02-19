import { MAX_MESSAGE_LENGTH, MAX_USERNAME_LENGTH } from "../config";

const HTML_TAG_REGEX = /<[^>]*>/g;
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

export function sanitize(input: string): string {
    return input.replace(HTML_TAG_REGEX, "").trim();
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
