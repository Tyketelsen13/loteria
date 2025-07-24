// In-memory lobbies store (reset on server restart)
import { NextResponse } from "next/server";

// Initialize with empty lobbies - only real user-created games will show
const lobbies: { code: string; players: string[]; createdAt?: Date }[] = [];

// GET: Return all lobbies, never error
export async function GET(req: Request) {
  // Optionally support ?code=... to always return a lobby for the code
  const url = req.url ? new URL(req.url, 'http://localhost') : null;
  const code = url?.searchParams.get('code');
  if (code) {
    const lobby = lobbies.find(l => l.code === code);
    if (!lobby) {
      // Return a fake lobby with no players if not found
      return NextResponse.json([{ code, players: [] }]);
    }
    return NextResponse.json([lobby]);
  }
  // Default: return all lobbies (never error)
  return NextResponse.json(lobbies);
}

// POST: Create or update a lobby (by code)
export async function POST(req: Request) {
  const { code, players } = await req.json();
  if (!code || !players || !Array.isArray(players)) {
    return NextResponse.json({ error: "Missing code or players" }, { status: 400 });
  }
  // Find or create lobby
  let lobby = lobbies.find(l => l.code === code);
  if (!lobby) {
    lobby = { code, players: [...players], createdAt: new Date() };
    lobbies.push(lobby);
  } else {
    lobby.players = [...players];
  }
  return NextResponse.json({ success: true });
}
