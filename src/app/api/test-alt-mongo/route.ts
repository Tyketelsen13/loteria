import { NextRequest, NextResponse } from "next/server";
import { getVercelMongoConnection } from "@/lib/mongodb-vercel-alt";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log("=== VERCEL ALTERNATIVE MONGO TEST ===");
    
    // Try the alternative connection strategies
    const result = await getVercelMongoConnection();
    const { client, strategy, time } = result;
    
    // Test database operations
    const db = client.db("loteria");
    const collection = db.collection("users");
    const userCount = await collection.countDocuments();
    
    const totalTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      strategy: strategy,
      connectionTime: time,
      totalTime: totalTime,
      database: "loteria",
      userCount: userCount,
      message: `Alternative MongoDB connection successful using ${strategy} strategy`
    });
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error("Alternative MongoDB test failed:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        totalTime,
        database: "loteria",
        message: "All alternative MongoDB connection strategies failed"
      },
      { status: 500 }
    );
  }
}
