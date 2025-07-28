// Standalone Socket.IO server for development
// This runs independently from the Next.js dev server on port 3001
const { createServer } = require("http");
const { Server } = require("socket.io");

// Create a simple HTTP server for Socket.IO with CORS support
const server = createServer((req, res) => {
  // Set CORS headers for all HTTP requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Let Socket.IO handle its routes, or return status for other requests
  if (!req.url || !req.url.startsWith('/api/socket/io')) {
    // Add debug endpoint
    if (req.url === '/debug' || req.url === '/debug/') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'Socket.IO server running',
        path: '/api/socket/io',
        timestamp: new Date().toISOString(),
        activeLobbies: Object.keys(lobbyGames).length,
        totalConnections: io.engine.clientsCount || 0
      }));
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'Socket.IO server running',
      path: '/api/socket/io',
      timestamp: new Date().toISOString()
    }));
  }
});

// Attach Socket.IO to the server with comprehensive CORS configuration
const io = new Server(server, {
  path: "/api/socket/io",
  cors: {
    origin: true, // Allow all origins in development
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
    credentials: true,
    allowEIO3: true
  },
  transports: ['polling', 'websocket'],
  allowUpgrades: true
});

console.log("🎮 Starting Socket.IO server...");

// --- In-memory game state per lobby ---
const lobbyGames = {};
const lobbyHosts = {};

// Helper function to sync lobbies with the API endpoint for "active games" display
async function syncLobbyWithAPI(lobbyCode, action) {
  try {
    const lobby = lobbyGames[lobbyCode];
    
    if (action === 'create' && lobby) {
      // Create/update lobby in API
      const humanPlayers = lobby.players.filter(p => !p.isAI && p.connected).map(p => p.name);
      const host = lobby.players.find(p => p.isHost && !p.isAI)?.name;
      
      console.log(`🔄 Syncing lobby ${lobbyCode} with API (create) - players:`, humanPlayers);
      
      const response = await fetch('http://localhost:3000/api/lobbies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: lobbyCode,
          players: humanPlayers,
          host: host
        })
      });
      
      if (response.ok) {
        console.log(`✅ Successfully synced lobby ${lobbyCode} with API`);
      } else {
        console.warn(`⚠️ Failed to sync lobby ${lobbyCode} with API:`, response.status);
      }
    } else if (action === 'delete') {
      // Delete lobby from API by setting empty players array
      console.log(`🗑️ Removing lobby ${lobbyCode} from API`);
      
      const response = await fetch('http://localhost:3000/api/lobbies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: lobbyCode,
          players: [], // Empty players array will effectively hide it
          host: null
        })
      });
      
      if (response.ok) {
        console.log(`✅ Successfully removed lobby ${lobbyCode} from API`);
      } else {
        console.warn(`⚠️ Failed to remove lobby ${lobbyCode} from API:`, response.status);
      }
    }
  } catch (error) {
    console.error(`❌ Error syncing lobby ${lobbyCode} with API:`, error);
  }
}

