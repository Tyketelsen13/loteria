/**
 * MongoDB Connection Singleton - Version 2.2 (Vercel Optimized)
 * Optimized for Vercel serverless environment
 */

import { MongoClient, MongoClientOptions } from "mongodb";
import { BUILD_VERSION } from "./build-info";

console.log(`MongoDB module loaded - Build: ${BUILD_VERSION} (Vercel Optimized)`);

// Environment validation
if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

const uri = process.env.MONGODB_URI;

// Vercel-optimized configuration
const clientOptions: MongoClientOptions = {
  maxPoolSize: 1, // Limit connections for serverless
  serverSelectionTimeoutMS: 5000, // 5 second timeout
  socketTimeoutMS: 5000,
  connectTimeoutMS: 5000,
  family: 4, // Use IPv4, skip trying IPv6
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

async function createConnection(): Promise<MongoClient> {
  const maxRetries = 2; // Reduced for Vercel timeout limits
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`MongoDB connection attempt ${i + 1}/${maxRetries} - Vercel optimized`);
      
      // Create fresh client instance
      const mongoClient = new MongoClient(uri, clientOptions);
      await mongoClient.connect();
      
      // Verify connection with short timeout
      await mongoClient.db("admin").command({ ping: 1 });
      console.log("MongoDB connection established successfully!");
      
      return mongoClient;
    } catch (error) {
      lastError = error as Error;
      console.error(`Connection attempt ${i + 1} failed:`, error);
      
      if (i < maxRetries - 1) {
        const delay = 1000; // Fixed 1s delay for Vercel
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`MongoDB connection failed after ${maxRetries} attempts. Last error: ${lastError?.message}`);
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
