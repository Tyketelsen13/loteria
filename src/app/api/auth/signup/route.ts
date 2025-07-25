import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import clientPromise from "@/lib/mongodb";

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// Signup endpoint: creates a new user in MongoDB for NextAuth credentials provider
export async function POST(req: NextRequest) {
  try {
    const { email, name, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const existing = await db.collection("users").findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await db.collection("users").insertOne({ email, name, password: hashed });
    return NextResponse.json({ id: user.insertedId, email });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
