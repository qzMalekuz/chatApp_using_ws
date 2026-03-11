import { Message } from "../types";

export function isValidEnvelope(value: unknown): value is Message {
    if (!value || typeof value !== "object") return false;

    const candidate = value as Record<string, unknown>;
    if (typeof candidate.type !== "string" || candidate.type.length > 40) return false;
    if (!candidate.payload || typeof candidate.payload !== "object" || Array.isArray(candidate.payload)) return false;

    return true;
}

export function asSafeInteger(value: unknown): number | null {
    if (typeof value !== "number" || !Number.isInteger(value)) return null;
    if (!Number.isSafeInteger(value) || value < 0) return null;
    return value;
}
