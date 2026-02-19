<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=socketdotio&logoColor=white" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
</p>

<h1 align="center">💬 chatApp</h1>

<p align="center">
  A full-stack real-time chat application built with <strong>WebSockets</strong>, <strong>React</strong>, and <strong>Node.js</strong>.<br/>
  Supports rooms, private messaging, typing indicators, JWT auth, rate limiting, and more.
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-project-structure">Project Structure</a> •
  <a href="#%EF%B8%8F-configuration">Configuration</a> •
  <a href="#-message-types">Message Types</a> •
  <a href="#-authentication">Authentication</a>
</p>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 💬 **Global Chat** | Broadcast messages to all connected users |
| 🔒 **Private Messaging** | Direct messages between two users |
| 🏠 **Chat Rooms** | Create, join, and leave rooms dynamically |
| ✍️ **Typing Indicators** | Real-time "user is typing…" with pulsing animation |
| 👥 **User & Room Lists** | Query who's online or in a room |
| 🔐 **JWT Authentication** | Optional token-based auth on connection |
| 🛡️ **Rate Limiting** | Sliding-window throttle to prevent spam |
| 🧹 **Input Sanitization** | Strips HTML tags, enforces length limits |
| 💓 **Heartbeat** | Ping/pong to detect and clean up dead connections |
| ⏱️ **Timestamps** | ISO timestamps on every message |
| 🎨 **Dark Theme UI** | Sleek React frontend with smooth animations |
| 📱 **Responsive** | Desktop three-column + mobile bottom tab layout |

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

# Install backend dependencies
cd BE && npm install

# Install frontend dependencies
cd ../FE && npm install
```

### Run

```bash
# Terminal 1 — Backend
cd BE
cp .env.example .env    # (first time only)
npm run dev

# Terminal 2 — Frontend
cd FE
npm run dev
```

| Service | URL |
|---------|-----|
| Backend (WebSocket) | `ws://localhost:3000` |
| Frontend (React) | `http://localhost:5173` |

Open **http://localhost:5173** in your browser to start chatting.

---

## 📁 Project Structure

```
chatApp/
├── README.md
├── .gitignore
│
├── BE/                              ← Backend (Node.js + Express + ws)
│   ├── .env                         ← Environment variables
│   ├── package.json
│   ├── tsconfig.json
│   ├── scripts/
│   │   └── generateToken.ts         ← JWT token generator CLI
│   └── src/
│       ├── server.ts                ← Express + WebSocket entry point
│       ├── config/index.ts          ← Loads .env, exports config
│       ├── types/index.ts           ← Shared TypeScript interfaces
│       ├── utils/
│       │   ├── send.ts              ← sendJson / sendError helpers
│       │   ├── validate.ts          ← Sanitization & validation
│       │   └── rateLimit.ts         ← Sliding-window rate limiter
│       ├── middleware/
│       │   ├── auth.ts              ← JWT verification
│       │   └── heartbeat.ts         ← Ping/pong health checks
│       ├── services/
│       │   ├── userService.ts       ← User CRUD (in-memory)
│       │   ├── chatService.ts       ← Broadcast & private messaging
│       │   └── roomService.ts       ← Room management
│       └── handlers/
│           ├── connectionHandler.ts ← Connection lifecycle
│           └── messageHandler.ts    ← Message routing & dispatch
│
└── FE/                              ← Frontend (React + Tailwind + Framer Motion)
    ├── package.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── main.tsx                 ← Entry point
        ├── App.tsx                  ← Layout + routing
        ├── index.css                ← Tailwind + dark theme
        ├── types.ts                 ← Frontend types
        ├── context/
        │   └── ChatContext.tsx       ← WebSocket state management
        ├── components/
        │   ├── UsernameModal.tsx     ← Username entry on first load
        │   ├── UsersSidebar.tsx      ← Online users list
        │   ├── ChatArea.tsx          ← Messages + input + typing
        │   ├── RoomPanel.tsx         ← Room join/leave/members
        │   └── Toast.tsx            ← Error notifications
        └── utils/
            └── timeAgo.ts           ← Relative timestamp formatter
```

---

## ⚙️ Configuration

All backend settings are in `BE/.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | WebSocket server port |
| `JWT_SECRET` | `default-secret` | JWT signing key |
| `AUTH_ENABLED` | `false` | Require JWT to connect |
| `RATE_LIMIT_WINDOW_MS` | `10000` | Rate limit window (ms) |
| `RATE_LIMIT_MAX_MESSAGES` | `10` | Max messages per window |
| `MAX_MESSAGE_LENGTH` | `500` | Max characters per message |
| `MAX_USERNAME_LENGTH` | `20` | Max characters for usernames |
| `HEARTBEAT_INTERVAL_MS` | `30000` | Ping interval (ms) |

---

## 📨 Message Types

All messages follow: `{ "type": "...", "payload": { ... } }`

### Client → Server

| Type | Payload | Description |
|------|---------|-------------|
| `CHAT` | `{ text }` | Global message |
| `SET_USERNAME` | `{ username }` | Change display name |
| `PRIVATE_CHAT` | `{ to, text }` | Direct message |
| `ROOM_JOIN` | `{ room }` | Join a room |
| `ROOM_LEAVE` | `{}` | Leave current room |
| `ROOM_CHAT` | `{ text }` | Message your room |
| `GET_USERS` | `{}` | Request online users |
| `ROOM_MEMBERS` | `{ room }` | Request room members |
| `TYPING_START` | `{ room? }` | Started typing |
| `TYPING_STOP` | `{ room? }` | Stopped typing |

### Server → Client

| Type | When |
|------|------|
| `CHAT` | Global message received |
| `USER_JOINED` / `USER_LEFT` | User connected/disconnected |
| `USERNAME_CHANGED` | Someone changed their name |
| `PRIVATE_CHAT` | DM received/sent |
| `ROOM_NOTIFICATION` | Room join/leave event |
| `ROOM_CHAT` | Room message |
| `USER_LIST` | Response to `GET_USERS` |
| `ROOM_MEMBERS` | Response to `ROOM_MEMBERS` |
| `TYPING_START` / `TYPING_STOP` | Typing indicator |
| `ERROR` | Validation/rate limit error |

---

## 🔐 Authentication

JWT auth is **opt-in**. Enable it in `BE/.env`:

```env
AUTH_ENABLED=true
JWT_SECRET=my-super-secret-key
```

```bash
# Generate a token
cd BE && npm run generate-token -- YourUsername

# Connect with token
wscat -c "ws://localhost:3000?token=<YOUR_TOKEN>"
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Backend** | Node.js, Express, ws, TypeScript, JWT, dotenv |
| **Frontend** | React, TypeScript, Tailwind CSS v4, Framer Motion, Vite |

---

## 📜 Scripts

### Backend (`BE/`)

| Script | Command | Description |
|--------|---------|-------------|
| Dev | `npm run dev` | Start with ts-node |
| Build | `npm run build` | Compile to `dist/` |
| Start | `npm start` | Run compiled build |
| Token | `npm run generate-token -- <name>` | Generate JWT |

### Frontend (`FE/`)

| Script | Command | Description |
|--------|---------|-------------|
| Dev | `npm run dev` | Vite dev server (port 5173) |
| Build | `npm run build` | Production build |
| Preview | `npm run preview` | Preview production build |

---

<p align="center">
  Made with ❤️ using WebSockets + React
</p>
