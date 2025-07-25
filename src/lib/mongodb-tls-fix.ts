/**
 * MongoDB Connection - TLS Version Fix for Vercel
 * Specifically addresses TLS alert number 80 error
 */

import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set");
}

const uri = process.env.MONGODB_URI;

// Parse and modify connection string for Vercel TLS compatibility
function getVercelCompatibleURI(originalUri: string): string {
  try {
    const url = new URL(originalUri);
    
    // Remove problematic SSL parameters and add Vercel-compatible ones
    url.searchParams.delete('ssl');
    url.searchParams.delete('sslValidate');
    url.searchParams.delete('tlsInsecure');
    url.searchParams.delete('tlsAllowInvalidHostnames');
    url.searchParams.delete('tlsAllowInvalidCertificates');
    
    // Add Vercel-compatible SSL parameters
    url.searchParams.set('ssl', 'true');
    url.searchParams.set('authSource', 'admin');
    url.searchParams.set('retryWrites', 'true');
    url.searchParams.set('w', 'majority');
    
    // Force TLS 1.2+ for compatibility
    url.searchParams.set('tls', 'true');
    
    const modifiedUri = url.toString();
    console.log('Modified URI for Vercel compatibility (credentials hidden)');
    return modifiedUri;
    
  } catch (error) {
    console.log('Could not parse URI, using original');
    return originalUri;
  }
}

export async function getTLSFixedConnection() {
  const startTime = Date.now();
  
  try {
    console.log("=== TLS VERSION FIX FOR VERCEL ===");
    
    // Get Vercel-compatible URI
    const vercelUri = getVercelCompatibleURI(uri);
    
    // TLS-specific client options
    const client = new MongoClient(vercelUri, {
      // Connection pool settings for serverless
      maxPoolSize: 1,
      minPoolSize: 0,
      
      // Timeout settings
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      
      // Network settings
      family: 4, // IPv4 only
      
      // TLS settings specifically for the SSL alert error
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
      
      // Force specific TLS behavior
      ssl: true,
      sslValidate: true,
      
      // Auth settings
      authSource: 'admin',
      
      // Write concern
      retryWrites: true,
      w: 'majority',
      
      // Application name for debugging
      appName: 'loteria-vercel-tls-fix',
    });
    
    console.log("Attempting TLS-fixed connection...");
    await client.connect();
    
    console.log("Testing connection with admin ping...");
    await client.db("admin").command({ ping: 1 });
    
    const totalTime = Date.now() - startTime;
    console.log(`✅ TLS-fixed connection successful in ${totalTime}ms`);
    
    return {
      client,
      connectionTime: totalTime,
      strategy: "tls-fixed"
    };
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error(`❌ TLS-fixed connection failed after ${totalTime}ms:`, error);
    
    // Try to extract specific SSL error details
    if (errorMessage.includes('ssl3_read_bytes') || errorMessage.includes('SSL alert')) {
      console.error("Detected specific SSL/TLS compatibility issue with Vercel");
      throw new Error(`Vercel TLS compatibility issue: ${errorMessage}`);
    }
    
    throw new Error(`TLS-fixed MongoDB connection failed: ${errorMessage}`);
  }
}
