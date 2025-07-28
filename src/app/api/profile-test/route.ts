import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Get the authenticated user's token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token?.email) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 });
    }

    console.log('Profile Test API - Authenticated user:', token.email);

    // Return session data as a mock profile for testing
    const mockProfile = {
      _id: 'mock-' + Date.now(),
      name: token.name || token.email?.split('@')[0] || 'User',
      email: token.email,
      image: token.picture || null,
      gamesPlayed: 0,
      gamesWon: 0,
      gamesCreated: 0,
      winRate: 0
    };

    return NextResponse.json({
      success: true,
      user: mockProfile,
      source: 'mock'
    });

  } catch (error: any) {
    console.error('Profile Test API error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch profile'
    }, { status: 500 });
  }
}
