// Complete 54-card Traditional Lotería deck
// All cards from the standard Mexican Lotería game

export const COMPLETE_LOTERIA_DECK = [
  // Complete 54-card deck matching backend exactly
  "El Gallo", "El Diablito", "La Dama", "El Catrín", "El Paraguas", "La Sirena", "La Escalera", "La Botella", "El Barril", "El Árbol",
  "El Melón", "El Valiente", "El Gorrito", "La Muerte", "La Pera", "La Bandera", "El Bandolón", "El Violoncello", "La Garza", "El Pájaro",
  "La Mano", "La Bota", "La Luna", "El Cotorro", "El Borracho", "El Negrito", "El Corazón", "La Sandía", "El Tambor", "El Camarón",
  "Las Jaras", "La Rosa", "La Estrella", "La Campana", "El Cantarito", "El Venado", "El Sol", "La Corona", "La Chalupa", "El Pino",
  "El Pescado", "La Palma", "La Maceta", "El Arpa", "La Rana", "La Araña", "El Soldado", "La Calavera", "El Apache", "El Nopal",
  "El Alacrán", "El Mundo", "El Músico", "El Cazo"
];

// Function to get all card names (54 total)
export function getAllCardNames(): string[] {
  if (COMPLETE_LOTERIA_DECK.length !== 54) {
    console.warn(`[DECK] Warning: Expected 54 cards, but deck has ${COMPLETE_LOTERIA_DECK.length} cards`);
  }
  return [...COMPLETE_LOTERIA_DECK];
}

// Function to get a shuffled deck
export function getShuffledDeck(): string[] {
  const deck = [...COMPLETE_LOTERIA_DECK];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Function to generate random board (4x4 grid from deck)
export function generateRandomBoard(): string[][] {
  const shuffled = getShuffledDeck();
  const board: string[][] = [];
  
  for (let i = 0; i < 4; i++) {
    board[i] = [];
    for (let j = 0; j < 4; j++) {
      board[i][j] = shuffled[i * 4 + j];
    }
  }
  
  return board;
}
