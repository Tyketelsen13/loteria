import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// Simple test to verify MongoDB works on Vercel
export async function GET() {
  const startTime = Date.now();
  
  try {
    console.log("=== VERCEL MONGO TEST START ===");
    
    // Test 1: Basic connection
    console.log("Test 1: Connecting...");
    const client = await clientPromise;
    console.log(`Connected in ${Date.now() - startTime}ms`);
    
    // Test 2: Database access
    console.log("Test 2: Database access...");
    const db = client.db(process.env.MONGODB_DB);
    console.log(`Database accessed in ${Date.now() - startTime}ms`);
    
    // Test 3: Simple operation
    console.log("Test 3: Simple ping...");
    await db.command({ ping: 1 });
    console.log(`Ping completed in ${Date.now() - startTime}ms`);
    
    // Test 4: Collection access
    console.log("Test 4: Collection access...");
    const testCollection = db.collection('connection_test');
    console.log(`Collection accessed in ${Date.now() - startTime}ms`);
    
    // Test 5: Simple insert/delete
    console.log("Test 5: Insert/delete test...");
    const insertResult = await testCollection.insertOne({
      test: true,
      timestamp: new Date(),
      vercel: true
    });
    
    await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log(`Insert/delete completed in ${Date.now() - startTime}ms`);
    
    console.log("=== ALL TESTS PASSED ===");
    
    return NextResponse.json({
      success: true,
      totalTime: Date.now() - startTime,
      database: process.env.MONGODB_DB,
      message: "All MongoDB operations successful on Vercel"
    });
    
  } catch (error: any) {
    console.error("=== MONGO TEST FAILED ===", error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      totalTime: Date.now() - startTime,
      database: process.env.MONGODB_DB
    }, { status: 500 });
  }
}
