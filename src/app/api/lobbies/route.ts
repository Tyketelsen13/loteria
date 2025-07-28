// In-memory lobbies store (reset on server restart)
import { NextResponse } from "next/server";

// Initialize with empty lobbies - only real user-created games will show
const lobbies: { code: string; players: string[]; host?: string; createdAt?: Date }[] = [];

// GET: Return all lobbies, never error
export async function GET(req: Request) {
  // Optionally support ?code=... to always return a lobby for the code
  const url = req.url ? new URL(req.url, 'http://localhost') : null;
  const code = url?.searchParams.get('code');
  if (code) {
    const lobby = lobbies.find(l => l.code === code);
    if (!lobby) {
      // Return a fake lobby with no players if not found
      return NextResponse.json([{ code, players: [], host: null }]);
    }
    return NextResponse.json([lobby]);
  }
  // Default: return all lobbies that have at least one player (filter out empty lobbies)
  const activeLobbies = lobbies.filter(lobby => lobby.players && lobby.players.length > 0);
  return NextResponse.json(activeLobbies);
}

// POST: Create or update a lobby (by code)
export async function POST(req: Request) {
  const { code, players, host } = await req.json();
  if (!code || !players || !Array.isArray(players)) {
    return NextResponse.json({ error: "Missing code or players" }, { status: 400 });
  }
  // Find or create lobby
  let lobby = lobbies.find(l => l.code === code);
  if (!lobby) {
    // New lobby - set the host as the creator (first player)
    lobby = { code, players: [...players], host: host || players[0], createdAt: new Date() };
    lobbies.push(lobby);
  } else {
    // Existing lobby - update players but keep original host
    lobby.players = [...players];
    // Only update host if it's explicitly provided and the lobby doesn't have one
    if (host && !lobby.host) {
      lobby.host = host;
    }
  }
  return NextResponse.json({ success: true });
}
