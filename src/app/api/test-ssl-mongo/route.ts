import { NextRequest, NextResponse } from "next/server";
import { getMongoClientSSL } from "@/lib/mongodb-ssl-fix";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log("=== VERCEL SSL TEST START ===");
    
    // Test 1: Get client with SSL fixes
    console.log("Test 1: SSL Connection...");
    const client = await getMongoClientSSL();
    const connectTime = Date.now() - startTime;
    console.log(`Connected in ${connectTime}ms`);
    
    // Test 2: Database access
    console.log("Test 2: Database access...");
    const db = client.db("loteria");
    const dbTime = Date.now() - startTime;
    console.log(`Database accessed in ${dbTime}ms`);
    
    // Test 3: Simple ping
    console.log("Test 3: Ping test...");
    await db.admin().ping();
    const pingTime = Date.now() - startTime;
    console.log(`Ping completed in ${pingTime}ms`);
    
    // Test 4: Collection access
    console.log("Test 4: Collection access...");
    const collection = db.collection("users");
    const collectionTime = Date.now() - startTime;
    console.log(`Collection accessed in ${collectionTime}ms`);
    
    // Test 5: Simple operation
    console.log("Test 5: Count operation...");
    const count = await collection.countDocuments();
    const operationTime = Date.now() - startTime;
    console.log(`Count operation completed in ${operationTime}ms`);
    
    const totalTime = Date.now() - startTime;
    console.log("=== ALL SSL TESTS PASSED ===");
    
    return NextResponse.json({
      success: true,
      totalTime,
      database: "loteria",
      userCount: count,
      message: "SSL MongoDB connection successful on Vercel",
      timings: {
        connect: connectTime,
        database: dbTime,
        ping: pingTime,
        collection: collectionTime,
        operation: operationTime
      }
    });
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error("SSL MongoDB test failed:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: `SSL MongoDB connection failed: ${errorMessage}`,
        totalTime,
        database: "loteria"
      },
      { status: 500 }
    );
  }
}
