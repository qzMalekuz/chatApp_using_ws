const send = require("send");
const {WebSocketServer} = require("ws");

const wss = new WebSocketServer({port: 3000});

let users = [];
let userId = 0;
let rooms = {};

wss.on('connection', (ws) =>{
    console.log("Client Connected");

    userId++
    const user = {
        id: userId,
        username: `Guest_${userId}`,
        room: null,
        ws
    };

    users.push(user);

    broadcast({
        type: "USER_JOINED",
        payload: { id: user.id, username: user.username }
    });

    ws.on("message", (message) => {
        handleMessage(ws, message.toString());
    });

    ws.on("close", () => {
        handleClose(ws);
    });
});

function handleMessage(ws, message){
    let msg;

    try{
        msg = JSON.parse(message);

    } catch {
        return sendError(ws, "Invalid JSON");
    }

    const { type, payload } = msg;

    const user = users.find((u) => u.ws === ws);

    if(!user) return sendError(ws, "User not found");

    if(!type || !payload) return sendError(ws, "Missing type or payload");

    if(type === "CHAT") {
        
        if(!payload.text) return sendError(ws, "Missing text");

        broadcast({
            type: "CHAT",
            payload: {
                id: user.id,
                username: user.username,
                text: payload.text
            }
        });

    } else if (type === "SET_USERNAME") {

        if(!payload.username) return sendError(ws, "Missing username");

        user.username = payload.username;

        broadcast({
            type: "USERNAME_CHANGED",
            payload: {
                id: user.id,
                username: user.username
            }
        });

    } else if (type === "PRIVATE_CHAT") {
        
        if(!payload.to || !payload.text) {
            return sendError(ws, "Missing 'to' or 'text");
        }

        sendPrivateMessage(user, payload.to, payload.text);

    } else if (type === "ROOM_JOIN") {

        if(!payload.room) {
            return sendError(ws, "Room name required");
            joinRoom(user, payload.room);
        }

    } else if (type === "ROOM_LEAVE") {

        leaveRoom(user);

    } else if (type === "ROOM_CHAT") {

        if(!payload.text) {
            return sendError(ws, "Message required");
        }
        if(!user.room) {
            return sendError(ws, "Join a room first");
        }

        roomBroadcast(user.room, {
            type: "ROOM_CHAT",
            payload: {
                id: user.id,
                username: user.username,
                text: payload.text
            }
        });

    } else {

        sendError(ws, "Unknown message type: " + type);
    
    }
}

function handleClose(ws) {
    const user = users.find((u) => u.ws === ws);

    if(!user) return;

    users = users.filter((u) => u.ws !== ws);

    broadcast({
        type: "USER_LEFT",
        payload: {
            id: user.id,
            username: user.username
        }
    });
}

function joinRoom (user, roomName) {

    if(!rooms[roomName]) {
        rooms[roomName] = [];
    }

    rooms[roomName].push(user.id);
    user.room = roomName;

    roomBroadcast(roomName, {
        type: "ROOM_NOTIFICATION",
        payload: {message: `${user.username} joined ${roomName}`}
    });
}

function leaveRoom () {

    rooms[user.room] = rooms[user.room].filter(id => id !== user.id);

    roomBroadcast(user.room, {
        type: "ROOM_NOTIFICATION",
        payload: {message: `${user.username} joined ${roomName}`}
    });

    if(rooms[user.room.length === 0]) {
        delete rooms[user.room];
    }
    user.room = null;
}

function roomBroadcast () {

    if(!rooms[roomName]) {
        return;
    }

    const json = JSON.stringify(message);

    rooms[roomName].forEach(id => {
        const user = users.find(u => u.id === id);
        if(user) user.ws.send(json);
    })
}

function broadcast(message) {
    const json = JSON.stringify(message);

    users.forEach((u) => {
        u.ws.send(json);
    });
}

function sendPrivateMessage(fromUser, toUserId, text) {

    const reciever = users.find((u) => u.id === toUserId);
    if(!reciever) {
        return sendError(ws, "Receiver not found");
    }
    const privateMessage = {
        type: "PRIVATE_CHAT",
        payload: {
            from: fromUser.id,
            username: fromUser.username,
            text
        }
    }

    reciever.ws.send(JSON.stringify(privateMessage));
    fromUser.ws.send(JSON.stringify(privateMessage));
}

function sendError(ws, msg){
    ws.send(
        JSON.stringify({
            type: "ERROR",
            payload: {message: msg}
        })
    );
}

console.log(`Server is running`);