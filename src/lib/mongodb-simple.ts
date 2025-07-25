/**
 * Alternative MongoDB Connection for Vercel Troubleshooting
 */

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;

// Minimal configuration for debugging
const options = {
  serverSelectionTimeoutMS: 2000,
  connectTimeoutMS: 2000,
  socketTimeoutMS: 2000,
};

let cachedClient: MongoClient | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (cachedClient) {
    console.log("Using cached MongoDB client");
    return cachedClient;
  }
  
  console.log("Creating new MongoDB client...");
  const client = new MongoClient(uri, options);
  
  try {
    await client.connect();
    console.log("MongoDB client connected successfully");
    
    // Test the connection
    await client.db("admin").command({ ping: 1 });
    console.log("MongoDB ping successful");
    
    cachedClient = client;
    return client;
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
}

export default getMongoClient;
