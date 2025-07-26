import { NextRequest, NextResponse } from 'next/server';
import { generateImagineArtCard } from '@/lib/imagineArt';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt } = body;

    // Test avatar generation without authentication
    const testPrompt = prompt || 'friendly avatar';
    
    // Try to generate with AI (will fallback to ui-avatars if no API key)
    const apiKey = process.env.IMAGINE_ART_API_KEY;
    let avatarUrl;
    
    if (apiKey && apiKey !== 'your-api-key-here') {
      avatarUrl = await generateImagineArtCard(testPrompt, apiKey);
    }
    
    // Fallback to ui-avatars
    if (!avatarUrl) {
      const seed = Date.now();
      avatarUrl = `https://ui-avatars.com/api/?name=Test+Player&size=200&background=b89c3a&color=ffffff&font-size=0.33&format=png&seed=${seed}`;
    }

    return NextResponse.json({ 
      message: 'Test avatar generated successfully',
      avatarUrl,
      usedFallback: !apiKey || apiKey === 'your-api-key-here'
    });

  } catch (error) {
    console.error('Test avatar API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
