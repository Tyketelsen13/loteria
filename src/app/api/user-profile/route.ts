import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Get the first user for profile display (in a real app, you'd get the specific user)
    const user = await db.collection('users').findOne(
      {},
      { projection: { email: 1, name: 1, _id: 0 } }
    );
    
    if (!user) {
      return NextResponse.json({
        status: 'no_users',
        message: 'No users found in database'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      status: 'ok',
      user: {
        name: user.name || 'User',
        email: user.email
      }
    });
  } catch (error: any) {
    console.error('User profile error:', error);
    return NextResponse.json({ 
      error: error?.message || 'Failed to fetch user data'
    }, { status: 500 });
  }
}
