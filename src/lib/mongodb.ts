/**
 * MongoDB Connection Singleton - Version 2.4 (ZERO OPTIONS - FINAL)
 * Fixed for Vercel using absolutely minimal configuration
 * 
 * SOLUTION: All MongoDB client options were causing conflicts with Vercel
 * FINAL STRATEGY: Zero options - let MongoDB driver handle everything
 */

import { MongoClient, MongoClientOptions } from "mongodb";
import { BUILD_VERSION } from "./build-info";

console.log(`MongoDB module loaded - Build: ${BUILD_VERSION} (Vercel Optimized)`);

// Environment validation
if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

const uri = process.env.MONGODB_URI;

// ZERO OPTIONS - Let MongoDB driver use all defaults
// This approach worked when all other strategies failed

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

async function createConnection(): Promise<MongoClient> {
  // Wrap entire connection process with timeout for Vercel
  const connectionTimeout = 8000; // 8 seconds max for Vercel
  
  const connectionPromise = async (): Promise<MongoClient> => {
    const maxRetries = 1; // Reduced to 1 retry for faster failure
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`MongoDB connection attempt ${i + 1}/${maxRetries} - Ultra-fast`);
        
        // Create fresh client instance with ZERO OPTIONS
        const mongoClient = new MongoClient(uri);
        await mongoClient.connect();
        
        // Skip ping to save time - connection test is enough
        console.log("MongoDB connection established successfully!");
        
        return mongoClient;
      } catch (error) {
        lastError = error as Error;
        console.error(`Connection attempt ${i + 1} failed:`, error);
        
        // No retry delay - fail fast for Vercel
      }
    }
    
    throw new Error(`MongoDB connection failed after ${maxRetries} attempts. Last error: ${lastError?.message}`);
  };
  
  // Race against timeout
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`MongoDB connection timeout after ${connectionTimeout}ms`)), connectionTimeout);
  });
  
  return Promise.race([connectionPromise(), timeoutPromise]);
}

// Environment-specific connection handling
if (process.env.NODE_ENV === "development") {
  // Development: Use global object to preserve connection across hot reloads
  if (!(global as any)._mongoClientPromise) {
    (global as any)._mongoClientPromise = createConnection();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  // Production: Create fresh connection for each request (Vercel serverless)
  clientPromise = createConnection();
}

export default clientPromise;
