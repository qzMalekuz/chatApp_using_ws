import "dotenv/config";

export const PORT = Number(process.env.PORT) || 3000;
export const JWT_SECRET = process.env.JWT_SECRET || "default-secret";
export const AUTH_ENABLED = process.env.AUTH_ENABLED === "true";
export const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 10000;
export const RATE_LIMIT_MAX_MESSAGES = Number(process.env.RATE_LIMIT_MAX_MESSAGES) || 10;
export const MAX_MESSAGE_LENGTH = Number(process.env.MAX_MESSAGE_LENGTH) || 500;
export const MAX_USERNAME_LENGTH = Number(process.env.MAX_USERNAME_LENGTH) || 20;
export const HEARTBEAT_INTERVAL_MS = Number(process.env.HEARTBEAT_INTERVAL_MS) || 30000;
export const MAX_RAW_MESSAGE_BYTES = Number(process.env.MAX_RAW_MESSAGE_BYTES) || 2_100_000;
export const MAX_STATUS_LENGTH = Number(process.env.MAX_STATUS_LENGTH) || 100;
export const MAX_ROOM_NAME_LENGTH = Number(process.env.MAX_ROOM_NAME_LENGTH) || 32;
export const WS_MAX_CONNECTIONS_PER_IP = Number(process.env.WS_MAX_CONNECTIONS_PER_IP) || 25;
export const WS_MAX_CONNECTIONS_PER_USER = Number(process.env.WS_MAX_CONNECTIONS_PER_USER) || 3;
export const WS_MAX_PAYLOAD_BYTES = Number(process.env.WS_MAX_PAYLOAD_BYTES) || 2_000_000;
export const WS_ALLOWED_ORIGINS = (process.env.WS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

if (AUTH_ENABLED && JWT_SECRET === "default-secret") {
    console.warn("[SECURITY] AUTH_ENABLED=true but JWT_SECRET is default. Set a strong JWT_SECRET in .env");
}
