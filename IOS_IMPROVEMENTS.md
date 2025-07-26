# iOS CSS Fixes and Improvements

This document outlines all the iOS-specific fixes applied to improve the Lotería application's appearance and functionality on iOS devices.

## Summary of Changes

### 1. Global CSS Improvements (`src/app/globals.css`)

#### Viewport and Scrolling Fixes
- Added `100dvh` (dynamic viewport height) support for iOS notched devices
- Fixed background attachment (iOS doesn't support `fixed` well)
- Added `-webkit-overflow-scrolling: touch` for smooth scrolling
- Prevented horizontal scrolling and rubber band effects
- Added safe area inset support for notched devices

#### Text and Font Rendering
- Added `-webkit-font-smoothing: antialiased` for better text rendering
- Fixed text size adjustment to prevent zoom on input focus
- Set minimum font size of 16px to prevent iOS zoom behavior

#### Touch Target Improvements
- Minimum 44px touch targets (iOS requirement)
- Added `-webkit-tap-highlight-color` customization
- Disabled text selection where inappropriate
- Added `touch-action: manipulation` to prevent zoom

#### Input and Button Fixes
- Removed iOS default styling with `-webkit-appearance: none`
- Fixed button appearance for iOS Safari
- Added proper focus states without zoom triggers

### 2. Tailwind Configuration Updates (`tailwind.config.js`)

#### New iOS-Specific Utilities
- `min-h-screen-ios`: Dynamic viewport height
- `min-h-touch` / `min-w-touch`: 44px minimum touch targets
- `ios-smooth`: Font smoothing for iOS
- `ios-scroll`: Touch scrolling optimization
- `ios-tap-transparent`: Transparent tap highlights
- `ios-no-callout`: Disable iOS callouts
- `ios-no-select`: Disable text selection
- `ios-appearance-none`: Remove default iOS styling
- `ios-transform-gpu`: GPU acceleration for performance
- `touch-manipulation`: Touch behavior control

#### Safe Area Support
- `safe-area-top/bottom/left/right`: Padding for safe areas
- CSS variables for `env(safe-area-inset-*)` values

### 3. Component Updates

#### LoteriaCard Component (`src/components/LoteriaCard.tsx`)
- Added iOS optimization classes to all card variants
- Fixed button styling with proper touch targets
- Added GPU acceleration for smooth animations
- Set explicit font size to prevent zoom

#### LoteriaBoard Component (`src/components/LoteriaBoard.tsx`)
- Added iOS performance optimizations
- Touch manipulation support for card interactions

#### Layout Component (`src/app/layout.tsx`)
- Added iOS-specific meta tags
- Viewport configuration for iOS Safari
- Safe area padding wrapper

### 4. Custom Hooks (`src/hooks/useIOSDetection.ts`)

#### iOS Detection Hook
- Detects iOS devices (iPhone, iPad, iPod)
- Identifies specific iOS version
- Detects notched devices
- Checks for standalone mode (PWA)

#### Viewport Management Hook
- Handles dynamic viewport height changes
- Detects keyboard open/close states
- Manages orientation changes

#### Touch Behavior Hook
- Prevents double-tap zoom
- Prevents pinch zoom
- Optimizes touch interactions

### 5. Component Layout Wrapper (`src/components/IOSLayout.tsx`)

A specialized wrapper component that:
- Automatically detects iOS devices
- Handles viewport height correctly
- Manages safe area padding
- Provides fallbacks for non-iOS devices

### 6. Game Page Updates

#### AI Game Page (`src/app/game/ai/page.tsx`)
- Integrated iOS detection hooks
- Applied dynamic viewport sizing
- Enhanced input field compatibility
- Added touch-friendly styling

#### Multiplayer Lobby (`src/app/game/private/LobbyClient.tsx`)
- iOS viewport management
- Touch-optimized chat interface
- Smooth scrolling improvements
- Button touch target enhancements

## Key iOS Issues Addressed

### 1. Viewport Height Problems
- **Issue**: iOS viewport height changes with keyboard/URL bar
- **Solution**: Dynamic viewport height (`100dvh`) and Visual Viewport API

### 2. Touch Target Size
- **Issue**: iOS requires minimum 44px touch targets
- **Solution**: Added `min-h-touch` and `min-w-touch` utilities

### 3. Input Focus Zoom
- **Issue**: iOS zooms page when focusing inputs with font-size < 16px
- **Solution**: Explicit 16px font size on all inputs

### 4. Scroll Performance
- **Issue**: Choppy scrolling on iOS
- **Solution**: `-webkit-overflow-scrolling: touch` and GPU acceleration

### 5. Button Appearance
- **Issue**: iOS Safari applies default button styling
- **Solution**: `-webkit-appearance: none` and custom styling

### 6. Safe Area Support
- **Issue**: Content hidden behind notch/home indicator
- **Solution**: `env(safe-area-inset-*)` padding

### 7. Text Rendering
- **Issue**: Blurry text on iOS Retina displays
- **Solution**: `-webkit-font-smoothing: antialiased`

### 8. Touch Behavior
- **Issue**: Unwanted tap highlights and zoom gestures
- **Solution**: Custom tap highlights and touch-action controls

## Testing Recommendations

1. **Physical Device Testing**: Test on actual iOS devices (iPhone and iPad)
2. **Multiple iOS Versions**: Test iOS 14+ for safe area support
3. **Safari and Chrome**: Test both iOS Safari and Chrome
4. **Orientation Changes**: Test portrait/landscape transitions
5. **Keyboard Interactions**: Test with iOS keyboard open/closed
6. **Touch Gestures**: Verify no unwanted zoom or scroll behaviors

## Performance Benefits

- **GPU Acceleration**: Cards and animations use hardware acceleration
- **Smooth Scrolling**: Native iOS touch scrolling behavior
- **Reduced Repaints**: Optimized CSS for iOS rendering engine
- **Touch Responsiveness**: Immediate touch feedback without delays

These improvements ensure the Lotería game provides a native-like experience on iOS devices while maintaining compatibility with other platforms.
