import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log("=== VERCEL TIMEOUT FIX TEST ===");
    
    // Set aggressive timeout for Vercel
    const vercelTimeout = 7000; // 7 seconds max
    
    const mongoTest = async () => {
      // Test the fixed minimal connection
      const client = await clientPromise;
      const connectTime = Date.now() - startTime;
      
      // Quick database test - just count users
      const db = client.db("loteria");
      const collection = db.collection("users");
      const count = await collection.estimatedDocumentCount(); // Faster than countDocuments
      
      return {
        connectTime,
        count,
        totalTime: Date.now() - startTime
      };
    };
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Vercel timeout after ${vercelTimeout}ms`)), vercelTimeout);
    });
    
    const result = await Promise.race([mongoTest(), timeoutPromise]);
    
    return NextResponse.json({
      success: true,
      connectionTime: result.connectTime,
      totalTime: result.totalTime,
      database: "loteria",
      userCount: result.count,
      message: "Ultra-fast MongoDB connection successful - timeout fixed",
      performance: {
        connectionSpeed: result.connectTime < 3000 ? "excellent" : result.connectTime < 5000 ? "good" : "slow",
        totalSpeed: result.totalTime < 5000 ? "excellent" : result.totalTime < 7000 ? "good" : "slow"
      }
    });
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error("Ultra-fast test failed:", error);
    
    const isTimeout = errorMessage.includes('timeout') || errorMessage.includes('TIMEOUT');
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        totalTime,
        database: "loteria",
        isTimeout: isTimeout,
        message: isTimeout ? 
          "Connection is still timing out - may need different MongoDB cluster" :
          "Connection failed for other reasons"
      },
      { status: isTimeout ? 504 : 500 }
    );
  }
}
