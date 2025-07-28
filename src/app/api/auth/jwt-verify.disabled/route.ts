import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as any;

    return NextResponse.json({
      valid: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        image: decoded.image
      }
    });

  } catch (error) {
    console.error('JWT Verify error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
