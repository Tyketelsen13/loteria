/**
 * Simple Component Tests
 * Basic tests to verify React Testing Library setup is working
 */

import { render } from '@testing-library/react'

// Simple test component
function TestButton({ onClick, children }: { onClick: () => void, children: React.ReactNode }) {
  return <button onClick={onClick}>{children}</button>
}

// Another simple component
function TestDiv({ className, children }: { className?: string, children: React.ReactNode }) {
  return <div className={className}>{children}</div>
}

describe('Simple Component Tests', () => {
  it('renders a button with text', () => {
    const mockClick = jest.fn()
    const { getByText } = render(<TestButton onClick={mockClick}>Click me</TestButton>)
    
    const button = getByText('Click me')
    expect(button).toBeTruthy()
    expect(button.tagName).toBe('BUTTON')
  })

  it('renders a div with className', () => {
    const { container } = render(<TestDiv className="test-class">Hello World</TestDiv>)
    
    const div = container.querySelector('.test-class')
    expect(div).toBeTruthy()
    expect(div?.textContent).toBe('Hello World')
  })

  it('handles click events', () => {
    const mockClick = jest.fn()
    const { getByText } = render(<TestButton onClick={mockClick}>Test</TestButton>)
    
    const button = getByText('Test')
    button.click()
    
    expect(mockClick).toHaveBeenCalledTimes(1)
  })

  it('renders multiple children', () => {
    const { container } = render(
      <TestDiv>
        <span>Child 1</span>
        <span>Child 2</span>
      </TestDiv>
    )
    
    expect(container.textContent).toContain('Child 1')
    expect(container.textContent).toContain('Child 2')
  })
})

describe('React Testing Library Setup', () => {
  it('can render React components', () => {
    const { container } = render(<div>Test</div>)
    expect(container.firstChild).toBeTruthy()
  })

  it('can find elements by text', () => {
    const { getByText } = render(<p>Hello Testing</p>)
    expect(getByText('Hello Testing')).toBeTruthy()
  })

  it('can handle props', () => {
    function PropTest({ message }: { message: string }) {
      return <h1>{message}</h1>
    }
    
    const { getByText } = render(<PropTest message="Props work!" />)
    expect(getByText('Props work!')).toBeTruthy()
  })
})
