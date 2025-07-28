import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    console.log('[AUTH TEST] Session test endpoint called');
    
    // Simple health check response
    return NextResponse.json({
      status: 'ok',
      message: 'Auth test endpoint working',
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT_SET',
        MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT_SET',
        SKIP_DB_VALIDATION: process.env.SKIP_DB_VALIDATION
      }
    });
  } catch (error) {
    console.error('[AUTH TEST] Error:', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
