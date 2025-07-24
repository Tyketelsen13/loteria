import { NextRequest } from "next/server";
import { createCanvas, loadImage } from "canvas";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
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
