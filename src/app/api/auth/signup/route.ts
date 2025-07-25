import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import clientPromise from "@/lib/mongodb";

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
    const user = await db.collection("users").insertOne({ 
      email, 
      name: name || email.split('@')[0], 
      password: hashed,
      createdAt: new Date()
    });
    
    return NextResponse.json({ 
      success: true,
      id: user.insertedId, 
      email 
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
