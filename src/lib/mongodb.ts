/**
 * MongoDB Connection Singleton
 * Provides efficient connection reuse and prevents connection pool exhaustion during development
 */

import { MongoClient } from "mongodb";

// Connection variables
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Validate environment variable exists
if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

const uri = process.env.MONGODB_URI!;
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
