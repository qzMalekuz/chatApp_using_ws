import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { PORT, AUTH_ENABLED } from "./config";
import { handleConnection } from "./handlers/connectionHandler";
import { authenticateConnection } from "./middleware/auth";
import { startHeartbeat } from "./middleware/heartbeat";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ noServer: true });

app.get("/", (_req, res) => {
    res.send("WebSocket server is running");
});

server.on("upgrade", (request, socket, head) => {
    if (AUTH_ENABLED) {
        const authPayload = authenticateConnection(request);

        if (!authPayload) {
            socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
            socket.destroy();
            return;
        }

        wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
            wss.emit("connection", ws, authPayload.username);
        });
    } else {
        wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
            wss.emit("connection", ws);
        });
    }
});

wss.on("connection", (ws: WebSocket, username?: string) => {
    handleConnection(ws, username);
});

startHeartbeat(wss);

server.listen(PORT, () => {
    console.log(`Server is running on ws://localhost:${PORT}`);
    console.log(`Auth: ${AUTH_ENABLED ? "ENABLED" : "DISABLED"}`);
});



