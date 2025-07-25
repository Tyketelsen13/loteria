import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function GET() {
  const testResults = [];
  
  // Test 1: Relaxed SSL settings (recommended for Docker)
  try {
    console.log("Test 1: Connecting with relaxed SSL (Docker-friendly)...");
    const client1 = new MongoClient(process.env.MONGODB_URI!, {
      tls: true,
      tlsInsecure: true,
      tlsAllowInvalidHostnames: true,
      serverSelectionTimeoutMS: 10000,
      authSource: 'admin'
    });
    await client1.connect();
    await client1.db("admin").command({ ping: 1 });
    await client1.close();
    testResults.push({ method: "Relaxed SSL (Docker)", status: "SUCCESS" });
  } catch (error) {
    testResults.push({ 
      method: "Relaxed SSL (Docker)", 
      status: "FAILED", 
      error: error instanceof Error ? error.message.substring(0, 100) : String(error)
    });
  }

  // Test 2: SSL in connection string
  try {
    console.log("Test 2: SSL parameters in connection string...");
    let connectionUri = process.env.MONGODB_URI!;
    if (!connectionUri.includes('ssl=')) {
      const separator = connectionUri.includes('?') ? '&' : '?';
      connectionUri += `${separator}ssl=true&tlsInsecure=true&retryWrites=true&authSource=admin`;
    }
    
    const client2 = new MongoClient(connectionUri, { serverSelectionTimeoutMS: 10000 });
    await client2.connect();
    await client2.db("admin").command({ ping: 1 });
    await client2.close();
    testResults.push({ method: "SSL in Connection String", status: "SUCCESS" });
  } catch (error) {
    testResults.push({ 
      method: "SSL in Connection String", 
      status: "FAILED", 
      error: error instanceof Error ? error.message.substring(0, 100) : String(error)
    });
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    tests: testResults,
    working_method: testResults.find(t => t.status === "SUCCESS")?.method || "None found",
    recommendation: testResults.find(t => t.status === "SUCCESS") ? 
      "Use the working method in your main connection" : 
      "Check MongoDB Atlas network access settings"
  });
}
