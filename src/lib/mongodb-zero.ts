/**
 * MongoDB Connection - Zero Options Strategy
 * Final attempt using absolutely no MongoDB client options
 */

import { MongoClient } from "mongodb";
import { BUILD_VERSION } from "./build-info";

console.log(`MongoDB Zero-Options module loaded - Build: ${BUILD_VERSION}`);

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

const uri = process.env.MONGODB_URI;

// ZERO OPTIONS - Let MongoDB driver use all defaults
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

async function createZeroOptionsConnection(): Promise<MongoClient> {
  console.log("Creating MongoDB connection with ZERO options...");
  
  try {
    // Create client with absolutely no options
    const mongoClient = new MongoClient(uri);
    
    // Just connect - no timeout wrappers, no retries, no complexity
    await mongoClient.connect();
    
    console.log("✅ Zero-options MongoDB connection successful!");
    return mongoClient;
    
  } catch (error) {
    console.error("❌ Zero-options connection failed:", error);
    throw error;
  }
}

// Environment-specific handling
if (process.env.NODE_ENV === "development") {
  // Development: Use global to preserve connection
  if (!(global as any)._mongoClientPromiseZero) {
    (global as any)._mongoClientPromiseZero = createZeroOptionsConnection();
  }
  clientPromise = (global as any)._mongoClientPromiseZero;
} else {
  // Production: Fresh connection each time
  clientPromise = createZeroOptionsConnection();
}

export default clientPromise;
export { clientPromise as mongoClientPromise };
