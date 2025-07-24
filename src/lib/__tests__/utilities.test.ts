/**
 * Utility Tests for Board Backgrounds and Settings
 */

import { getBoardEdgeStyle } from '@/lib/boardBackgrounds'

describe('Board Background Utilities', () => {
  describe('getBoardEdgeStyle', () => {
    it('returns classic style for classic theme', () => {
      const result = getBoardEdgeStyle('classic')
      expect(result).toContain('linear-gradient')
      expect(result).toContain('#') // Should contain hex colors
    })

    it('returns ocean style for ocean theme', () => {
      const result = getBoardEdgeStyle('ocean')
      expect(result).toContain('linear-gradient')
      expect(result).toContain('#') // Should contain hex colors
    })

    it('returns forest style for forest theme', () => {
      const result = getBoardEdgeStyle('forest')
      expect(result).toContain('linear-gradient')
      expect(result).toContain('#') // Should contain hex colors
    })

    it('returns sunset style for sunset theme', () => {
      const result = getBoardEdgeStyle('sunset')
      expect(result).toContain('linear-gradient')
      expect(result).toContain('#') // Should contain hex colors
    })

    it('returns royal style for royal theme', () => {
      const result = getBoardEdgeStyle('royal')
      expect(result).toContain('linear-gradient')
      expect(result).toContain('#') // Should contain hex colors
    })

    it('handles invalid theme gracefully', () => {
      const result = getBoardEdgeStyle('invalid-theme' as any)
      // Should return default style
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('generates different styles for different themes', () => {
      const classic = getBoardEdgeStyle('classic')
      const ocean = getBoardEdgeStyle('ocean')
      const forest = getBoardEdgeStyle('forest')

      // Each theme should produce a unique style
      expect(classic).not.toBe(ocean)
      expect(ocean).not.toBe(forest)
      expect(classic).not.toBe(forest)
    })

    it('produces consistent results for same theme', () => {
      const result1 = getBoardEdgeStyle('classic')
      const result2 = getBoardEdgeStyle('classic')
      
      expect(result1).toBe(result2)
    })
  })
})

describe('Game Helper Functions', () => {
  describe('String conversion utilities', () => {
    function toImageName(name: string): string {
      return name
        .toLowerCase()
        .normalize('NFD') // Decompose accented characters
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }

    it('converts display names to image filenames', () => {
      expect(toImageName('La Dama')).toBe('la-dama')
      expect(toImageName('El Corazón')).toBe('el-corazon')
      expect(toImageName('La Muerte')).toBe('la-muerte')
    })

    it('handles special characters', () => {
      expect(toImageName('El Niño')).toBe('el-nino')
      expect(toImageName('La Señora')).toBe('la-senora')
      expect(toImageName('El Corazón Rojo')).toBe('el-corazon-rojo')
    })

    it('removes extra punctuation', () => {
      expect(toImageName('!@#La Dama!@#')).toBe('la-dama')
      expect(toImageName('---El Sol---')).toBe('el-sol')
      expect(toImageName('Las... Flores')).toBe('las-flores')
    })
  })

  describe('Board generation', () => {
    function generateRandomBoard(cardNames: string[]): string[][] {
      if (cardNames.length < 16) {
        throw new Error('Need at least 16 cards')
      }
      
      const shuffled = [...cardNames].sort(() => Math.random() - 0.5)
      return [
        shuffled.slice(0, 4),
        shuffled.slice(4, 8),
        shuffled.slice(8, 12),
        shuffled.slice(12, 16),
      ]
    }

    const sampleCards = [
      'la-dama', 'el-catrin', 'la-muerte', 'el-corazon',
      'la-luna', 'el-sol', 'la-estrella', 'el-mundo',
      'el-gallo', 'la-rosa', 'el-pajaro', 'la-mano',
      'el-arbol', 'la-corona', 'el-borracho', 'la-sirena',
      'la-arana', 'el-apache', 'la-bandera', 'el-tambor'
    ]

    it('creates 4x4 board from card list', () => {
      const board = generateRandomBoard(sampleCards)
      
      expect(board).toHaveLength(4)
      board.forEach(row => {
        expect(row).toHaveLength(4)
      })
    })

    it('uses unique cards from the pool', () => {
      const board = generateRandomBoard(sampleCards)
      const usedCards = board.flat()
      const uniqueCards = new Set(usedCards)
      
      expect(uniqueCards.size).toBe(16)
      usedCards.forEach(card => {
        expect(sampleCards).toContain(card)
      })
    })

    it('throws error with insufficient cards', () => {
      const smallPool = ['card1', 'card2', 'card3']
      expect(() => generateRandomBoard(smallPool)).toThrow('Need at least 16 cards')
    })
  })

  describe('Bingo pattern detection', () => {
    function hasRowWin(marks: boolean[][]): boolean {
      return marks.some(row => row.every(Boolean))
    }

    function hasColumnWin(marks: boolean[][]): boolean {
      for (let col = 0; col < 4; col++) {
        if (marks.every(row => row[col])) return true
      }
      return false
    }

    function hasDiagonalWin(marks: boolean[][]): boolean {
      const mainDiag = [0, 1, 2, 3].every(i => marks[i][i])
      const antiDiag = [0, 1, 2, 3].every(i => marks[i][3 - i])
      return mainDiag || antiDiag
    }

    it('detects row wins correctly', () => {
      const rowWin = [
        [true, true, true, true],
        [false, false, false, false],
        [false, false, false, false],
        [false, false, false, false]
      ]
      expect(hasRowWin(rowWin)).toBe(true)

      const noRowWin = [
        [true, true, false, true],
        [false, false, false, false],
        [false, false, false, false],
        [false, false, false, false]
      ]
      expect(hasRowWin(noRowWin)).toBe(false)
    })

    it('detects column wins correctly', () => {
      const colWin = [
        [true, false, false, false],
        [true, false, false, false],
        [true, false, false, false],
        [true, false, false, false]
      ]
      expect(hasColumnWin(colWin)).toBe(true)

      const noColWin = [
        [true, false, false, false],
        [false, false, false, false],
        [true, false, false, false],
        [true, false, false, false]
      ]
      expect(hasColumnWin(noColWin)).toBe(false)
    })

    it('detects diagonal wins correctly', () => {
      const diagWin = [
        [true, false, false, false],
        [false, true, false, false],
        [false, false, true, false],
        [false, false, false, true]
      ]
      expect(hasDiagonalWin(diagWin)).toBe(true)

      const antiDiagWin = [
        [false, false, false, true],
        [false, false, true, false],
        [false, true, false, false],
        [true, false, false, false]
      ]
      expect(hasDiagonalWin(antiDiagWin)).toBe(true)

      const noDiagWin = [
        [true, false, false, false],
        [false, false, false, false],
        [false, false, true, false],
        [false, false, false, true]
      ]
      expect(hasDiagonalWin(noDiagWin)).toBe(false)
    })
  })
})
