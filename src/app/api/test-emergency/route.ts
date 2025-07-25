import { NextRequest, NextResponse } from "next/server";
import { getEmergencyConnection } from "@/lib/mongodb-emergency";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log("=== EMERGENCY CONNECTION TEST ===");
    
    // Try emergency connection strategies
    const result = await getEmergencyConnection();
    const { client, strategy } = result;
    
    // Quick test
    await client.db("admin").command({ ping: 1 });
    const db = client.db("loteria");
    const userCount = await db.collection("users").estimatedDocumentCount();
    
    const totalTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      strategy: strategy,
      totalTime: totalTime,
      database: "loteria",
      userCount: userCount,
      message: `Emergency connection successful using ${strategy} strategy`,
      recommendation: "Update your main connection to use this working approach"
    });
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error("Emergency connection failed:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        totalTime,
        clusterId: getClusterIdFromUri(),
        recommendations: [
          "🚨 CRITICAL: Your MongoDB cluster may have connectivity issues",
          "🔧 Try creating a NEW MongoDB Atlas cluster",
          "⚙️ Ensure cluster is in the same region as Vercel (US East)",
          "🌐 Verify Network Access allows all IPs (0.0.0.0/0)",
          "📊 Check if cluster is paused or has resource limits",
          "🆙 Consider upgrading from M0 (free) to M2+ cluster",
          "🔐 Verify database user has correct permissions"
        ],
        nextSteps: [
          "1. Go to https://cloud.mongodb.com",
          "2. Check cluster status and health",
          "3. Create a new M0 cluster in us-east-1 region",
          "4. Set network access to 0.0.0.0/0 (allow all)",
          "5. Create new database user with readWrite permissions",
          "6. Get new connection string and update MONGODB_URI"
        ]
      },
      { status: 500 }
    );
  }
}

function getClusterIdFromUri(): string {
  try {
    const uri = process.env.MONGODB_URI || '';
    const url = new URL(uri);
    return url.hostname;
  } catch {
    return 'unknown';
  }
}
