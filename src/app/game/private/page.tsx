"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import LobbyClient from "./LobbyClient";
import UserInfo from "../../../components/UserInfo";

// Helper to generate a random 6-character lobby code
function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function PrivateLobbyPage() {
  const searchParams = useSearchParams();
  
  // State for lobby code, join code, join status, and user name
  const [lobbyCode, setLobbyCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joined, setJoined] = useState(false);
  const [userName, setUserName] = useState("");
  const [pendingName, setPendingName] = useState("");

  // Check for code in URL parameters and auto-join if present
  useEffect(() => {
    if (!searchParams) return;
    const urlCode = searchParams.get('code');
    if (urlCode && userName && !joined) {
      // Auto-join if code is provided in URL
      autoJoinLobby(urlCode.toUpperCase());
    }
  }, [userName, joined, searchParams]);

  // Auto-join function for URL-provided codes
  async function autoJoinLobby(code: string) {
    try {
      // Fetch all lobbies to find the one matching the code
      const res = await fetch(`/api/lobbies`);
      let lobbies = [];
      try {
        if (res.ok) {
          lobbies = await res.json();
        }
      } catch (err) {
        lobbies = [];
      }
      // Find the lobby and update the player list
      const lobby = Array.isArray(lobbies) ? lobbies.find((l: any) => l.code === code) : null;
      let players = lobby && Array.isArray(lobby.players) ? lobby.players : [];
      if (!players.includes(userName)) players = [...players, userName];
      await fetch("/api/lobbies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, players }),
      });
      setLobbyCode(code);
      setJoined(true);
    } catch (error) {
      console.error('Error auto-joining lobby:', error);
      // If auto-join fails, user can still manually enter code
    }
  }

  // Create a new lobby and add the user as the first player
  async function handleCreateLobby() {
    const code = generateCode();
    await fetch("/api/lobbies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, players: [userName], host: userName }),
    });
    setLobbyCode(code);
    setJoined(true);
  }

  // Join an existing lobby by code, adding the user to the player list in DB
  async function handleJoinLobby(e: React.FormEvent) {
    e.preventDefault();
    if (joinCode.length === 6) {
      const code = joinCode.toUpperCase();
      // Fetch all lobbies to find the one matching the code
      const res = await fetch(`/api/lobbies`);
      let lobbies = [];
      try {
        if (res.ok) {
          lobbies = await res.json();
        }
      } catch (err) {
        lobbies = [];
      }
      // Find the lobby and update the player list
      const lobby = Array.isArray(lobbies) ? lobbies.find((l: any) => l.code === code) : null;
      let players = lobby && Array.isArray(lobby.players) ? lobby.players : [];
      if (!players.includes(userName)) players = [...players, userName];
      await fetch("/api/lobbies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, players }),
      });
      setLobbyCode(code);
      setJoined(true);
    }
  }

  // Prompt for user name if not set (in real app, use session)
  // Prompt for user name if not set (in real app, use session)
  if (!userName) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8ecd7] dark:bg-[#18181b] bg-[url('/parchment-bg.png')] dark:bg-none bg-cover transition-colors">
        <div className="bg-white/90 dark:bg-gray-900/90 border-4 border-[#b89c3a] dark:border-yellow-700 rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center gap-6 drop-shadow-xl transition-colors">
          <h2 className="text-2xl font-western font-bold mb-4 text-[#8c2f2b] dark:text-yellow-200 tracking-widest drop-shadow transition-colors">Enter your name to join a lobby</h2>
          <input
            type="text"
            value={pendingName}
            onChange={e => setPendingName(e.target.value)}
            placeholder="Your name"
            className="p-3 rounded-lg border-2 border-[#b89c3a] dark:border-yellow-700 text-center mb-4 bg-[#fff8e1] dark:bg-[#232323] text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[#e1b866] transition-all duration-150 shadow-inner"
            minLength={3}
          />
          <button
            onClick={() => {
              if (pendingName.trim().length >= 3) setUserName(pendingName.trim());
            }}
            className="bg-gradient-to-b from-[#e1b866] to-[#b89c3a] text-[#8c2f2b] dark:text-yellow-900 font-western font-semibold py-2 px-6 rounded-xl border-2 border-[#8c2f2b] dark:border-yellow-700 shadow-lg hover:from-[#ffe7a0] hover:to-[#e1b866] hover:text-[#6a1a1a] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={pendingName.trim().length < 3}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }


  // Main lobby UI: create/join or show LobbyClient if joined
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8ecd7] dark:bg-[#18181b] bg-[url('/parchment-bg.png')] dark:bg-none bg-cover transition-colors">
      <div className="bg-white/90 dark:bg-gray-900/90 border-4 border-[#b89c3a] dark:border-yellow-700 rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center gap-6 drop-shadow-xl transition-colors">
        <h2 className="text-3xl font-western font-bold mb-4 text-[#8c2f2b] dark:text-yellow-200 tracking-widest drop-shadow transition-colors">Private Lobby</h2>
        <p className="mb-4 text-[#3b2c1a] dark:text-gray-200 bg-[#fff8e1]/80 dark:bg-[#232323]/80 px-4 py-2 rounded-xl border border-[#e1b866] dark:border-yellow-700 shadow-sm text-center transition-colors">Create or join a private Lotería game with friends. Share your lobby code to invite others!</p>
        {!joined ? (
          <>
            <button
              onClick={handleCreateLobby}
            className="bg-gradient-to-b from-[#e1b866] to-[#b89c3a] text-[#8c2f2b] dark:text-yellow-900 font-western font-semibold py-2 px-6 rounded-xl border-2 border-[#8c2f2b] dark:border-yellow-700 shadow-lg hover:from-[#ffe7a0] hover:to-[#e1b866] hover:text-[#6a1a1a] transition-all duration-150 mb-6"
            >
              Create Lobby
            </button>
            <form onSubmit={handleJoinLobby} className="flex flex-col items-center gap-2 w-full">
              <input
                type="text"
                maxLength={6}
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
                placeholder="Enter lobby code"
                className="p-3 rounded-lg border-2 border-[#b89c3a] dark:border-yellow-700 text-center uppercase tracking-widest bg-[#fff8e1] dark:bg-[#232323] text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[#e1b866] transition-all duration-150 shadow-inner w-full"
                required
              />
              <button
                type="submit"
                className="bg-gradient-to-b from-[#e1b866] to-[#b89c3a] text-[#8c2f2b] dark:text-yellow-900 font-western font-semibold py-2 px-6 rounded-xl border-2 border-[#8c2f2b] dark:border-yellow-700 shadow-lg hover:from-[#ffe7a0] hover:to-[#e1b866] hover:text-[#6a1a1a] transition-all duration-150 w-full"
              >
                Join Lobby
              </button>
            </form>
          </>
        ) : (
          // Show the real-time lobby client if joined
          <LobbyClient lobbyCode={lobbyCode} user={{ name: userName }} />
        )}
      </div>
    </div>
  );
}
