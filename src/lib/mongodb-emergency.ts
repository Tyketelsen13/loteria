/**
 * MongoDB Emergency Connection - Last Resort Strategy
 * For persistent timeout issues on Vercel
 */

import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set");
}

const uri = process.env.MONGODB_URI;

// Emergency: Try connecting with absolutely no options
export async function getEmergencyConnection() {
  console.log("=== EMERGENCY MONGODB CONNECTION ===");
  
  try {
    // Strategy 1: No options at all (trust MongoDB defaults)
    console.log("Trying: No options at all");
    const client1 = new MongoClient(uri);
    
    // Set a very short timeout for testing
    const connectPromise = client1.connect();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Emergency timeout')), 3000)
    );
    
    await Promise.race([connectPromise, timeoutPromise]);
    console.log("✅ No-options connection succeeded!");
    return { client: client1, strategy: "no-options" };
    
  } catch (error1) {
    console.log("No-options failed:", error1);
    
    try {
      // Strategy 2: Only specify timeout
      console.log("Trying: Only serverSelectionTimeoutMS");
      const client2 = new MongoClient(uri, {
        serverSelectionTimeoutMS: 3000
      });
      
      await client2.connect();
      console.log("✅ Timeout-only connection succeeded!");
      return { client: client2, strategy: "timeout-only" };
      
    } catch (error2) {
      console.log("Timeout-only failed:", error2);
      
      // Strategy 3: Check if URI itself is the problem
      try {
        console.log("Trying: URI analysis");
        const url = new URL(uri);
        console.log("URI analysis:", {
          protocol: url.protocol,
          hostname: url.hostname,
          hasPassword: !!url.password,
          params: Array.from(url.searchParams.entries())
        });
        
        // Try to modify the URI for Vercel compatibility
        const modifiedUrl = new URL(uri);
        modifiedUrl.searchParams.set('maxPoolSize', '1');
        modifiedUrl.searchParams.set('serverSelectionTimeoutMS', '3000');
        modifiedUrl.searchParams.set('connectTimeoutMS', '3000');
        
        const client3 = new MongoClient(modifiedUrl.toString());
        await client3.connect();
        console.log("✅ Modified URI connection succeeded!");
        return { client: client3, strategy: "modified-uri" };
        
      } catch (error3) {
        console.log("All emergency strategies failed");
        
        // Return detailed error analysis
        const error1Msg = error1 instanceof Error ? error1.message : String(error1);
        const error2Msg = error2 instanceof Error ? error2.message : String(error2);
        const error3Msg = error3 instanceof Error ? error3.message : String(error3);
        
        throw new Error(`All emergency connection strategies failed:
1. No options: ${error1Msg}
2. Timeout only: ${error2Msg}  
3. Modified URI: ${error3Msg}

This suggests a fundamental connectivity issue between Vercel and your MongoDB Atlas cluster.`);
      }
    }
  }
}
