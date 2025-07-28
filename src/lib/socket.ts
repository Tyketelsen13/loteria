// Socket.IO client singleton for the browser
// Ensures only one connection is used throughout the app for real-time multiplayer
// Handles connection, reconnection, and error events for debugging
// Updated: Fixed socket path for production compatibility
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
    let baseUrl = "https://loteria-backend-aoiq.onrender.com";
    if (isBrowser) {
      // In development, use local backend; in production, use deployed backend
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isDevelopment) {
        baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3003';
      } else {
        baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://loteria-backend-aoiq.onrender.com';
      }
      console.log("[Socket.IO] Connecting to baseUrl:", baseUrl, "isDevelopment:", isDevelopment);
    } else {
      baseUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      console.log("[Socket.IO] Server-side baseUrl:", baseUrl);
    }
    
    console.log("[Socket.IO] Creating socket with config:", {
      baseUrl,
      path: "/socket.io",
      transports: ["polling", "websocket"],
      isDevelopment: isBrowser ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') : false
    });
    
    // Cross-origin configuration for Vercel + Render
    socket = io(baseUrl, {
      path: "/socket.io", // Use standard socket.io path for better compatibility
      transports: ["polling", "websocket"], // Try polling first, then websocket for better compatibility
      upgrade: true, // Allow transport upgrades
      autoConnect: true,
      timeout: 30000, // Increased timeout for slower connections
      forceNew: false,
      reconnection: true,
      reconnectionDelay: 3000, // Increased delay for production
      reconnectionAttempts: 10, // More attempts for production
      randomizationFactor: 0.5, // Add randomization to reconnection delay
    });
    // Debug connection events
    socket.on("connect", () => {
      console.log("[Socket.IO] Connected to", baseUrl, "with ID:", socket?.id);
    });
    socket.on("disconnect", (reason: any) => {
      console.log("[Socket.IO] Disconnected from", baseUrl, "reason:", reason);
    });
    socket.on("connect_error", (err: any) => {
      console.error("[Socket.IO] Connection error to", baseUrl, "error:", err);
      console.log("[Socket.IO] Retrying connection...");
    });
    socket.on("reconnect", (attemptNumber: number) => {
      console.log("[Socket.IO] Reconnected to", baseUrl, "after", attemptNumber, "attempts");
    });
    socket.on("reconnect_error", (err: any) => {
      console.error("[Socket.IO] Reconnection error to", baseUrl, "error:", err);
    });
    socket.on("reconnect_failed", () => {
      console.error("[Socket.IO] Failed to reconnect to", baseUrl, "after maximum attempts");
    });
  }
  return socket;
}
