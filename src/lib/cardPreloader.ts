/**
 * Card image preloader utility to prevent white flashes when cards are called
 * Preloads all card images when the game starts
 */

import { getCardImageForDeck } from './cardMappings';

class CardPreloader {
  private preloadedImages: Map<string, HTMLImageElement> = new Map();
  private preloadPromise: Promise<void> | null = null;

  /**
   * Preload all card images for a specific deck theme
   */
  async preloadCards(cardNames: string[], deckTheme: string): Promise<void> {
    const cacheKey = `${deckTheme}-${cardNames.length}`;
    
    // If already preloading or preloaded for this theme, return the existing promise
    if (this.preloadPromise) {
      return this.preloadPromise;
    }

    console.log(`[CardPreloader] Starting preload for ${cardNames.length} cards with ${deckTheme} theme`);
    
    this.preloadPromise = new Promise((resolve) => {
      const loadPromises = cardNames.map((cardName) => {
        return this.preloadSingleCard(cardName, deckTheme);
      });

      Promise.allSettled(loadPromises).then((results) => {
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        
        console.log(`[CardPreloader] Preload complete: ${successful} successful, ${failed} failed`);
        resolve();
      });
    });

    return this.preloadPromise;
  }

  /**
   * Preload a single card image
   */
  private preloadSingleCard(cardName: string, deckTheme: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const imageUrl = getCardImageForDeck(cardName, deckTheme);
      const cacheKey = `${cardName}-${deckTheme}`;
      
      // Check if already preloaded
      if (this.preloadedImages.has(cacheKey)) {
        resolve(this.preloadedImages.get(cacheKey)!);
        return;
      }

      const img = new Image();
      
      img.onload = () => {
        this.preloadedImages.set(cacheKey, img);
        resolve(img);
      };
      
      img.onerror = () => {
        console.warn(`[CardPreloader] Failed to preload: ${cardName} (${imageUrl})`);
        reject(new Error(`Failed to load ${cardName}`));
      };
      
      // Set source to start loading
      img.src = imageUrl;
    });
  }

  /**
   * Get a preloaded image if available
   */
  getPreloadedImage(cardName: string, deckTheme: string): HTMLImageElement | null {
    const cacheKey = `${cardName}-${deckTheme}`;
    return this.preloadedImages.get(cacheKey) || null;
  }

  /**
   * Check if a card is preloaded
   */
  isCardPreloaded(cardName: string, deckTheme: string): boolean {
    const cacheKey = `${cardName}-${deckTheme}`;
    return this.preloadedImages.has(cacheKey);
  }

  /**
   * Clear all preloaded images (useful when switching themes)
   */
  clearCache(): void {
    this.preloadedImages.clear();
    this.preloadPromise = null;
  }
}

// Export singleton instance
export const cardPreloader = new CardPreloader();
