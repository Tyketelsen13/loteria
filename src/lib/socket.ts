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
      // Use window.location.origin for same-origin, or override for dev
      baseUrl = window.location.origin;
    } else {
      baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    }
    socket = io(baseUrl, {
      path: "/api/socket/io", // Must match server.js path
      transports: ["websocket"], // Use only WebSocket transport for reliability
      upgrade: false,
      autoConnect: true,
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
