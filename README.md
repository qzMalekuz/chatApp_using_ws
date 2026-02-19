<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=socketdotio&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
</p>

<h1 align="center">💬 chatApp</h1>

<p align="center">
  A real-time chat server built with <strong>WebSockets</strong>, <strong>TypeScript</strong>, and <strong>Node.js</strong>.<br/>
  Supports rooms, private messaging, typing indicators, JWT auth, rate limiting, and more.
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#%EF%B8%8F-configuration">Configuration</a> •
  <a href="#-message-types">Message Types</a> •
  <a href="#-authentication">Authentication</a> •
  <a href="#-project-structure">Project Structure</a>
</p>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 💬 **Global Chat** | Broadcast messages to all connected users |
| 🔒 **Private Messaging** | Send direct messages between two users |
| 🏠 **Chat Rooms** | Create, join, and leave rooms dynamically |
| ✍️ **Typing Indicators** | Real-time "user is typing…" events |
| 👥 **User & Room Lists** | Query who's online or in a specific room |
| 🔐 **JWT Authentication** | Optional token-based auth on connection |
| 🛡️ **Rate Limiting** | Sliding-window throttle to prevent spam |
| 🧹 **Input Sanitization** | Strips HTML tags, enforces length limits |
| 💓 **Heartbeat** | Ping/pong to detect and clean up dead connections |
| ⏱️ **Timestamps** | ISO timestamps on every outgoing message |
| 🧱 **Modular Architecture** | Clean separation: types, config, utils, services, handlers, middleware |

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/qzMalekuz/chatApp_using_ws.git
cd chatApp_using_ws

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
```

### Run

```bash
# Development (with hot TypeScript compilation)
npm run dev

# Production
npm run build
npm start
```

The server will start on `ws://localhost:3000` by default.

### Connect

Use any WebSocket client — [Postman](https://www.postman.com/), [wscat](https://github.com/websockets/wscat), or a browser:

```bash
# Using wscat
npx wscat -c ws://localhost:3000

# Send a chat message
> {"type":"CHAT","payload":{"text":"Hello, world!"}}
```

---

## ⚙️ Configuration

All settings are managed via environment variables in `.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `JWT_SECRET` | `default-secret` | Secret key for signing/verifying JWTs |
| `AUTH_ENABLED` | `false` | Enable JWT authentication (`true` / `false`) |
| `RATE_LIMIT_WINDOW_MS` | `10000` | Rate limit window in milliseconds |
| `RATE_LIMIT_MAX_MESSAGES` | `10` | Max messages per window |
| `MAX_MESSAGE_LENGTH` | `500` | Maximum characters per message |
| `MAX_USERNAME_LENGTH` | `20` | Maximum characters for usernames |
| `HEARTBEAT_INTERVAL_MS` | `30000` | Ping interval for dead connection detection |

---

## 📨 Message Types

All messages follow the format: `{ "type": "...", "payload": { ... } }`

### Send (Client → Server)

| Type | Payload | Description |
|------|---------|-------------|
| `CHAT` | `{ "text": "Hello!" }` | Send a global message |
| `SET_USERNAME` | `{ "username": "Alice" }` | Change your display name |
| `PRIVATE_CHAT` | `{ "to": 2, "text": "Hi" }` | Send a direct message to user ID 2 |
| `ROOM_JOIN` | `{ "room": "lobby" }` | Join a chat room |
| `ROOM_LEAVE` | `{}` | Leave your current room |
| `ROOM_CHAT` | `{ "text": "Hey room!" }` | Message your current room |
| `GET_USERS` | `{}` | Request the online user list |
| `ROOM_MEMBERS` | `{ "room": "lobby" }` | Request members of a room |
| `TYPING_START` | `{ "room": "lobby" }` | Notify room you started typing |
| `TYPING_STOP` | `{ "room": "lobby" }` | Notify room you stopped typing |

### Receive (Server → Client)

| Type | Payload | When |
|------|---------|------|
| `CHAT` | `{ id, username, text, timestamp }` | Someone sent a global message |
| `USER_JOINED` | `{ id, username, timestamp }` | A new user connected |
| `USER_LEFT` | `{ id, username, timestamp }` | A user disconnected |
| `USERNAME_CHANGED` | `{ id, username, timestamp }` | A user changed their name |
| `PRIVATE_CHAT` | `{ from, username, text, timestamp }` | You received/sent a DM |
| `ROOM_NOTIFICATION` | `{ message, timestamp }` | Someone joined/left a room |
| `ROOM_CHAT` | `{ id, username, text, timestamp }` | Message in your room |
| `USER_LIST` | `{ users: [...], timestamp }` | Response to `GET_USERS` |
| `ROOM_MEMBERS` | `{ room, members: [...], timestamp }` | Response to `ROOM_MEMBERS` |
| `TYPING_START` | `{ id, username, room }` | Someone is typing |
| `TYPING_STOP` | `{ id, username, room }` | Someone stopped typing |
| `ERROR` | `{ message }` | Something went wrong |

---

## 🔐 Authentication

JWT authentication is **opt-in**. Enable it in `.env`:

```env
AUTH_ENABLED=true
JWT_SECRET=my-super-secret-key
```

### Generate a Token

```bash
npm run generate-token -- YourUsername
```

### Connect with Token

```bash
npx wscat -c "ws://localhost:3000?token=<YOUR_TOKEN>"
```

Unauthenticated connections receive `401 Unauthorized` when auth is enabled.

---

## 📁 Project Structure

```
chatApp/
├── .env.example                    ← Environment variable template
├── package.json
├── tsconfig.json
├── scripts/
│   └── generateToken.ts            ← CLI token generator
└── src/
    ├── server.ts                   ← Entry point
    ├── config/
    │   └── index.ts                ← Loads .env, exports config
    ├── types/
    │   └── index.ts                ← All TypeScript interfaces
    ├── utils/
    │   ├── send.ts                 ← sendJson / sendError
    │   ├── validate.ts             ← Sanitization & validation
    │   └── rateLimit.ts            ← Sliding-window rate limiter
    ├── middleware/
    │   ├── auth.ts                 ← JWT verification
    │   └── heartbeat.ts            ← Ping/pong health checks
    ├── services/
    │   ├── userService.ts          ← User management (in-memory)
    │   ├── chatService.ts          ← Broadcast & private messaging
    │   └── roomService.ts          ← Room management
    └── handlers/
        ├── connectionHandler.ts    ← Connection lifecycle
        └── messageHandler.ts       ← Message routing & dispatch
```

---

## 📜 Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Dev** | `npm run dev` | Start with `ts-node` (auto-compiles TS) |
| **Build** | `npm run build` | Compile TypeScript to `dist/` |
| **Start** | `npm start` | Run the compiled JS build |
| **Token** | `npm run generate-token -- <username>` | Generate a JWT for testing |

---

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **WebSocket**: [ws](https://github.com/websockets/ws)
- **Auth**: [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- **Config**: [dotenv](https://github.com/motdotla/dotenv)

---

<p align="center">
  Made with ❤️ using WebSockets
</p>
