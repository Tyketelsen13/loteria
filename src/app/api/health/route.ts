import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log("Health check v2.0: Testing MongoDB connection...");
    // Test MongoDB connection
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    // Test database connection with admin ping
    await db.admin().ping();
    console.log("Health check: MongoDB connection successful");
    return NextResponse.json({
      status: "OK",
      mongodb: "Connected",
      database: process.env.MONGODB_DB,
      timestamp: new Date().toISOString(),
      connection_info: {
        node_env: process.env.NODE_ENV,
        has_mongodb_uri: !!process.env.MONGODB_URI,
        mongodb_uri_prefix: process.env.MONGODB_URI?.substring(0, 25) + "..." || "missing"
      }
    });
  } catch (error) {
    console.error("Health check error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const isSSLError = errorMessage.includes('SSL') || errorMessage.includes('TLS') || errorMessage.includes('ssl3_read_bytes');
    
    return NextResponse.json({
      status: "ERROR",
      mongodb: "Failed",
      error: errorMessage,
      error_type: isSSLError ? "SSL/TLS Connection Issue" : "General Connection Error",
      env_check: {
        MONGODB_URI: !!process.env.MONGODB_URI,
        MONGODB_DB: !!process.env.MONGODB_DB
      },
      ssl_info: isSSLError ? {
        issue: "SSL handshake failed",
        solution: "MongoDB Atlas SSL/TLS configuration issue",
        check: "Verify MongoDB Atlas network access and SSL settings"
      } : null
    }, { status: 500 });
  }
}
