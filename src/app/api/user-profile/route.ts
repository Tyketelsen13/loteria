import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Get the user with tyketelsen@aol.com specifically, or fallback to first user
    let user = await db.collection('users').findOne(
      { email: 'tyketelsen@aol.com' },
      { projection: { email: 1, name: 1, _id: 0 } }
    );
    
    // If specific user not found, get the first user
    if (!user) {
      user = await db.collection('users').findOne(
        {},
        { projection: { email: 1, name: 1, _id: 0 } }
      );
    }
    
    console.log('User profile - Raw user data:', user);
    
    if (!user) {
      return NextResponse.json({
        status: 'no_users',
        message: 'No users found in database'
      }, { status: 404 });
    }
    
    const result = {
      status: 'ok',
      user: {
        name: user.name || 'User',
        email: user.email
      }
    };
    
    console.log('User profile - Returning:', result);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('User profile error:', error);
    return NextResponse.json({ 
      error: error?.message || 'Failed to fetch user data'
    }, { status: 500 });
  }
}
