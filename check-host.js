// Debug script to check who the host is in lobby APBJEZ
const { io } = require("socket.io-client");

console.log("🔍 Checking lobby APBJEZ host status...");

const socket = io("http://localhost:3001", {
  path: "/api/socket/io",
  transports: ['polling', 'websocket']
});

socket.on("connect", () => {
  console.log("✅ Connected to socket server with ID:", socket.id);
  
  // Listen for all events
  socket.onAny((eventName, ...args) => {
    console.log(`📥 Received event "${eventName}":`, JSON.stringify(args, null, 2));
  });
  
  // Join the lobby to see the state
  console.log("👤 Joining lobby APBJEZ to check host...");
  socket.emit("join-lobby", {
    lobbyCode: "APBJEZ",
    playerName: "HostChecker",
    playerEmail: "hostcheck@test.com"
  });
  
  // Disconnect after 5 seconds
  setTimeout(() => {
    console.log("👋 Disconnecting...");
    socket.disconnect();
    process.exit(0);
  }, 5000);
});

socket.on("connect_error", (error) => {
  console.error("❌ Connection error:", error);
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from socket server");
});
