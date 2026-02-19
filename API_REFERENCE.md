# chatApp — Backend API Reference (for Frontend Integration)

## Base URL

```
WebSocket: ws://localhost:3000
HTTP:      http://localhost:3000
```

---

## Connection

This is a **WebSocket-based** backend. There are no REST API routes — all communication happens over a single persistent WebSocket connection.

### How to Connect

```js
// Without auth (default)
const ws = new WebSocket("ws://localhost:3000");

// With auth (when AUTH_ENABLED=true on server)
const ws = new WebSocket("ws://localhost:3000?token=<JWT_TOKEN>");
```

### Connection Events

- On successful connect → server sends a `USER_JOINED` message to all clients
- On disconnect → server sends a `USER_LEFT` message to all clients

---

## Auth System

- **Type**: JWT (JSON Web Token)
- **How it works**: Token is passed as a query parameter when connecting: `ws://localhost:3000?token=<JWT>`
- **Token payload**: `{ "username": "Alice" }` — the username from the token is used as the display name
- **When disabled** (default): Any client can connect without a token and gets assigned `Guest_N` as username
- **When enabled**: Connections without a valid token receive `401 Unauthorized` and are rejected
- **Token expiry**: 24 hours

---

## Message Format

### Sending (Client → Server)

Every message sent to the server must be a JSON string with this structure:

```json
{
  "type": "MESSAGE_TYPE",
  "payload": { ... }
}
```

### Receiving (Server → Client)

Every message from the server follows the same structure:

```json
{
  "type": "MESSAGE_TYPE",
  "payload": { ... }
}
```

Most server responses include a `timestamp` field (ISO 8601 string) in the payload.

---

## All Message Types

### 1. CHAT — Send a global message

**Send:**
```json
{ "type": "CHAT", "payload": { "text": "Hello everyone!" } }
```

**Receive (broadcast to ALL users):**
```json
{
  "type": "CHAT",
  "payload": {
    "id": 1,
    "username": "Alice",
    "text": "Hello everyone!",
    "timestamp": "2026-02-19T18:30:00.000Z"
  }
}
```

---

### 2. SET_USERNAME — Change display name

**Send:**
```json
{ "type": "SET_USERNAME", "payload": { "username": "Alice" } }
```

**Receive (broadcast to ALL users):**
```json
{
  "type": "USERNAME_CHANGED",
  "payload": {
    "id": 1,
    "username": "Alice",
    "timestamp": "2026-02-19T18:30:00.000Z"
  }
}
```

**Validation rules**: alphanumeric + underscore only, max 20 characters.

---

### 3. PRIVATE_CHAT — Send a direct message

**Send:**
```json
{ "type": "PRIVATE_CHAT", "payload": { "to": 2, "text": "Hey!" } }
```

**Receive (sent to BOTH sender and receiver):**
```json
{
  "type": "PRIVATE_CHAT",
  "payload": {
    "from": 1,
    "username": "Alice",
    "text": "Hey!",
    "timestamp": "2026-02-19T18:30:00.000Z"
  }
}
```

---

### 4. ROOM_JOIN — Join a chat room

**Send:**
```json
{ "type": "ROOM_JOIN", "payload": { "room": "lobby" } }
```

**Receive (broadcast to room members):**
```json
{
  "type": "ROOM_NOTIFICATION",
  "payload": {
    "message": "Alice joined lobby",
    "timestamp": "2026-02-19T18:30:00.000Z"
  }
}
```

Rooms are created automatically when the first user joins.

---

### 5. ROOM_LEAVE — Leave current room

**Send:**
```json
{ "type": "ROOM_LEAVE", "payload": {} }
```

**Receive (broadcast to room members):**
```json
{
  "type": "ROOM_NOTIFICATION",
  "payload": {
    "message": "Alice left lobby",
    "timestamp": "2026-02-19T18:30:00.000Z"
  }
}
```

Room is automatically deleted when the last member leaves.

---

### 6. ROOM_CHAT — Send a message to your room

**Send:**
```json
{ "type": "ROOM_CHAT", "payload": { "text": "Hey room!" } }
```

**Receive (broadcast to room members only):**
```json
{
  "type": "ROOM_CHAT",
  "payload": {
    "id": 1,
    "username": "Alice",
    "text": "Hey room!",
    "timestamp": "2026-02-19T18:30:00.000Z"
  }
}
```

**Error**: Returns error if user hasn't joined a room.

---

### 7. GET_USERS — Get online user list

