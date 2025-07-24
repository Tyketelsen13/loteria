"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function generateLobbyCode(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function CreateGamePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    const code = generateLobbyCode();
    // Save lobby to DB
    await fetch("/api/lobbies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, players: [] }),
    });
    router.push(`/game/private?code=${code}`);
  };


  // Create Game page styled with vintage/western theme
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8ecd7] bg-[url('/parchment-bg.png')] bg-cover p-8">
      <div className="bg-white/90 border-4 border-[#b89c3a] rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center gap-6 drop-shadow-xl">
        <h1 className="text-3xl font-western font-bold text-center text-[#8c2f2b] mb-2 tracking-widest drop-shadow">Create a Game</h1>
        <p className="text-[#3b2c1a] text-center mb-4 bg-[#fff8e1]/80 px-4 py-2 rounded-xl border border-[#e1b866] shadow-sm">Start a new private Lotería lobby and invite your friends!</p>
        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-gradient-to-b from-[#e1b866] to-[#b89c3a] text-[#8c2f2b] font-western font-semibold py-3 rounded-xl border-2 border-[#8c2f2b] shadow-lg hover:from-[#ffe7a0] hover:to-[#e1b866] hover:text-[#6a1a1a] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating..." : "Create Game"}
        </button>
      </div>
    </div>
  );
}
