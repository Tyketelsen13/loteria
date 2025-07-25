import { NextResponse } from "next/server";

export async function GET() {
  const mongoUri = process.env.MONGODB_URI || '';
  
  // Parse the URI to show its components (safely)
  const hasUri = !!mongoUri;
  const uriStart = mongoUri.substring(0, 30);
  const uriLength = mongoUri.length;
  
  // Check for potentially problematic parameters
  const hasSSLParam = mongoUri.includes('ssl=');
  const hasTLSParam = mongoUri.includes('tls=');
  const hasTLSInsecure = mongoUri.includes('tlsInsecure');
  const hasTLSInvalidHostnames = mongoUri.includes('tlsAllowInvalidHostnames');
  
  // Extract query parameters (everything after ?)
  const queryStart = mongoUri.indexOf('?');
  const queryParams = queryStart > -1 ? mongoUri.substring(queryStart + 1) : 'none';
  
  return NextResponse.json({
    mongodb_uri_info: {
      has_uri: hasUri,
      uri_start: uriStart + '...',
      uri_length: uriLength,
      query_params_preview: queryParams.substring(0, 100) + (queryParams.length > 100 ? '...' : ''),
      ssl_analysis: {
        has_ssl_param: hasSSLParam,
        has_tls_param: hasTLSParam,
        has_tls_insecure: hasTLSInsecure,
        has_tls_invalid_hostnames: hasTLSInvalidHostnames
      },
      recommendation: hasTLSInsecure || hasTLSInvalidHostnames ? 
        'URI contains conflicting SSL parameters - they will be cleaned' : 
        'URI looks clean for SSL configuration'
    }
  });
}
