/**
 * MongoDB Atlas Reconnection Utility
 * Diagnoses connection issues and tries fresh connection strategies
 */

import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set");
}

const originalUri = process.env.MONGODB_URI;

// Extract connection details for diagnostics
function analyzeConnectionString(uri: string) {
  try {
    const url = new URL(uri);
    return {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port || '27017',
      database: url.pathname.slice(1) || 'test',
      username: url.username,
      hasPassword: !!url.password,
      searchParams: Array.from(url.searchParams.entries())
    };
  } catch (error) {
    return { error: 'Invalid URI format' };
  }
}

// Strategy 1: Completely minimal connection
async function tryMinimalConnection() {
  console.log("🔧 Strategy 1: Ultra-minimal connection");
  
  const client = new MongoClient(originalUri, {
    maxPoolSize: 1,
    serverSelectionTimeoutMS: 15000,
  });
  
  await client.connect();
  await client.db("admin").command({ ping: 1 });
  return client;
}

// Strategy 2: No SSL/TLS options at all
async function tryNoSSLConnection() {
  console.log("🔧 Strategy 2: No explicit SSL options");
  
  // Remove all SSL parameters from URI
  const url = new URL(originalUri);
  url.searchParams.delete('ssl');
  url.searchParams.delete('tls');
  url.searchParams.delete('tlsAllowInvalidCertificates');
  url.searchParams.delete('tlsAllowInvalidHostnames');
  
  const cleanUri = url.toString();
  
  const client = new MongoClient(cleanUri, {
    maxPoolSize: 1,
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
    socketTimeoutMS: 15000,
  });
  
  await client.connect();
  await client.db("admin").command({ ping: 1 });
  return client;
}

// Strategy 3: Force specific MongoDB driver version behavior
async function tryLegacyConnection() {
  console.log("🔧 Strategy 3: Legacy driver behavior");
  
  const client = new MongoClient(originalUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 1,
    serverSelectionTimeoutMS: 20000,
  } as any);
  
  await client.connect();
  await client.db("admin").command({ ping: 1 });
  return client;
}

// Strategy 4: Alternative cluster endpoint (if MongoDB Atlas)
async function tryAlternativeEndpoint() {
  console.log("🔧 Strategy 4: Alternative MongoDB endpoint");
  
  // Try connecting to primary cluster node directly
  let altUri = originalUri;
  
  // If it's a cluster URI, try to connect to shard 0 directly
  if (originalUri.includes('cluster')) {
    altUri = originalUri.replace(/cluster\d*\./, 'cluster0-shard-00-00.');
  }
  
  const client = new MongoClient(altUri, {
    maxPoolSize: 1,
    serverSelectionTimeoutMS: 15000,
    directConnection: true,
  });
  
  await client.connect();
  await client.db("admin").command({ ping: 1 });
  return client;
}

// Strategy 5: Different TLS version
async function tryDifferentTLS() {
  console.log("🔧 Strategy 5: Different TLS configuration");
  
  const client = new MongoClient(originalUri, {
    maxPoolSize: 1,
    serverSelectionTimeoutMS: 15000,
    tls: true,
    tlsInsecure: false, // This might help with Vercel
    authSource: 'admin',
  });
  
  await client.connect();
  await client.db("admin").command({ ping: 1 });
  return client;
}

export async function reconnectMongoDB() {
  const startTime = Date.now();
  
  console.log("=== MONGODB RECONNECTION DIAGNOSTICS ===");
  
  // First, analyze the connection string
  const analysis = analyzeConnectionString(originalUri);
  console.log("Connection Analysis:", {
    ...analysis,
    password: analysis.hasPassword ? '[REDACTED]' : 'none'
  });
  
  const strategies = [
    { name: "Minimal", fn: tryMinimalConnection },
    { name: "No SSL", fn: tryNoSSLConnection },
    { name: "Legacy", fn: tryLegacyConnection },
    { name: "Alternative Endpoint", fn: tryAlternativeEndpoint },
    { name: "Different TLS", fn: tryDifferentTLS },
  ];
  
  for (const strategy of strategies) {
    try {
      console.log(`\n--- Trying ${strategy.name} Strategy ---`);
      const client = await strategy.fn();
      
      // Test full functionality
      const db = client.db("loteria");
      const collection = db.collection("users");
      const count = await collection.countDocuments();
      
      const totalTime = Date.now() - startTime;
      
      return {
        success: true,
        strategy: strategy.name,
        client: client,
        connectionTime: totalTime,
        userCount: count,
        message: `Successfully connected using ${strategy.name} strategy`
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ ${strategy.name} failed:`, errorMessage);
      
      // Continue to next strategy
      continue;
    }
  }
  
  // If all strategies failed
  const totalTime = Date.now() - startTime;
  throw new Error(`All reconnection strategies failed after ${totalTime}ms. This may indicate a MongoDB Atlas cluster configuration issue.`);
}
