/**
 * Test script for ImagineArt API to debug avatar generation issues
 */

const fs = require('fs');
const path = require('path');

// Read .env.local file manually
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
  } catch (error) {
    console.error("Failed to load .env.local:", error.message);
  }
}

async function testImagineArtAPI() {
  loadEnvFile();
  
  const apiKey = process.env.IMAGINE_ART_API_KEY;
  
  if (!apiKey) {
    console.error("❌ IMAGINE_ART_API_KEY not found in environment variables");
    return;
  }
  
  console.log("🔑 API Key found (first 10 chars):", apiKey.substring(0, 10) + "...");
  
  try {
    const formData = new FormData();
    formData.append('prompt', 'portrait of a friendly person with colorful traditional clothing');
    formData.append('style', 'realistic');
    formData.append('aspect_ratio', '1:1');
    formData.append('seed', '123');

    console.log("🚀 Testing ImagineArt API...");
    
    const response = await fetch("https://api.vyro.ai/v2/image/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    console.log("📊 Response status:", response.status);
    console.log("📊 Response headers:", Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      console.log("✅ API call successful! Content-Type:", contentType);
      
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        console.log("📄 JSON Response:", data);
      } else {
        console.log("🖼️ Binary response received (image data)");
        const arrayBuffer = await response.arrayBuffer();
        console.log("📏 Image size:", arrayBuffer.byteLength, "bytes");
      }
    } else {
      const errorText = await response.text();
      console.error("❌ API Error:", response.status, errorText);
    }
  } catch (error) {
    console.error("💥 Request failed:", error);
  }
}

testImagineArtAPI();
