import { NextRequest, NextResponse } from "next/server";
import { reconnectMongoDB } from "@/lib/mongodb-reconnect";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log("=== MONGODB RECONNECTION TEST ===");
    
    // Try all reconnection strategies
    const result = await reconnectMongoDB();
    
    const totalTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      strategy: result.strategy,
      connectionTime: result.connectionTime,
      totalTime: totalTime,
      database: "loteria",
      userCount: result.userCount,
      message: result.message,
      recommendation: "This strategy worked! Update your main MongoDB connection to use this approach."
    });
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error("All reconnection strategies failed:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        totalTime,
        database: "loteria",
        message: "All reconnection strategies failed",
        recommendations: [
          "Check MongoDB Atlas cluster status at https://cloud.mongodb.com",
          "Verify cluster is running and accepting connections",
          "Check if cluster is paused or has connectivity restrictions",
          "Try creating a new cluster with different configuration",
          "Consider upgrading cluster tier if on free tier",
          "Check Vercel's IP ranges are whitelisted in MongoDB Atlas"
        ]
      },
      { status: 500 }
    );
  }
}
