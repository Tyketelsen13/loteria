import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// Simple signup endpoint placeholder
export async function POST(req: NextRequest) {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}