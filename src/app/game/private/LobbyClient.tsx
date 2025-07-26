// Multiplayer Lobby and Game Client for Lotería
// Handles real-time board, chat, player list, and game logic via Socket.IO
// Comments throughout explain each section and important logic.

// Helper to convert display name to image filename (e.g., "La Dama" -> "la-dama")
function toImageName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// --- Bingo logic copied from AI game ---
// Checks if the marks array has a winning bingo (row, col, diag, corners, center)
function checkBingo(marks: boolean[][]): boolean {
  for (let i = 0; i < 4; i++) if (marks[i].every(Boolean)) return true;
  for (let j = 0; j < 4; j++) if (marks.every(row => row[j])) return true;
  if ([0, 1, 2, 3].every(i => marks[i][i])) return true;
  if ([0, 1, 2, 3].every(i => marks[i][3 - i])) return true;
  if (marks[0][0] && marks[0][3] && marks[3][0] && marks[3][3]) return true;
  if (marks[1][1] && marks[1][2] && marks[2][1] && marks[2][2]) return true;
  return false;
}

// Returns the type and index of the winning line, or null if none
function getWinningLine(marks: boolean[][]): { type: 'row' | 'col' | 'diag1' | 'diag2' | 'corners' | 'center', index: number } | null {
  for (let i = 0; i < 4; i++) if (marks[i].every(Boolean)) return { type: 'row', index: i };
  for (let j = 0; j < 4; j++) if (marks.every(row => row[j])) return { type: 'col', index: j };
  if ([0, 1, 2, 3].every(i => marks[i][i])) return { type: 'diag1', index: 0 };
  if ([0, 1, 2, 3].every(i => marks[i][3 - i])) return { type: 'diag2', index: 0 };
  if (marks[0][0] && marks[0][3] && marks[3][0] && marks[3][3]) return { type: 'corners', index: 0 };
  if (marks[1][1] && marks[1][2] && marks[2][1] && marks[2][2]) return { type: 'center', index: 0 };
  return null;
}

