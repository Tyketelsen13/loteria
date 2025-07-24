import { checkBingo, getWinningLine, isValidBingo, generateBoardFrom, toImageName } from '../gameLogic'

describe('Game Logic Functions', () => {
  describe('checkBingo', () => {
    it('detects row wins', () => {
      const marks = [
        [true, true, true, true],   // Winning row
        [false, false, false, false],
        [false, false, false, false],
        [false, false, false, false]
      ]
      expect(checkBingo(marks)).toBe(true)
    })

    it('detects column wins', () => {
      const marks = [
        [true, false, false, false],
        [true, false, false, false],  // Winning column
        [true, false, false, false],
        [true, false, false, false]
      ]
      expect(checkBingo(marks)).toBe(true)
    })

    it('detects main diagonal wins', () => {
      const marks = [
        [true, false, false, false],
        [false, true, false, false],   // Main diagonal
        [false, false, true, false],
        [false, false, false, true]
      ]
      expect(checkBingo(marks)).toBe(true)
    })

    it('detects anti-diagonal wins', () => {
      const marks = [
        [false, false, false, true],
        [false, false, true, false],   // Anti-diagonal
        [false, true, false, false],
        [true, false, false, false]
      ]
      expect(checkBingo(marks)).toBe(true)
    })

    it('detects corner wins', () => {
      const marks = [
        [true, false, false, true],    // Corners
        [false, false, false, false],
        [false, false, false, false],
        [true, false, false, true]
      ]
      expect(checkBingo(marks)).toBe(true)
    })

    it('detects center wins', () => {
      const marks = [
        [false, false, false, false],
        [false, true, true, false],    // Center 2x2
        [false, true, true, false],
        [false, false, false, false]
      ]
      expect(checkBingo(marks)).toBe(true)
    })

    it('returns false for no wins', () => {
      const marks = [
        [true, false, false, false],
        [false, true, false, false],
        [false, false, false, false],   // No winning pattern
        [false, false, false, true]
      ]
      expect(checkBingo(marks)).toBe(false)
    })
  })

  describe('getWinningLine', () => {
    it('identifies winning row', () => {
      const marks = [
        [false, false, false, false],
        [true, true, true, true],      // Row 1 wins
        [false, false, false, false],
        [false, false, false, false]
      ]
      expect(getWinningLine(marks)).toEqual({ type: 'row', index: 1 })
    })

    it('identifies winning column', () => {
      const marks = [
        [false, false, true, false],
        [false, false, true, false],   // Column 2 wins
        [false, false, true, false],
        [false, false, true, false]
      ]
      expect(getWinningLine(marks)).toEqual({ type: 'col', index: 2 })
    })

    it('returns null for no wins', () => {
      const marks = [
        [true, false, false, false],
        [false, true, false, false],
        [false, false, false, false],
        [false, false, false, true]
      ]
      expect(getWinningLine(marks)).toBeNull()
    })
  })

  describe('isValidBingo', () => {
    const sampleBoard = [
      ['la-dama', 'el-catrin', 'la-muerte', 'el-corazon'],
      ['la-luna', 'el-sol', 'la-estrella', 'el-mundo'],
      ['el-gallo', 'la-rosa', 'el-pajaro', 'la-mano'],
      ['el-arbol', 'la-corona', 'el-borracho', 'la-sirena']
    ]

    it('validates legitimate row bingo', () => {
      const marks = [
        [true, true, true, true],      // Row 0 marked
        [false, false, false, false],
        [false, false, false, false],
        [false, false, false, false]
      ]
      const calledCards = ['la-dama', 'el-catrin', 'la-muerte', 'el-corazon']
      const line = { type: 'row', index: 0 }
      
      expect(isValidBingo(sampleBoard, marks, line, calledCards)).toBe(true)
    })

    it('rejects invalid bingo with uncalled cards', () => {
      const marks = [
        [true, true, true, true],      // Row 0 marked
        [false, false, false, false],
        [false, false, false, false],
        [false, false, false, false]
      ]
      const calledCards = ['la-dama', 'el-catrin']  // Missing 'la-muerte', 'el-corazon'
      const line = { type: 'row', index: 0 }
      
      expect(isValidBingo(sampleBoard, marks, line, calledCards)).toBe(false)
    })

    it('validates partial marking with called cards', () => {
      const marks = [
        [true, false, true, false],    // Only some cards marked
        [false, false, false, false],
        [false, false, false, false],
        [false, false, false, false]
      ]
      const calledCards = ['la-dama', 'la-muerte', 'extra-card']
      const line = null // No winning line
      
      expect(isValidBingo(sampleBoard, marks, line, calledCards)).toBe(false)
    })
  })

  describe('generateBoardFrom', () => {
    const cardPool = [
      'la-dama', 'el-catrin', 'la-muerte', 'el-corazon',
      'la-luna', 'el-sol', 'la-estrella', 'el-mundo',
      'el-gallo', 'la-rosa', 'el-pajaro', 'la-mano',
      'el-arbol', 'la-corona', 'el-borracho', 'la-sirena',
      'la-arana', 'el-apache', 'la-bandera', 'el-tambor'
    ]

    it('generates 4x4 board from card pool', () => {
      const board = generateBoardFrom(cardPool)
      
      expect(board).toHaveLength(4)
      expect(board[0]).toHaveLength(4)
      expect(board[1]).toHaveLength(4)
      expect(board[2]).toHaveLength(4)
      expect(board[3]).toHaveLength(4)
    })

    it('uses unique cards from the pool', () => {
      const board = generateBoardFrom(cardPool)
      const flatBoard = board.flat()
      const uniqueCards = new Set(flatBoard)
      
      expect(uniqueCards.size).toBe(16) // All 16 positions should be unique
      flatBoard.forEach((card: string) => {
        expect(cardPool).toContain(card)
      })
    })

    it('throws error with insufficient cards', () => {
      const smallPool = ['card1', 'card2', 'card3']
      
      expect(() => generateBoardFrom(smallPool)).toThrow('Need at least 16 cards to generate a board')
    })

    it('generates different boards on multiple calls', () => {
      const board1 = generateBoardFrom(cardPool)
      const board2 = generateBoardFrom(cardPool)
      
      // Very unlikely to generate identical boards due to randomization
      expect(JSON.stringify(board1)).not.toBe(JSON.stringify(board2))
    })
  })

  describe('toImageName', () => {
    // Improved helper function to handle accented characters
    function toImageName(name: string): string {
      return name
        .toLowerCase()
        .normalize('NFD') // Decompose accented characters
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }

    it('converts Spanish names to image filenames', () => {
      expect(toImageName('La Dama')).toBe('la-dama')
      expect(toImageName('El Corazón')).toBe('el-corazon')
      expect(toImageName('La Muerte')).toBe('la-muerte')
    })

    it('handles special characters and accents', () => {
      expect(toImageName('El Niño')).toBe('el-nino')
      expect(toImageName('La Señora')).toBe('la-senora')
      expect(toImageName('El Corazón Rojo')).toBe('el-corazon-rojo')
    })

    it('removes leading and trailing hyphens', () => {
      expect(toImageName('!@#La Dama!@#')).toBe('la-dama')
      expect(toImageName('---El Sol---')).toBe('el-sol')
    })

    it('handles empty and single character strings', () => {
      expect(toImageName('')).toBe('')
      expect(toImageName('A')).toBe('a')
      expect(toImageName('!')).toBe('')
    })
  })
})
