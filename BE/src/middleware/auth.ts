import { IncomingMessage } from "http";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

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
        return decoded;
    } catch {
        return null;
    }
}
