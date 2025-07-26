/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // iOS-specific utilities
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      minHeight: {
        'screen-ios': '100dvh', // Dynamic viewport height
        'touch': '44px', // Minimum iOS touch target
      },
      minWidth: {
        'touch': '44px', // Minimum iOS touch target
      },
      fontSize: {
        'ios-base': '16px', // Prevents zoom on iOS
      },
      transitionProperty: {
        'touch': 'transform, box-shadow, background-color',
      },
      // Custom utilities for iOS
      touchAction: {
        'manipulation': 'manipulation',
        'pan-x': 'pan-x',
        'pan-y': 'pan-y',
        'none': 'none',
      },
    },
  },
  plugins: [
    // Custom plugin for iOS-specific utilities
    function({ addUtilities }) {
      const iosUtilities = {
        '.ios-smooth': {
          '-webkit-font-smoothing': 'antialiased',
          '-moz-osx-font-smoothing': 'grayscale',
        },
        '.ios-scroll': {
          '-webkit-overflow-scrolling': 'touch',
        },
        '.ios-tap-transparent': {
          '-webkit-tap-highlight-color': 'transparent',
        },
        '.ios-no-callout': {
          '-webkit-touch-callout': 'none',
        },
        '.ios-no-select': {
          '-webkit-user-select': 'none',
          '-moz-user-select': 'none',
          'user-select': 'none',
        },
        '.ios-appearance-none': {
          '-webkit-appearance': 'none',
          '-moz-appearance': 'none',
          'appearance': 'none',
        },
        '.ios-transform-gpu': {
          '-webkit-transform': 'translateZ(0)',
          'transform': 'translateZ(0)',
          '-webkit-backface-visibility': 'hidden',
          'backface-visibility': 'hidden',
        },
        '.touch-manipulation': {
          'touch-action': 'manipulation',
        },
        '.touch-pan-x': {
          'touch-action': 'pan-x',
        },
        '.touch-pan-y': {
          'touch-action': 'pan-y',
        },
        '.touch-none': {
          'touch-action': 'none',
        },
      }
      addUtilities(iosUtilities)
    }
  ],
};
