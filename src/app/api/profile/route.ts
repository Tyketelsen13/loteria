import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    console.log('Profile API - Starting authentication check');
    console.log('Profile API - Request URL:', req.url);
    
    // Log all cookies to debug
    const cookieHeader = req.headers.get('cookie');
    console.log('Profile API - Cookie header:', cookieHeader);
    
    // Parse cookies manually to see what's available
    const cookies = cookieHeader ? Object.fromEntries(
      cookieHeader.split('; ').map(cookie => {
        const [name, ...rest] = cookie.split('=');
        return [name, rest.join('=')];
      })
    ) : {};
    console.log('Profile API - Available cookies:', Object.keys(cookies));
    
    // Try multiple authentication methods
    let userEmail = null;
    
    // Method 1: Try JWT token with different cookie names
    const possibleCookieNames = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'next-auth.session-token.0',
      'next-auth.session-token.1'
    ];
    
    for (const cookieName of possibleCookieNames) {
      if (cookies[cookieName]) {
        console.log(`Profile API - Found cookie: ${cookieName}`);
        try {
          const token = await getToken({ 
            req, 
            secret: process.env.NEXTAUTH_SECRET,
            cookieName
          });
          
          console.log(`Profile API - JWT Token with ${cookieName}:`, token ? 'Found' : 'Not found');
          if (token?.email) {
            userEmail = token.email;
            console.log('Profile API - JWT Email:', userEmail);
            break;
          }
        } catch (jwtError) {
          console.log(`Profile API - JWT Error with ${cookieName}:`, jwtError);
        }
      }
    }
    
    // Method 2: Try server session if JWT fails
    if (!userEmail) {
      try {
        const session = await getServerSession(authOptions);
        console.log('Profile API - Server Session:', session ? 'Found' : 'Not found');
        if (session?.user?.email) {
          userEmail = session.user.email;
          console.log('Profile API - Session Email:', userEmail);
        }
      } catch (sessionError) {
        console.log('Profile API - Session Error:', sessionError);
      }
    }

    if (!userEmail) {
      console.log('Profile API - No authentication found, returning 401');
      return NextResponse.json({ 
        error: 'Unauthorized',
        debug: {
          availableCookies: Object.keys(cookies),
          hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET
        }
      }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const userData = await db.collection('users').findOne(
      { email: userEmail },
      { projection: { _id: 0, name: 1, email: 1, image: 1 } }
    );

    console.log('Profile API - User data found:', userData ? 'Yes' : 'No');

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
