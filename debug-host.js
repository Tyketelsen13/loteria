// Debug script to check host permissions
const { io } = require("socket.io-client");

console.log("🔍 Connecting as original host to test game start...");

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
  
  // Create a new lobby to be the host
  console.log("🎪 Creating new lobby...");
  socket.emit("create-lobby", {
    playerName: "TestHost",
    playerEmail: "host@test.com"
  });
  
  // Wait for lobby creation, then start game
  let actualLobbyCode = null;
  
  // Capture the lobby code from the lobby-created event
  socket.on("lobby-created", (data) => {
    actualLobbyCode = data.lobbyCode;
    console.log("🏠 Lobby created with code:", actualLobbyCode);
    
    // Start the game after a short delay
    setTimeout(() => {
      console.log("🎮 Attempting to start game as host with code:", actualLobbyCode);
      socket.emit("start-game", { lobbyCode: actualLobbyCode });
    }, 2000);
  });
  
  // Wait for lobby creation, then start game
  setTimeout(() => {
    if (!actualLobbyCode) {
      console.log("🎮 Attempting to start game as host...");
      socket.emit("start-game", { lobbyCode: "TEST123" }); // We'll use the actual code from lobby-created event
    }
  }, 3000);
  
  // Disconnect after 15 seconds
  setTimeout(() => {
    console.log("👋 Disconnecting...");
    socket.disconnect();
    process.exit(0);
  }, 15000);
});

socket.on("connect_error", (error) => {
  console.error("❌ Connection error:", error);
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from socket server");
});
