// Game logic utility functions for Lotería

/**
 * Checks if a 4x4 board has a winning pattern (row, column, diagonal, corners, or center)
 * @param marks - 4x4 boolean array representing marked cards
 * @returns boolean indicating if there's a win
 */
export function checkBingo(marks: boolean[][]): boolean {
  // Check rows
  for (let i = 0; i < 4; i++) {
    if (marks[i].every(mark => mark)) return true;
  }
  
  // Check columns
  for (let j = 0; j < 4; j++) {
    if (marks.every(row => row[j])) return true;
  }
  
  // Check diagonals
  if (marks[0][0] && marks[1][1] && marks[2][2] && marks[3][3]) return true;
  if (marks[0][3] && marks[1][2] && marks[2][1] && marks[3][0]) return true;
  
  // Check corners
  if (marks[0][0] && marks[0][3] && marks[3][0] && marks[3][3]) return true;
  
  // Check center 2x2
  if (marks[1][1] && marks[1][2] && marks[2][1] && marks[2][2]) return true;
  
  return false;
}

/**
 * Gets the specific winning line/pattern from marks
 * @param marks - 4x4 boolean array representing marked cards
 * @returns Object describing the winning pattern or null if no win
 */
export function getWinningLine(marks: boolean[][]): { type: 'row' | 'col' | 'diag1' | 'diag2' | 'corners' | 'center', index: number } | null {
  // Check rows
  for (let i = 0; i < 4; i++) {
    if (marks[i].every(mark => mark)) return { type: 'row', index: i };
  }
  
  // Check columns
  for (let j = 0; j < 4; j++) {
    if (marks.every(row => row[j])) return { type: 'col', index: j };
  }
  
  // Check diagonals
  if (marks[0][0] && marks[1][1] && marks[2][2] && marks[3][3]) return { type: 'diag1', index: 0 };
  if (marks[0][3] && marks[1][2] && marks[2][1] && marks[3][0]) return { type: 'diag2', index: 0 };
  
  // Check corners
  if (marks[0][0] && marks[0][3] && marks[3][0] && marks[3][3]) return { type: 'corners', index: 0 };
  
  // Check center 2x2
  if (marks[1][1] && marks[1][2] && marks[2][1] && marks[2][2]) return { type: 'center', index: 0 };
  
  return null;
}

/**
 * Validates that a bingo is legitimate by checking called cards
 * @param board - 4x4 string array of card names
 * @param marks - 4x4 boolean array of marked positions
 * @param line - The winning line pattern
 * @param calledCards - Array of card names that have been called
 * @returns boolean indicating if the bingo is valid
 */
export function isValidBingo(board: string[][], marks: boolean[][], line: { type: string, index: number } | null, calledCards: string[]): boolean {
  if (!line) return false;
  
  // Get positions that should be marked for this winning pattern
  const positions: [number, number][] = [];
  
  switch (line.type) {
    case 'row':
      for (let j = 0; j < 4; j++) {
        positions.push([line.index, j]);
      }
      break;
    case 'col':
      for (let i = 0; i < 4; i++) {
        positions.push([i, line.index]);
      }
      break;
    case 'diag1':
      positions.push([0, 0], [1, 1], [2, 2], [3, 3]);
      break;
    case 'diag2':
      positions.push([0, 3], [1, 2], [2, 1], [3, 0]);
      break;
    case 'corners':
      positions.push([0, 0], [0, 3], [3, 0], [3, 3]);
      break;
    case 'center':
      positions.push([1, 1], [1, 2], [2, 1], [2, 2]);
      break;
  }
  
  // Check that all marked positions correspond to called cards
  for (const [row, col] of positions) {
    if (marks[row][col]) {
      const cardName = board[row][col];
      if (!calledCards.includes(cardName)) {
        return false; // Card was marked but not called
      }
    }
  }
  
  return true;
}

/**
 * Generates a random 4x4 board from a pool of card names
 * @param cardNames - Array of available card names
 * @returns 4x4 string array of unique card names
 */
export function generateBoardFrom(cardNames: string[]): string[][] {
  if (cardNames.length < 16) {
    throw new Error('Need at least 16 cards to generate a board');
  }
  
  const shuffled = [...cardNames].sort(() => Math.random() - 0.5);
  const board: string[][] = [];
  
  for (let i = 0; i < 4; i++) {
    board.push(shuffled.slice(i * 4, (i + 1) * 4));
  }
  
  return board;
}

/**
 * Converts Spanish card names to image filenames
 * @param cardName - Spanish card name with accents
 * @returns filename-safe string without accents
 */
export function toImageName(cardName: string): string {
  return cardName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w-]/g, ''); // Remove non-word characters except hyphens
}
