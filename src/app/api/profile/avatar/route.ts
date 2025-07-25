import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { generateImagineArtCard } from "@/lib/imagineArt";
import fs from "fs";
import path from "path";

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// Helper to get admin settings
function getAdminSettings() {
  try {
    const settingsPath = path.join(process.cwd(), "admin-settings.json");
    const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
    return settings;
  } catch (error) {
    console.error("Failed to load admin settings:", error);
    return {};
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contentType = request.headers.get("content-type");
    
    // Handle AI avatar generation
    if (contentType?.includes("application/json")) {
      const body = await request.json();
      
      if (body.generateAI) {
        const settings = getAdminSettings();
        const apiKey = settings.imagineArtApiKey?.trim();
        
        if (!apiKey) {
          return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
        }

        // Use custom prompt if provided, otherwise use default Lotería-themed prompts
        let finalPrompt = "";
        
        if (body.customPrompt && body.customPrompt.trim()) {
          // Use user's custom prompt, but ensure it's for a portrait/avatar
          finalPrompt = `portrait of ${body.customPrompt.trim()}`;
        } else {
          // Generate avatar with AI using default prompts
          const avatarPrompts = [
            "portrait of a friendly person with colorful traditional clothing",
            "smiling person wearing vibrant traditional attire, artistic portrait",
            "friendly face with warm expression, colorful portrait",
            "person with warm smile, traditional style clothing, bright colors",
            "portrait of person in traditional attire, friendly expression"
          ];
          finalPrompt = avatarPrompts[Math.floor(Math.random() * avatarPrompts.length)];
        }
        
        try {
          // Try Imagine Art API first with compatible prompts
          const formData = new FormData();
          formData.append('prompt', finalPrompt);
          formData.append('style', 'realistic');
          formData.append('aspect_ratio', '1:1');
          formData.append('seed', Math.floor(Math.random() * 1000).toString());

          const response = await fetch("https://api.vyro.ai/v2/image/generations", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
            body: formData,
          });

          let imageUrl = null;

          if (response.ok) {
            // Save the image to a temporary location
            const imageBuffer = await response.arrayBuffer();
            const fileName = `avatar-${session.user.email.replace('@', '-').replace('.', '-')}-${Date.now()}.png`;
            const filePath = path.join(process.cwd(), "public", "avatars", fileName);
            
            // Create avatars directory if it doesn't exist
            const avatarsDir = path.join(process.cwd(), "public", "avatars");
            if (!fs.existsSync(avatarsDir)) {
              fs.mkdirSync(avatarsDir, { recursive: true });
            }
            
            // Save the image
            fs.writeFileSync(filePath, Buffer.from(imageBuffer));
            imageUrl = `/avatars/${fileName}`;
            console.log("ImagineArt API success: Saved avatar to", imageUrl);
          } else {
            const errorText = await response.text();
            console.error("ImagineArt API error:", response.status, errorText);
          }

          // Fallback to ui-avatars if Imagine Art fails
          if (!imageUrl) {
            const colors = ['e1b866', 'b89c3a', '8c2f2b', 'd4a574', 'c49158', '9a2e2a'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            const seed = Math.random().toString(36).substring(7);
            imageUrl = `https://ui-avatars.com/api/?name=Loteria+Player&size=200&background=${randomColor}&color=ffffff&font-size=0.33&format=png&seed=${seed}`;
            console.log("Using fallback avatar:", imageUrl);
          }

          if (!imageUrl) {
            return NextResponse.json({ error: "Failed to generate avatar" }, { status: 500 });
          }

          // Update user's avatar in database
          const client = await clientPromise;
          const db = client.db(process.env.MONGODB_DB);
          
          await db.collection("users").updateOne(
            { email: session.user.email },
            { $set: { image: imageUrl } }
          );

          return NextResponse.json({ success: true, imageUrl });
        } catch (error) {
          console.error("Avatar generation error:", error);
          return NextResponse.json({ error: "Failed to generate avatar" }, { status: 500 });
        }
      }
    }

    // Handle file upload (existing functionality)
    if (contentType?.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("avatar") as File;
      
      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      // Here you would typically upload to a cloud storage service
      // For now, we'll just return success
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    
  } catch (error) {
    console.error("Avatar API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}