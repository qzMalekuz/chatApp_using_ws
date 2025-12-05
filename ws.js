const {WebSocketServer} = require("ws");

const wss = new WebSocketServer({port: 3000});

let users = [];
let userId = 0;

wss.on('connection', (ws) =>{
    console.log("Client Connected");

    userId++
    const user = {
        id: userId,
        username: `Guest_${userId}`,
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