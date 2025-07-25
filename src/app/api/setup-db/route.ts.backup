import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// Setup endpoint to create necessary MongoDB indexes
export async function POST() {
  try {
    console.log("Setting up MongoDB indexes...");
    
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const users = db.collection('users');
    
    // Create unique index on email for faster lookups and duplicate prevention
    await users.createIndex({ email: 1 }, { unique: true });
    console.log("Email index created");
    
    // Create index on createdAt for faster queries
    await users.createIndex({ createdAt: 1 });
    console.log("CreatedAt index created");
    
    return NextResponse.json({ 
      success: true,
      message: "Database indexes created successfully"
    });
    
  } catch (error: any) {
    console.error("Index creation error:", error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}
