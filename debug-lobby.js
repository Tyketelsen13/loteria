// Debug script to check lobby state via Socket.IO client
const { io } = require("socket.io-client");

console.log("🔍 Connecting to socket server to debug lobby state...");

const socket = io("http://localhost:3001", {
  path: "/api/socket/io",
  transports: ['polling', 'websocket']
});

socket.on("connect", () => {
  console.log("✅ Connected to socket server with ID:", socket.id);
  
  // Listen for all events
  socket.onAny((eventName, ...args) => {
    console.log(`📥 Received event "${eventName}":`, args);
  });
  
  // Join the lobby that was mentioned in the logs
  console.log("👤 Joining lobby APBJEZ...");
  socket.emit("join-lobby", {
    lobbyCode: "APBJEZ",
    playerName: "DebugPlayer",
    playerEmail: "debug@test.com"
  });
  
  // Try to start the game after a short delay
  setTimeout(() => {
    console.log("🎮 Attempting to start game...");
    socket.emit("start-game", { lobbyCode: "APBJEZ" });
  }, 2000);
  
  // Disconnect after 10 seconds
  setTimeout(() => {
    console.log("👋 Disconnecting...");
    socket.disconnect();
    process.exit(0);
  }, 10000);
});

socket.on("connect_error", (error) => {
  console.error("❌ Connection error:", error);
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from socket server");
});
