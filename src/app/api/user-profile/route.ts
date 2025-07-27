import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Get the authenticated user's token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token?.email) {
      console.log('User-Profile API - No authenticated user found');
      // Return fallback data for non-authenticated users
      return NextResponse.json({
        name: 'Guest User',
        email: 'guest@example.com',
        isAuthenticated: false
      });
    }

    console.log('User-Profile API - Authenticated user:', token.email);

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Get the SPECIFIC user based on their authenticated email
    const currentUser = await db.collection('users').findOne(
      { email: token.email }, // Find by authenticated user's email
      { projection: { email: 1, name: 1, _id: 0 } }
    );
    
    console.log('User-Profile API - Found user data:', currentUser);

    if (!currentUser) {
      console.log('User-Profile API - User not found in database');
      return NextResponse.json({
        name: 'Unknown User',
        email: token.email,
        isAuthenticated: true,
        error: 'User not found in database'
      });
    }

    return NextResponse.json({
      name: currentUser.name,
      email: currentUser.email,
      isAuthenticated: true
    });

  } catch (error: any) {
    console.error('User-Profile API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch user profile',
      name: 'Error User',
      email: 'error@example.com',
      isAuthenticated: false
    }, { status: 500 });
  }
}
