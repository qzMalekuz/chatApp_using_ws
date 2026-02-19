import { WebSocketServer } from "ws";
import { PORT } from "./config";
import { handleConnection } from "./handlers/connectionHandler";

const wss = new WebSocketServer({ port: PORT });

wss.on("connection", handleConnection);

console.log(`Server is running on ws://localhost:${PORT}`);
