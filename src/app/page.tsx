"use client";

/**
 * Home Page - Main dashboard for Lotería Online
 * Shows user info, navigation options, and available game lobbies
 */

import UserInfo from "@/components/UserInfo";
import Link from "next/link";
import ProfileMenu from "@/components/ProfileMenu";
import { useEffect, useState } from "react";
import { FaUserFriends, FaRobot, FaLock, FaPlus, FaGamepad, FaSync } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // State for lobby management
  const [lobbies, setLobbies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect unauthenticated users to signin
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
  }, [status, router]);

  // Fetch available public lobbies
  const fetchLobbies = () => {
    if (status !== "authenticated") return;
    
    setLoading(true);
    setError(null);
    
    fetch("/api/lobbies")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch lobbies");
        return res.json();
      })
      .then(data => {
        setLobbies(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError("Could not load active games.");
        setLoading(false);
      });
  };

  // Fetch available public lobbies
  useEffect(() => {
    fetchLobbies();
  }, [status]);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#f8ecd7] flex items-center justify-center">
        <div className="text-xl font-medium text-[#8c2f2b]">Loading...</div>
      </div>
    );
  }

  // Don't render anything if not authenticated (redirect in progress)
  if (status === "unauthenticated") {
    return null;
  }

  // Main Home Page - styled to match the vintage/western Lotería theme
  return (
    <div className="min-h-screen bg-[#f8ecd7] dark:bg-[#18181b] bg-[url('/parchment-bg.png')] dark:bg-none bg-cover flex flex-col items-center justify-center p-4 sm:p-8 relative transition-colors">
      {/* Floating Menus (Profile only) */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <ProfileMenu />
      </div>
      {/* Main Card - vintage style */}
      <div className="w-full max-w-3xl bg-white/90 dark:bg-gray-900/90 border-4 border-[#b89c3a] dark:border-yellow-700 rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-8 relative mt-8 drop-shadow-xl transition-colors">
        <div className="flex flex-col items-center gap-2 animate-fade-in">
          {/* Main Heading - western font */}
          <h1 className="text-5xl font-western font-extrabold text-center text-red-600 dark:text-red-400 tracking-widest drop-shadow mb-2 transition-colors">
            ¡Lotería Online!
          </h1>
          <p className="text-center text-[#3b2c1a] dark:text-gray-200 text-lg max-w-xl mt-2 bg-[#fff8e1]/80 dark:bg-[#232323]/80 px-4 py-2 rounded-xl border border-[#e1b866] dark:border-yellow-700 shadow-sm transition-colors">
            Play the classic Mexican game with friends, join public games, or challenge the AI.<br />
            Ready to shout <span className="font-bold text-[#b94a48] font-western">¡Lotería!</span>?
          </p>
        </div>
        {/* User Info Card */}
        <UserInfo />
        {/* Action Cards - styled as vintage buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full mt-2">
          {/* Join Game Card */}
          <Link href="/game/join" className="group bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 px-4 rounded-2xl flex flex-col items-center gap-2 shadow transition transform hover:-translate-y-1">
            <FaGamepad className="text-3xl group-hover:scale-110 transition" />
            <span>Join Game</span>
          </Link>
          <Link href="/game/create" className="group bg-green-600 hover:bg-green-700 text-white font-semibold py-6 px-4 rounded-2xl flex flex-col items-center gap-2 shadow transition transform hover:-translate-y-1">
            <FaPlus className="text-3xl group-hover:scale-110 transition" />
            <span>Create Game</span>
          </Link>
          <Link href="/game/private" className="group bg-purple-600 hover:bg-purple-700 text-white font-semibold py-6 px-4 rounded-2xl flex flex-col items-center gap-2 shadow transition transform hover:-translate-y-1">
            <FaLock className="text-3xl group-hover:scale-110 transition" />
            <span>Private Lobby</span>
          </Link>
          <Link href="/game/ai" className="group bg-pink-600 hover:bg-pink-700 text-white font-semibold py-6 px-4 rounded-2xl flex flex-col items-center gap-2 shadow transition transform hover:-translate-y-1">
            <FaRobot className="text-3xl group-hover:scale-110 transition" />
            <span>AI Game</span>
          </Link>
        </div>
        {/* Active Games List */}
        <div className="w-full mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-bold text-blue-800 flex items-center gap-2">
              <FaUserFriends className="text-xl" /> Active Games
            </h2>
            <button
              onClick={fetchLobbies}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh game list"
            >
              <FaSync className={`text-sm ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          <div className="bg-gray-100 rounded-xl p-4 text-gray-700 min-h-[56px] max-h-64 overflow-y-auto shadow-inner">
            {loading ? (
              <span>Loading...</span>
            ) : error ? (
              <span className="text-red-500">{error}</span>
            ) : lobbies.length === 0 ? (
              <div className="text-center py-8">
                <FaGamepad className="mx-auto text-4xl text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">No active games right now</p>
                <p className="text-sm text-gray-500">Be the first to create a game and invite your friends!</p>
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {lobbies.map(lobby => {
                  // Use a unique, stable key: prefer id, then _id, then code
                  const key = lobby.id || lobby._id || lobby.code;
                  const playerCount = lobby.players?.length || 0;
                  const maxPlayers = 4; // Standard Lotería game limit
                  
                  return (
                    <li key={key} className="flex items-center justify-between bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xl font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-lg">
                              {lobby.code}
                            </span>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                              LIVE
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-600">
                              <FaUserFriends className="inline mr-1" />
                              {playerCount}/{maxPlayers} players
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              playerCount === 0 ? 'bg-gray-100 text-gray-600' :
                              playerCount < maxPlayers ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {playerCount === 0 ? 'Waiting' : 
                               playerCount < maxPlayers ? 'Open' : 
                               'Full'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link 
                        href={`/game/private?code=${lobby.code}`} 
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                          playerCount >= maxPlayers 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 transform'
                        }`}
                        {...(playerCount >= maxPlayers ? { onClick: (e) => e.preventDefault() } : {})}
                      >
                        {playerCount >= maxPlayers ? 'Full' : 'Join'}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
