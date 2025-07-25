import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log("=== MONGODB ATLAS CLUSTER DIAGNOSTICS ===");
    
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      return NextResponse.json({
        error: "MONGODB_URI not found in environment variables"
      }, { status: 500 });
    }
    
    // Parse URI to extract cluster information
    const url = new URL(uri);
    const hostname = url.hostname;
    const clusterInfo = {
      hostname: hostname,
      isAtlas: hostname.includes('mongodb.net'),
      region: hostname.includes('.') ? hostname.split('.')[1] : 'unknown',
      params: Array.from(url.searchParams.entries()),
      hasSSL: url.searchParams.has('ssl') || url.searchParams.has('tls'),
      authSource: url.searchParams.get('authSource') || 'admin',
      retryWrites: url.searchParams.get('retryWrites') || 'true',
    };
    
    // Test basic connectivity (without MongoDB driver)
    const connectivityTest = await testConnectivity(hostname, 27017);
    
    return NextResponse.json({
      cluster: clusterInfo,
      connectivity: connectivityTest,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        isVercel: !!process.env.VERCEL,
        vercelRegion: process.env.VERCEL_REGION || 'unknown'
      },
      recommendations: generateRecommendations(clusterInfo, connectivityTest),
      nextSteps: [
        "1. Check MongoDB Atlas dashboard for cluster status",
        "2. Verify network access list includes Vercel IPs (0.0.0.0/0 for testing)",
        "3. Ensure cluster is not paused",
        "4. Try the reconnection test endpoint",
        "5. Consider creating a new cluster if issues persist"
      ]
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return NextResponse.json({
      error: errorMessage,
      message: "Failed to analyze MongoDB Atlas configuration"
    }, { status: 500 });
  }
}

async function testConnectivity(hostname: string, port: number): Promise<any> {
  // Since we can't do raw socket connections in serverless, 
  // we'll do a DNS resolution test instead
  try {
    // Try to resolve the hostname
    const dnsTest = await fetch(`https://dns.google/resolve?name=${hostname}&type=A`)
      .then(res => res.json())
      .catch(() => ({ Status: -1 }));
    
    return {
      dnsResolution: dnsTest.Status === 0 ? 'success' : 'failed',
      hostname: hostname,
      port: port,
      message: dnsTest.Status === 0 ? 'Hostname resolves correctly' : 'DNS resolution failed'
    };
  } catch (error) {
    return {
      dnsResolution: 'error',
      hostname: hostname,
      port: port,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function generateRecommendations(clusterInfo: any, connectivityTest: any): string[] {
  const recommendations = [];
  
  if (!clusterInfo.isAtlas) {
    recommendations.push("⚠️ Not using MongoDB Atlas - ensure your MongoDB instance supports SSL/TLS");
  }
  
  if (!clusterInfo.hasSSL) {
    recommendations.push("⚠️ No SSL/TLS parameters detected in connection string");
  }
  
  if (connectivityTest.dnsResolution !== 'success') {
    recommendations.push("❌ DNS resolution failed - cluster may be unreachable");
  }
  
  if (clusterInfo.authSource !== 'admin') {
    recommendations.push("⚠️ authSource is not 'admin' - this may cause authentication issues");
  }
  
  // Vercel-specific recommendations
  recommendations.push("✅ For Vercel: Ensure network access allows 0.0.0.0/0 (all IPs)");
  recommendations.push("✅ For SSL errors: Try creating a new M0 cluster with default settings");
  recommendations.push("✅ For persistent issues: Consider upgrading to M2+ cluster");
  
  return recommendations;
}
