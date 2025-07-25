/**
 * MongoDB Connection - Vercel SSL Fix
 * Specifically handles SSL/TLS issues on Vercel serverless
 */

import { MongoClient, MongoClientOptions } from "mongodb";

console.log("MongoDB Vercel SSL Fix - Loading");

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set");
}

const uri = process.env.MONGODB_URI;

// Alternative connection options for Vercel SSL issues
const clientOptions: MongoClientOptions = {
  // Connection limits for serverless
  maxPoolSize: 1,
  minPoolSize: 0,
  
  // Aggressive timeouts for Vercel
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 5000,
  connectTimeoutMS: 5000,
  
  // Network settings
  family: 4, // IPv4 only
  
  // SSL/TLS settings - alternative approach
  ssl: true,
  sslValidate: true,
  
  // MongoDB Atlas specific
  authSource: 'admin',
  retryWrites: true,
  w: 'majority',
  
  // Additional options to handle Vercel environment
  appName: 'loteria-vercel',
  readPreference: 'primary',
  
  // Heartbeat settings for serverless
  heartbeatFrequencyMS: 30000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

async function createVercelConnection(): Promise<MongoClient> {
  const startTime = Date.now();
  console.log("=== VERCEL SSL MONGO CONNECTION START ===");
  
  try {
    // Log connection details (without exposing credentials)
    const uriParts = uri.split('@');
    const hostPart = uriParts[1] || 'unknown';
    console.log(`Connecting to: ${hostPart}`);
    console.log(`SSL Mode: ${clientOptions.ssl ? 'enabled' : 'disabled'}`);
    console.log(`Timeout: ${clientOptions.connectTimeoutMS}ms`);
    
    // Create client with SSL-specific options
    const mongoClient = new MongoClient(uri, clientOptions);
    
    // Connect with timeout protection
    console.log("Initiating connection...");
    await mongoClient.connect();
    
    // Test the connection
    console.log("Testing connection with ping...");
    await mongoClient.db("admin").command({ ping: 1 });
    
    const totalTime = Date.now() - startTime;
    console.log(`✅ Connection successful in ${totalTime}ms`);
    
    return mongoClient;
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ Connection failed after ${totalTime}ms:`, error);
    throw new Error(`MongoDB SSL connection failed: ${errorMessage}`);
  }
}

// Singleton pattern for Vercel
if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri, clientOptions);
    (global as any)._mongoClientPromise = createVercelConnection();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  // In production mode, create new connection each time
  clientPromise = createVercelConnection();
}

export async function getMongoClientSSL(): Promise<MongoClient> {
  try {
    const client = await clientPromise;
    return client;
  } catch (error) {
    console.error("Failed to get MongoDB client:", error);
    throw error;
  }
}

export { clientPromise as mongoClientPromise };
export default clientPromise;