// Helper function to generate lobby codes
function generateLobbyCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper function to shuffle array
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Handle new Socket.IO connections
io.on("connection", (socket) => {
  // Handle marking a card on the board (accepts { lobbyCode, player, row, col })
  socket.on("mark-card", ({ lobbyCode, player, row, col }) => {
    if (!lobbyCode || !player || typeof row !== "number" || typeof col !== "number") {
      socket.emit("error", { message: "Invalid mark-card payload" });
      return;
    }
    // Optionally, update server-side state here if needed
    // Broadcast the mark to all players in the lobby
    io.to(lobbyCode).emit("mark-card", { player, row, col });
    console.log(`✅ mark-card: ${player} marked row ${row}, col ${col} in lobby ${lobbyCode}`);
  });
  console.log("✅ User connected:", socket.id);

  // Debug: Log all incoming events
  socket.onAny((eventName, ...args) => {
    console.log(`📥 Received event "${eventName}" from ${socket.id}:`, args);
  });

  // Create a new lobby
  socket.on("create-lobby", ({ playerName, playerEmail }) => {
    const lobbyCode = generateLobbyCode();
    console.log(`🎪 Creating new lobby ${lobbyCode} for ${playerName} (${socket.id})`);
    
    socket.join(lobbyCode);
    socket.lobbyCode = lobbyCode;
    socket.playerName = playerName;
    socket.playerEmail = playerEmail;

    // Initialize lobby
    lobbyGames[lobbyCode] = {
      players: [],
      gameStarted: false,
      currentCardIndex: 0,
      calledCards: [],
      winners: [],
      settings: {
        maxPlayers: 6,
        cardInterval: 3,
        gameMode: 'classic',
        deckTheme: 'traditional',
        aiPlayers: 2,
        allowSpectators: true,
        requireReady: false
      }
    };
    lobbyHosts[lobbyCode] = socket.id;

    // Add player to lobby
    lobbyGames[lobbyCode].players.push({
      socketId: socket.id,
      name: playerName,
      email: playerEmail,
      connected: true,
      board: [],
      isHost: true,
      isAI: false,
      avatar: 'default-avatar',
      isReady: false,
      gamesPlayed: 0,
      wins: 0
    });

    console.log(`🏠 ${playerName} is now the host of lobby: ${lobbyCode}`);
    
    // Sync with API - create lobby in database for "active games" display
    syncLobbyWithAPI(lobbyCode, 'create');
    
    // Send lobby code back to client
    socket.emit("lobby-created", { lobbyCode, lobby: lobbyGames[lobbyCode] });
  });

  // Join a lobby
  socket.on("join-lobby", ({ lobbyCode, playerName, playerEmail }) => {
    console.log(`👤 ${playerName} (${socket.id}) joining lobby: ${lobbyCode}`);
    
    socket.join(lobbyCode);
    socket.lobbyCode = lobbyCode;
    socket.playerName = playerName;
    socket.playerEmail = playerEmail;

    // Initialize lobby if it doesn't exist
    if (!lobbyGames[lobbyCode]) {
      lobbyGames[lobbyCode] = {
        players: [],
        gameStarted: false,
        currentCardIndex: 0,
        calledCards: [],
        winners: [],
        settings: {
          maxPlayers: 6,
          cardInterval: 3,
          gameMode: 'classic',
          deckTheme: 'traditional',
          aiPlayers: 2,
          allowSpectators: true,
          requireReady: false
        }
      };
      lobbyHosts[lobbyCode] = socket.id;
      console.log(`🏠 ${playerName} is now the host of lobby: ${lobbyCode}`);
    }

    // Add player to lobby with enhanced data
    const existingPlayerIndex = lobbyGames[lobbyCode].players.findIndex(p => p.email === playerEmail);
    if (existingPlayerIndex !== -1) {
      // Update existing player's socket ID and connection status
      lobbyGames[lobbyCode].players[existingPlayerIndex].socketId = socket.id;
      lobbyGames[lobbyCode].players[existingPlayerIndex].connected = true;
    } else {
      // Add new player with enhanced data
      lobbyGames[lobbyCode].players.push({
        socketId: socket.id,
        name: playerName,
        email: playerEmail,
        connected: true,
        board: [], // Will be generated when game starts
        isHost: socket.id === lobbyHosts[lobbyCode],
        isAI: false,
        avatar: 'default-avatar',
        isReady: false,
        gamesPlayed: 0,
        wins: 0
      });
    }

    // Send current lobby state to the player
    socket.emit("lobby-state", lobbyGames[lobbyCode]);
    
    // Notify all players in the lobby about the new player
    socket.to(lobbyCode).emit("player-joined", {
      name: playerName,
      avatar: 'default-avatar',
      playerCount: lobbyGames[lobbyCode].players.filter(p => p.connected).length
    });

    console.log(`📊 Lobby ${lobbyCode} now has ${lobbyGames[lobbyCode].players.filter(p => p.connected).length} players`);
  });

  // Update player data (avatar, ready status, etc.)
  socket.on("update-player", ({ lobbyCode, playerName, updates }) => {
    const lobby = lobbyGames[lobbyCode];
    if (!lobby) return;

    const player = lobby.players.find(p => p.name === playerName);
    if (player) {
      Object.assign(player, updates);
      
      // Notify all players about the update
      io.to(lobbyCode).emit("player-updated", { playerName, updates });
      console.log(`👤 Player ${playerName} updated:`, updates);
    }
  });

  // Update lobby settings (host only)
  socket.on("update-settings", ({ lobbyCode, settings }) => {
    if (lobbyHosts[lobbyCode] !== socket.id) {
      socket.emit("error", { message: "Only the host can update settings" });
      return;
    }

    if (lobbyGames[lobbyCode]) {
      lobbyGames[lobbyCode].settings = { ...lobbyGames[lobbyCode].settings, ...settings };
      io.to(lobbyCode).emit("settings-updated", lobbyGames[lobbyCode].settings);
      console.log(`⚙️ Settings updated for lobby ${lobbyCode}:`, settings);
    }
  });

  // Handle chat messages with enhanced support
  socket.on("send-chat", (lobbyCode, message) => {
    console.log(`💬 Chat in ${lobbyCode} from ${socket.playerName}:`, message.message);
    
    // Add timestamp if not present
    if (!message.timestamp) {
      message.timestamp = Date.now();
    }
    
    // Broadcast to all players in the lobby
    io.to(lobbyCode).emit("chat-message", message);
  });

  // Start game (host only)
  socket.on("start-game", ({ lobbyCode }) => {
    console.log(`🎮 Start game request for lobby: ${lobbyCode} from socket: ${socket.id}`);
    
    if (!lobbyCode) {
      console.log(`❌ No lobby code provided`);
      socket.emit("error", { message: "No lobby code provided" });
      return;
    }

    if (lobbyHosts[lobbyCode] !== socket.id) {
      console.log(`❌ Unauthorized start game attempt. Host: ${lobbyHosts[lobbyCode]}, Requester: ${socket.id}`);
      socket.emit("error", { message: "Only the host can start the game" });
      return;
    }

    const lobby = lobbyGames[lobbyCode];
    if (!lobby) {
      console.log(`❌ Lobby ${lobbyCode} not found`);
      socket.emit("error", { message: "Lobby not found" });
      return;
    }

    if (lobby.gameStarted) {
      console.log(`❌ Game already started in lobby ${lobbyCode}`);
      socket.emit("error", { message: "Game already started" });
      return;
    }

    console.log(`🎮 Starting game in lobby: ${lobbyCode}`);

    // Add AI players if configured
    const connectedPlayers = lobby.players.filter(p => p.connected);
    const aiPlayersToAdd = Math.max(0, lobby.settings.aiPlayers - (connectedPlayers.length - 1));
    
    console.log(`🤖 Adding ${aiPlayersToAdd} AI players to lobby ${lobbyCode}`);
    
    for (let i = 0; i < aiPlayersToAdd; i++) {
      const aiNames = ['Carlos', 'Maria', 'Diego', 'Elena', 'Fernando', 'Isabel'];
      const aiName = aiNames[i % aiNames.length] + ` AI ${i + 1}`;
      
      lobby.players.push({
        socketId: `ai-${i}`,
        name: aiName,
        email: `ai${i}@loteria.game`,
        connected: true,
        board: [],
        isHost: false,
        isAI: true
      });
    }

    // Generate boards for all players using actual card names
    const cardNames = [
      'El Corazón', 'La Luna', 'El Sol', 'La Estrella', 'El Árbol', 'La Sirena', 
      'La Escalera', 'La Botella', 'El Barril', 'El Cazo', 'El Soldado',
      'La Dama', 'El Paraguas', 'La Rana', 'El Pescado', 'El Alacran', 'El Apache',
      'El Arpa', 'El Bandolón', 'El Borracho', 'El Camarón', 'El Cantarito', 'El Catrín',
      'El Cotorro', 'El Diablito', 'El Gallo', 'El Gorrito', 'El Melón', 'El Mundo',
      'El Músico', 'El Negrito', 'El Nopal', 'El Pájaro', 'El Pino', 'El Tambor',
      'El Valiente', 'El Venado', 'El Violoncello', 'La Araña', 'La Bandera', 'La Bota',
      'La Calavera', 'La Campana', 'La Chalupa', 'La Corona', 'La Garza', 'La Maceta',
      'La Mano', 'La Muerte', 'La Palma', 'La Pera', 'La Rosa', 'La Sandía', 'Las Jaras'
    ];

    console.log(`📋 Generating boards for ${lobby.players.length} players`);

    lobby.players.forEach(player => {
      if (player.connected) {
        const shuffled = shuffleArray([...cardNames]);
        player.board = [
          shuffled.slice(0, 4),
          shuffled.slice(4, 8),
          shuffled.slice(8, 12),
          shuffled.slice(12, 16)
        ]; // 4x4 board with card names
      }
    });

    // Prepare deck and shuffle
    lobby.calledCards = [];
    lobby.currentCardIndex = 0;
    lobby.gameStarted = true;
    lobby.shuffledDeck = shuffleArray([...cardNames]);

    console.log(`📤 Sending game-started event to all players in lobby ${lobbyCode}`);

    // Notify all players that the game has started
    const gameStartedData = {
      players: lobby.players,
      settings: lobby.settings,
      lobbyCode: lobbyCode,
      gameStarted: true,
      timestamp: Date.now()
    };

    console.log(`📋 Game started data being sent:`, {
      lobbyCode: gameStartedData.lobbyCode,
      playerCount: gameStartedData.players.length,
      gameStarted: gameStartedData.gameStarted
    });

    io.to(lobbyCode).emit("game-started", gameStartedData);

    // Also send individual confirmation to the host
    socket.emit("game-start-confirmed", {
      success: true,
      lobbyCode: lobbyCode,
      message: "Game started successfully! You should now be redirected to the game board."
    });

    console.log(`✅ Game started in lobby ${lobbyCode} with ${lobby.players.filter(p => p.connected).length} players`);

    // Start calling cards automatically based on settings
    const interval = (lobby.settings.cardInterval || 3) * 1000;
    lobby.cardCallInterval = setInterval(() => {
      callNextCard(lobbyCode);
    }, interval);
  });

  // Handle bingo claims
  socket.on("claim-bingo", ({ lobbyCode, pattern, markedPositions }) => {
    const lobby = lobbyGames[lobbyCode];
    if (!lobby || !lobby.gameStarted) {
      socket.emit("error", { message: "Game not found or not started" });
      return;
    }

    const player = lobby.players.find(p => p.socketId === socket.id);
    if (!player) {
      socket.emit("error", { message: "Player not found in this lobby" });
      return;
    }

    console.log(`🎯 ${player.name} claimed bingo in lobby ${lobbyCode} with pattern: ${pattern}`);

    // Validate the bingo claim (simplified validation)
    const isValidBingo = validateBingo(player.board, markedPositions, pattern, lobby.calledCards);
    
    if (isValidBingo) {
      lobby.winners.push({
        playerName: player.name,
        pattern: pattern,
        timestamp: Date.now()
      });

      // Notify all players
      io.to(lobbyCode).emit("bingo-winner", {
        winner: player.name,
        pattern: pattern,
        isGameOver: true
      });

      // Stop the game
      if (lobby.cardCallInterval) {
        clearInterval(lobby.cardCallInterval);
        lobby.cardCallInterval = null;
      }

      console.log(`🏆 ${player.name} won in lobby ${lobbyCode}!`);
    } else {
      socket.emit("bingo-invalid", { message: "Invalid bingo claim" });
      console.log(`❌ Invalid bingo claim by ${player.name} in lobby ${lobbyCode}`);
    }
  });

  // Handle player disconnect
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
    
    if (socket.lobbyCode) {
      const lobby = lobbyGames[socket.lobbyCode];
      if (lobby) {
        const player = lobby.players.find(p => p.socketId === socket.id);
        if (player) {
          player.connected = false;
          socket.to(socket.lobbyCode).emit("player-left", {
            playerName: player.name,
            playerCount: lobby.players.filter(p => p.connected).length
          });

          // If host disconnects, assign new host
          if (lobbyHosts[socket.lobbyCode] === socket.id) {
            const newHost = lobby.players.find(p => p.connected && !p.isAI);
            if (newHost) {
              lobbyHosts[socket.lobbyCode] = newHost.socketId;
              newHost.isHost = true;
              io.to(socket.lobbyCode).emit("new-host", { newHostName: newHost.name });
              console.log(`👑 ${newHost.name} is now the host of lobby: ${socket.lobbyCode}`);
            } else {
              // No more human players to assign as host, lobby will be cleaned up below
              delete lobbyHosts[socket.lobbyCode];
            }
          }

          // Check if there are any connected non-AI players left
          const connectedHumanPlayers = lobby.players.filter(p => p.connected && !p.isAI);
          
          if (connectedHumanPlayers.length === 0) {
            console.log(`🧹 No human players left in lobby ${socket.lobbyCode}, cleaning up...`);
            
            // Clear any running intervals
            if (lobby.cardCallInterval) {
              clearInterval(lobby.cardCallInterval);
              lobby.cardCallInterval = null;
            }
            
            // Remove from lobby games and hosts
            delete lobbyGames[socket.lobbyCode];
            delete lobbyHosts[socket.lobbyCode];
            
            // Sync with API - remove lobby from database  
            syncLobbyWithAPI(socket.lobbyCode, 'delete');
            
            console.log(`✅ Lobby ${socket.lobbyCode} has been automatically closed (no players)`);
          } else {
            console.log(`📊 Lobby ${socket.lobbyCode} still has ${connectedHumanPlayers.length} human players connected`);
          }
        }
      }
    }
  });
});

