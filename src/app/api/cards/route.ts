import { NextResponse, NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { getDeckThemeFolder } from "../../../lib/boardBackgrounds";
import { cardMappings } from "../../../lib/cardMappings";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const deckTheme = searchParams.get('deckTheme') || 'traditional';
  
  // For all deck themes, return traditional card names 
  // The actual images are handled by getCardImageForDeck() function
  const cardsDir = path.join(process.cwd(), "public", "cards");
  
  try {
    const files = fs.readdirSync(cardsDir);
    const cardNames = files
      .filter(f => f.endsWith(".png") || f.endsWith(".jpg"))
      .map(f =>
        f
          .replace(/\.(png|jpg)$/, "")
          .replace(/-/g, " ")
          .replace(/\b\w/g, l => l.toUpperCase())
      );
    return NextResponse.json(cardNames);
  } catch (error) {
    console.error('Error reading traditional cards directory:', error);
    // Fallback with all 54 traditional card names
    const fallbackCards = [
      'El Corazón', 'La Luna', 'El Sol', 'La Estrella', 'El Árbol', 'La Sirena', 
      'La Escalera', 'La Botella', 'El Barril', 'El Cazo', 'Los Remos', 'El Soldado',
      'La Dama', 'El Paraguas', 'La Rana', 'El Pescado', 'El Alacran', 'El Apache',
      'El Arpa', 'El Bandolón', 'El Borracho', 'El Camarón', 'El Cantarito', 'El Catrín',
      'El Cotorro', 'El Diablito', 'El Gallo', 'El Gorrito', 'El Melón', 'El Mundo',
      'El Músico', 'El Negrito', 'El Nopal', 'El Pájaro', 'El Pino', 'El Tambor',
      'El Valiente', 'El Venado', 'El Violoncello', 'La Araña', 'La Bandera', 'La Bota',
      'La Calavera', 'La Campana', 'La Chalupa', 'La Corona', 'La Garza', 'La Maceta',
      'La Mano', 'La Muerte', 'La Palma', 'La Pera', 'La Rosa', 'La Sandía', 'Las Jaras'
    ];
    return NextResponse.json(fallbackCards);
  }
}
