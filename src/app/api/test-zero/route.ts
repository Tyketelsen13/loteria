import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb-zero";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log("=== ZERO OPTIONS TEST ===");
    
    // Test the absolute minimal connection
    const client = await clientPromise;
    const connectTime = Date.now() - startTime;
    
    // Test database operations
    const db = client.db("loteria");
    const collection = db.collection("users");
    const userCount = await collection.estimatedDocumentCount();
    
    const totalTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      strategy: "zero-options",
      connectionTime: connectTime,
      totalTime: totalTime,
      database: "loteria",
      userCount: userCount,
      message: "Zero-options MongoDB connection successful - simplest possible approach",
      performance: {
        connectionMs: connectTime,
        totalMs: totalTime,
        rating: totalTime < 2000 ? "excellent" : totalTime < 5000 ? "good" : "slow"
      }
    });
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error("Zero-options test failed:", error);
    
    return NextResponse.json(
      {
        success: false,
        strategy: "zero-options",
        error: errorMessage,
        totalTime,
        database: "loteria",
        message: "Even zero-options failed - cluster recreation likely needed",
        clusterIssue: true
      },
      { status: 500 }
    );
  }
}
