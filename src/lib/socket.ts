// Socket.IO client singleton for the browser
// Ensures only one connection is used throughout the app for real-time multiplayer
// Handles connection, reconnection, and error events for debugging
import io from "socket.io-client";

let socket: ReturnType<typeof io> | null = null;

/**
 * Returns a singleton Socket.IO client instance.
 * Ensures only one connection is used throughout the app.
 * Uses absolute URL in development to avoid WebSocket connection issues.
 */
export function getSocket() {
  if (!socket) {
    // Detect if running in the browser
    const isBrowser = typeof window !== "undefined";
    let baseUrl = "";
    if (isBrowser) {
      // Use backend URL for cross-origin deployment
      baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://loteria-backend-aoiq.onrender.com';
    } else {
      baseUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";
    }
    
    // Cross-origin configuration for Vercel + Render
    socket = io(baseUrl, {
      path: "/api/socket/io", // Keep your existing path
      transports: ["websocket", "polling"], // Allow polling fallback
      upgrade: true, // Allow transport upgrades
      autoConnect: true,
      timeout: 20000, // Increased timeout for Railway
      forceNew: false,
    });
    // Debug connection events
    socket.on("connect", () => {
      console.log("[Socket.IO] Connected", socket?.id);
    });
    socket.on("disconnect", (reason: any) => {
      console.log("[Socket.IO] Disconnected", reason);
    });
    socket.on("connect_error", (err: any) => {
      console.error("[Socket.IO] Connection error", err);
    });
  }
  return socket;
}
