// Mapping between traditional card names and custom deck filenames
export interface CardMapping {
  traditional: string;
  cuteAdorable: string;
  darkMysterious: string;
  horror: string;
  fantasy?: string; // Optional for now until fantasy cards are uploaded
}

// This maps traditional card names to their corresponding custom deck files
// Note: For cards not in cute/dark themes, we'll fall back to generating the filename
export const cardMappings: CardMapping[] = [
  {
    traditional: "El Corazón",
    cuteAdorable: "large-cute-and-adorable-mexican-loteria-deck-item-1-1752794219242.png",
    darkMysterious: "large-evil-and-dark-themed-objects-item-1-1752790851683.png",
    horror: "el-corazon-horror.png"
  },
  {
    traditional: "La Luna",
    cuteAdorable: "small-cute-and-adorable-mexican-loteria-deck-item-2-1752794231989.png",
    darkMysterious: "small-evil-and-dark-themed-objects-item-2-1752790879561.png",
    horror: "la-luna-horror.png"
  },
  {
    traditional: "El Sol",
    cuteAdorable: "colorful-cute-and-adorable-mexican-loteria-deck-item-3-1752794253418.png",
    darkMysterious: "colorful-evil-and-dark-themed-objects-item-3-1752790906683.png",
    horror: "el-sol-horror.png"
  },
  {
    traditional: "La Estrella",
    cuteAdorable: "bright-cute-and-adorable-mexican-loteria-deck-item-4-1752794293211.png",
    darkMysterious: "bright-evil-and-dark-themed-objects-item-4-1752790924605.png",
    horror: "la-estrella-horror.png"
  },
  {
    traditional: "El Árbol",
    cuteAdorable: "shiny-cute-and-adorable-mexican-loteria-deck-item-5-1752794306004.png",
    darkMysterious: "shiny-evil-and-dark-themed-objects-item-5-1752790937017.png",
    horror: "el-arbol-horror.png"
  },
  {
    traditional: "La Sirena",
    cuteAdorable: "classic-cute-and-adorable-mexican-loteria-deck-item-6-1752794318610.png",
    darkMysterious: "classic-evil-and-dark-themed-objects-item-6-1752790959424.png",
    horror: "la-sirena-horror.png"
  },
  {
    traditional: "La Escalera",
    cuteAdorable: "modern-cute-and-adorable-mexican-loteria-deck-item-7-1752794331007.png",
    darkMysterious: "modern-evil-and-dark-themed-objects-item-7-1752790972040.png",
    horror: "la-escalera-horror.png"
  },
  {
    traditional: "La Botella",
    cuteAdorable: "vintage-cute-and-adorable-mexican-loteria-deck-item-8-1752794343773.png",
    darkMysterious: "vintage-evil-and-dark-themed-objects-item-8-1752790983912.png",
    horror: "la-botella-horror.png"
  },
  {
    traditional: "El Barril",
    cuteAdorable: "simple-cute-and-adorable-mexican-loteria-deck-item-9-1752794357676.png",
    darkMysterious: "simple-evil-and-dark-themed-objects-item-9-1752791011827.png",
    horror: "el-barril-horror.png"
  },
  {
    traditional: "El Cazo",
    cuteAdorable: "detailed-cute-and-adorable-mexican-loteria-deck-item-10-1752794370866.png",
    darkMysterious: "detailed-evil-and-dark-themed-objects-item-10-1752791030572.png",
    horror: "el-cazo-horror.png"
  },
  {
    traditional: "Los Remos",
    cuteAdorable: "bold-cute-and-adorable-mexican-loteria-deck-item-11-1752794387084.png",
    darkMysterious: "bold-evil-and-dark-themed-objects-item-11-1752791058328.png",
    horror: "los-remos-horror.png"
  },
  {
    traditional: "El Soldado",
    cuteAdorable: "elegant-cute-and-adorable-mexican-loteria-deck-item-12-1752794399409.png",
    darkMysterious: "elegant-evil-and-dark-themed-objects-item-12-1752791078370.png",
    horror: "el-soldado-horror.png"
  },
  {
    traditional: "La Dama",
    cuteAdorable: "cute-cute-and-adorable-mexican-loteria-deck-item-13-1752794412025.png",
    darkMysterious: "cute-evil-and-dark-themed-objects-item-13-1752791090172.png",
    horror: "la-dama-horror.png"
  },
  {
    traditional: "El Paraguas",
    cuteAdorable: "mysterious-cute-and-adorable-mexican-loteria-deck-item-14-1752794424824.png",
    darkMysterious: "mysterious-evil-and-dark-themed-objects-item-14-1752791103536.png",
    horror: "el-paraguas-horror.png"
  },
  {
    traditional: "La Rana",
    cuteAdorable: "magical-cute-and-adorable-mexican-loteria-deck-item-15-1752794437393.png",
    darkMysterious: "magical-evil-and-dark-themed-objects-item-15-1752791117736.png",
    horror: "la-rana-horror.png"
  },
  {
    traditional: "El Pescado",
    cuteAdorable: "happy-cute-and-adorable-mexican-loteria-deck-item-16-1752794449710.png",
    darkMysterious: "happy-evil-and-dark-themed-objects-item-16-1752791137647.png",
    horror: "el-pescado-horror.png"
  }
];

