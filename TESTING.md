# Testing Documentation - Lotería Online

## Test Suite Overview

This project includes comprehensive testing for the Lotería multiplayer game application. The tests ensure code quality, functionality, and reliability across all components and game logic.

## Test Structure

```
src/
├── components/
│   └── __tests__/
│       ├── LoteriaCard.test.tsx      # Card component tests
│       ├── LoteriaBoard.test.tsx     # Game board tests
│       └── CopyrightFooter.test.tsx  # Footer component tests
├── context/
│   └── __tests__/
│       └── SettingsContext.test.tsx  # Settings state management tests
├── lib/
│   └── __tests__/
│       ├── gameLogic.test.ts         # Core game logic utilities
│       ├── gameLogic.spec.ts         # Game logic validation tests
│       └── utilities.test.ts         # Helper function tests
└── app/
    └── api/
        └── __tests__/
            └── cards.test.ts         # API endpoint tests
```

## Testing Technologies

- **Jest**: Main testing framework
- **React Testing Library**: Component testing utilities
- **@testing-library/jest-dom**: DOM testing matchers
- **@testing-library/user-event**: User interaction simulation
- **jest-environment-jsdom**: Browser environment simulation

## Test Categories

### 1. Component Tests
- **LoteriaCard**: Card rendering, click handling, styling, accessibility
- **LoteriaBoard**: 4x4 grid layout, mark detection, user interactions
- **CopyrightFooter**: Layout positioning, styling consistency

### 2. Game Logic Tests
- **Bingo Detection**: Row, column, diagonal, corner, and center patterns
- **Win Validation**: Ensures only legitimate wins with called cards
- **Board Generation**: Random board creation from card pools
- **Card Name Conversion**: Display name to filename transformation

### 3. Context Tests
- **SettingsContext**: State management, localStorage integration, theme switching
- **Provider Functionality**: Context value updates and persistence

### 4. Utility Tests
- **Board Backgrounds**: Theme style generation and consistency
- **Helper Functions**: String conversion, board validation
- **Pattern Detection**: Various winning pattern algorithms

### 5. API Tests
- **Cards Endpoint**: Traditional and custom deck retrieval
- **Lobby Management**: Creation, joining, and state management
- **Error Handling**: Graceful failure and recovery

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (Development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Specific Test Files
```bash
# Component tests
npm test -- --testPathPattern=components

# Game logic tests
npm test -- --testPathPattern=gameLogic

# API tests
npm test -- --testPathPattern=api
```

## Test Patterns Used

### 1. **Arrange-Act-Assert (AAA)**
```typescript
it('should detect row wins', () => {
  // Arrange
  const marks = [[true, true, true, true], ...]
  
  // Act
  const result = checkBingo(marks)
  
  // Assert
  expect(result).toBe(true)
})
```

### 2. **Mock Testing**
```typescript
// Mock external dependencies
jest.mock('@/lib/socket', () => ({
  getSocket: jest.fn(() => mockSocket)
}))
```

### 3. **Component Testing**
```typescript
// Test user interactions
render(<LoteriaCard name="la-dama" onClick={mockClick} />)
fireEvent.click(screen.getByRole('button'))
expect(mockClick).toHaveBeenCalled()
```

## Coverage Goals

- **Components**: 90%+ coverage on user interactions and rendering
- **Game Logic**: 100% coverage on win detection and validation
- **Utilities**: 95%+ coverage on helper functions
- **API Integration**: 85%+ coverage on endpoints and error handling

## Test Data

### Sample Cards
Traditional deck includes 54 authentic Lotería cards:
- La Dama, El Catrin, La Muerte, El Corazón
- La Luna, El Sol, La Estrella, El Mundo
- [Complete traditional set...]

### Custom Themes
- **Horror**: Spooky themed alternatives
- **Cute**: Family-friendly designs
- **Dark Mysterious**: Gothic aesthetic

## Mocking Strategy

### External Dependencies
- **Socket.IO**: Connection and event handling
- **Next.js Router**: Navigation functionality
- **localStorage**: Settings persistence
- **Web Speech API**: Card announcements
- **Image Loading**: Card asset management

### API Endpoints
- Mock fetch responses for consistent testing
- Error scenario simulation
- Network failure handling

## Continuous Integration

Tests run automatically on:
- Pull requests
- Main branch commits
- Deployment preparation

## Test Maintenance

### Best Practices
1. **Keep tests simple and focused**
2. **Use descriptive test names**
3. **Mock external dependencies**
4. **Test edge cases and error conditions**
5. **Maintain test data consistency**

### Common Issues
- **Canvas dependency conflicts** (resolved with legacy-peer-deps)
- **Next.js async configuration** (handled by next/jest)
- **Module path resolution** (configured in jest.config.js)

## Future Testing Plans

### Phase 1: Current Implementation ✅
- Core component testing
- Game logic validation
- Basic API testing

### Phase 2: Enhanced Coverage
- Integration testing
- End-to-end user flows
- Performance testing

### Phase 3: Advanced Testing
- Visual regression testing
- Accessibility testing
- Load testing for multiplayer

## Debugging Tests

### Common Commands
```bash
# Run tests with verbose output
npm test -- --verbose

# Debug specific test
npm test -- --testNamePattern="detects row wins"

# Run tests without coverage
npm test -- --coverage=false
```

### VS Code Integration
- Tests can be run directly from VS Code
- Debugging breakpoints supported
- Test explorer integration available

This comprehensive test suite ensures the Lotería Online game is robust, reliable, and ready for production deployment! 🎯
