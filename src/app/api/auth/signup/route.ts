import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import clientPromise from "@/lib/mongodb";

// Signup endpoint: creates a new user in MongoDB for NextAuth credentials provider
export async function POST(req: NextRequest) {
  try {
    console.log("Signup attempt started...");
    
    const { email, name, password } = await req.json();
    console.log(`Signup request for email: ${email}`);
    
    if (!email || !password) {
      console.log("Missing email or password");
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    console.log("Connecting to MongoDB...");
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    console.log(`Connected to database: ${process.env.MONGODB_DB}`);
    
    console.log("Checking for existing user...");
    const existing = await db.collection("users").findOne({ email });
    if (existing) {
      console.log(`User ${email} already exists`);
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }
    
    console.log("Hashing password...");
    const hashed = await bcrypt.hash(password, 10);
    
    console.log("Inserting new user...");
    const user = await db.collection("users").insertOne({ 
      email, 
      name: name || email.split('@')[0], 
      password: hashed,
      createdAt: new Date()
    });
    
    console.log(`User created successfully with ID: ${user.insertedId}`);
    
    return NextResponse.json({ 
      success: true,
      id: user.insertedId, 
      email 
    });
  } catch (error) {
    console.error("Signup error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      env_info: {
        mongodb_db: process.env.MONGODB_DB,
        has_mongodb_uri: !!process.env.MONGODB_URI
      }
    }, { status: 500 });
  }
}
