import { render, screen, fireEvent, act } from '@testing-library/react'
import { SettingsProvider, useSettings } from '@/context/SettingsContext'

// Test component to use the context
function TestComponent() {
  const { boardEdge, deckTheme, notifications, sound, setNotifications, setSound, setBoardEdge, setDeckTheme } = useSettings()
  
  return (
    <div>
      <div data-testid="board-edge">{boardEdge}</div>
      <div data-testid="deck-theme">{deckTheme}</div>
      <div data-testid="notifications">{notifications.toString()}</div>
      <div data-testid="sound-enabled">{sound.toString()}</div>
      <button onClick={() => setNotifications(!notifications)}>Toggle Notifications</button>
      <button onClick={() => setSound(!sound)}>Toggle Sound</button>
      <button onClick={() => setBoardEdge('gold')}>Set Gold</button>
      <button onClick={() => setDeckTheme('horror')}>Set Horror</button>
    </div>
  )
}

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

describe('SettingsContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  it('provides default settings values', () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    )

    expect(screen.getByTestId('board-edge')).toHaveTextContent('classic')
    expect(screen.getByTestId('deck-theme')).toHaveTextContent('traditional')
    expect(screen.getByTestId('notifications')).toHaveTextContent('true')
    expect(screen.getByTestId('sound-enabled')).toHaveTextContent('true')
  })

  it('loads settings from localStorage', () => {
    mockLocalStorage.getItem.mockImplementation((key) => {
      const values: { [key: string]: string } = {
        'boardEdge': 'gold',
        'deckTheme': 'horror',
        'notifications': 'false',
        'sound': 'false'
      }
      return values[key] || null
    })

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    )

    expect(screen.getByTestId('board-edge')).toHaveTextContent('gold')
    expect(screen.getByTestId('deck-theme')).toHaveTextContent('horror')
    expect(screen.getByTestId('notifications')).toHaveTextContent('false')
    expect(screen.getByTestId('sound-enabled')).toHaveTextContent('false')
  })

  it('updates board edge setting', () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    )

    const setGoldButton = screen.getByText('Set Gold')

    act(() => {
      fireEvent.click(setGoldButton)
    })

    expect(screen.getByTestId('board-edge')).toHaveTextContent('gold')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('boardEdge', 'gold')
  })

  it('updates deck theme setting', () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    )

    const setHorrorButton = screen.getByText('Set Horror')

    act(() => {
      fireEvent.click(setHorrorButton)
    })

    expect(screen.getByTestId('deck-theme')).toHaveTextContent('horror')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('deckTheme', 'horror')
  })

  it('toggles notifications setting', () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    )

    const toggleButton = screen.getByText('Toggle Notifications')
    
    // Initially true, click to false
    act(() => {
      fireEvent.click(toggleButton)
    })
    expect(screen.getByTestId('notifications')).toHaveTextContent('false')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('notifications', 'false')
    
    // Click again to true
    act(() => {
      fireEvent.click(toggleButton)
    })
    expect(screen.getByTestId('notifications')).toHaveTextContent('true')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('notifications', 'true')
  })

  it('toggles sound setting', () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    )

    const toggleButton = screen.getByText('Toggle Sound')
    
    // Initially true, click to false
    act(() => {
      fireEvent.click(toggleButton)
    })
    expect(screen.getByTestId('sound-enabled')).toHaveTextContent('false')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('sound', 'false')
    
    // Click again to true
    act(() => {
      fireEvent.click(toggleButton)
    })
    expect(screen.getByTestId('sound-enabled')).toHaveTextContent('true')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('sound', 'true')
  })

  it('throws error when used outside provider', () => {
    // Capture console.error to suppress error output during test
    const originalError = console.error
    console.error = jest.fn()

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useSettings must be used within SettingsProvider')

    console.error = originalError
  })
})
