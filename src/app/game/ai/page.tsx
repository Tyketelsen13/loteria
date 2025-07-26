"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import LoteriaBoard from "../../../components/LoteriaBoard";
import LoteriaCard from "../../../components/LoteriaCard";
import { useSettings } from "../../../context/SettingsContext";
import { getBoardEdgeStyle } from "../../../lib/boardBackgrounds";
import { useIOSDetection, useIOSViewport, useIOSTouch } from "../../../hooks/useIOSDetection";

// List of fake names for AI bots used in the game
const BOT_FAKE_NAMES = [
  "Ana", "Luis", "Maria", "Carlos", "Sofia", "Miguel", "Valeria", "Diego", "Lucia", "Javier",
  "Camila", "Mateo", "Isabella", "Andres", "Fernanda", "Pablo", "Daniela", "Emilio", "Gabriela"
];

// Helper function to fetch all card names from /api/cards endpoint
async function fetchCardNames(deckTheme?: string): Promise<string[]> {
  let url = `/api/cards${deckTheme ? `?deckTheme=${deckTheme}` : ''}`;
  // If running on server, use absolute URL
  if (typeof window === "undefined" && process.env.NEXT_PUBLIC_VERCEL_URL) {
    url = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/cards${deckTheme ? `?deckTheme=${deckTheme}` : ''}`;
  }
  const res = await fetch(url);
  if (!res.ok) return [];
  // Defensive: If response is not JSON, return []
  try {
    return await res.json();
  } catch {
    return [];
  }
}

// Main AI Game Page component
export default function AIGamePage() {
  const router = useRouter();
  const { boardEdge, deckTheme } = useSettings();
  const boardEdgeStyle = getBoardEdgeStyle(boardEdge);
  
  // iOS detection and optimization hooks
  const { isIOS } = useIOSDetection();
  const { viewportHeight } = useIOSViewport();
  useIOSTouch();
  
  // Minimum 3 bots (4 total players), maximum 19 bots (20 total players)
  const [showAIBoards, setShowAIBoards] = useState(false);
  // numBots is the value used for the current boards; pendingNumBots is the input value
  const [numBots, setNumBots] = useState(3);
  const [pendingNumBots, setPendingNumBots] = useState(3);
  const [botNames, setBotNames] = useState(() => Array.from({ length: 3 }, (_, i) => BOT_FAKE_NAMES[i % BOT_FAKE_NAMES.length]));
  const [cardNames, setCardNames] = useState<string[]>([]);
  const [userBoard, setUserBoard] = useState<string[][] | null>(null);
  const [aiBoards, setAIBoards] = useState<string[][][]>([]);
  const [marks, setMarks] = useState(Array(4).fill(null).map(() => Array(4).fill(false)));
  const [aiMarks, setAIMarks] = useState<Array<boolean[][]>>([]);
  const [activePlayers, setActivePlayers] = useState<number[]>(() => Array.from({ length: 4 }, (_, i) => i));
  const [winner, setWinner] = useState<string | null>(null);
  const [finalWinners, setFinalWinners] = useState<number[] | null>(null);
  const [winningLine, setWinningLine] = useState<{ type: string, index: number } | null>(null);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [lastCalledCard, setLastCalledCard] = useState<string | null>(null);
  const [intervalSec, setIntervalSec] = useState(4);
  const [calledCards, setCalledCards] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Called cards paging state (must be after calledCards)
  const [calledPage, setCalledPage] = useState(0);
  // (showAIBoards state moved to top of function to fix hook order)
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // When calledCards changes, update the page to the latest
  useEffect(() => {
    // Update the called cards page to the latest when calledCards changes
    if (calledCards.length > 0) {
      setCalledPage(Math.floor((calledCards.length - 1) / 3));
    }
  }, [calledCards.length]);

  useEffect(() => {
    // Fetch card names and initialize boards when number of bots changes
    setLoading(true);
    setError(null);
    fetchCardNames(deckTheme).then(names => {
      if (!names || names.length < 16) {
        setError("No cards found or not enough cards in /public/cards. At least 16 required.");
        setLoading(false);
        return;
      }
      setCardNames(names);
      setUserBoard(generateBoardFrom(names));
      setAIBoards(Array.from({ length: numBots }, () => generateBoardFrom(names)));
      setAIMarks(Array.from({ length: numBots }, () => Array(4).fill(null).map(() => Array(4).fill(false))));
      setActivePlayers(Array.from({ length: numBots + 1 }, (_, i) => i));
      setBotNames(Array.from({ length: numBots }, (_, i) => BOT_FAKE_NAMES[i % BOT_FAKE_NAMES.length]));
      setLoading(false);
    }).catch(e => {
      setError("Failed to load cards: " + e.message);
      setLoading(false);
    });
    // eslint-disable-next-line
  }, [numBots, deckTheme]);

  useEffect(() => {
    // Speak the last called card using browser speech synthesis
    if (lastCalledCard) {
      const utter = new window.SpeechSynthesisUtterance(lastCalledCard);
      // Try to use a more exciting Spanish voice
      const voices = window.speechSynthesis.getVoices();
      // Prefer Google/Microsoft/"español" Spanish voices for more expressive sound
      const exciting = voices.find(v => v.lang.startsWith('es') && (/google|microsoft|español/i).test(v.name))
        || voices.find(v => v.lang.startsWith('es'));
      if (exciting) utter.voice = exciting;
      utter.lang = exciting?.lang || "es-MX";
      utter.rate = 0.9; // a bit faster, but still clear
      utter.pitch = 1.3; // higher pitch for excitement
      utter.volume = 1;
      window.speechSynthesis.speak(utter);
    }
  }, [lastCalledCard]);

  useEffect(() => {
    // Automatically call cards at interval when game is started and not paused
    if (started && !winner && !paused) {
      intervalRef.current = setInterval(() => {
        callCard();
      }, intervalSec * 1000);
      return () => clearInterval(intervalRef.current!);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [started, winner, paused, calledCards, intervalSec]);

  // Resets the game state and regenerates boards when Generate Boards is clicked
  function resetGame() {
    setNumBots(pendingNumBots);
    setWinner(null);
    setStarted(false);
    setMarks(Array(4).fill(null).map(() => Array(4).fill(false)));
    setAIMarks(Array.from({ length: pendingNumBots }, () => Array(4).fill(null).map(() => Array(4).fill(false))));
    setCalledCards([]);
    if (cardNames.length >= 16) {
      setUserBoard(generateBoardFrom(cardNames));
      setAIBoards(Array.from({ length: pendingNumBots }, () => generateBoardFrom(cardNames)));
    }
    setActivePlayers(Array.from({ length: pendingNumBots + 1 }, (_, i) => i));
    setFinalWinners(null);
    setWinningLine(null);
    setPaused(false);
    setLastCalledCard(null);
  }

  // Starts the game
  function handleStartGame() {
    setStarted(true);
  }

  // Handles marking a cell on the user's board
  function handleMark(row: number, col: number) {
    setMarks(m => {
      const newMarks = m.map((r, i) => i === row ? r.map((c, j) => j === col ? !c : c) : r);
      if (!winner && checkBingo(newMarks)) {
        const line = getWinningLine(newMarks);
        if (userBoard && isValidBingo(userBoard, newMarks, line, calledCards)) {
          const eligible = finalWinners && finalWinners.length > 1 ? finalWinners : activePlayers;
          const winners: number[] = [];
          if (eligible.includes(0)) winners.push(0);
          aiMarks.forEach((aiM, idx) => {
            if (eligible.includes(idx + 1) && checkBingo(aiM)) {
              const aiLine = getWinningLine(aiM);
              if (isValidBingo(aiBoards[idx], aiM, aiLine, calledCards)) winners.push(idx + 1);
            }
          });
          if (winners.length === 1) {
            setWinner(winners[0] === 0 ? "You" : botNames[winners[0] - 1]);
            setWinningLine(line);
            setFinalWinners([winners[0]]);
          } else if (winners.length > 1) {
            // If more than one winner, remove their boards from play and continue with remaining players
            // Remove the winning line from their marks so they must get another bingo
            const updatedAIMarks = aiMarks.map((aiM, idx) => {
              if (winners.includes(idx + 1)) {
                // Remove the winning line from this AI's marks
                const newMarks = aiM.map(row => [...row]);
                const winLine = getWinningLine(aiM);
                if (winLine) {
                  if (winLine.type === 'row') newMarks[winLine.index] = [false, false, false, false];
                  if (winLine.type === 'col') for (let i = 0; i < 4; i++) newMarks[i][winLine.index] = false;
                  if (winLine.type === 'diag1') for (let i = 0; i < 4; i++) newMarks[i][i] = false;
                  if (winLine.type === 'diag2') for (let i = 0; i < 4; i++) newMarks[i][3 - i] = false;
                  if (winLine.type === 'corners') {
                    newMarks[0][0] = false; newMarks[0][3] = false; newMarks[3][0] = false; newMarks[3][3] = false;
                  }
                  if (winLine.type === 'center') {
                    newMarks[1][1] = false; newMarks[1][2] = false; newMarks[2][1] = false; newMarks[2][2] = false;
                  }
                }
                return newMarks;
              }
              return aiM;
            });
            let newUserMarks = marks;
            if (winners.includes(0)) {
              // Remove the winning line from the user's marks
              const winLine = getWinningLine(marks);
              if (winLine) {
                const m = marks.map(row => [...row]);
                if (winLine.type === 'row') m[winLine.index] = [false, false, false, false];
                if (winLine.type === 'col') for (let i = 0; i < 4; i++) m[i][winLine.index] = false;
                if (winLine.type === 'diag1') for (let i = 0; i < 4; i++) m[i][i] = false;
                if (winLine.type === 'diag2') for (let i = 0; i < 4; i++) m[i][3 - i] = false;
                if (winLine.type === 'corners') {
                  m[0][0] = false; m[0][3] = false; m[3][0] = false; m[3][3] = false;
                }
                if (winLine.type === 'center') {
                  m[1][1] = false; m[1][2] = false; m[2][1] = false; m[2][2] = false;
                }
                newUserMarks = m;
              }
            }
            setAIMarks(updatedAIMarks);
            setMarks(newUserMarks);
            setFinalWinners(winners);
            setActivePlayers(winners);
            setWinningLine(line);
          } else {
            setWinningLine(line);
          }
        } else {
          setWinningLine(line);
        }
      }
      return newMarks;
    });
  }

  // Toggles pause/resume state
  function handlePauseResume() {
    setPaused(p => !p);
  }

  // Calls a new card and updates marks for all boards
  function callCard() {
    if (winner || !cardNames.length) return;
    const remaining = cardNames.filter(c => !calledCards.includes(c));
    if (!remaining.length) return;
    const next = remaining[Math.floor(Math.random() * remaining.length)];
    setCalledCards([...calledCards, next]);
    setLastCalledCard(next);
    setAIMarks(prevAIMarks => {
      const newAIMarks = prevAIMarks.map((board, b) =>
        board.map((row, i) =>
          row.map((marked, j) => aiBoards[b][i][j] === next ? true : marked)
        )
      );
      const eligible = finalWinners && finalWinners.length > 1 ? finalWinners : activePlayers;
      const winners: number[] = [];
      if (eligible.includes(0) && checkBingo(marks)) {
        const line = getWinningLine(marks);
        if (userBoard && isValidBingo(userBoard, marks, line, [...calledCards, next])) winners.push(0);
      }
      newAIMarks.forEach((aiM, idx) => {
        if (eligible.includes(idx + 1) && checkBingo(aiM)) {
          const aiLine = getWinningLine(aiM);
          if (isValidBingo(aiBoards[idx], aiM, aiLine, [...calledCards, next])) winners.push(idx + 1);
        }
      });
      if (winners.length === 1) {
        setWinner(winners[0] === 0 ? "You" : botNames[winners[0] - 1]);
        setWinningLine(getWinningLine(winners[0] === 0 ? marks : newAIMarks[winners[0] - 1]));
        setFinalWinners([winners[0]]);
      } else if (winners.length > 1) {
        setFinalWinners(winners);
        setActivePlayers(winners);
        setWinningLine(getWinningLine(winners[0] === 0 ? marks : newAIMarks[winners[0] - 1]));
      }
      return newAIMarks;
    });
  }

  // The full JSX UI rendering block goes here (you already had it)
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-lg text-gray-600">
        Loading cards for your game...
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-lg text-red-600">
        {error}
      </div>
    );
  }
  if (!userBoard || !aiBoards.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-lg text-gray-600">
        Preparing boards...
      </div>
    );
  }
  // (removed duplicate, now only declared once at the top)
  // AI Game page styled with vintage/western theme with iOS optimizations
  const containerStyle = isIOS ? {
    minHeight: `${viewportHeight}px`,
    height: `${viewportHeight}px`,
  } : {};

  return (
    <div 
      className="min-h-screen-ios bg-[#f8ecd7] dark:bg-[#18181b] bg-[url('/parchment-bg.png')] dark:bg-none bg-cover flex flex-col items-center justify-center py-8 px-2 transition-colors safe-area-top safe-area-bottom safe-area-left safe-area-right ios-transform-gpu no-bounce"
      style={containerStyle}
    >
      {/* Main heading */}
      <h1 className="text-4xl font-western font-extrabold text-center text-[#8c2f2b] dark:text-yellow-200 tracking-widest drop-shadow mb-8 mt-2 transition-colors">Lotería AI Game</h1>
      <div className="w-full max-w-6xl flex flex-col gap-8 items-center">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-6 items-center justify-center bg-[#fff8e1]/80 dark:bg-[#232323]/80 border-4 border-[#b89c3a] dark:border-yellow-700 rounded-2xl shadow-xl px-8 py-5 mb-2 w-full max-w-2xl mx-auto drop-shadow-lg transition-colors">
          <div className="flex flex-col items-center sm:items-start flex-1">
            <label className="text-lg font-western text-[#8c2f2b] dark:text-yellow-200 mb-1 tracking-wider drop-shadow transition-colors">Number of Bots</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={3}
                max={19}
                value={pendingNumBots}
                onChange={e => {
                  const val = Math.max(3, Math.min(19, Number(e.target.value)));
                  setPendingNumBots(val);
                }}
                className="border-2 border-[#b89c3a] dark:border-yellow-700 bg-[#fff8e1] dark:bg-[#232323] rounded-lg px-3 py-2 w-20 text-center text-lg font-bold shadow-inner focus:outline-none focus:ring-2 focus:ring-[#e1b866] transition-all duration-150 ios-appearance-none touch-manipulation"
                style={{ fontSize: '16px' }}
                disabled={started}
              />
              <span className="ml-2 text-base text-[#3b2c1a] dark:text-gray-200 font-semibold bg-[#e1b866]/60 dark:bg-yellow-900/60 px-3 py-1 rounded-lg border border-[#b89c3a] dark:border-yellow-700 shadow-sm transition-colors">Total players: <span className="text-blue-600 dark:text-blue-400 font-bold">{pendingNumBots + 1}</span></span>
            </div>
          </div>
          <div className="flex flex-col items-center sm:items-end flex-1 mt-4 sm:mt-0 w-full">
            <label className="text-lg font-western text-[#8c2f2b] dark:text-yellow-200 mb-1 tracking-wider drop-shadow transition-colors">Time Between Cards</label>
            <div className="flex items-center gap-3 w-full">
              <input
                type="range"
                min={1}
                max={10}
                value={intervalSec}
                onChange={e => setIntervalSec(Number(e.target.value))}
                className="w-32 accent-[#b89c3a]"
                disabled={started}
              />
              <span className="text-base text-[#3b2c1a] dark:text-gray-200 font-semibold bg-[#e1b866]/60 dark:bg-yellow-900/60 px-3 py-1 rounded-lg border border-[#b89c3a] dark:border-yellow-700 shadow-sm transition-colors">{intervalSec} sec</span>
            </div>
            <button
              className="mt-4 px-6 py-2 bg-gradient-to-b from-[#e1b866] to-[#b89c3a] text-[#8c2f2b] font-western text-lg rounded-xl border-2 border-[#8c2f2b] shadow-lg hover:from-[#ffe7a0] hover:to-[#e1b866] hover:text-[#6a1a1a] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed tracking-wider drop-shadow"
              onClick={resetGame}
              disabled={loading || started}
            >
              <span className="inline-flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#8c2f2b]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Generate Boards
              </span>
            </button>
          </div>
        </div>
        <div className="flex flex-row gap-10 items-start justify-center w-full">
          {/* Left: User Board */}
          <div className="flex flex-col items-center w-full max-w-md">
            <h2 className="font-western text-xl font-bold mb-2 text-white bg-[#8c2f2b] px-4 py-2 rounded-xl border-2 border-[#b89c3a] shadow-lg tracking-wider text-center transition-colors">Your Board</h2>
            {userBoard && (
              <div
                className="p-4 rounded-2xl shadow-2xl w-full border-2 border-[#b89c3a]"
                style={{
                  minWidth: 420,
                  maxWidth: 640,
                  background: boardEdgeStyle,
                  filter: "brightness(0.93)"
                }}
              >
                <LoteriaBoard
                  board={userBoard}
                  marks={marks}
                  onMark={started ? handleMark : undefined}
                />
              </div>
            )}
            <div className="flex gap-4 mt-4 mb-2">
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                onClick={handleStartGame}
                disabled={started || loading}
              >
                Start Game
              </button>
              <button
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
                onClick={handlePauseResume}
                disabled={!started || !!winner}
              >
                {paused ? "Resume" : "Pause"}
              </button>
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                onClick={resetGame}
              >
                Reset
              </button>
            </div>
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              onClick={() => setShowAIBoards(v => !v)}
            >
              {showAIBoards ? "Hide AI Boards" : "Show AI Boards"}
            </button>
            {showAIBoards && (
              <div className="w-full mt-4">
                <h2 className="font-western text-xl font-bold mb-2 text-white bg-[#8c2f2b] px-4 py-2 rounded-xl border-2 border-[#b89c3a] shadow-lg tracking-wider text-center transition-colors">AI Bots ({numBots})</h2>
                <div className="flex flex-col items-center gap-10">
                  {aiBoards.map((board, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl shadow-2xl border-2 border-[#b89c3a] flex flex-col items-center"
                      style={{
                        minWidth: 320,
                        maxWidth: 420,
                        background: boardEdgeStyle,
                        filter: "brightness(0.93)"
                      }}
                    >
                      <div className="font-western text-lg font-bold mb-3 text-white bg-blue-600 px-4 py-2 rounded-xl border-2 border-blue-500 shadow-xl tracking-wider text-center w-full transform hover:scale-105 transition-all duration-200" style={{letterSpacing: '0.08em'}}>
                        {botNames[idx]}
                      </div>
                      <LoteriaBoard
                        board={board}
                        marks={aiMarks[idx]}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                        onClick={() => setWinner(null)}
                      >
                        Close
                      </button>
                      <button
                        className="px-6 py-2 bg-green-600 text-white font-bold rounded-xl border-2 border-green-800 shadow hover:bg-green-700 hover:text-yellow-200 transition-all"
                        onClick={resetGame}
                      >
                        Play Again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Right: Called Cards */}
          <div className="flex flex-col items-center w-full max-w-md">
            <h2 className="font-semibold mb-2">Deck</h2>
            <div className="relative h-[320px] w-[220px] flex items-end justify-center mt-4">
              {/* Deck: show a stack of 3 card backs for a 3D effect if there are cards left to call */}
              {cardNames.length > calledCards.length && (
                <>
                  {/* Enhanced vintage color deck backs */}
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
                </>
              )}
              {/* Called card: show the most recent called card on top */}
              {calledCards.length > 0 ? (
                <div className="absolute left-0 right-0 bottom-0 flex justify-center z-20 transition-all duration-300">
                  <div className="w-[50vw] max-w-[340px] min-w-[180px] aspect-[11/16] flex items-center justify-center">
                    {/* Called card is now responsive: half the viewport width, but never larger than 340px or smaller than 180px, and keeps card aspect ratio */}
                    <LoteriaCard key={`${calledCards[calledCards.length - 1]}-${deckTheme}`} name={calledCards[calledCards.length - 1]} variant="plain" className="w-full h-full" />
                  </div>
                </div>
              ) : (
                <div className="absolute left-0 right-0 bottom-0 flex justify-center z-20 transition-all duration-300">
                  <div className="w-[260px] h-[380px] flex items-center justify-center">
                    {/* Show a deck card back with vintage style */}
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
            <div className="mt-4 text-sm text-gray-600 font-medium">
              {cardNames.length > 0 && (
                <>
                  {calledCards.length} called / {cardNames.length} total
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Generates a 4x4 board from a shuffled list of card names
function generateBoardFrom(cardNames: string[]): string[][] {
  const shuffled = [...cardNames].sort(() => Math.random() - 0.5);
  return [shuffled.slice(0, 4), shuffled.slice(4, 8), shuffled.slice(8, 12), shuffled.slice(12, 16)];
}

// Checks if a board has a bingo (row, column, diagonal, corners, or center)
function checkBingo(marks: boolean[][]): boolean {
  for (let i = 0; i < 4; i++) if (marks[i].every(Boolean)) return true;
  for (let j = 0; j < 4; j++) if (marks.every(row => row[j])) return true;
  if ([0, 1, 2, 3].every(i => marks[i][i])) return true;
  if ([0, 1, 2, 3].every(i => marks[i][3 - i])) return true;
  if (marks[0][0] && marks[0][3] && marks[3][0] && marks[3][3]) return true;
  if (marks[1][1] && marks[1][2] && marks[2][1] && marks[2][2]) return true;
  return false;
}

// Returns the type and index of the winning line if bingo, otherwise null
function getWinningLine(marks: boolean[][]): { type: 'row' | 'col' | 'diag1' | 'diag2' | 'corners' | 'center', index: number } | null {
  for (let i = 0; i < 4; i++) if (marks[i].every(Boolean)) return { type: 'row', index: i };
  for (let j = 0; j < 4; j++) if (marks.every(row => row[j])) return { type: 'col', index: j };
  if ([0, 1, 2, 3].every(i => marks[i][i])) return { type: 'diag1', index: 0 };
  if ([0, 1, 2, 3].every(i => marks[i][3 - i])) return { type: 'diag2', index: 0 };
  if (marks[0][0] && marks[0][3] && marks[3][0] && marks[3][3]) return { type: 'corners', index: 0 };
  if (marks[1][1] && marks[1][2] && marks[2][1] && marks[2][2]) return { type: 'center', index: 0 };
  return null;
}

// Checks if the winning line is valid (all marked cards have been called)
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
