import { NextRequest } from "next/server";

// Optional canvas import
let createCanvas: any, loadImage: any;
try {
  const canvas = require("canvas");
  createCanvas = canvas.createCanvas;
  loadImage = canvas.loadImage;
} catch (error) {
  console.warn("Canvas not available, card generation will be disabled");
}

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // Check if canvas is available
  if (!createCanvas || !loadImage) {
    return new Response(
      JSON.stringify({ error: "Image generation not available" }), 
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  // Example: ?text=El Gallo
  const { searchParams } = new URL(req.url);
  const text = searchParams.get("text") || "Lotería";

  // Create a 300x400px card
  const width = 300;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#fffbe6";
  ctx.fillRect(0, 0, width, height);

  // Card border
  ctx.strokeStyle = "#eab308";
  ctx.lineWidth = 8;
  ctx.strokeRect(0, 0, width, height);

  // Card text
  ctx.font = "bold 32px sans-serif";
  ctx.fillStyle = "#be185d";
  ctx.textAlign = "center";
  ctx.fillText(text, width / 2, height - 40);

  // Optionally: draw an image or icon in the center
  // const img = await loadImage('https://...');
  // ctx.drawImage(img, 50, 60, 200, 200);

  // Output PNG
  const buffer = canvas.toBuffer("image/png");
  return new Response(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store"
    }
  });
}
