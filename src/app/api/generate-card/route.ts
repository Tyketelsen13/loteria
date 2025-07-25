import { NextRequest } from "next/server";

// Dynamic import to handle canvas module
let createCanvas: any, loadImage: any;

try {
  const canvasModule = require("canvas");
  createCanvas = canvasModule.createCanvas;
  loadImage = canvasModule.loadImage;
} catch (error) {
  console.log("Canvas module not available in this environment");
}

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // Check if canvas is available
  if (!createCanvas) {
    return new Response(
      JSON.stringify({ error: "Canvas not available in this environment" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  // Example: ?text=El Gallo
  const { searchParams } = new URL(req.url);
  const text = searchParams.get("text") || "Lotería";

  try {
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
  } catch (error) {
    console.error("Canvas generation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate card" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
