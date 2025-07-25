import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    // Test MongoDB connection
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Test database connection
    await db.admin().ping();
    
    return NextResponse.json({ 
      status: "OK",
      mongodb: "Connected",
      database: process.env.MONGODB_DB,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json({ 
      status: "ERROR",
      mongodb: "Failed",
      error: error instanceof Error ? error.message : "Unknown error",
      env_check: {
        MONGODB_URI: !!process.env.MONGODB_URI,
        MONGODB_DB: !!process.env.MONGODB_DB
      }
    }, { status: 500 });
  }
}
