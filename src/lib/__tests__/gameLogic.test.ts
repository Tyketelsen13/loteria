// Test utilities for Lotería Online
// Game logic tests for bingo validation and board generation

/**
 * Checks if marks array has a winning bingo pattern
 */
export function checkBingo(marks: boolean[][]): boolean {
  // Check rows
  for (let i = 0; i < 4; i++) {
    if (marks[i].every(Boolean)) return true
  }
  
  // Check columns
  for (let j = 0; j < 4; j++) {
    if (marks.every(row => row[j])) return true
  }
  
  // Check main diagonal (top-left to bottom-right)
  if ([0, 1, 2, 3].every(i => marks[i][i])) return true
  
  // Check anti-diagonal (top-right to bottom-left)
  if ([0, 1, 2, 3].every(i => marks[i][3 - i])) return true
  
  // Check four corners
  if (marks[0][0] && marks[0][3] && marks[3][0] && marks[3][3]) return true
  
  // Check center 2x2 square
  if (marks[1][1] && marks[1][2] && marks[2][1] && marks[2][2]) return true
  
  return false
}

// Simple test to ensure file is not empty
describe('Game Logic Test File', () => {
  it('should have working test utilities', () => {
    expect(typeof checkBingo).toBe('function')
  })
  
  it('should detect simple bingo patterns', () => {
    const rowWin = [
      [true, true, true, true],
      [false, false, false, false],
      [false, false, false, false],
      [false, false, false, false]
    ]
    expect(checkBingo(rowWin)).toBe(true)
  })
})
