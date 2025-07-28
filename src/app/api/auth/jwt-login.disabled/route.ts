import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Connect to database
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const usersCollection = db.collection('users');

    // Find user
    const user = await usersCollection.findOne({ email });
    console.log('JWT Login - User found:', !!user, 'Has password:', !!user?.password);
    if (!user || !user.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    console.log('JWT Login - Attempting password verification for:', email);
    const isValid = await bcrypt.compare(password, user.password);
    console.log('JWT Login - Password valid:', isValid);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        image: user.image 
      },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        image: user.image
      }
    });

  } catch (error) {
    console.error('JWT Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
