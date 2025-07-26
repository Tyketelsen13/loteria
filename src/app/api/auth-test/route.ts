import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    console.log('Auth Test - Starting');
    
    // Check environment
    console.log('Auth Test - Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL
    });
    
    // Check cookies
    const cookieHeader = req.headers.get('cookie');
    console.log('Auth Test - Raw cookies:', cookieHeader);
    
    // Try different methods
    const results: any = {
      cookies: cookieHeader ? 'present' : 'missing',
      jwtToken: null,
      serverSession: null,
      environment: process.env.NODE_ENV
    };
    
    // Test JWT
    try {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      results.jwtToken = token ? { email: token.email, name: token.name } : null;
    } catch (e) {
      console.log('Auth Test - JWT Error:', e);
    }
    
    // Test session
    try {
      const session = await getServerSession(authOptions);
      results.serverSession = session ? { email: session.user?.email, name: session.user?.name } : null;
    } catch (e) {
      console.log('Auth Test - Session Error:', e);
    }
    
    return NextResponse.json({ status: 'ok', results });
  } catch (error: any) {
    console.error('Auth Test - Error:', error);
    return NextResponse.json({ error: error?.message || 'Unknown error' }, { status: 500 });
  }
}
