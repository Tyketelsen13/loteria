import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { generateImagineArtCard } from "@/lib/imagineArt";
import { cloudinary } from "@/lib/cloudinary";
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
  const user = await getAuthenticatedUser(request);
  
  if (!user?.email) {
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
            // Upload the image to Cloudinary instead of saving locally
            const imageBuffer = await response.arrayBuffer();
            const fileName = `avatar-${user.email.replace('@', '-').replace('.', '-')}-${Date.now()}`;
            
            try {
              // Upload to Cloudinary
              const uploadResponse = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                  {
                    public_id: fileName,
                    folder: 'avatars',
                    resource_type: 'image',
                    format: 'png',
                    overwrite: true,
                  },
                  (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                  }
                ).end(Buffer.from(imageBuffer));
              });
              
              imageUrl = (uploadResponse as any).secure_url;
              console.log("ImagineArt API success: Uploaded avatar to Cloudinary:", imageUrl);
            } catch (cloudinaryError) {
              console.error("Cloudinary upload error:", cloudinaryError);
              // Fallback: save locally for development
              const localPath = path.join(process.cwd(), "public", "avatars", `${fileName}.png`);
              const avatarsDir = path.join(process.cwd(), "public", "avatars");
              if (!fs.existsSync(avatarsDir)) {
                fs.mkdirSync(avatarsDir, { recursive: true });
              }
              fs.writeFileSync(localPath, Buffer.from(imageBuffer));
              imageUrl = `/avatars/${fileName}.png`;
              console.log("Cloudinary failed, saved locally:", imageUrl);
            }
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
            { email: user.email },
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

      try {
        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Generate filename
        const fileName = `avatar-${user.email.replace('@', '-').replace('.', '-')}-${Date.now()}`;
        
        let imageUrl = null;
        
        try {
          // Upload to Cloudinary
          const uploadResponse = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              {
                public_id: fileName,
                folder: 'avatars',
                resource_type: 'image',
                overwrite: true,
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            ).end(buffer);
          });
          
          imageUrl = (uploadResponse as any).secure_url;
          console.log("File upload success: Uploaded avatar to Cloudinary:", imageUrl);
        } catch (cloudinaryError) {
          console.error("Cloudinary upload error:", cloudinaryError);
          // Fallback: save locally for development
          const localPath = path.join(process.cwd(), "public", "avatars", `${fileName}.${file.name.split('.').pop()}`);
          const avatarsDir = path.join(process.cwd(), "public", "avatars");
          if (!fs.existsSync(avatarsDir)) {
            fs.mkdirSync(avatarsDir, { recursive: true });
          }
          fs.writeFileSync(localPath, buffer);
          imageUrl = `/avatars/${fileName}.${file.name.split('.').pop()}`;
          console.log("Cloudinary failed, saved locally:", imageUrl);
        }
        
        if (!imageUrl) {
          return NextResponse.json({ error: "Failed to upload avatar" }, { status: 500 });
        }

        // Update user's avatar in database
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        
        await db.collection("users").updateOne(
          { email: user.email },
          { $set: { image: imageUrl } }
        );

        return NextResponse.json({ success: true, imageUrl });
      } catch (error) {
        console.error("File upload error:", error);
        return NextResponse.json({ error: "Failed to upload avatar" }, { status: 500 });
      }
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    
  } catch (error) {
    console.error("Avatar API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}