**Send:**
```json
{ "type": "GET_USERS", "payload": {} }
```

**Receive (sent only to requester):**
```json
{
  "type": "USER_LIST",
  "payload": {
    "users": [
      { "id": 1, "username": "Alice" },
      { "id": 2, "username": "Bob" }
    ],
    "timestamp": "2026-02-19T18:30:00.000Z"
  }
}
```

---

### 8. ROOM_MEMBERS — Get members of a specific room

**Send:**
```json
{ "type": "ROOM_MEMBERS", "payload": { "room": "lobby" } }
```

**Receive (sent only to requester):**
```json
{
  "type": "ROOM_MEMBERS",
  "payload": {
    "room": "lobby",
    "members": [
      { "id": 1, "username": "Alice" },
      { "id": 3, "username": "Charlie" }
    ],
    "timestamp": "2026-02-19T18:30:00.000Z"
  }
}
```

---

### 9. TYPING_START — Notify room that you're typing

**Send:**
```json
{ "type": "TYPING_START", "payload": { "room": "lobby" } }
```

**Receive (broadcast to room members):**
```json
{
  "type": "TYPING_START",
  "payload": {
    "id": 1,
    "username": "Alice",
    "room": "lobby"
  }
}
```

If `room` is omitted in payload, uses the sender's current room.

---

### 10. TYPING_STOP — Notify room that you stopped typing

**Send:**
```json
{ "type": "TYPING_STOP", "payload": { "room": "lobby" } }
```

**Receive (broadcast to room members):**
```json
{
  "type": "TYPING_STOP",
  "payload": {
    "id": 1,
    "username": "Alice",
    "room": "lobby"
  }
}
```

---

## Server-Initiated Messages

These are sent by the server automatically (not in response to a client request):

### USER_JOINED — A new user connected
```json
{
  "type": "USER_JOINED",
  "payload": {
    "id": 3,
    "username": "Guest_3",
    "timestamp": "2026-02-19T18:30:00.000Z"
  }
}
```

### USER_LEFT — A user disconnected
```json
{
  "type": "USER_LEFT",
  "payload": {
    "id": 3,
    "username": "Guest_3",
    "timestamp": "2026-02-19T18:30:00.000Z"
  }
}
```

### ERROR — Something went wrong
```json
{
  "type": "ERROR",
  "payload": {
    "message": "Invalid or empty message (max 500 chars)"
  }
}
```

Possible error messages:
- `"Invalid JSON"`
- `"User not found"`
- `"Missing type or payload"`
- `"Rate limit exceeded. Please slow down."`
- `"Invalid or empty message (max 500 chars)"`
- `"Invalid username (alphanumeric/underscore, max 20 chars)"`
- `"Missing 'to' or invalid message"`
- `"Room name required"`
- `"Join a room first"`
- `"Message required"`
- `"Receiver not found"`
- `"Specify a room or join one first"`
- `"Unknown message type: <type>"`

---

## Rate Limiting

- **Window**: 10 seconds
- **Max messages**: 10 per window
- If exceeded, server responds with an `ERROR` message and drops the message

---

## Input Validation

- **Messages**: Max 500 characters, HTML tags are stripped
- **Usernames**: Max 20 characters, alphanumeric + underscore only, HTML tags are stripped

---

## Frontend Requirements

Build a dark/grey themed React chat UI with these features:

1. **Username setup screen** — Let user pick a display name on first load (sends `SET_USERNAME`)
2. **Global chat** — Default view showing all `CHAT` messages
3. **Room panel** — Sidebar to join/leave rooms, show room members
4. **Room chat** — When in a room, show `ROOM_CHAT` messages for that room
5. **Private messaging** — Click a user to send a `PRIVATE_CHAT`
6. **Online users sidebar** — Show the list from `GET_USERS`, update on `USER_JOINED`/`USER_LEFT`
7. **Typing indicators** — Show "User is typing..." when `TYPING_START` received, hide on `TYPING_STOP`
8. **Notifications** — Show `ROOM_NOTIFICATION` messages (joins/leaves) in the chat
9. **Error handling** — Display `ERROR` messages as toasts or inline alerts
10. **Timestamps** — Display the `timestamp` field on messages as relative time (e.g. "2 min ago")

### Color Scheme
- Dark/grey theme
- Background: #1a1a2e or similar dark navy/charcoal
- Cards/panels: #16213e or #1e1e2e
- Text: #e0e0e0 (light grey)
- Accent: #0f3460 or #7c3aed (purple accent)
- Messages from self: slightly different shade than messages from others
