import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import {
    PORT,
    AUTH_ENABLED,
    WS_ALLOWED_ORIGINS,
    WS_MAX_CONNECTIONS_PER_IP,
    WS_MAX_CONNECTIONS_PER_USER,
    WS_MAX_PAYLOAD_BYTES,
} from "./config";
import { handleConnection } from "./handlers/connectionHandler";
import { authenticateConnection } from "./middleware/auth";
import { startHeartbeat } from "./middleware/heartbeat";
import { httpRateLimiter, checkWsConnectionRateLimit } from "./middleware/rateLimiter";
import { getActiveConnectionsByIp, getActiveConnectionsByUsername } from "./services/userService";

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", true);

// Apply HTTP rate limiting to all Express routes
app.use(httpRateLimiter);
app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Permissions-Policy", "geolocation=(), microphone=(self), camera=(self)");
    res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
    res.setHeader("Content-Security-Policy", "default-src 'self'; frame-ancestors 'none'; base-uri 'self'");
    next();
});

const server = createServer(app);
const wss = new WebSocketServer({
    noServer: true,
    maxPayload: WS_MAX_PAYLOAD_BYTES,
});

app.get("/", (_req, res) => {
    res.send("WebSocket server is running");
});

server.on("upgrade", (request, socket, head) => {
    const forwarded = request.headers["x-forwarded-for"];
    const proxyIp = typeof forwarded === "string" ? forwarded.split(",")[0]?.trim() : "";
    const ip = proxyIp || request.socket.remoteAddress || "unknown_ip";
    const origin = request.headers.origin;

    if (WS_ALLOWED_ORIGINS.length > 0) {
        if (!origin || !WS_ALLOWED_ORIGINS.includes(origin)) {
            socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
            socket.destroy();
            return;
        }
    }

    // Check connection rate limit based on IP
    if (checkWsConnectionRateLimit(ip)) {
        socket.write("HTTP/1.1 429 Too Many Requests\r\n\r\n");
        socket.destroy();
        return;
    }
    if (getActiveConnectionsByIp(ip) >= WS_MAX_CONNECTIONS_PER_IP) {
        socket.write("HTTP/1.1 429 Too Many Connections\r\n\r\n");
        socket.destroy();
        return;
    }

    if (AUTH_ENABLED) {
        const authPayload = authenticateConnection(request);

        if (!authPayload) {
            socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
            socket.destroy();
            return;
        }
        if (getActiveConnectionsByUsername(authPayload.username) >= WS_MAX_CONNECTIONS_PER_USER) {
            socket.write("HTTP/1.1 429 Too Many Sessions\r\n\r\n");
            socket.destroy();
            return;
        }

        wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
            wss.emit("connection", ws, authPayload.username, ip);
        });
    } else {
        wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
            wss.emit("connection", ws, undefined, ip);
        });
    }
});

wss.on("connection", (ws: WebSocket, username?: string, ip?: string) => {
    handleConnection(ws, username, ip);
});

startHeartbeat(wss);

server.listen(PORT, () => {
    console.log(`Server is running on ws://localhost:${PORT}`);
    console.log(`Auth: ${AUTH_ENABLED ? "ENABLED" : "DISABLED"}`);
});
