/**
 * MongoDB Connection Singleton - Version 2.1
 * Simplified connection for Docker/production environments
 * Completely rewritten to force cache invalidation
 */

import { MongoClient, MongoClientOptions } from "mongodb";
import { BUILD_VERSION } from "./build-info";

console.log(`MongoDB module loaded - Build: ${BUILD_VERSION}`);

// Environment validation
if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

const uri = process.env.MONGODB_URI;

// Minimal configuration - let MongoDB Atlas handle SSL automatically
const clientOptions: MongoClientOptions = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 15000,
  maxPoolSize: 10
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

async function createConnection(): Promise<MongoClient> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`MongoDB connection attempt ${i + 1}/${maxRetries} - v2.1 (CLEAN BUILD)`);
      
      // Create fresh client instance
      const mongoClient = new MongoClient(uri, clientOptions);
      await mongoClient.connect();
      
      // Verify connection
      await mongoClient.db("admin").command({ ping: 1 });
      console.log("MongoDB connection established successfully!");
      
      return mongoClient;
    } catch (error) {
      lastError = error as Error;
      console.error(`Connection attempt ${i + 1} failed:`, error);
      
      if (i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000;
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
  // Production: Create fresh connection for each deployment
  clientPromise = createConnection();
}

export default clientPromise;
