import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Get count of users (without exposing sensitive data)
    const userCount = await db.collection('users').countDocuments();
    
    // Get first user's email (masked) for testing
    const firstUser = await db.collection('users').findOne(
      {},
      { projection: { email: 1, name: 1, _id: 0 } }
    );
    
    const maskedEmail = firstUser?.email 
      ? firstUser.email.substring(0, 3) + '***@' + firstUser.email.split('@')[1]
      : 'No users found';
    
    return NextResponse.json({
      status: 'ok',
      database: process.env.MONGODB_DB,
      userCount,
      sampleUser: {
        email: maskedEmail,
        name: firstUser?.name || 'N/A'
      },
      hasMongoUri: !!process.env.MONGODB_URI
    });
  } catch (error: any) {
    console.error('DB Test error:', error);
    return NextResponse.json({ 
      error: error?.message || 'Database connection failed',
      hasMongoUri: !!process.env.MONGODB_URI
    }, { status: 500 });
  }
}
