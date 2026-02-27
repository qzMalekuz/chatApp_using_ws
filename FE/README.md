<h1 align="center">💬 ChatLo.io - Frontend</h1>

<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
</p>

<p align="center">
  The beautiful, interactive, and responsive frontend for <strong>ChatLo.io</strong>, a real-time full-stack chat application.
</p>

---

## ✨ Features

- **Real-Time UI**: Instant message updates powered by WebSockets via `ChatContext`.
- **Modern Aesthetics**: A sleek dark theme built with modern Tailwind CSS.
- **Fluid Animations**: Smooth transitions, typing indicators, and message pop-ins powered by Framer Motion.
- **Responsive Layout**: Seamlessly adapts from desktop (three-column) to mobile devices (bottom tabs).

## 🚀 Quick Start

Ensure you have Node.js installed, then run the following commands to spin up the local development server:

```bash
# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

The frontend will be available at [http://localhost:5173](http://localhost:5173). 

*(Note: Ensure the backend WebSocket server is running concurrently for full functionality)*

## 📂 Project Structure

- `src/context/ChatContext.tsx`: The heart of real-time state manipulation.
- `src/components/`: Reusable, beautifully-styled components including `ChatArea`, `RoomPanel`, and `UsersSidebar`.

Made with ❤️ using React & Tailwind.
