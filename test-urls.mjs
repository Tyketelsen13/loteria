import { getCardImageForDeck } from '../src/lib/cardMappings.ts';

console.log('Testing URL generation:');
const testCard = 'El Corazón';
const themes = ['traditional', 'cute-adorable', 'dark-mysterious', 'horror', 'fantasy'];

themes.forEach(theme => {
  const url = getCardImageForDeck(testCard, theme);
  console.log(`${theme}: ${url}`);
});
