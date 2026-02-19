import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { PORT, AUTH_ENABLED } from "./config";
import { handleConnection } from "./handlers/connectionHandler";
import { authenticateConnection } from "./middleware/auth";
import { startHeartbeat } from "./middleware/heartbeat";

const httpServer = http.createServer((_req, res) => {
    res.writeHead(200);
    res.end("WebSocket server is running");
});

const wss = new WebSocketServer({ noServer: true });

httpServer.on("upgrade", (request, socket, head) => {
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

httpServer.listen(PORT, () => {
    console.log(`Server is running on ws://localhost:${PORT}`);
    console.log(`Auth: ${AUTH_ENABLED ? "ENABLED" : "DISABLED"}`);
});
