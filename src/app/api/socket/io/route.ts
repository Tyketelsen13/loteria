import { Server } from "socket.io";
import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

console.log("[Socket.IO] App Router handler invoked");

// Store the io server instance globally to avoid creating multiple instances
let io: Server | undefined;

export async function GET(request: NextRequest) {
  if (!io) {
    console.log("[Socket.IO] Initializing new server instance in App Router");
    
    // Create HTTP server for Socket.IO (this is a simplified approach for Next.js App Router)
    // In production, this will be handled by the Next.js server
    const httpServer = (global as any).__httpServer;
    
    if (!httpServer) {
      return new Response("Socket.IO server not available", { status: 500 });
    }
    
    io = new Server(httpServer, {
      path: "/api/socket/io",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      transports: ["websocket", "polling"],
    });

    console.log("[Socket.IO] Server initialized with CORS and transports");

    // Handle Socket.IO connections
    io.on("connection", (socket) => {
      console.log("[Socket.IO] Client connected:", socket.id);

      // Handle game events (same as Pages Router version)
      socket.on("join-lobby", (lobbyCode: string) => {
        console.log(`[Socket.IO] ${socket.id} joining lobby: ${lobbyCode}`);
        socket.join(lobbyCode);
        socket.to(lobbyCode).emit("player-joined", socket.id);
      });

      socket.on("leave-lobby", (lobbyCode: string) => {
        console.log(`[Socket.IO] ${socket.id} leaving lobby: ${lobbyCode}`);
        socket.leave(lobbyCode);
        socket.to(lobbyCode).emit("player-left", socket.id);
      });

      socket.on("start-game", (lobbyCode: string) => {
        console.log(`[Socket.IO] Starting game in lobby: ${lobbyCode}`);
        io?.to(lobbyCode).emit("game-started");
      });

      socket.on("call-card", ({ lobbyCode, card }: { lobbyCode: string; card: string }) => {
        console.log(`[Socket.IO] Card called in ${lobbyCode}: ${card}`);
        socket.to(lobbyCode).emit("card-called", card);
      });

      socket.on("mark-card", ({ lobbyCode, card, playerId }: { lobbyCode: string; card: string; playerId: string }) => {
        console.log(`[Socket.IO] Card marked in ${lobbyCode}: ${card} by ${playerId}`);
        socket.to(lobbyCode).emit("card-marked", { card, playerId });
      });

      socket.on("claim-loteria", ({ lobbyCode, playerId }: { lobbyCode: string; playerId: string }) => {
        console.log(`[Socket.IO] Lotería claimed in ${lobbyCode} by ${playerId}`);
        io?.to(lobbyCode).emit("loteria-claimed", playerId);
      });

      socket.on("disconnect", (reason) => {
        console.log(`[Socket.IO] Client ${socket.id} disconnected:`, reason);
      });
    });
  }

  return new Response("Socket.IO server running", { status: 200 });
}

export async function POST(request: NextRequest) {
  return GET(request);
}
