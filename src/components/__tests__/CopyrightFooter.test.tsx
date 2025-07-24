import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import CopyrightFooter from '@/components/CopyrightFooter'

describe('CopyrightFooter Component', () => {
  it('renders copyright text', () => {
    render(<CopyrightFooter />)
    
    const copyrightSymbol = screen.getByText('©')
    const authorText = screen.getByText('ketelsencoding')
    expect(copyrightSymbol).toBeInTheDocument()
    expect(authorText).toBeInTheDocument()
  })

  it('is positioned at the bottom of the screen', () => {
    render(<CopyrightFooter />)
    
    const footer = screen.getByText('ketelsencoding').closest('div')
    expect(footer).toHaveClass('fixed', 'bottom-4')
  })

  it('is positioned on the right side', () => {
    render(<CopyrightFooter />)
    
    const footer = screen.getByText('ketelsencoding').closest('div')
    expect(footer).toHaveClass('right-4')
  })

  it('has appropriate styling classes', () => {
    render(<CopyrightFooter />)
    
    const footer = screen.getByText('ketelsencoding').closest('div')
    expect(footer).toHaveClass('z-50', 'bg-white/80')
  })

  it('has accessible text styling', () => {
    render(<CopyrightFooter />)
    
    const copyrightSymbol = screen.getByLabelText('Copyright')
    expect(copyrightSymbol).toBeInTheDocument()
    expect(copyrightSymbol).toHaveAttribute('title', 'Copyright')
  })

  it('renders consistently', () => {
    const { rerender } = render(<CopyrightFooter />)
    
    expect(screen.getByText('ketelsencoding')).toBeInTheDocument()
    
    // Re-render should produce same result
    rerender(<CopyrightFooter />)
    expect(screen.getByText('ketelsencoding')).toBeInTheDocument()
  })

  it('has correct semantic structure', () => {
    render(<CopyrightFooter />)
    
    const footer = screen.getByText('ketelsencoding').closest('div')
    
    // Should be a proper footer-type element structure
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveClass('fixed')
  })
})