// Checks if a bingo is valid: all marked cards in the winning line must have been called
function isValidBingo(board: string[][], marks: boolean[][], line: { type: string, index: number } | null, calledCards: string[]): boolean {
  if (!line) return false;
  const getCards = (): { card: string, marked: boolean }[] => {
    if (line.type === 'row') return board[line.index].map((card, j) => ({ card, marked: marks[line.index][j] }));
    if (line.type === 'col') return board.map((row, i) => ({ card: row[line.index], marked: marks[i][line.index] }));
    if (line.type === 'diag1') return [0, 1, 2, 3].map(i => ({ card: board[i][i], marked: marks[i][i] }));
    if (line.type === 'diag2') return [0, 1, 2, 3].map(i => ({ card: board[i][3 - i], marked: marks[i][3 - i] }));
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
  return getCards().every(({ card, marked }) => !marked || calledCards.includes(card));
}

import { useEffect, useState, useRef } from "react";
import { getSocket } from "../../../lib/socket";
import { requestNotificationPermission, showNotification } from "@/lib/notify";
import LoteriaBoard from "@/components/LoteriaBoard";
import LoteriaCard from "@/components/LoteriaCard";
import { useSettings } from "@/context/SettingsContext";
import { getBoardEdgeStyle } from "@/lib/boardBackgrounds";
import { useIOSDetection, useIOSViewport, useIOSTouch } from "@/hooks/useIOSDetection";

// Helper to fetch all card names from /api/cards and generate a random 4x4 board
async function fetchCardNames(deckTheme?: string): Promise<string[]> {
  const res = await fetch(`/api/cards${deckTheme ? `?deckTheme=${deckTheme}` : ''}`);
  if (!res.ok) return [];
  return res.json();
}
function generateBoardFrom(cardNames: string[]): string[][] {
  const shuffled = [...cardNames].sort(() => Math.random() - 0.5);
  return [
    shuffled.slice(0, 4),
    shuffled.slice(4, 8),
    shuffled.slice(8, 12),
    shuffled.slice(12, 16),
  ];
}

// Main React component for the multiplayer lobby and game
export default function LobbyClient({ lobbyCode, user }: { lobbyCode: string; user: { name: string } }) {
  const { boardEdge, deckTheme } = useSettings();
  const boardEdgeStyle = getBoardEdgeStyle(boardEdge);
  
  // iOS detection and optimization hooks
  const { isIOS } = useIOSDetection();
  const { viewportHeight } = useIOSViewport();
  useIOSTouch();
  
  // --- State ---
  // Player list (real users)
  const [players, setPlayers] = useState<string[]>([user.name]);
  // Bot players (for filling empty seats)
  const [bots, setBots] = useState<string[]>([]);
  // Chat messages
  const [chat, setChat] = useState<{ name: string; message: string }[]>([]);
  // Current chat input
  const [message, setMessage] = useState("");
  // Whether to show the board/game UI
  const [showBoard, setShowBoard] = useState(false);
  // The user's board (4x4 grid of card names)
  const [board, setBoard] = useState<string[][] | null>(null);
  // All boards for all players (by name)
  const [allBoards, setAllBoards] = useState<{ [name: string]: string[][] }>({});
  // Whether the user is the host (first in player list)
  const [isHost, setIsHost] = useState(false);
  // Winner modal state
  const [winner, setWinner] = useState<string | null>(null);
  // Called cards (deck state)
  const [calledCards, setCalledCards] = useState<string[]>([]);
  // All card names (for deck size, always from server deck)
  const [cardNames, setCardNames] = useState<string[]>([]);
  // Marks for the user's board (4x4 boolean grid)
  const [marks, setMarks] = useState(Array(4).fill(null).map(() => Array(4).fill(false)));
  // Whether the game has started
  const [gameStarted, setGameStarted] = useState(false);

  // --- Host controls ---
  // Card calling interval (seconds)
  const [intervalSec, setIntervalSec] = useState(3);
  // Whether card calling is paused
  const [isPaused, setIsPaused] = useState(false);
  // Ref for interval timer
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- Effects ---
  // Reset marks when a new board is set (but not on every render)
  const prevBoardRef = useRef<string[][] | null>(null);
  useEffect(() => {
    if (board && board !== prevBoardRef.current) {
      setMarks(Array(4).fill(null).map(() => Array(4).fill(false)));
      prevBoardRef.current = board;
    }
  }, [board]);

  // Host: Start calling cards when gameStarted is true

  // Host: Start calling cards when gameStarted is true, and not paused
  useEffect(() => {
    if (!isHost || !gameStarted || isPaused || winner) return;
    if (!cardNames.length) return;
    let timeoutId: NodeJS.Timeout | null = null;
    let cancelled = false;
    function scheduleNext() {
      if (cancelled) return;
      timeoutId = setTimeout(() => {
        if (cancelled) return;
        const remaining = cardNames.filter(c => !calledCards.includes(c));
        if (remaining.length === 0) return;
        const next = remaining[Math.floor(Math.random() * remaining.length)];
        const socket = getSocket();
        socket.emit("call-card", { lobbyCode, card: next });
      }, intervalSec * 1000);
    }
    // Listen for confirmation from server before scheduling next
    const socket = getSocket();
    function onCalledCard(card: string) {
      if (!cancelled) scheduleNext();
    }
    socket.on("called-card", onCalledCard);
    // Start the first call immediately if no cards have been called
    if (calledCards.length === 0) {
      const remaining = cardNames.filter(c => !calledCards.includes(c));
      if (remaining.length > 0) {
        const next = remaining[Math.floor(Math.random() * remaining.length)];
        socket.emit("call-card", { lobbyCode, card: next });
      }
    } else {
      scheduleNext();
    }
    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      socket.off("called-card", onCalledCard);
    };
    // eslint-disable-next-line
  }, [isHost, gameStarted, cardNames, calledCards.length, intervalSec, isPaused, winner]);
  // Listen for called card events from server and update deck from server
  useEffect(() => {
    const socket = getSocket();
    socket.on("called-cards", (cards: string[]) => {
      setCalledCards(cards);
    });
    socket.on("mark-card", (payload: { player: string; row: number; col: number }) => {
      const { player, row, col } = payload;
      if (player === user.name) {
        setMarks(prev => {
          const updated = prev.map(arr => [...arr]);
          updated[row][col] = !updated[row][col];
          return updated;
        });
      }
    });
    return () => {
      socket.off("called-cards");
      socket.off("mark-card");
    };
  }, [user.name]);
  // Example: Listen for a winner event from the server (replace with your real win logic)
  useEffect(() => {
    const socket = getSocket();
    socket.on("winner", (winnerName: string) => {
      setWinner(winnerName);
    });
    return () => {
      socket.off("winner");
    };
  }, []);

  // Listen for game reset event
  useEffect(() => {
    const socket = getSocket();
    socket.on("game-reset", () => {
      console.log('[CLIENT] Received game-reset event, resetting game state');
      // Reset all game state to initial values
      setWinner(null);
      setIsPaused(false);
      setGameStarted(false);
      setShowBoard(false);
      setCalledCards([]);
      setMarks(Array(4).fill(null).map(() => Array(4).fill(false)));
      setAllBoards({});
      setBoard(null);
    });
    return () => {
      socket.off("game-reset");
    };
  }, []);

  useEffect(() => {
    // Check notification setting from localStorage
    let notifications = true;
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("notifications");
      notifications = stored ? stored === "true" : true;
      if (notifications) requestNotificationPermission();
    }
    const socket = getSocket();
    
    // Join the lobby room on the server (socket auto-connects)
    socket.emit("join-lobby", lobbyCode, user.name);
    // Listen for new players joining via socket
    socket.on("player-joined", (name: string) => {
      setPlayers((prev) => (prev.includes(name) ? prev : [...prev, name]));
      if (name !== user.name && notifications) {
        showNotification("Player Joined", { body: `${name} joined the lobby!` });
      }
    });
    // Listen for new chat messages via socket
    socket.on("chat-message", (msg: { name: string; message: string }) => {
      setChat((prev) => [...prev, msg]);
    });
    // Determine if user is host (first in player list)
    setIsHost(players[0] === user.name);
    // Listen for start-game event
    socket.on("start-game", (payload: { boards: { [name: string]: string[][] }, deck?: string[] }) => {
      console.log('[CLIENT] Received start-game payload:', payload);
      setAllBoards(payload.boards);
      setBoard(payload.boards[user.name]);
      setMarks(Array(4).fill(null).map(() => Array(4).fill(false)));
      // Use the deck from the server as the source of truth for cardNames
      if (payload.deck && Array.isArray(payload.deck) && payload.deck.length > 0) {
        setCardNames(payload.deck);
      } else {
        // Fallback: try to infer deck from boards if missing (should not happen)
        const allCards = Object.values(payload.boards).flat(2);
        const unique = Array.from(new Set(allCards));
        setCardNames(unique);
        console.warn('[CLIENT] No deck in payload, using fallback unique cards:', unique);
      }
      setShowBoard(true);
      setGameStarted(true); // Start the game for all players
    });
    // Poll for player list from DB every 2 seconds for real-time updates
    const poll = setInterval(async () => {
      const res = await fetch(`/api/lobbies`);
      const lobbies = await res.ok ? await res.json() : [];
      const lobby = Array.isArray(lobbies) ? lobbies.find((l: any) => l.code === lobbyCode) : null;
      if (lobby && Array.isArray(lobby.players)) {
        setPlayers(lobby.players);
      }
    }, 2000);
    // Cleanup on unmount
    return () => {
      socket.disconnect();
      clearInterval(poll);
    };
  }, [lobbyCode, user.name]); // Removed 'players' to prevent re-connection on player list changes

  // Send a chat message to the lobby
  function sendMessage() {
    const socket = getSocket();
    socket.emit("send-chat", lobbyCode, { name: user.name, message });
    setMessage("");
  }

  async function handleStartGame() {
    console.log('[CLIENT] Starting game with lobbyCode:', lobbyCode);
    // If a previous game ended, clear winner state before starting a new game
    setWinner(null);
    setGameStarted(false);
    // Always at least 4 players (real + bots)
    const minPlayers = 4;
    // More realistic AI names
    const aiNames = [
      "Sofía", "Mateo", "Valeria", "Diego", "Camila", "Santiago", "Lucía", "Emilia", "Andrés", "Isabella",
      "Mariana", "Javier", "Paola", "Carlos", "Gabriela", "Luis", "Daniela", "Miguel", "Alejandra", "Juan"
    ];
    let fullPlayers = [...players, ...bots];
    let aiUsed = 0;
    while (fullPlayers.length < minPlayers) {
      // Add unique bot names
      let nextBot = aiNames[aiUsed++ % aiNames.length];
      // Prefix with AI for server logic, but display as a real name
      let aiDisplay = `AI ${nextBot}`;
      if (!fullPlayers.includes(aiDisplay)) {
        fullPlayers.push(aiDisplay);
      }
    }
    console.log('[CLIENT] Full players list:', fullPlayers);
    // Fetch all card names and generate a random board for each player
    const cardNames = await fetchCardNames(deckTheme);
    console.log('[CLIENT] Fetched card names:', cardNames.length, 'cards');
    const boards: { [name: string]: string[][] } = {};
    for (const p of fullPlayers) {
      boards[p] = generateBoardFrom(cardNames);
    }
    console.log('[CLIENT] Generated boards for players:', Object.keys(boards));
    // Emit start-game event to all clients
    const socket = getSocket();
    console.log('[CLIENT] Emitting start-game event, socket connected:', socket.connected);
    
    // Ensure socket is connected before emitting
    if (!socket.connected) {
      console.log('[CLIENT] Socket not connected, attempting to connect...');
      socket.connect();
      // Wait a moment for connection to establish
      await new Promise(resolve => {
        if (socket.connected) {
          resolve(true);
        } else {
          socket.once('connect', () => resolve(true));
          setTimeout(() => resolve(false), 5000); // 5 second timeout
        }
      });
    }
    
    if (socket.connected) {
      socket.emit("start-game", { boards });
      console.log('[CLIENT] Start game event emitted successfully');
    } else {
      console.error('[CLIENT] Failed to connect socket, cannot start game');
      return;
    }
  }

  // System card announcer using Web Speech API
  function announceCard(card: string) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const speak = () => {
      const utter = new window.SpeechSynthesisUtterance(card);
      const voices = window.speechSynthesis.getVoices();
      const esVoice = voices.find(v => v.lang.startsWith('es'));
      if (esVoice) utter.voice = esVoice;
      utter.rate = 0.7;
      utter.pitch = 1.1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    };
    // If voices are not loaded yet, wait for them
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        speak();
        window.speechSynthesis.onvoiceschanged = null;
      };
    } else {
      speak();
    }
  }

  // Announce each new called card (only when a new card is added)
  const prevCalledCardsLen = useRef(0);
  useEffect(() => {
    if (calledCards.length > prevCalledCardsLen.current && calledCards.length > 0) {
      const last = calledCards[calledCards.length - 1];
      announceCard(last);
    }
    prevCalledCardsLen.current = calledCards.length;
  }, [calledCards]);

  // Main container for the multiplayer lobby and game UI with iOS optimizations
  const containerStyle = isIOS ? {
    minHeight: `${viewportHeight}px`,
    height: `${viewportHeight}px`,
  } : {};

  return (
    <div 
      className="min-h-screen-ios bg-[#f8ecd7] dark:bg-[#18181b] bg-[url('/parchment-bg.png')] dark:bg-none bg-cover flex flex-col items-center justify-center py-8 px-2 transition-colors safe-area-top safe-area-bottom safe-area-left safe-area-right ios-transform-gpu no-bounce"
      style={containerStyle}
    >
      {/* App title */}
      <h1 className="text-4xl font-western font-extrabold text-center text-[#8c2f2b] dark:text-yellow-200 tracking-widest drop-shadow mb-8 mt-2 transition-colors">Lotería Multiplayer Lobby</h1>
      <div className="w-full max-w-6xl flex flex-col gap-8 items-center">
        {/* Show lobby only if game has not started */}
        {!showBoard && (
          <div className="flex flex-col md:flex-row gap-10 items-start justify-center w-full">
            {/* Lobby UI: Player list, chat, start button, and bot controls */}
            <div className="flex flex-col items-center w-full max-w-2xl">
              <div className="w-full bg-gradient-to-br from-[#fff8e1]/90 via-[#f7e0b2]/90 to-[#f3d9a4]/90 dark:from-[#232323]/90 dark:to-[#18181b]/90 border-4 border-[#b89c3a] dark:border-yellow-700 rounded-3xl shadow-2xl px-10 py-8 mb-2 drop-shadow-2xl transition-colors relative">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-10">
                  <span className="text-5xl font-western text-[#b89c3a] drop-shadow-lg">🎲</span>
                </div>
                <div className="text-3xl font-western font-extrabold text-center text-[#8c2f2b] dark:text-yellow-200 mb-4 tracking-widest drop-shadow transition-colors">Lobby: <span className="bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded-lg border border-yellow-300 dark:border-yellow-700 text-[#b94a48] dark:text-yellow-200 text-2xl ml-2">{lobbyCode}</span></div>
                {/* Start Game Button (host only) */}
                {isHost && (
                  <div className="flex flex-col items-center mb-4">
                    <button
                      onClick={handleStartGame}
                      className="mb-2 bg-gradient-to-b from-[#e1b866] to-[#b89c3a] text-[#8c2f2b] font-western font-semibold py-3 px-12 rounded-2xl border-2 border-[#8c2f2b] shadow-xl hover:from-[#ffe7a0] hover:to-[#e1b866] hover:text-[#6a1a1a] transition-all duration-150 text-2xl tracking-wider min-h-touch min-w-touch touch-manipulation ios-tap-transparent"
                    >
                      Start Game
                    </button>
                    {/* Bot controls: only show if less than 4 real players */}
                    {players.length + bots.length < 4 && (
                      <div className="mb-2 flex flex-col items-center">
                        <div className="flex gap-2 mb-1">
                          <button
                            className="px-4 py-2 bg-blue-200 text-blue-900 rounded-lg font-semibold border border-blue-400 shadow hover:bg-blue-300 transition-all"
                            onClick={() => {
                              // Add a bot with a unique name
                              const aiNames = [
                                "Sofía", "Mateo", "Valeria", "Diego", "Camila", "Santiago", "Lucía", "Emilia", "Andrés", "Isabella",
                                "Mariana", "Javier", "Paola", "Carlos", "Gabriela", "Luis", "Daniela", "Miguel", "Alejandra", "Juan"
                              ];
                              let nextBot = aiNames.find(name => !players.includes(`AI ${name}`) && !bots.includes(`AI ${name}`));
                              if (nextBot) setBots(prev => [...prev, `AI ${nextBot}`]);
                            }}
                            disabled={players.length + bots.length >= 4}
                          >
                            + Add Bot
                          </button>
                          <button
                            className="px-4 py-2 bg-red-200 text-red-900 rounded-lg font-semibold border border-red-400 shadow hover:bg-red-300 transition-all"
                            onClick={() => setBots(prev => prev.slice(0, -1))}
                            disabled={bots.length === 0}
                          >
                            – Remove Bot
                          </button>
                        </div>
                        <div className="text-xs text-gray-600 italic">Bots will fill empty seats (min 4 players)</div>
                      </div>
                    )}
                  </div>
                )}
                {/* Player list */}
                <div className="mb-6 w-full">
                  <div className="font-semibold mb-2 text-[#8c2f2b] text-lg flex items-center gap-2"><span className="text-xl">👥</span>Players:</div>
                  <ul className="flex flex-wrap gap-3">
                    {players.map((p) => (
                      <li key={p} className="bg-[#ffe7a0] text-[#8c2f2b] px-4 py-2 rounded-full text-base font-semibold border border-[#b89c3a] shadow flex items-center gap-2"><span className="text-lg">🧑</span>{p}</li>
                    ))}
                    {bots.map((b) => (
                      <li key={b} className="bg-blue-100 text-blue-900 px-4 py-2 rounded-full text-base font-semibold border border-blue-400 shadow flex items-center gap-2"><span className="text-lg">🤖</span>{b.replace(/^AI /, "")} <span className="text-xs font-normal">(Bot)</span></li>
                    ))}
                  </ul>
                </div>
                {/* Chat UI */}
                <div className="mb-2 w-full">
                  <div className="font-semibold mb-2 text-[#8c2f2b] text-lg flex items-center gap-2"><span className="text-xl">💬</span>Chat:</div>
                  <div className="bg-[#fff8e1] dark:bg-[#232323] rounded-xl p-3 h-40 overflow-y-auto flex flex-col gap-1 border-2 border-[#e1b866] dark:border-yellow-700 shadow-inner mb-2 transition-colors ios-scroll">
                    {chat.length === 0 && <div className="text-gray-400 italic">No messages yet. Say hello! 👋</div>}
                    {chat.map((msg, i) => (
                      <div key={msg.name + '-' + msg.message + '-' + i} className="flex items-start gap-2">
                        <span className="font-bold text-[#8c2f2b] dark:text-yellow-200">{msg.name}:</span>
                        <span className="text-[#3b2c1a] dark:text-yellow-100">{msg.message}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-1">
                    <input
                      className="flex-1 border-2 border-[#b89c3a] dark:border-yellow-700 rounded-lg p-2 bg-[#fff8e1] dark:bg-[#232323] text-[#3b2c1a] dark:text-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all ios-appearance-none touch-manipulation"
                      style={{ fontSize: '16px' }}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
                      placeholder="Type a message..."
                    />
                    <button onClick={sendMessage} className="bg-[#e1b866] hover:bg-[#ffe7a0] text-[#8c2f2b] px-6 py-2 rounded-lg font-semibold border-2 border-[#b89c3a] shadow transition-all min-h-touch min-w-touch touch-manipulation ios-tap-transparent">Send</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Show game board and deck only if game has started */}
        {showBoard && (
          <div className="flex flex-col md:flex-row gap-10 items-start justify-center w-full">
            {/* Left: Board Area */}
            <div className="flex flex-col items-center w-full max-w-md">
              <div className="font-semibold mb-2 text-[#8c2f2b] dark:text-yellow-200 transition-colors">Your Board</div>
              {board && (
                <div
                  className="p-4 rounded-2xl shadow-2xl w-full border-2 border-[#b89c3a]"
                  style={{
                    minWidth: 420,
                    maxWidth: 640,
                    background: boardEdgeStyle,
                    filter: "brightness(0.93)"
                  }}
                >
                  {/* Lotería board grid, interactive for marking cards */}
                  <LoteriaBoard
                    board={board}
                    marks={marks}
                    onMark={(row, col) => {
                      if (!board) return;
                      // Only emit to server, don't update local state immediately
                      // Wait for server confirmation via "mark-card" event
                      const socket = getSocket();
                      socket.emit("mark-card", { lobbyCode, player: user.name, row, col });
                    }}
                  />
                </div>
              )}
              {/* Game Controls: Reset, Back, Lotería, and host controls */}
              <div className="flex flex-col gap-2 mt-6 mb-2 w-full">
                <div className="flex gap-4">
                  {/* Reset board and game state */}
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    onClick={async () => {
                      if (!gameStarted) {
                        // If the game hasn't started, randomize the board for the user
                        let cards: string[] = cardNames;
                        if (!cards || cards.length < 16) {
                          // Fallback: fetch from API if not available
                          cards = await fetchCardNames(deckTheme);
                        }
                        const newBoard = generateBoardFrom(cards);
                        setBoard(newBoard);
                        setMarks(Array(4).fill(null).map(() => Array(4).fill(false)));
                        setCalledCards([]);
                        // Ensure gameStarted is set to false after board/marks update
                        setTimeout(() => setGameStarted(false), 0);
                        return;
                      }
                      setMarks(Array(4).fill(null).map(() => Array(4).fill(false)));
                      setCalledCards([]);
                      setTimeout(() => setGameStarted(false), 0);
                    }}
                  >
                    Reset
                  </button>
                  {/* Back to lobby */}
                  <button
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
                    onClick={() => setShowBoard(false)}
                  >
                    Back to Lobby
                  </button>
                  {/* Claim Lotería (bingo) */}
                  <button
                    className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 disabled:opacity-50"
                    onClick={() => {
                      if (!board) return;
                      // Debug: print board, marks, calledCards
                      console.log('DEBUG: board', board);
                      console.log('DEBUG: marks', marks);
                      console.log('DEBUG: calledCards', calledCards);
                      const line = getWinningLine(marks);
                      console.log('DEBUG: winning line', line);
                      const bingo = checkBingo(marks);
                      const validBingo = isValidBingo(board, marks, line, calledCards);
                      console.log('DEBUG: checkBingo', bingo, 'isValidBingo', validBingo);
                      if (!line) {
                        alert("No valid Lotería! You must complete a row, column, diagonal, corners, or center.");
                        return;
                      }
                      if (!validBingo) {
                        alert("You cannot claim Lotería unless all marked cards in the winning line have been called!");
                        return;
                      }
                      // New rule: The most recent called card must be in the winning line and marked
                      if (calledCards.length > 0) {
                        const lastCalled = calledCards[calledCards.length - 1];
                        // Get all cards in the winning line that are marked
                        let winningCards: { card: string, marked: boolean }[] = [];
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
                        const lastCardInLine = winningCards.some(({ card, marked }) => marked && card === lastCalled);
                        if (!lastCardInLine) {
                          alert("You can only claim Lotería if the last called card is part of your winning line. Wait for the next card!");
                          return;
                        }
                      }
                      if (bingo) {
                        const socket = getSocket();
                        socket.emit("bingo", { lobbyCode, player: user.name });
                      } else {
                        alert("No valid Lotería! You must complete a row, column, diagonal, corners, or center with called cards.");
                      }
                    }}
                  >
                    ¡Lotería!
                  </button>
                </div>
                {/* Host controls: interval slider and pause/resume */}
                {isHost && gameStarted && (
                  <div className="flex flex-col gap-2 mt-2">
                    <label className="flex items-center gap-3 text-sm font-medium">
                      Card Interval:
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={intervalSec}
                        onChange={e => setIntervalSec(Number(e.target.value))}
                        disabled={isPaused}
                        style={{ width: 140 }}
                        className="appearance-none w-[140px] h-3 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 rounded-lg outline-none transition-all duration-200 shadow-inner
                          disabled:opacity-60
                          [&::-webkit-slider-thumb]:appearance-none
                          [&::-webkit-slider-thumb]:w-6
                          [&::-webkit-slider-thumb]:h-6
                          [&::-webkit-slider-thumb]:bg-yellow-500
                          [&::-webkit-slider-thumb]:rounded-full
                          [&::-webkit-slider-thumb]:shadow-lg
                          [&::-webkit-slider-thumb]:border-2
                          [&::-webkit-slider-thumb]:border-yellow-700
                          [&::-webkit-slider-thumb]:transition-all
                          [&::-webkit-slider-thumb]:duration-200
                          dark:bg-gradient-to-r dark:from-yellow-700 dark:via-yellow-600 dark:to-yellow-400
                          "
                      />
                      <span className="w-10 text-center font-bold text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900 rounded px-2 py-1 shadow-sm border border-yellow-300 dark:border-yellow-700">{intervalSec}s</span>
                    </label>
                    <button
                      className={`flex items-center gap-2 px-5 py-2 rounded-full font-semibold border-2 shadow transition-all duration-200
                        ${isPaused
                          ? 'bg-blue-500 hover:bg-blue-600 border-blue-300 text-white'
                          : 'bg-red-600 hover:bg-red-700 border-yellow-400 text-white'}
                        hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-300`}
                      onClick={() => setIsPaused(p => !p)}
                    >
                      <span className="text-lg">
                        {isPaused ? '▶️' : '⏸️'}
                      </span>
                      <span className="tracking-wide">
                        {isPaused ? 'Resume' : 'Pause'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
              {/* Winner Modal Overlay */}
              {winner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                  <div className="relative flex flex-col items-center">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-10">
                      <span className="text-6xl md:text-7xl font-western font-extrabold text-[#b89c3a] drop-shadow-lg animate-pulse">🏆</span>
                    </div>
                    <div className="bg-gradient-to-b from-[#fff8e1] to-[#e1b866] border-4 border-[#b89c3a] rounded-2xl shadow-2xl px-8 py-6 flex flex-col items-center w-full max-w-md">
                      <h2 className="text-4xl md:text-5xl font-western font-extrabold text-[#8c2f2b] tracking-widest drop-shadow mb-2 animate-winner-glow">¡Lotería!</h2>
                      <div className="text-2xl md:text-3xl font-bold text-green-800 mb-2 animate-winner-glow">Winner: <span className="text-[#b94a48]">{winner}</span></div>
                      <div className="flex gap-2 mt-2 animate-bounce">
                        <span className="text-3xl">🎉</span>
                        <span className="text-3xl">🎊</span>
                        <span className="text-3xl">🎉</span>
                      </div>
                      <div className="flex gap-4 mt-6">
                        <button
                          className="px-6 py-2 bg-[#b89c3a] text-[#8c2f2b] font-bold rounded-xl border-2 border-[#8c2f2b] shadow hover:bg-[#ffe7a0] hover:text-[#6a1a1a] transition-all"
                          onClick={() => {
                            setWinner(null);
                            setIsPaused(false);
                            setGameStarted(false);
                          }}
                        >
                          Close
                        </button>
                        <button
                          className="px-6 py-2 bg-green-600 text-white font-bold rounded-xl border-2 border-green-800 shadow hover:bg-green-700 hover:text-yellow-200 transition-all"
                          onClick={() => {
                            console.log('[CLIENT] Play Again clicked, emitting reset-game event');
                            // Emit reset-game event to reset for entire lobby
                            const socket = getSocket();
                            socket.emit("reset-game", { lobbyCode });
                          }}
                        >
                          Play Again
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Right: Deck/Called Card Area */}
            <div className="flex flex-col items-center w-full max-w-md gap-6">
              <div className="flex flex-col items-center w-full">
                <h2 className="font-semibold mb-2">Deck</h2>
                <div className="relative h-[320px] w-[220px] flex items-end justify-center mt-4">
                  {/*
                    Deck visualization:
                    - If there are cards left to call, show a stack of 3 card backs for a 3D effect (vintage style).
                    - The top card (if any have been called) is shown as a responsive LoteriaCard.
                    - If no cards have been called yet, show a single card back as a placeholder.
                  */}
                  {cardNames.length > calledCards.length && (
                    // Show a stack of 3 card backs for a 3D deck effect (only if there are cards left to call)
                    <>
                      {/* Bottom card (deepest, most faded) */}
                      <div className="absolute left-0 right-0 bottom-4 flex justify-center z-0">
                        <div
                          className="border-2 border-[#b89c3a] rounded-xl shadow w-[220px] h-[320px] flex items-center justify-center text-5xl font-bold select-none rotate-1"
                          style={{
                            background: boardEdgeStyle,
                            filter: 'brightness(0.85)'
                          }}
                        >
                          <span className="opacity-20">🂠</span>
                        </div>
                      </div>
                      {/* Middle card (slightly less faded, blue tint) */}
                      <div className="absolute left-0 right-0 bottom-2 flex justify-center z-0">
                        <div
                          className="border-2 border-[#2d4c4d] rounded-xl shadow w-[220px] h-[320px] flex items-center justify-center text-5xl font-bold select-none rotate-2"
                          style={{
                            background: boardEdgeStyle,
                            filter: 'brightness(0.89)'
                          }}
                        >
                          <span className="opacity-30">🂠</span>
                        </div>
                      </div>
                      {/* Top card (most visible, red tint) */}
                      <div className="absolute left-0 right-0 bottom-0 flex justify-center z-0">
                        <div
                          className="border-2 border-[#8c2f2b] rounded-xl shadow-lg w-[220px] h-[320px] flex items-center justify-center text-5xl font-bold select-none rotate-[-4deg]"
                          style={{
                            background: boardEdgeStyle,
                            filter: 'brightness(0.93)'
                          }}
                        >
                          <span className="opacity-40">🂠</span>
                        </div>
                      </div>
                    </>
                  )}
                  {/*
                    Called card display:
                    - If at least one card has been called, show the most recent called card on top of the deck.
                    - The card is responsive: half the viewport width, but never larger than 340px or smaller than 180px, and keeps card aspect ratio.
                  */}
                  {calledCards.length > 0 ? (
                    <div className="absolute left-0 right-0 bottom-0 flex justify-center z-20 transition-all duration-300">
                      <div className="w-[50vw] max-w-[340px] min-w-[180px] aspect-[11/16] flex items-center justify-center">
                        {/* Show the most recently called card (face up) */}
                        <LoteriaCard key={`${calledCards[calledCards.length - 1]}-${deckTheme}`} name={toImageName(calledCards[calledCards.length - 1])} variant="plain" className="w-full h-full" />
                      </div>
                    </div>
                  ) : (
                    // If no cards have been called yet, show a single card back as a placeholder
                    <div className="absolute left-0 right-0 bottom-0 flex justify-center z-20 transition-all duration-300">
                      <div className="w-[260px] h-[380px] flex items-center justify-center">
                        {/* Placeholder: deck card back (vintage style) */}
                        <div
                          className="border-2 border-[#8c2f2b] rounded-xl shadow-lg w-[220px] h-[320px] flex items-center justify-center text-5xl font-bold select-none"
                          style={{
                            background: boardEdgeStyle,
                            filter: 'brightness(0.93)'
                          }}
                        >
                          <span className="opacity-40">🂠</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {/* Deck/called card count */}
                <div className="mt-4 text-sm text-gray-600 font-medium">
                  {cardNames.length > 0 && (
                    <span>
                      {calledCards.length} called / {cardNames.length} total
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
