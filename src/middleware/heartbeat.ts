import { WebSocketServer } from "ws";
import { HEARTBEAT_INTERVAL_MS } from "../config";
import { User } from "../types";
import { findUserByWs, removeUser } from "../services/userService";
import { broadcast } from "../services/chatService";

export function startHeartbeat(wss: WebSocketServer): void {
    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            const user = findUserByWs(ws) as User | undefined;

            if (user && !user.isAlive) {
                // User didn't respond to last ping — terminate
                removeUser(ws);
                broadcast({
                    type: "USER_LEFT",
                    payload: { id: user.id, username: user.username, timestamp: new Date().toISOString() },
                });
                return ws.terminate();
            }

            if (user) {
                user.isAlive = false;
            }

            ws.ping();
        });
    }, HEARTBEAT_INTERVAL_MS);

    wss.on("close", () => {
        clearInterval(interval);
    });
}