export function getCardImageForDeck(cardName: string, deckThemeId: string): string {
  const mapping = cardMappings.find(m => m.traditional === cardName);
  
  // Generate the standard filename format for fallbacks
  let standardFilename = cardName.toLowerCase()
    .normalize("NFD").replace(/\p{Diacritic}/gu, "")  // Remove accents
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');
  
  // Fix gender article mismatches for horror theme
  if (deckThemeId === 'horror') {
    // Correct gender articles to match horror file naming
    const genderCorrections: { [key: string]: string } = {
      'el-arpa': 'la-arpa',
      // Add other corrections if discovered
    };
    
    standardFilename = genderCorrections[standardFilename] || standardFilename;
  }

  // Use Cloudinary URLs in production (when CLOUDINARY_CLOUD_NAME is set)
  const useCloudinary = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && process.env.NODE_ENV === 'production';
  
  if (useCloudinary) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/loteria-cards`;
    
    switch (deckThemeId) {
      case 'cute-adorable':
        if (mapping?.cuteAdorable) {
          return `${baseUrl}/68796740a83d8baf97ca977a/${mapping.cuteAdorable.replace('.png', '')}`;
        }
        return `${baseUrl}/cards/${standardFilename}`;
        
      case 'dark-mysterious':
        if (mapping?.darkMysterious) {
          return `${baseUrl}/68796740a83d8baf97ca977a/${mapping.darkMysterious.replace('.png', '')}`;
        }
        return `${baseUrl}/cards/${standardFilename}`;
        
      case 'horror':
        return `${baseUrl}/horror-theme/${standardFilename}-horror`;
        
      case 'fantasy':
        if (mapping?.fantasy) {
          return `${baseUrl}/fantasy-theme/${mapping.fantasy.replace('.png', '')}`;
        }
        return `${baseUrl}/fantasy-theme/${standardFilename}-fantasy`;
        
      case 'traditional':
      default:
        return `${baseUrl}/cards/${standardFilename}`;
    }
  }
  
  // Local development - use local files
  switch (deckThemeId) {
    case 'cute-adorable':
      if (mapping?.cuteAdorable) {
        return `/custom-cards/68796740a83d8baf97ca977a/${mapping.cuteAdorable}`;
      }
      // Fallback to traditional
      return `/cards/${standardFilename}.png`;
      
    case 'dark-mysterious':
      if (mapping?.darkMysterious) {
        return `/custom-cards/68796740a83d8baf97ca977a/${mapping.darkMysterious}`;
      }
      // Fallback to traditional
      return `/cards/${standardFilename}.png`;
      
    case 'horror':
      // For horror theme, we have all cards so use the standard naming convention
      return `/custom-cards/horror-theme/${standardFilename}-horror.png`;
      
    case 'fantasy':
      // For fantasy theme, check if specific mapping exists, otherwise use standard naming
      if (mapping?.fantasy) {
        return `/custom-cards/fantasy-theme/${mapping.fantasy}`;
      }
      // Fallback to standard fantasy naming convention
      return `/custom-cards/fantasy-theme/${standardFilename}-fantasy.png`;
      
    case 'traditional':
    default:
      return `/cards/${standardFilename}.png`;
  }
}
