import { WebSocketServer, WebSocket } from "ws";

interface User {
  id: number;
  username: string;
  room: string | null;
  ws: WebSocket;
}

interface Message {
  type: string;
  payload: Record<string, unknown>;
}

interface ChatPayload {
  text?: string;
}

interface SetUsernamePayload {
  username?: string;
}

interface PrivateChatPayload {
  to?: number;
  text?: string;
}

interface RoomJoinPayload {
  room?: string;
}

const wss = new WebSocketServer({ port: 3000 });

let users: User[] = [];
let userId: number = 0;
let rooms: Record<string, number[]> = {};

wss.on("connection", (ws: WebSocket) => {
  console.log("Client Connected");

  userId++;
  const user: User = {
    id: userId,
    username: `Guest_${userId}`,
    room: null,
    ws,
  };

  users.push(user);

  broadcast({
    type: "USER_JOINED",
    payload: { id: user.id, username: user.username },
  });

  ws.on("message", (message: Buffer) => {
    handleMessage(ws, message.toString());
  });

  ws.on("close", () => {
    handleClose(ws);
  });
});

function handleMessage(ws: WebSocket, message: string): void {
  let msg: Message;

  try {
    msg = JSON.parse(message);
  } catch {
    return sendError(ws, "Invalid JSON");
  }

  const { type, payload } = msg;

  const user = users.find((u) => u.ws === ws);

  if (!user) return sendError(ws, "User not found");

  if (!type || !payload) return sendError(ws, "Missing type or payload");

  if (type === "CHAT") {
    const chatPayload = payload as ChatPayload;
    if (!chatPayload.text) return sendError(ws, "Missing text");

    broadcast({
      type: "CHAT",
      payload: {
        id: user.id,
        username: user.username,
        text: chatPayload.text,
      },
    });
  } else if (type === "SET_USERNAME") {
    const usernamePayload = payload as SetUsernamePayload;
    if (!usernamePayload.username) return sendError(ws, "Missing username");

    user.username = usernamePayload.username;

    broadcast({
      type: "USERNAME_CHANGED",
      payload: {
        id: user.id,
        username: user.username,
      },
    });
  } else if (type === "PRIVATE_CHAT") {
    const privatePayload = payload as PrivateChatPayload;
    if (!privatePayload.to || !privatePayload.text) {
      return sendError(ws, "Missing 'to' or 'text'");
    }

    sendPrivateMessage(user, privatePayload.to, privatePayload.text);
  } else if (type === "ROOM_JOIN") {
    const roomPayload = payload as RoomJoinPayload;
    if (!roomPayload.room) {
      return sendError(ws, "Room name required");
    }
    joinRoom(user, roomPayload.room);
  } else if (type === "ROOM_LEAVE") {
    leaveRoom(user);
  } else if (type === "ROOM_CHAT") {
    const chatPayload = payload as ChatPayload;
    if (!chatPayload.text) {
      return sendError(ws, "Message required");
    }
    if (!user.room) {
      return sendError(ws, "Join a room first");
    }

    roomBroadcast(user.room, {
      type: "ROOM_CHAT",
      payload: {
        id: user.id,
        username: user.username,
        text: chatPayload.text,
      },
    });
  } else {
    sendError(ws, "Unknown message type: " + type);
  }
}

function handleClose(ws: WebSocket): void {
  const user = users.find((u) => u.ws === ws);

  if (!user) return;

  users = users.filter((u) => u.ws !== ws);

  broadcast({
    type: "USER_LEFT",
    payload: {
      id: user.id,
      username: user.username,
    },
  });
}

function joinRoom(user: User, roomName: string): void {
  if (!rooms[roomName]) {
    rooms[roomName] = [];
  }

  rooms[roomName].push(user.id);
  user.room = roomName;

  roomBroadcast(roomName, {
    type: "ROOM_NOTIFICATION",
    payload: { message: `${user.username} joined ${roomName}` },
  });
}

function leaveRoom(user: User): void {
  if (!user.room) return;

  rooms[user.room] = rooms[user.room].filter((id) => id !== user.id);

  roomBroadcast(user.room, {
    type: "ROOM_NOTIFICATION",
    payload: { message: `${user.username} left ${user.room}` },
  });

  if (rooms[user.room].length === 0) {
    delete rooms[user.room];
  }
  user.room = null;
}

function roomBroadcast(roomName: string, message: Message): void {
  if (!rooms[roomName]) {
    return;
  }

  const json = JSON.stringify(message);

  rooms[roomName].forEach((id) => {
    const user = users.find((u) => u.id === id);
    if (user) user.ws.send(json);
  });
}

function broadcast(message: Message): void {
  const json = JSON.stringify(message);

  users.forEach((u) => {
    u.ws.send(json);
  });
}

function sendPrivateMessage(
  fromUser: User,
  toUserId: number,
  text: string
): void {
  const receiver = users.find((u) => u.id === toUserId);
  if (!receiver) {
    return sendError(fromUser.ws, "Receiver not found");
  }
  const privateMessage: Message = {
    type: "PRIVATE_CHAT",
    payload: {
      from: fromUser.id,
      username: fromUser.username,
      text,
    },
  };

  receiver.ws.send(JSON.stringify(privateMessage));
  fromUser.ws.send(JSON.stringify(privateMessage));
}

function sendError(ws: WebSocket, msg: string): void {
  ws.send(
    JSON.stringify({
      type: "ERROR",
      payload: { message: msg },
    })
  );
}

console.log("Server is running on ws://localhost:3000");
