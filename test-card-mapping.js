// Simple test to verify getCardImageForDeck function
import { getCardImageForDeck } from './src/lib/cardMappings.js';

const testCard = "El Corazón";
const themes = ['traditional', 'horror', 'fantasy', 'cute-adorable', 'dark-mysterious'];

console.log('Testing getCardImageForDeck function:');
themes.forEach(theme => {
  const url = getCardImageForDeck(testCard, theme);
  console.log(`${theme}: ${url}`);
});
