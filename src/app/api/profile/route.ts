import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Try using JWT token instead of session for better App Router compatibility
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    console.log('Profile API - Token:', token ? 'Found' : 'Not found');
    console.log('Profile API - Token email:', token?.email);

    if (!token?.email) {
      console.log('Profile API - No token or email, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const userData = await db.collection('users').findOne(
      { email: token.email },
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
