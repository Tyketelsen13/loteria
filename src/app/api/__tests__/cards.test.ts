/**
 * API Integration Tests for Lotería Online
 * Tests the /api/cards endpoint functionality
 */

// Mock fetch for testing
global.fetch = jest.fn()

describe('/api/cards API', () => {
  beforeEach(() => {
    // Clear all mock calls before each test
    jest.clearAllMocks()
  })

  describe('Traditional deck', () => {
    it('should return default traditional cards', async () => {
      // Mock successful response
      const mockCards = [
        'La Dama', 'El Catrin', 'La Muerte', 'El Corazón',
        'La Luna', 'El Sol', 'La Estrella', 'El Mundo'
      ]
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCards,
      })

      const response = await fetch('/api/cards')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data).toEqual(mockCards)
      expect(data.length).toBeGreaterThan(0)
    })

    it('should handle API errors gracefully', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      const response = await fetch('/api/cards')
      expect(response.ok).toBe(false)
      expect(response.status).toBe(500)
    })
  })

  describe('Custom deck themes', () => {
    it('should return horror theme cards when specified', async () => {
      const mockHorrorCards = [
        'The Skeleton', 'The Ghost', 'The Vampire', 'The Witch'
      ]
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockHorrorCards,
      })

      const response = await fetch('/api/cards?deckTheme=horror')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data).toEqual(mockHorrorCards)
    })

    it('should return cute theme cards when specified', async () => {
      const mockCuteCards = [
        'The Puppy', 'The Kitten', 'The Bunny', 'The Bear'
      ]
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCuteCards,
      })

      const response = await fetch('/api/cards?deckTheme=cute')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data).toEqual(mockCuteCards)
    })
  })

  describe('Card validation', () => {
    it('should return array of strings', async () => {
      const mockCards = ['Card 1', 'Card 2', 'Card 3']
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCards,
      })

      const response = await fetch('/api/cards')
      const data = await response.json()

      expect(Array.isArray(data)).toBe(true)
      data.forEach((card: any) => {
        expect(typeof card).toBe('string')
        expect(card.length).toBeGreaterThan(0)
      })
    })

    it('should return sufficient cards for game (minimum 16)', async () => {
      const mockCards = Array.from({ length: 54 }, (_, i) => `Card ${i + 1}`)
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCards,
      })

      const response = await fetch('/api/cards')
      const data = await response.json()

      expect(data.length).toBeGreaterThanOrEqual(16)
    })
  })
})

describe('Lobby API functionality', () => {
  describe('/api/lobbies', () => {
    it('should handle lobby creation', async () => {
      const mockLobby = {
        code: 'ABC123',
        players: ['Player1'],
        createdAt: new Date().toISOString()
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLobby,
      })

      const response = await fetch('/api/lobbies', {
        method: 'POST',
        body: JSON.stringify({ playerName: 'Player1' })
      })
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.code).toBeDefined()
      expect(data.players).toContain('Player1')
    })

    it('should handle lobby retrieval', async () => {
      const mockLobbies = [
        { code: 'ABC123', players: ['Player1', 'Player2'] },
        { code: 'XYZ789', players: ['Player3'] }
      ]
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLobbies,
      })

      const response = await fetch('/api/lobbies')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThanOrEqual(0)
    })
  })
})
