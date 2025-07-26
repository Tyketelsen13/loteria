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
    console.log('Profile API - Cookies:', req.headers.get('cookie') ? 'Present' : 'Missing');
    
    // Try multiple authentication methods
    let userEmail = null;
    
    // Method 1: Try JWT token
    try {
      const token = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token'
      });
      
      console.log('Profile API - JWT Token:', token ? 'Found' : 'Not found');
      if (token?.email) {
        userEmail = token.email;
        console.log('Profile API - JWT Email:', userEmail);
      }
    } catch (jwtError) {
      console.log('Profile API - JWT Error:', jwtError);
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
