import { WebSocketServer } from "ws";
import { PORT } from "./config";
import { handleConnection } from "./handlers/connectionHandler";

// ─── Bootstrap ──────────────────────────────────────────────

const server = new WebSocketServer({ port: PORT });

server.on("connection", handleConnection);

console.log(`Server is running on ws://localhost:${PORT}`);
