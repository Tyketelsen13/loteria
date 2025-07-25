import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function GET() {
  const testResults = [];
  
  // Test 1: Original MongoDB URI with minimal options
  try {
    console.log("Test 1: Using original MongoDB URI with minimal options...");
    const client1 = new MongoClient(process.env.MONGODB_URI!, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10
    });
    await client1.connect();
    await client1.db("admin").command({ ping: 1 });
    await client1.close();
    testResults.push({ method: "Original URI + Minimal Options", status: "SUCCESS" });
  } catch (error) {
    testResults.push({ 
      method: "Original URI + Minimal Options", 
      status: "FAILED", 
      error: error instanceof Error ? error.message.substring(0, 100) : String(error)
    });
  }

  // Test 2: Completely empty options
  try {
    console.log("Test 2: Using original MongoDB URI with no options...");
    const client2 = new MongoClient(process.env.MONGODB_URI!, {});
    await client2.connect();
    await client2.db("admin").command({ ping: 1 });
    await client2.close();
    testResults.push({ method: "Original URI + No Options", status: "SUCCESS" });
  } catch (error) {
    testResults.push({ 
      method: "Original URI + No Options", 
      status: "FAILED", 
      error: error instanceof Error ? error.message.substring(0, 100) : String(error)
    });
  }

  // Test 3: Default MongoClient (just URI)
  try {
    console.log("Test 3: Default MongoClient configuration...");
    const client3 = new MongoClient(process.env.MONGODB_URI!);
    await client3.connect();
    await client3.db("admin").command({ ping: 1 });
    await client3.close();
    testResults.push({ method: "Default MongoClient", status: "SUCCESS" });
  } catch (error) {
    testResults.push({ 
      method: "Default MongoClient", 
      status: "FAILED", 
      error: error instanceof Error ? error.message.substring(0, 100) : String(error)
    });
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    tests: testResults,
    working_method: testResults.find(t => t.status === "SUCCESS")?.method || "None found",
    mongodb_uri_analysis: {
      has_retry_writes: process.env.MONGODB_URI?.includes('retryWrites=true'),
      has_w_majority: process.env.MONGODB_URI?.includes('w=majority'),
      app_name: process.env.MONGODB_URI?.includes('appName=LearningFS')
    },
    recommendation: testResults.find(t => t.status === "SUCCESS") ? 
      "Use the working method in your main connection" : 
      "Check MongoDB Atlas network access and firewall settings"
  });
}
