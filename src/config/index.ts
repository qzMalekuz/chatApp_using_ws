/**
 * Server configuration.
 * Override defaults via environment variables (e.g. PORT=8080).
 */

/** The port the WebSocket server listens on. */
export const PORT = Number(process.env.PORT) || 3000;