// Helper function to call the next card
function callNextCard(lobbyCode) {
  const lobby = lobbyGames[lobbyCode];
  if (!lobby || !lobby.gameStarted || lobby.currentCardIndex >= lobby.shuffledDeck.length) {
    return;
  }

  const cardId = lobby.shuffledDeck[lobby.currentCardIndex];
  lobby.calledCards.push(cardId);
  lobby.currentCardIndex++;

  // Notify all players
  io.to(lobbyCode).emit("card-called", {
    cardId: cardId,
    cardIndex: lobby.currentCardIndex,
    totalCards: lobby.shuffledDeck.length
  });

  console.log(`📢 Called card ${cardId} in lobby ${lobbyCode} (${lobby.currentCardIndex}/${lobby.shuffledDeck.length})`);

  // AI players automatically mark their boards
  lobby.players.filter(p => p.isAI && p.connected).forEach(aiPlayer => {
    if (aiPlayer.board.includes(cardId)) {
      // Simulate AI marking the card after a short delay
      setTimeout(() => {
        // Check if AI should claim bingo (simple logic)
        const markedCards = lobby.calledCards.filter(id => aiPlayer.board.includes(id));
        if (markedCards.length >= 4 && Math.random() < 0.1) { // 10% chance to claim bingo
          handleAIBingo(lobbyCode, aiPlayer);
        }
      }, Math.random() * 1000 + 500); // Random delay between 0.5-1.5 seconds
    }
  });
}

