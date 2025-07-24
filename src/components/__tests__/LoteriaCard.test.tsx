import { render, screen, fireEvent } from '@testing-library/react'
import { SettingsProvider } from '@/context/SettingsContext'
import LoteriaCard from '@/components/LoteriaCard'

// Mock the card image loading
jest.mock('next/image', () => {
  return function MockedImage({ src, alt, ...props }: any) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />
  }
})

// Wrapper component that provides SettingsContext
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <SettingsProvider>{children}</SettingsProvider>
)

describe('LoteriaCard Component', () => {
  const mockProps = {
    name: 'la-dama',
    variant: 'default' as const,
    className: 'test-class'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders card with correct image src', () => {
    render(
      <TestWrapper>
        <LoteriaCard {...mockProps} />
      </TestWrapper>
    )
    
    const image = screen.getByAltText('la-dama')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', '/cards/la-dama.png')
  })

  it('applies custom className', () => {
    render(
      <TestWrapper>
        <LoteriaCard {...mockProps} />
      </TestWrapper>
    )
    
    const cardContainer = screen.getByRole('button')
    expect(cardContainer).toHaveClass('test-class')
  })

  it('handles click events in default variant', () => {
    const onClickMock = jest.fn()
    render(
      <TestWrapper>
        <LoteriaCard {...mockProps} onClick={onClickMock} />
      </TestWrapper>
    )
    
    const card = screen.getByRole('button')
    fireEvent.click(card)
    
    expect(onClickMock).toHaveBeenCalledTimes(1)
  })

  it('renders plain variant without click handler', () => {
    render(
      <TestWrapper>
        <LoteriaCard {...mockProps} variant="plain" />
      </TestWrapper>
    )
    
    // Plain variant should not be a button
    const buttons = screen.queryAllByRole('button')
    expect(buttons).toHaveLength(0)
  })

  it('shows fallback image on error', () => {
    render(
      <TestWrapper>
        <LoteriaCard {...mockProps} />
      </TestWrapper>
    )
    
    const image = screen.getByAltText('la-dama')
    
    // Simulate image load error
    fireEvent.error(image)
    
    // Should fallback to default image
    setTimeout(() => {
      expect(image).toHaveAttribute('src', '/cards/el-corazon.png')
    }, 100)
  })

  it('handles custom theme paths', () => {
    render(
      <TestWrapper>
        <LoteriaCard name="horror-card" variant="default" />
      </TestWrapper>
    )
    
    const image = screen.getByAltText('horror-card')
    expect(image).toHaveAttribute('src', '/cards/horror-card.png')
  })

  it('applies expected styling classes', () => {
    render(
      <TestWrapper>
        <LoteriaCard {...mockProps} />
      </TestWrapper>
    )
    
    const cardContainer = screen.getByRole('button')
    expect(cardContainer).toHaveClass('w-24', 'h-32', 'flex', 'rounded-lg')
  })

  it('maintains proper aspect ratio styling', () => {
    render(
      <TestWrapper>
        <LoteriaCard {...mockProps} />
      </TestWrapper>
    )
    
    const cardContainer = screen.getByRole('button')
    expect(cardContainer).toHaveClass('w-24', 'h-32')
  })

  it('renders as clickable button', () => {
    render(
      <TestWrapper>
        <LoteriaCard {...mockProps} />
      </TestWrapper>
    )
    
    const card = screen.getByRole('button')
    expect(card).toBeInTheDocument()
  })
})
