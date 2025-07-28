"use client";
import { useSettings } from "@/context/SettingsContext";
import { getCardDeckClass, getCardStyleClass, getDeckThemeFolder } from "@/lib/boardBackgrounds";
import { getCardImageForDeck } from "@/lib/cardMappings";
import { cardPreloader } from "@/lib/cardPreloader";
import { useEffect, useState } from "react";

interface LoteriaCardProps {
  name: string; // Card name (e.g., "El Corazón", "La Dama")
  marked?: boolean; // Whether this card is selected by player
  onClick?: () => void; // Click handler for card interactions
  showHover?: boolean; // Whether to show hover effects
  variant?: "default" | "plain"; // 'default' for game board, 'plain' for called card display
  className?: string; // Additional CSS classes
  markable?: boolean; // Whether the card can be clicked/marked
}

// Legacy helper - converts Spanish card names to URL-safe filenames for traditional deck
function getCardImagePath(cardName: string, deckTheme: string): string {
  const folder = getDeckThemeFolder(deckTheme);
  
  if (deckTheme === 'traditional') {
    const filename = cardName
      .toLowerCase()
      .normalize("NFD").replace(/\p{Diacritic}/gu, "")  // Remove accents
      .replace(/\s+/g, "-")                              // Replace spaces with hyphens
      .replace(/[^a-z0-9\-]/g, "")                       // Remove special characters
      + ".png";
    return `/${folder}/${filename}`;
  } else {
    const searchName = cardName.toLowerCase();
    return `/${folder}/${searchName}-cute-and-adorable-mexican-loteria-deck-item-1.png`;
  }
}

// Legacy helper for backward compatibility - converts card names to standardized filenames
function wordToFilename(word: string) {
  return (
    word
      .toLowerCase()
      .normalize("NFD").replace(/\p{Diacritic}/gu, "")  // Remove diacritics/accents
      .replace(/\s+/g, "-")                              // Replace spaces with hyphens
      .replace(/[^a-z0-9\-]/g, "")                       // Remove special characters
    + ".png"
  );
}

/**
 * Core card component for both interactive game board cards and display-only called cards
 * Supports multiple themes (traditional, horror, cute, dark mysterious) with fallback loading
 */
export default function LoteriaCard({ name, marked = false, onClick, showHover = true, variant = "default", className, markable }: LoteriaCardProps) {
  const { cardDeck, cardStyle, deckTheme } = useSettings();
  const cardDeckClass = getCardDeckClass(cardDeck);
  const cardStyleClass = getCardStyleClass(cardStyle);
  
  // Use state to ensure card URL is generated on client side only
  const [cardImageSrc, setCardImageSrc] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  
  useEffect(() => {
    // Check if card is preloaded first
    const preloadedImage = cardPreloader.getPreloadedImage(name, deckTheme);
    if (preloadedImage) {
      setCardImageSrc(preloadedImage.src);
      setImageLoaded(true);
    } else {
      // Only generate the URL on the client side to ensure proper environment detection
      setCardImageSrc(getCardImageForDeck(name, deckTheme));
      setImageLoaded(false);
    }
  }, [name, deckTheme]);
  
  if (variant === "plain") {
    // Use black border and background for all decks to hide white edging on cards
    const borderClass = 'border-black bg-black';
    const imgClass = 'w-full h-full object-cover transition-opacity duration-200';
    
    return (
      <div className={`w-24 h-32 rounded-lg overflow-hidden ${borderClass} ${cardDeckClass} flex items-center justify-center ios-transform-gpu ios-smooth relative ${className ?? ''}`}>
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {cardImageSrc && (
          <img
            key={`${name}-${deckTheme}`}
            src={cardImageSrc}
            alt={name}
            className={`${imgClass} ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={e => {
              // Fallback to traditional card if custom card fails to load
              if (!e.currentTarget.src.includes('/cards/')) {
                e.currentTarget.src = `/cards/${wordToFilename(name)}`;
              } else {
                e.currentTarget.style.display = 'none';
              }
            }}
          />
        )}
      </div>
    );
  }
  return (
    <button
      className={`w-24 h-32 flex items-center justify-center rounded-lg border text-center font-semibold text-xs p-0 overflow-hidden relative transition select-none min-h-touch min-w-touch touch-manipulation ios-tap-transparent ios-no-callout ios-smooth ios-transform-gpu ${cardStyleClass}${marked ? " ring-2 ring-green-500" : ""}${showHover ? " group" : ""} ${className ?? ''}`}
      onClick={onClick}
      style={{
        position: 'relative',
        cursor: markable ? 'pointer' : 'not-allowed',
        opacity: markable === false && !marked ? 0.5 : 1,
        fontSize: '16px', // Prevent iOS zoom
      }}
      tabIndex={onClick ? 0 : -1}
      type="button"
      disabled={markable === false && !marked}
    >
      {/* Loading spinner for card images */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-600 flex items-center justify-center z-5">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      {/* Hover border effect */}
      {showHover && (
        <span className="absolute inset-0 rounded-lg border-4 border-black opacity-0 group-hover:opacity-80 pointer-events-none transition-opacity z-10" />
      )}
      {cardImageSrc && (
        <img
          key={`${name}-${deckTheme}`}
          src={cardImageSrc}
          alt={name}
          className={`absolute inset-0 w-full h-full object-cover z-0 ios-transform-gpu transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={e => {
            // Fallback to traditional card if custom card fails to load
            if (!e.currentTarget.src.includes('/cards/')) {
              e.currentTarget.src = `/cards/${wordToFilename(name)}`;
            } else {
              e.currentTarget.style.display = 'none';
            }
          }}
        />
      )}
      {marked && (
        <span
          className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
          aria-label="Marked"
        >
          {/* Bright green marker: a bold X */}
          <svg width="100%" height="100%" viewBox="0 0 96 128" className="w-full h-full">
            <line x1="16" y1="24" x2="80" y2="104" stroke="#39FF14" strokeWidth="16" strokeLinecap="round" />
            <line x1="80" y1="24" x2="16" y2="104" stroke="#39FF14" strokeWidth="16" strokeLinecap="round" />
          </svg>
        </span>
      )}
    </button>
  );
}
