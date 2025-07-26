import { NextRequest, NextResponse } from 'next/server';
import { generateImagineArtCard } from '@/lib/imagineArt';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt } = body;

    // Test avatar generation with your actual API key
    const testPrompt = prompt || 'friendly cartoon character';
    const apiKey = process.env.IMAGINE_ART_API_KEY;
    
    console.log('API Key available:', !!apiKey);
    console.log('API Key actual value:', apiKey);
    
    let avatarUrl;
    let usedAI = false;
    
    if (apiKey && apiKey !== 'your-imagine-art-api-key-here') {
      console.log('Attempting AI generation with prompt:', testPrompt);
      avatarUrl = await generateImagineArtCard(testPrompt, apiKey);
      if (avatarUrl) {
        usedAI = true;
        console.log('AI generation successful!');
      } else {
        console.log('AI generation failed, using fallback');
      }
    } else {
      console.log('No valid API key, using fallback');
    }
    
    // Fallback to ui-avatars
    if (!avatarUrl) {
      const seed = Date.now();
      avatarUrl = `https://ui-avatars.com/api/?name=Test+Player&size=200&background=b89c3a&color=ffffff&font-size=0.33&format=png&seed=${seed}`;
    }

    return NextResponse.json({ 
      message: usedAI ? 'AI avatar generated successfully!' : 'Fallback avatar generated',
      avatarUrl,
      usedAI,
      prompt: testPrompt
    });

  } catch (error) {
    console.error('Test avatar API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
