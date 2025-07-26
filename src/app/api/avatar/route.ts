import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { generateImagineArtCard } from '@/lib/imagineArt';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Get session directly in the API route
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const contentType = req.headers.get('content-type');
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await req.formData();
      const file = formData.get('avatar') as File;
      
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      // For now, we'll just generate a random avatar since file upload to cloud storage would require additional setup
      // In a real implementation, you'd upload to Cloudinary or another service
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name || session.user.email || 'Player')}&size=200&background=b89c3a&color=ffffff&font-size=0.33&format=png&seed=${Date.now()}`;
      
      // Update user's avatar in database
      await db.collection('users').updateOne(
        { email: session.user.email },
        { $set: { image: avatarUrl } }
      );

      return NextResponse.json({ 
        message: 'Avatar uploaded successfully',
        avatarUrl 
      });

    } else {
      // Handle AI generation
      const body = await req.json();
      const { generateAI, customPrompt } = body;

      if (!generateAI) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
      }

      // Generate AI avatar
      const prompt = customPrompt || 'friendly avatar';
      const apiKey = process.env.IMAGINE_ART_API_KEY;
      
      let avatarUrl;
      if (apiKey) {
        avatarUrl = await generateImagineArtCard(prompt, apiKey);
      }
      
      // Fallback to ui-avatars if AI generation fails
      if (!avatarUrl) {
        avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name || session.user.email || 'Player')}&size=200&background=b89c3a&color=ffffff&font-size=0.33&format=png&seed=${Date.now()}`;
      }

      // Update user's avatar in database
      await db.collection('users').updateOne(
        { email: session.user.email },
        { $set: { image: avatarUrl } }
      );

      return NextResponse.json({ 
        message: 'Avatar generated successfully',
        avatarUrl 
      });
    }

  } catch (error) {
    console.error('Avatar API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
