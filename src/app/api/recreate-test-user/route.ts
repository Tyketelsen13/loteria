import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const usersCollection = db.collection('users');

    // Delete existing test user
    await usersCollection.deleteMany({ email: 'test@example.com' });

    // Create new test user with fresh password hash
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const newUser = {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    // Verify the password works
    const testVerification = await bcrypt.compare('password123', hashedPassword);
    
    return NextResponse.json({
      message: 'Test user recreated successfully',
      userId: result.insertedId,
      passwordVerification: testVerification,
      credentials: {
        email: 'test@example.com',
        password: 'password123'
      }
    });

  } catch (error) {
    console.error('Recreate user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
