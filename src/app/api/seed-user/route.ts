import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Get the authenticated user's token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token?.email) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 });
    }

    console.log('Seed User API - Authenticated user:', token.email);

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email: token.email });
    
    if (existingUser) {
      console.log('Seed User API - User already exists:', existingUser);
      return NextResponse.json({
        success: true,
        message: 'User already exists',
        user: {
          _id: existingUser._id.toString(),
          name: existingUser.name,
          email: existingUser.email,
          image: existingUser.image || null
        }
      });
    }

    // Create new user
    const newUser = {
      email: token.email,
      name: token.name || token.email?.split('@')[0] || 'User',
      image: token.picture || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('users').insertOne(newUser);
    
    console.log('Seed User API - Created new user:', result.insertedId);

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        _id: result.insertedId.toString(),
        name: newUser.name,
        email: newUser.email,
        image: newUser.image
      }
    });

  } catch (error: any) {
    console.error('Seed User API error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to seed user'
    }, { status: 500 });
  }
}
