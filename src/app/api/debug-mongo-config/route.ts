import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log("=== MONGODB ATLAS CONFIGURATION DEBUG ===");
    
    // Check environment variables
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI environment variable not found");
    }
    
    // Parse the connection string to check configuration
    const parsedUri = new URL(mongoUri);
    
    const diagnostics = {
      host: parsedUri.hostname,
      protocol: parsedUri.protocol,
      database: parsedUri.pathname.substring(1) || 'admin',
      searchParams: Object.fromEntries(parsedUri.searchParams.entries()),
      hasUsername: !!parsedUri.username,
      hasPassword: !!parsedUri.password,
      port: parsedUri.port || 'default',
    };
    
    // Check for common problematic parameters
    const problematicParams = [];
    if (parsedUri.searchParams.has('tlsInsecure')) {
      problematicParams.push('tlsInsecure');
    }
    if (parsedUri.searchParams.has('tlsAllowInvalidHostnames')) {
      problematicParams.push('tlsAllowInvalidHostnames');
    }
    if (parsedUri.searchParams.has('tlsAllowInvalidCertificates')) {
      problematicParams.push('tlsAllowInvalidCertificates');
    }
    
    // Check SSL/TLS parameters
    const sslParams: Array<{param: string, value: string | null}> = [];
    ['ssl', 'tls', 'sslValidate', 'authSource', 'retryWrites', 'w'].forEach(param => {
      if (parsedUri.searchParams.has(param)) {
        sslParams.push({
          param,
          value: parsedUri.searchParams.get(param)
        });
      }
    });
    
    const totalTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      totalTime,
      diagnostics,
      problematicParams,
      sslParams,
      recommendations: {
        removeParams: problematicParams.length > 0 ? problematicParams : null,
        suggestedParams: [
          'ssl=true',
          'authSource=admin',
          'retryWrites=true',
          'w=majority'
        ],
        mongoAtlasCheck: "Verify your MongoDB Atlas cluster allows connections from 0.0.0.0/0 (all IPs) for Vercel",
        tlsVersion: "Atlas cluster might be configured for TLS 1.3 only - try changing to TLS 1.2+ support"
      },
      nextSteps: [
        "1. Check MongoDB Atlas Network Access settings",
        "2. Verify cluster is not paused",
        "3. Try creating a new connection string from Atlas dashboard",
        "4. Consider upgrading MongoDB Atlas cluster if using M0 free tier"
      ]
    });
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        totalTime,
        message: "Failed to analyze MongoDB configuration"
      },
      { status: 500 }
    );
  }
}
