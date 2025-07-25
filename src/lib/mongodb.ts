/**
 * MongoDB Connection Singleton
 * Provides efficient connection reuse and prevents connection pool exhaustion during development
 * Updated: Simplified SSL configuration for Docker/production environments
 */

import { MongoClient, MongoClientOptions } from "mongodb";

const uri = process.env.MONGODB_URI!;
const options: MongoClientOptions = {
  // Use minimal options - let MongoDB Atlas connection string handle SSL
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 15000,
  maxPoolSize: 10
};

// Connection variables
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Validate environment variable exists
if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

async function connectWithRetry(): Promise<MongoClient> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`MongoDB connection attempt ${i + 1}/${maxRetries} - v2.0`);
      console.log(`Using original MongoDB URI without modifications`);
      
      // Use the original URI without any modifications
      const client = new MongoClient(uri, options);
      await client.connect();
      
      // Test the connection
      await client.db("admin").command({ ping: 1 });
      console.log("MongoDB connection successful!");
      
      return client;
    } catch (error) {
      lastError = error as Error;
      console.error(`MongoDB connection attempt ${i + 1} failed:`, error);
      
      if (i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff: 1s, 2s, 4s
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`Failed to connect to MongoDB after ${maxRetries} attempts. Last error: ${lastError?.message}`);
}

// Environment-specific connection handling
if (process.env.NODE_ENV === "development") {
  // Development: Use global object to preserve connection across hot reloads
  if (!(global as any)._mongoClientPromise) {
    (global as any)._mongoClientPromise = connectWithRetry();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  // Production: Create fresh connection for each deployment
  clientPromise = connectWithRetry();
}

export default clientPromise;
