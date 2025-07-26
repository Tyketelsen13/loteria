// Custom Next.js + Socket.IO server for production backend deployment
// This file runs both the Next.js app and the Socket.IO server for real-time multiplayer Lotería.
// All multiplayer logic is handled here. MongoDB is used for persistent user/profile data.
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");

// Determine if running in development mode
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// Prepare Next.js and start the custom server
app.prepare().then(() => {
  // Create HTTP server for Next.js with CORS support
  const server = createServer((req, res) => {
    // Add CORS headers for all requests
    const allowedOrigins = [
      'https://loteria-frontend-ten.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001',
      'https://loteria-backend-aoiq.onrender.com'
    ];
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Attach Socket.IO to the same HTTP server
  const io = new Server(server, {
    path: "/api/socket/io",
    cors: {
      origin: [
        "https://loteria-frontend-ten.vercel.app",
        "http://localhost:3000",
        "http://localhost:3001",
        "https://loteria-backend-aoiq.onrender.com"
      ],
      methods: ["GET", "POST"],
      credentials: true,
      allowEIO3: true
    },
  });

  // Store the io server instance globally for potential App Router access
  global.__httpServer = server;
  global.__ioServer = io;

  // --- In-memory game state per lobby ---
  // This object holds all active lobbies and their game state (not persistent)
  const lobbyGames = {};
  const lobbyHosts = {}; // Track who the host is for each lobby

  // Handle new Socket.IO connections
  io.on("connection", (socket) => {
    console.log("[Socket.IO] Client connected:", socket.id);

    // --- Lobby Join/Leave Logic ---
    // Player joins a lobby
    socket.on("join-lobby", (lobbyCode, user) => {
      socket.join(lobbyCode);
      // Initialize lobby if it doesn't exist
      if (!lobbyGames[lobbyCode]) {
        lobbyGames[lobbyCode] = {
          boards: {},
          turnOrder: [],
          deck: [],
          turn: 0,
          called: [],
          marks: {},
          winner: null,
          players: [],
        };
        // If no host is set and this is the first player, make them host
        if (!lobbyHosts[lobbyCode]) {
          lobbyHosts[lobbyCode] = user;
          console.log(`[Socket.IO] Setting ${user} as host for lobby ${lobbyCode}`);
        }
      }
      // Add player to lobby if not already present
      if (!lobbyGames[lobbyCode].players.some((p) => p.id === socket.id)) {
        lobbyGames[lobbyCode].players.push({ id: socket.id, name: user });
      }
      // Notify all clients in the lobby
      io.to(lobbyCode).emit("player-list", lobbyGames[lobbyCode].players);
      io.to(lobbyCode).emit("player-joined", user);
    });

    // Player leaves a lobby
    socket.on("leave-lobby", (lobbyCode) => {
      socket.leave(lobbyCode);
      if (lobbyGames[lobbyCode]) {
        lobbyGames[lobbyCode].players = lobbyGames[lobbyCode].players.filter(
          (p) => p.id !== socket.id
        );
        io.to(lobbyCode).emit("player-list", lobbyGames[lobbyCode].players);
      }
    });

    // Handle disconnect: remove player from all lobbies
    socket.on("disconnecting", () => {
      for (const lobbyCode of socket.rooms) {
        if (lobbyGames[lobbyCode]) {
          lobbyGames[lobbyCode].players = lobbyGames[lobbyCode].players.filter(
            (p) => p.id !== socket.id
          );
          io.to(lobbyCode).emit("player-list", lobbyGames[lobbyCode].players);
        }
      }
    });

    // --- Chat ---
    // Broadcast chat messages to the lobby
    socket.on("send-chat", (lobbyCode, message) => {
      io.to(lobbyCode).emit("chat-message", message);
    });

    // --- Card Calling ---
    // Host calls a card; update called cards and notify all clients
    socket.on("call-card", ({ lobbyCode, card }) => {
      const game = lobbyGames[lobbyCode];
      if (!game || !card || game.called.includes(card)) return;
      
      // Additional validation: only allow calling from known lobbies with proper host
      const expectedHost = lobbyHosts[lobbyCode];
      if (!expectedHost) {
        console.log(`[Socket.IO] No host found for lobby ${lobbyCode}, allowing card call`);
      }
      
      game.called.push(card);
      console.log(`[Socket.IO] Card called in ${lobbyCode}: ${card} (total: ${game.called.length})`);
      
      // --- Tiebreaker and Card Stopping Logic ---
      // If there are active winners, only allow them to continue; otherwise, stop card calling
      if (!game.activeWinners) game.activeWinners = null;
      // If there are active winners, only allow them to continue
      if (game.activeWinners && Array.isArray(game.activeWinners) && game.activeWinners.length > 0) {
        // Only continue calling cards for active winners
        // Remove any players who have already won
        // (Handled below in bingo logic)
      }
      // Always emit the full called-cards array after every call, including the first
      io.to(lobbyCode).emit("called-cards", game.called);
      // Optionally, emit the single called card for host's interval logic
      io.to(lobbyCode).emit("called-card", card);

      // --- AI Bingo Logic + Tiebreaker ---
      // For each AI player, mark the card if present, then check for bingo
      let newWinners = [];
      Object.keys(game.boards).forEach((player) => {
        if (!player.startsWith('AI ')) return;
        // If tiebreaker is active, only allow activeWinners to play
        if (game.activeWinners && Array.isArray(game.activeWinners) && game.activeWinners.length > 0 && !game.activeWinners.includes(player)) return;
        // Mark the card on the AI's board
        if (!game.marks[player]) {
          game.marks[player] = Array(4).fill(null).map(() => Array(4).fill(false));
        }
        const board = game.boards[player];
        const marks = game.marks[player];
        for (let row = 0; row < 4; row++) {
          for (let col = 0; col < 4; col++) {
            if (board[row][col] === card) {
              marks[row][col] = true;
            }
          }
        }
        // --- AI: Check for bingo using the same logic as the client, but also auto-mark all called cards ---
        // Ensure all called cards are marked (simulate a real player who marks every called card)
        for (let row = 0; row < 4; row++) {
          for (let col = 0; col < 4; col++) {
            if (game.called.includes(board[row][col])) {
              marks[row][col] = true;
            }
          }
        }
        // Check for bingo using same rules as client (including last called card in line)
        const checkBingo = (marks) => {
          for (let i = 0; i < 4; i++) if (marks[i].every(Boolean)) return true;
          for (let j = 0; j < 4; j++) if (marks.every((row) => row[j])) return true;
          if ([0, 1, 2, 3].every((i) => marks[i][i])) return true;
          if ([0, 1, 2, 3].every((i) => marks[i][3 - i])) return true;
          if (marks[0][0] && marks[0][3] && marks[3][0] && marks[3][3]) return true;
          if (marks[1][1] && marks[1][2] && marks[2][1] && marks[2][2]) return true;
          return false;
        };
        const getWinningLine = (marks) => {
          for (let i = 0; i < 4; i++) if (marks[i].every(Boolean)) return { type: "row", index: i };
          for (let j = 0; j < 4; j++) if (marks.every((row) => row[j])) return { type: "col", index: j };
          if ([0, 1, 2, 3].every((i) => marks[i][i])) return { type: "diag1", index: 0 };
          if ([0, 1, 2, 3].every((i) => marks[i][3 - i])) return { type: "diag2", index: 0 };
          if (marks[0][0] && marks[0][3] && marks[3][0] && marks[3][3]) return { type: "corners", index: 0 };
          if (marks[1][1] && marks[1][2] && marks[2][1] && marks[2][2]) return { type: "center", index: 0 };
          return null;
        };
        const isValidBingo = (board, marks, line, calledCards) => {
          if (!line) return false;
          const getCards = () => {
            if (line.type === "row") return board[line.index].map((card, j) => ({ card, marked: marks[line.index][j] }));
            if (line.type === "col") return board.map((row, i) => ({ card: row[line.index], marked: marks[i][line.index] }));
            if (line.type === "diag1") return [0, 1, 2, 3].map((i) => ({ card: board[i][i], marked: marks[i][i] }));
            if (line.type === "diag2") return [0, 1, 2, 3].map((i) => ({ card: board[i][3 - i], marked: marks[i][3 - i] }));
            if (line.type === "corners") return [
              { card: board[0][0], marked: marks[0][0] },
              { card: board[0][3], marked: marks[0][3] },
              { card: board[3][0], marked: marks[3][0] },
              { card: board[3][3], marked: marks[3][3] },
            ];
            if (line.type === "center") return [
              { card: board[1][1], marked: marks[1][1] },
              { card: board[1][2], marked: marks[1][2] },
              { card: board[2][1], marked: marks[2][1] },
              { card: board[2][2], marked: marks[2][2] },
            ];
            return [];
          };
          return getCards().every(({ card, marked }) => !marked || calledCards.includes(card));
        };
        const line = getWinningLine(marks);
        const bingo = checkBingo(marks);
        const validBingo = isValidBingo(board, marks, line, game.called);
        // Last called card must be in the winning line and marked
        let lastCardInLine = false;
        if (game.called.length > 0 && line) {
          const lastCalled = game.called[game.called.length - 1];
          let winningCards = [];
          if (line.type === 'row') winningCards = board[line.index].map((card, j) => ({ card, marked: marks[line.index][j] }));
          else if (line.type === 'col') winningCards = board.map((row, i) => ({ card: row[line.index], marked: marks[i][line.index] }));
          else if (line.type === 'diag1') winningCards = [0, 1, 2, 3].map(i => ({ card: board[i][i], marked: marks[i][i] }));
          else if (line.type === 'diag2') winningCards = [0, 1, 2, 3].map(i => ({ card: board[i][3 - i], marked: marks[i][3 - i] }));
          else if (line.type === 'corners') winningCards = [
            { card: board[0][0], marked: marks[0][0] },
            { card: board[0][3], marked: marks[0][3] },
            { card: board[3][0], marked: marks[3][0] },
            { card: board[3][3], marked: marks[3][3] }
          ];
          else if (line.type === 'center') winningCards = [
            { card: board[1][1], marked: marks[1][1] },
            { card: board[1][2], marked: marks[1][2] },
            { card: board[2][1], marked: marks[2][1] },
            { card: board[2][2], marked: marks[2][2] }
          ];
          lastCardInLine = winningCards.some(({ card, marked }) => marked && card === lastCalled);
        }
        if (bingo && validBingo && lastCardInLine && (!game.activeWinners || game.activeWinners.includes(player))) {
          newWinners.push(player);
        }
      });
      // If there are new winners, handle tiebreaker or end game
      if (newWinners.length > 0) {
        if (newWinners.length === 1) {
          // Single winner: end game for all
          game.winner = newWinners[0];
          let winnerDisplay = newWinners[0];
          if (typeof winnerDisplay === 'string' && winnerDisplay.startsWith('AI ')) {
            const aiName = winnerDisplay.replace(/^AI /, '');
            winnerDisplay = aiName + ' AI';
          }
          io.to(lobbyCode).emit("winner", winnerDisplay);
          io.to(lobbyCode).emit("chat-message", { name: "System", message: `¡Lotería! ${winnerDisplay} has won the game!` });
          game.activeWinners = null;
        } else {
          // Multiple winners: only allow these players to continue
          game.activeWinners = newWinners;
          io.to(lobbyCode).emit("chat-message", { name: "System", message: `¡Lotería! Multiple players have bingo! Only they continue. Everyone else is out.` });
        }
      }
    });

    // --- Set Host ---
    // Set or update who the host is for a lobby
    socket.on("set-host", ({ lobbyCode, host }) => {
      if (lobbyCode && host) {
        lobbyHosts[lobbyCode] = host;
        console.log(`[Socket.IO] Host set for lobby ${lobbyCode}: ${host}`);
        io.to(lobbyCode).emit("host-updated", host);
      }
    });

    // --- Game Start ---
    // Host starts the game; generate boards and deck, notify all clients
    socket.on("start-game", (payload) => {
      // Find the lobby code from the socket's rooms
      const lobbyCode = Array.from(socket.rooms).find((r) => r !== socket.id);
      if (lobbyCode && payload && payload.boards) {
        // Read all card image names from /public/cards
        const cardsDir = path.join(process.cwd(), "public", "cards");
        const files = fs.readdirSync(cardsDir);
        const cardNames = files
          .filter((f) => f.endsWith(".png") || f.endsWith(".jpg"))
          .map((f) =>
            f
              .replace(/\.(png|jpg)$/, "")
              .replace(/-/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())
          );
        // Shuffle deck and assign boards
        const deck = [...cardNames].sort(() => Math.random() - 0.5);
        const playerNames = Object.keys(payload.boards);
        const boards = {};
        playerNames.forEach((name) => {
          const shuffled = [...cardNames].sort(() => Math.random() - 0.5);
          boards[name] = [
            shuffled.slice(0, 4),
            shuffled.slice(4, 8),
            shuffled.slice(8, 12),
            shuffled.slice(12, 16),
          ];
        });
        const turnOrder = playerNames.sort(() => Math.random() - 0.5);
        // Store game state in memory
        lobbyGames[lobbyCode] = {
          boards,
          turnOrder,
          deck,
          turn: 0,
          called: [],
          marks: {},
          winner: null,
          players: lobbyGames[lobbyCode]?.players || playerNames.map(
            (name) => ({ id: "", name })
          ),
        };
        // Debug: log the deck and payload
        console.log('[SERVER] Emitting start-game with deck:', deck);
        io.to(lobbyCode).emit("start-game", {
          boards,
          turnOrder,
          deck,
          turn: 0,
          called: [],
          currentPlayer: turnOrder[0],
          card: deck[0],
        });
        io.to(lobbyCode).emit("called-cards", []); // Reset called cards for all clients
      }
    });

    // --- Marking Cards ---
    // Player marks a card on their board
    socket.on("mark-card", ({ lobbyCode, player, row, col }) => {
      const game = lobbyGames[lobbyCode];
      if (!game) return;
      if (!game.marks[player]) {
        game.marks[player] = Array(4).fill(null).map(() => Array(4).fill(false));
      }
      // Toggle the mark state (same as AI game behavior)
      game.marks[player][row][col] = !game.marks[player][row][col];
      io.to(lobbyCode).emit("mark-card", { player, row, col });
    });

    // --- Bingo Validation ---
    // Helper functions to check for valid bingo
    function checkBingo(marks) {
      for (let i = 0; i < 4; i++) if (marks[i].every(Boolean)) return true;
      for (let j = 0; j < 4; j++) if (marks.every((row) => row[j])) return true;
      if ([0, 1, 2, 3].every((i) => marks[i][i])) return true;
      if ([0, 1, 2, 3].every((i) => marks[i][3 - i])) return true;
      if (marks[0][0] && marks[0][3] && marks[3][0] && marks[3][3]) return true;
      if (marks[1][1] && marks[1][2] && marks[2][1] && marks[2][2]) return true;
      return false;
    }
    function getWinningLine(marks) {
      for (let i = 0; i < 4; i++) if (marks[i].every(Boolean)) return { type: "row", index: i };
      for (let j = 0; j < 4; j++) if (marks.every((row) => row[j])) return { type: "col", index: j };
      if ([0, 1, 2, 3].every((i) => marks[i][i])) return { type: "diag1", index: 0 };
      if ([0, 1, 2, 3].every((i) => marks[i][3 - i])) return { type: "diag2", index: 0 };
      if (marks[0][0] && marks[0][3] && marks[3][0] && marks[3][3]) return { type: "corners", index: 0 };
      if (marks[1][1] && marks[1][2] && marks[2][1] && marks[2][2]) return { type: "center", index: 0 };
      return null;
    }
    function isValidBingo(board, marks, line, calledCards) {
      if (!line) return false;
      const getCards = () => {
        if (line.type === "row") return board[line.index].map((card, j) => ({ card, marked: marks[line.index][j] }));
        if (line.type === "col") return board.map((row, i) => ({ card: row[line.index], marked: marks[i][line.index] }));
        if (line.type === "diag1") return [0, 1, 2, 3].map((i) => ({ card: board[i][i], marked: marks[i][i] }));
        if (line.type === "diag2") return [0, 1, 2, 3].map((i) => ({ card: board[i][3 - i], marked: marks[i][3 - i] }));
        if (line.type === "corners") return [
          { card: board[0][0], marked: marks[0][0] },
          { card: board[0][3], marked: marks[0][3] },
          { card: board[3][0], marked: marks[3][0] },
          { card: board[3][3], marked: marks[3][3] },
        ];
        if (line.type === "center") return [
          { card: board[1][1], marked: marks[1][1] },
          { card: board[1][2], marked: marks[1][2] },
          { card: board[2][1], marked: marks[2][1] },
          { card: board[2][2], marked: marks[2][2] },
        ];
        return [];
      };
      return getCards().every(({ card, marked }) => !marked || calledCards.includes(card));
    }

    // Player claims bingo; validate and notify all clients if win is valid
    socket.on("bingo", ({ lobbyCode, player }) => {
      const game = lobbyGames[lobbyCode];
      if (!game || !game.boards[player] || !game.marks[player]) return;
      const board = game.boards[player];
      const marks = game.marks[player];
      // --- Extra anti-cheat: ensure every marked cell is in called cards ---
      let allMarkedCalled = true;
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          if (marks[row][col] && !game.called.includes(board[row][col])) {
            allMarkedCalled = false;
            break;
          }
        }
        if (!allMarkedCalled) break;
      }
      const line = getWinningLine(marks);
      if (!allMarkedCalled) {
        socket.emit("bingo-error", { message: "You cannot mark cards that have not been called!" });
        return;
      }
      if (checkBingo(marks) && isValidBingo(board, marks, line, game.called)) {
        game.winner = player;
        // Format winner message for both bots and real players
        let winnerDisplay = player;
        // If the player is a bot, ensure AI is at the end (e.g., "Lobo AI")
        if (typeof player === 'string' && player.startsWith('AI ')) {
          // Convert "AI Lobo" to "Lobo AI" for display
          const aiName = player.replace(/^AI /, '');
          winnerDisplay = aiName + ' AI';
        }
        // Broadcast winner event and chat message
        io.to(lobbyCode).emit("winner", winnerDisplay);
        io.to(lobbyCode).emit("chat-message", { name: "System", message: `¡Lotería! ${winnerDisplay} has won the game!` });
      }
    });

    // --- Game Reset ---
    // Reset the game state for the entire lobby (play again functionality)
    socket.on("reset-game", ({ lobbyCode }) => {
      console.log(`[Socket.IO] Game reset requested for lobby: ${lobbyCode}`);
      const game = lobbyGames[lobbyCode];
      if (!game) {
        console.log(`[Socket.IO] No game found for lobby: ${lobbyCode}`);
        return;
      }
      
      // Reset all game state
      game.called = [];
      game.winner = null;
      game.activeWinners = null;
      game.turn = 0;
      game.deck = [];
      
      // Reset all player marks
      Object.keys(game.marks).forEach(player => {
        game.marks[player] = Array(4).fill(null).map(() => Array(4).fill(false));
      });
      
      console.log(`[Socket.IO] Game reset complete for lobby: ${lobbyCode}, notifying ${game.players.length} players`);
      
      // Notify all clients in the lobby to reset their game state
      io.to(lobbyCode).emit("game-reset");
      io.to(lobbyCode).emit("called-cards", []);
      io.to(lobbyCode).emit("chat-message", { name: "System", message: "Game has been reset. Starting a new round!" });
    });
  });

  // Start the server
  const port = process.env.PORT || 3001;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Backend ready on http://localhost:${port}`);
  });
});
