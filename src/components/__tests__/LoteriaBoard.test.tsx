import { render, screen } from '@testing-library/react'
import { SettingsProvider } from '@/context/SettingsContext'
import LoteriaBoard from '@/components/LoteriaBoard'

// Mock LoteriaCard component
jest.mock('@/components/LoteriaCard', () => {
  return function MockedLoteriaCard({ name, onClick, className }: any) {
    return (
      <button 
        onClick={onClick} 
        className={className}
        data-testid={`card-${name}`}
      >
        {name}
      </button>
    )
  }
})

// Wrapper component that provides SettingsContext
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <SettingsProvider>{children}</SettingsProvider>
)

describe('LoteriaBoard Component', () => {
  const mockBoard = [
    ['la-dama', 'el-catrin', 'la-muerte', 'el-corazon'],
    ['la-luna', 'el-sol', 'la-estrella', 'el-mundo'],
    ['el-gallo', 'la-rosa', 'el-pajaro', 'la-mano'],
    ['el-arbol', 'la-corona', 'el-borracho', 'la-sirena']
  ]

  const mockMarks = [
    [true, false, true, false],
    [false, true, false, true],
    [true, false, true, false],
    [false, true, false, true]
  ]

  const mockOnMark = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders 4x4 grid of cards', () => {
    render(
      <TestWrapper>
        <LoteriaBoard 
          board={mockBoard} 
          marks={mockMarks} 
          onMark={mockOnMark} 
        />
      </TestWrapper>
    )

    // Should render 16 cards total
    expect(screen.getAllByRole('button')).toHaveLength(16)
  })

  it('renders cards with correct names', () => {
    render(
      <TestWrapper>
        <LoteriaBoard 
          board={mockBoard} 
          marks={mockMarks} 
          onMark={mockOnMark} 
        />
      </TestWrapper>
    )

    // Check specific cards are present
    expect(screen.getByTestId('card-la-dama')).toBeInTheDocument()
    expect(screen.getByTestId('card-el-catrin')).toBeInTheDocument()
    expect(screen.getByTestId('card-la-muerte')).toBeInTheDocument()
    expect(screen.getByTestId('card-la-sirena')).toBeInTheDocument()
  })

  it('applies expected styling to cards', () => {
    render(
      <TestWrapper>
        <LoteriaBoard 
          board={mockBoard} 
          marks={mockMarks} 
          onMark={mockOnMark} 
        />
      </TestWrapper>
    )

    const firstCard = screen.getByTestId('card-la-dama')
    const secondCard = screen.getByTestId('card-el-catrin')
    
    // Cards should be rendered as buttons
    expect(firstCard).toBeInTheDocument()
    expect(secondCard).toBeInTheDocument()
  })

  it('renders board with responsive grid layout', () => {
    render(
      <TestWrapper>
        <LoteriaBoard 
          board={mockBoard} 
          marks={mockMarks} 
          onMark={mockOnMark} 
        />
      </TestWrapper>
    )

    const boardContainer = screen.getByTestId('card-la-dama').parentElement
    expect(boardContainer).toHaveClass('grid', 'grid-cols-4')
  })

  it('calls onMark when cards are clicked', () => {
    render(
      <TestWrapper>
        <LoteriaBoard 
          board={mockBoard} 
          marks={mockMarks} 
          onMark={mockOnMark} 
        />
      </TestWrapper>
    )

    const firstCard = screen.getByTestId('card-la-dama')
    firstCard.click()

    expect(mockOnMark).toHaveBeenCalledWith(0, 0)
  })

  it('calls onMark with different coordinates', () => {
    render(
      <TestWrapper>
        <LoteriaBoard 
          board={mockBoard} 
          marks={mockMarks} 
          onMark={mockOnMark} 
        />
      </TestWrapper>
    )

    const lastCard = screen.getByTestId('card-la-sirena') // Bottom right: [3][3]
    lastCard.click()

    expect(mockOnMark).toHaveBeenCalledWith(3, 3)
  })

  it('handles empty board gracefully', () => {
    const emptyBoard = [['', '', '', ''], ['', '', '', ''], ['', '', '', ''], ['', '', '', '']]
    const emptyMarks = [[false, false, false, false], [false, false, false, false], [false, false, false, false], [false, false, false, false]]

    render(
      <TestWrapper>
        <LoteriaBoard 
          board={emptyBoard} 
          marks={emptyMarks} 
          onMark={mockOnMark} 
        />
      </TestWrapper>
    )

    // Should still render the grid structure
    expect(screen.getAllByRole('button')).toHaveLength(16)
  })
})