// Helper function to handle AI bingo claims
function handleAIBingo(lobbyCode, aiPlayer) {
  const lobby = lobbyGames[lobbyCode];
  if (!lobby || !lobby.gameStarted) return;

  const markedCards = lobby.calledCards.filter(id => aiPlayer.board.includes(id));
  
  // Simple bingo validation for AI (check if we have 4+ marked cards in a row/column)
  if (markedCards.length >= 4) {
    lobby.winners.push({
      playerName: aiPlayer.name,
      pattern: 'line',
      timestamp: Date.now()
    });

    io.to(lobbyCode).emit("bingo-winner", {
      winner: aiPlayer.name,
      pattern: 'line',
      isGameOver: true
    });

    if (lobby.cardCallInterval) {
      clearInterval(lobby.cardCallInterval);
      lobby.cardCallInterval = null;
    }

    console.log(`🤖 AI ${aiPlayer.name} won in lobby ${lobbyCode}!`);
  }
}

// Simple bingo validation function
function validateBingo(board, markedPositions, pattern, calledCards) {
  // This is a simplified validation - in a real game you'd have more complex patterns
  const markedCardIds = markedPositions.map(pos => board[pos]);
  const validMarks = markedCardIds.every(cardId => calledCards.includes(cardId));
  
  // For now, just check if we have at least 4 valid marked cards
  return validMarks && markedCardIds.length >= 4;
}

// Start the server
const PORT = process.env.PORT || 3003;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
server.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on http://localhost:${PORT}`);
  console.log(`🔗 Path: /api/socket/io`);
  console.log(`📡 CORS enabled for: ${CORS_ORIGIN}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('👋 Shutting down Socket.IO server...');
  
  // Clear all intervals
  Object.values(lobbyGames).forEach(lobby => {
    if (lobby.cardCallInterval) {
      clearInterval(lobby.cardCallInterval);
    }
  });
  
  server.close(() => {
    console.log('✅ Socket.IO server stopped');
    process.exit(0);
  });
});
