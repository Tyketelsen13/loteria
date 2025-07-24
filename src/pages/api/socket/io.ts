
import { Server } from "socket.io";
import { NextApiRequest, NextApiResponse } from "next";
import type { NextApiResponseServerIO } from "@/types/next";
import fs from "fs";
import path from "path";

// --- DEBUG: Log when handler is called ---
console.log("[Socket.IO] API handler invoked");

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse & NextApiResponseServerIO
) {
  // --- Ensure singleton Socket.IO server ---
  if (!res.socket.server.io) {
    console.log("[Socket.IO] Initializing new server instance");
    const io = new Server(res.socket.server, {
      path: "/api/socket/io",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });
    res.socket.server.io = io;
    // Attach a property to global for debugging
    // (Optional) Attach to global for debugging in dev, but avoid type error
    // (no-op for type safety)
    // --- In-memory game state per lobby ---
    type LobbyGame = {
      boards: { [name: string]: string[][] };
      turnOrder: string[];
      deck: string[];
      turn: number;
      called: string[];
      marks: { [player: string]: boolean[][] };
      winner: string | null;
      players: { id: string; name: string }[];
    };
    const lobbyGames: { [lobbyCode: string]: LobbyGame } = {};
    io.on("connection", (socket) => {
      console.log(`[Socket.IO] Client connected: ${socket.id}`);
      socket.on("join-lobby", (lobbyCode, user) => {
        socket.join(lobbyCode);
        if (!lobbyGames[lobbyCode]) {
          lobbyGames[lobbyCode] = {
            boards: {}, turnOrder: [], deck: [], turn: 0, called: [], marks: {}, winner: null, players: []
          };
        }
        if (!lobbyGames[lobbyCode].players.some(p => p.id === socket.id)) {
          lobbyGames[lobbyCode].players.push({ id: socket.id, name: user });
        }
        io.to(lobbyCode).emit("player-list", lobbyGames[lobbyCode].players);
        io.to(lobbyCode).emit("player-joined", user);
      });
      socket.on("leave-lobby", (lobbyCode) => {
        socket.leave(lobbyCode);
        if (lobbyGames[lobbyCode]) {
          lobbyGames[lobbyCode].players = lobbyGames[lobbyCode].players.filter(p => p.id !== socket.id);
          io.to(lobbyCode).emit("player-list", lobbyGames[lobbyCode].players);
        }
      });
      socket.on("disconnecting", () => {
        for (const lobbyCode of socket.rooms) {
          if (lobbyGames[lobbyCode]) {
            lobbyGames[lobbyCode].players = lobbyGames[lobbyCode].players.filter(p => p.id !== socket.id);
            io.to(lobbyCode).emit("player-list", lobbyGames[lobbyCode].players);
          }
        }
      });
      socket.on("send-chat", (lobbyCode, message) => {
        io.to(lobbyCode).emit("chat-message", message);
      });
      socket.on("call-card", ({ lobbyCode, card }) => {
        const game = lobbyGames[lobbyCode];
        if (!game || !card || game.called.includes(card)) return;
        game.called.push(card);
        // Always emit the full called-cards array after every call, including the first
        io.to(lobbyCode).emit("called-cards", game.called);
        // Optionally, emit the single called card for host's interval logic
        io.to(lobbyCode).emit("called-card", card);
      });
      socket.on("start-game", (payload) => {
        const lobbyCode = Array.from(socket.rooms).find((r) => r !== socket.id);
        if (lobbyCode && payload && payload.boards) {
          const cardsDir = path.join(process.cwd(), "public", "cards");
          const files = fs.readdirSync(cardsDir);
          const cardNames = files
            .filter(f => f.endsWith(".png") || f.endsWith(".jpg"))
            .map(f =>
              f
                .replace(/\.(png|jpg)$/, "")
                .replace(/-/g, " ")
                .replace(/\b\w/g, l => l.toUpperCase())
            );
          const deck = [...cardNames].sort(() => Math.random() - 0.5);
          const playerNames = Object.keys(payload.boards);
          const boards: { [name: string]: string[][] } = {};
          playerNames.forEach(name => {
            const shuffled = [...cardNames].sort(() => Math.random() - 0.5);
            boards[name] = [
              shuffled.slice(0, 4),
              shuffled.slice(4, 8),
              shuffled.slice(8, 12),
              shuffled.slice(12, 16),
            ];
          });
          const turnOrder = playerNames.sort(() => Math.random() - 0.5);
          lobbyGames[lobbyCode] = {
            boards,
            turnOrder,
            deck,
            turn: 0,
            called: [],
            marks: {},
            winner: null,
            players: lobbyGames[lobbyCode]?.players || playerNames.map(name => ({ id: '', name }))
          };
          io.to(lobbyCode).emit("start-game", {
            boards,
            turnOrder,
            deck,
            turn: 0,
            called: [],
            currentPlayer: turnOrder[0],
            card: deck[0]
          });
          io.to(lobbyCode).emit("called-cards", []); // Reset called cards for all clients
        }
      });
      socket.on("next-turn", (lobbyCode) => {
        const game = lobbyGames[lobbyCode];
        if (!game || game.winner) return;
        game.turn++;
        if (game.turn >= game.deck.length) return;
        const currentPlayer = game.turnOrder[game.turn % game.turnOrder.length];
        const card = game.deck[game.turn];
        game.called.push(card);
        io.to(lobbyCode).emit("next-turn", {
          turn: game.turn,
          currentPlayer,
          card,
          called: game.called
        });
      });
      socket.on("mark-card", ({ lobbyCode, player, row, col }) => {
        const game = lobbyGames[lobbyCode];
        if (!game) return;
        if (!game.marks[player]) {
          game.marks[player] = Array(4).fill(null).map(() => Array(4).fill(false));
        }
        game.marks[player][row][col] = true;
        io.to(lobbyCode).emit("mark-card", { player, row, col });
      });
      // --- Bingo validation logic ---
      function checkBingo(marks: boolean[][]): boolean {
        for (let i = 0; i < 4; i++) if (marks[i].every(Boolean)) return true;
        for (let j = 0; j < 4; j++) if (marks.every((row: boolean[]) => row[j])) return true;
        if ([0, 1, 2, 3].every(i => marks[i][i])) return true;
        if ([0, 1, 2, 3].every(i => marks[i][3 - i])) return true;
        if (marks[0][0] && marks[0][3] && marks[3][0] && marks[3][3]) return true;
        if (marks[1][1] && marks[1][2] && marks[2][1] && marks[2][2]) return true;
        return false;
      }
      function getWinningLine(marks: boolean[][]): { type: 'row' | 'col' | 'diag1' | 'diag2' | 'corners' | 'center', index: number } | null {
        for (let i = 0; i < 4; i++) if (marks[i].every(Boolean)) return { type: 'row', index: i };
        for (let j = 0; j < 4; j++) if (marks.every((row: boolean[]) => row[j])) return { type: 'col', index: j };
        if ([0, 1, 2, 3].every(i => marks[i][i])) return { type: 'diag1', index: 0 };
        if ([0, 1, 2, 3].every(i => marks[i][3 - i])) return { type: 'diag2', index: 0 };
        if (marks[0][0] && marks[0][3] && marks[3][0] && marks[3][3]) return { type: 'corners', index: 0 };
        if (marks[1][1] && marks[1][2] && marks[2][1] && marks[2][2]) return { type: 'center', index: 0 };
        return null;
      }
      function isValidBingo(
        board: string[][],
        marks: boolean[][],
        line: { type: string; index: number } | null,
        calledCards: string[]
      ): boolean {
        if (!line) return false;
        const getCards = (): { card: string; marked: boolean }[] => {
          if (line.type === 'row') return board[line.index].map((card: string, j: number) => ({ card, marked: marks[line.index][j] }));
          if (line.type === 'col') return board.map((row: string[], i: number) => ({ card: row[line.index], marked: marks[i][line.index] }));
          if (line.type === 'diag1') return [0, 1, 2, 3].map((i: number) => ({ card: board[i][i], marked: marks[i][i] }));
          if (line.type === 'diag2') return [0, 1, 2, 3].map((i: number) => ({ card: board[i][3 - i], marked: marks[i][3 - i] }));
          if (line.type === 'corners') return [
            { card: board[0][0], marked: marks[0][0] },
            { card: board[0][3], marked: marks[0][3] },
            { card: board[3][0], marked: marks[3][0] },
            { card: board[3][3], marked: marks[3][3] }
          ];
          if (line.type === 'center') return [
            { card: board[1][1], marked: marks[1][1] },
            { card: board[1][2], marked: marks[1][2] },
            { card: board[2][1], marked: marks[2][1] },
            { card: board[2][2], marked: marks[2][2] }
          ];
          return [];
        };
        return getCards().every(({ card, marked }: { card: string; marked: boolean }) => !marked || calledCards.includes(card));
      }
      socket.on("bingo", ({ lobbyCode, player }) => {
        const game = lobbyGames[lobbyCode];
        if (!game || game.winner) return;
        const board = game.boards[player];
        const marks = game.marks[player];
        if (!board || !marks) return;
        if (!checkBingo(marks)) return;
        const line = getWinningLine(marks);
        if (!isValidBingo(board, marks, line, game.called)) return;
        game.winner = player;
        // Emit both "winner" and "bingo" for compatibility with frontend
        io.to(lobbyCode).emit("winner", player);
        io.to(lobbyCode).emit("bingo", { winner: player });
      });
    });
  } else {
    // Already initialized
    // Optionally log for debug
    // console.log("[Socket.IO] Server already initialized");
  }
  res.end();
}
