/**
 * MongoDB Connection - Vercel Alternative Approach
 * Using different SSL/TLS strategy for problematic Vercel environment
 */

import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set");
}

// Try a completely different connection approach
const uri = process.env.MONGODB_URI;

export async function getVercelMongoConnection() {
  const startTime = Date.now();
  
  try {
    console.log("=== ALTERNATIVE VERCEL MONGO CONNECTION ===");
    
    // Strategy 1: Minimal options
    console.log("Trying minimal connection options...");
    const client1 = new MongoClient(uri, {
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    });
    
    await client1.connect();
    await client1.db("admin").command({ ping: 1 });
    
    const totalTime = Date.now() - startTime;
    console.log(`✅ Minimal options worked in ${totalTime}ms`);
    
    return {
      client: client1,
      strategy: "minimal",
      time: totalTime
    };
    
  } catch (error1) {
    console.log("Minimal options failed, trying Node.js 18 compatible...");
    
    try {
      // Strategy 2: Node.js 18 compatible options
      const client2 = new MongoClient(uri, {
        maxPoolSize: 1,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        family: 4,
        tls: true,
        tlsAllowInvalidCertificates: false,
        tlsAllowInvalidHostnames: false,
      });
      
      await client2.connect();
      await client2.db("admin").command({ ping: 1 });
      
      const totalTime = Date.now() - startTime;
      console.log(`✅ Node.js 18 compatible worked in ${totalTime}ms`);
      
      return {
        client: client2,
        strategy: "nodejs18",
        time: totalTime
      };
      
    } catch (error2) {
      console.log("Node.js 18 failed, trying legacy approach...");
      
      try {
        // Strategy 3: Legacy approach
        const client3 = new MongoClient(uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          maxPoolSize: 1,
          serverSelectionTimeoutMS: 15000,
        } as any); // Use any to bypass TypeScript restrictions
        
        await client3.connect();
        await client3.db("admin").command({ ping: 1 });
        
        const totalTime = Date.now() - startTime;
        console.log(`✅ Legacy approach worked in ${totalTime}ms`);
        
        return {
          client: client3,
          strategy: "legacy",
          time: totalTime
        };
        
      } catch (error3) {
        const totalTime = Date.now() - startTime;
        const error1Msg = error1 instanceof Error ? error1.message : String(error1);
        const error2Msg = error2 instanceof Error ? error2.message : String(error2);
        const error3Msg = error3 instanceof Error ? error3.message : String(error3);
        
        console.error("All connection strategies failed:");
        console.error("1. Minimal:", error1Msg);
        console.error("2. Node.js 18:", error2Msg);
        console.error("3. Legacy:", error3Msg);
        
        throw new Error(`All MongoDB connection strategies failed. Total time: ${totalTime}ms. Last error: ${error3Msg}`);
      }
    }
  }
}
