/**
 * MongoDB Connection Singleton
 * Provides efficient connection reuse and prevents connection pool exhaustion during development
 */

import { MongoClient } from "mongodb";

// Connection variables
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Skip validation during build time or when SKIP_DB_VALIDATION is set
const skipValidation = process.env.SKIP_DB_VALIDATION === "true" || 
                      process.env.NODE_ENV === "production" ||
                      process.env.VERCEL_ENV === "preview" ||
                      process.env.VERCEL_ENV === "production";

// Validate environment variable exists (skip during build)
if (!process.env.MONGODB_URI && !skipValidation) {
  throw new Error("Please add your Mongo URI to .env.local");
}

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/fallback";
const options = {}; // MongoDB client options

// Environment-specific connection handling
if (process.env.NODE_ENV === "development") {
  // Development: Use global object to preserve connection across hot reloads
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri, options);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  // Production: Create fresh connection for each deployment
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
