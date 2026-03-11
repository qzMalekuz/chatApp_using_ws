import rateLimit from "express-rate-limit";

// HTTP Rate Limiter (e.g., for the GET / endpoint)
export const httpRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: "Too many requests from this IP, please try again after 15 minutes",
});

// WebSocket Connection Rate Limiter (by IP)
const wsConnectionCounts = new Map<string, { count: number; windowStart: number }>();
const WS_RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const WS_RATE_LIMIT_MAX_CONNECTIONS = 20; // 20 connections per minute per IP

export function checkWsConnectionRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = wsConnectionCounts.get(ip);

    if (!record) {
        wsConnectionCounts.set(ip, { count: 1, windowStart: now });
        return false;
    }

    if (now - record.windowStart > WS_RATE_LIMIT_WINDOW_MS) {
        // Reset window
        record.count = 1;
        record.windowStart = now;
        return false;
    }

    record.count += 1;
    if (record.count > WS_RATE_LIMIT_MAX_CONNECTIONS) {
        return true; // Rate limited
    }

    return false;
}

// Periodically clean stale records to avoid unbounded memory growth
setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of wsConnectionCounts.entries()) {
        if (now - record.windowStart > WS_RATE_LIMIT_WINDOW_MS * 3) {
            wsConnectionCounts.delete(ip);
        }
    }
}, WS_RATE_LIMIT_WINDOW_MS).unref();
