import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    console.log("Testing basic MongoDB operations...");
    
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Test 1: Database connection
    console.log("Testing database connection...");
    await db.command({ ping: 1 });
    
    // Test 2: List collections
    console.log("Listing collections...");
    const collections = await db.listCollections().toArray();
    
    // Test 3: Simple insert and find (using a test collection)
    console.log("Testing insert and find operations...");
    const testCollection = db.collection("test_connection");
    
    const insertResult = await testCollection.insertOne({
      test: true,
      timestamp: new Date(),
      message: "MongoDB connection test"
    });
    
    const findResult = await testCollection.findOne({ _id: insertResult.insertedId });
    
    // Clean up test document
    await testCollection.deleteOne({ _id: insertResult.insertedId });
    
    return NextResponse.json({
      status: "SUCCESS",
      database: process.env.MONGODB_DB,
      operations: {
        ping: "✅ Success",
        list_collections: `✅ Found ${collections.length} collections`,
        insert_find: "✅ Insert and find operations successful"
      },
      collections: collections.map(c => c.name),
      test_document_id: insertResult.insertedId,
      found_document: !!findResult
    });
    
  } catch (error) {
    console.error("MongoDB operations test failed:", error);
    
    return NextResponse.json({
      status: "ERROR",
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack trace",
      env_check: {
        MONGODB_URI: !!process.env.MONGODB_URI,
        MONGODB_DB: process.env.MONGODB_DB
      }
    }, { status: 500 });
  }
}
