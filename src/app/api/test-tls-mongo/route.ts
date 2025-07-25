import { NextRequest, NextResponse } from "next/server";
import { getTLSFixedConnection } from "@/lib/mongodb-tls-fix";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log("=== VERCEL TLS FIX TEST ===");
    
    // Try the TLS-specific fix
    const result = await getTLSFixedConnection();
    const { client, connectionTime, strategy } = result;
    
    // Test database operations
    const db = client.db("loteria");
    const collection = db.collection("users");
    const userCount = await collection.countDocuments();
    
    // Test a write operation to verify full functionality
    const testDoc = { testId: "tls-test-" + Date.now(), test: true, timestamp: new Date() };
    const insertResult = await collection.insertOne(testDoc);
    await collection.deleteOne({ _id: insertResult.insertedId });
    
    const totalTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      strategy: strategy,
      connectionTime: connectionTime,
      totalTime: totalTime,
      database: "loteria",
      userCount: userCount,
      message: "TLS-fixed MongoDB connection successful - SSL alert resolved",
      tlsInfo: {
        alertResolved: true,
        vercelCompatible: true
      }
    });
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error("TLS-fixed MongoDB test failed:", error);
    
    // Check if it's the same SSL error
    const isSslError = errorMessage.includes('ssl3_read_bytes') || 
                       errorMessage.includes('SSL alert') ||
                       errorMessage.includes('tlsv1 alert');
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        totalTime,
        database: "loteria",
        tlsError: isSslError,
        message: isSslError ? 
          "Same TLS/SSL alert error persists - may need MongoDB Atlas configuration change" :
          "Different error - TLS fix may have helped but other issue exists"
      },
      { status: 500 }
    );
  }
}
