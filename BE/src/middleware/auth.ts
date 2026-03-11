import { IncomingMessage } from "http";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { validateUsername } from "../utils/validate";

export interface AuthPayload {
    username: string;
    [key: string]: unknown;
}

export function authenticateConnection(request: IncomingMessage): AuthPayload | null {
    try {
        const url = new URL(request.url || "", `http://${request.headers.host}`);
        const token = url.searchParams.get("token");

        if (!token) return null;

        const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
        const username = validateUsername(String(decoded.username || ""));
        if (!username) return null;
        return { ...decoded, username };
    } catch {
        return null;
    }
}
