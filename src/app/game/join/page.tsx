"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function JoinGamePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 4) {
      setError("Please enter a valid lobby code.");
      return;
    }
    setLoading(true);
    setError("");
    router.push(`/game/private?code=${code.toUpperCase()}`);
  };


  // Join Game page styled with vintage/western theme
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8ecd7] bg-[url('/parchment-bg.png')] bg-cover p-8">
      <div className="bg-white/90 border-4 border-[#b89c3a] rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center gap-6 drop-shadow-xl">
        <h1 className="text-3xl font-western font-bold text-center text-[#8c2f2b] mb-2 tracking-widest drop-shadow">Join a Game</h1>
        <p className="text-[#3b2c1a] text-center mb-4 bg-[#fff8e1]/80 px-4 py-2 rounded-xl border border-[#e1b866] shadow-sm">Enter a lobby code to join your friends in a private Lotería game.</p>
        <form onSubmit={handleJoin} className="w-full flex flex-col gap-4">
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase())}
            maxLength={8}
            placeholder="Lobby Code"
            className="w-full px-4 py-3 rounded-lg border-2 border-[#b89c3a] bg-[#fff8e1] focus:outline-none focus:ring-2 focus:ring-[#e1b866] text-center text-xl tracking-widest uppercase font-semibold shadow-inner"
            autoFocus
          />
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-b from-[#e1b866] to-[#b89c3a] text-[#8c2f2b] font-western font-semibold py-3 rounded-xl border-2 border-[#8c2f2b] shadow-lg hover:from-[#ffe7a0] hover:to-[#e1b866] hover:text-[#6a1a1a] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Joining..." : "Join Game"}
          </button>
        </form>
      </div>
    </div>
  );
}
