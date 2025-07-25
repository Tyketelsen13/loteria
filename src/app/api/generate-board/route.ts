import { NextRequest } from "next/server";
import { createCanvas, loadImage } from "canvas";
import path from "path";
import { promises as fs } from "fs";

export const runtime = "nodejs";

// Example Lotería words (replace with your full set as needed)
const DEFAULT_WORDS = [
  "El Gallo", "La Dama", "El Catrín", "El Paraguas",
  "La Sirena", "La Escalera", "La Botella", "El Barril",
  "El Árbol", "El Melón", "El Valiente", "El Gorrito",
  "La Muerte", "La Pera", "El Bandolón", "El Violoncello"
];

function wordToFilename(word: string) {
  // Convert to lowercase, remove accents, replace spaces with dashes, remove non-alphanum
  return word
    .toLowerCase()
    .normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    + ".png";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const words = (searchParams.get("words")?.split(",") || DEFAULT_WORDS).slice(0, 16);

  // Board config
  const cols = 4;
  const rows = 4;
  const cardW = 150;
  const cardH = 200;
  const boardW = cols * cardW;
  const boardH = rows * cardH;

  const canvas = createCanvas(boardW, boardH);
  const ctx = canvas.getContext("2d");

  // Draw each card
  for (let i = 0; i < words.length; i++) {
    const x = (i % cols) * cardW;
    const y = Math.floor(i / cols) * cardH;
    // Card background
    ctx.fillStyle = `hsl(${(i * 40) % 360}, 70%, 85%)`;
    ctx.fillRect(x, y, cardW, cardH);
    ctx.strokeStyle = "#be185d";
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, cardW, cardH);
    // Try to load image for this word
    const filename = wordToFilename(words[i]);
    const imgPath = path.join(process.cwd(), "public", "cards", filename);
    try {
      await fs.access(imgPath);
      const img = await loadImage(imgPath);
      ctx.drawImage(img, x + 15, y + 15, cardW - 30, cardH - 60);
    } catch {
      // If image not found, draw a placeholder icon
      ctx.beginPath();
      ctx.arc(x + cardW / 2, y + cardH / 2 - 20, 30, 0, 2 * Math.PI);
      ctx.fillStyle = `hsl(${(i * 40 + 180) % 360}, 60%, 70%)`;
      ctx.fill();
      ctx.closePath();
    }
    // Card word
    ctx.font = "bold 20px sans-serif";
    ctx.fillStyle = "#1e293b";
    ctx.textAlign = "center";
    ctx.fillText(words[i], x + cardW / 2, y + cardH - 20);
  }

  const buffer = canvas.toBuffer("image/png");
  return new Response(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store"
    }
  });
}
