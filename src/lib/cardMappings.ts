// Mapping between traditional card names and custom deck filenames
// Updated: Paper-art cards now load from correct Cloudinary folder structure
export interface CardMapping {
  traditional: string;
  horror: string;
  fantasy: string;
  paperArt: string; 
}

// This maps traditional card names to their corresponding custom deck files
// Note: For cards not in cute/dark themes, we'll fall back to generating the filename
export const cardMappings: CardMapping[] = [
  {
    traditional: "El Corazón",
    horror: "el-corazon-horror.png",
    fantasy: "el-corazon-fantasy.png",
    paperArt: "el-corazon-paper-art.png"
  },
  {
    traditional: "La Luna",
    horror: "la-luna-horror.png",
    fantasy: "la-luna-fantasy.png",
    paperArt: "la-luna-paper-art.png"
  },
  {
    traditional: "El Sol",
    horror: "el-sol-horror.png",
    fantasy: "el-sol-fantasy.png",
    paperArt: "el-sol-paper-art.png"
  },
  {
    traditional: "La Estrella",
    horror: "la-estrella-horror.png",
    fantasy: "la-estrella-fantasy.png",
    paperArt: "la-estrella-paper-art.png"
  },
  {
    traditional: "El Árbol",
    horror: "el-arbol-horror.png",
    fantasy: "el-arbol-fantasy.png",
    paperArt: "el-arbol-paper-art.png"
  },
  {
    traditional: "La Sirena",
    horror: "la-sirena-horror.png",
    fantasy: "la-sirena-fantasy.png",
    paperArt: "la-sirena-paper-art.png"
  },
  {
    traditional: "La Escalera",
    horror: "la-escalera-horror.png",
    fantasy: "la-escalera-fantasy.png",
    paperArt: "la-escalera-paper-art.png"
  },
  {
    traditional: "La Botella",
    horror: "la-botella-horror.png",
    fantasy: "la-botella-fantasy.png",
    paperArt: "la-botella-paper-art.png"
  },
  {
    traditional: "El Barril",
    horror: "el-barril-horror.png",
    fantasy: "el-barril-fantasy.png",
    paperArt: "el-barril-paper-art.png"
  },
  {
    traditional: "El Cazo",
    horror: "el-cazo-horror.png",
    fantasy: "el-cazo-fantasy.png",
    paperArt: "el-cazo-paper-art.png"
  },

  {
    traditional: "El Soldado",
    horror: "el-soldado-horror.png",
    fantasy: "el-soldado-fantasy.png",
    paperArt: "el-soldado-paper-art.png"
  },
  {
    traditional: "La Dama",
    horror: "la-dama-horror.png",
    fantasy: "la-dama-fantasy.png",
    paperArt: "la-dama-paper-art.png"
  },
  {
    traditional: "El Paraguas",
    horror: "el-paraguas-horror.png",
    fantasy: "el-paraguas-fantasy.png",
    paperArt: "el-paraguas-paper-art.png"
  },
  {
    traditional: "La Rana",
    horror: "la-rana-horror.png",
    fantasy: "la-rana-fantasy.png",
    paperArt: "la-rana-paper-art.png"
  },
  {
    traditional: "El Pescado",
    horror: "el-pescado-horror.png",
    fantasy: "el-pescado-fantasy.png",
    paperArt: "el-pescado-paper-art.png"
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

  // Use Cloudinary URLs in production (deployed on Vercel)
  // Force client-side execution for proper environment detection
  if (typeof window === 'undefined') {
    // Server-side: return traditional cards to avoid 404s during SSR
    return `/cards/${standardFilename}.png`;
  }
  
  const cloudName = 'deessrmbv'; // Hard-code for reliability
  const isVercelProduction = window.location.hostname.includes('vercel.app');
  const isProductionBuild = process.env.NODE_ENV === 'production';
  // Force Cloudinary for any Vercel deployment
  const useCloudinary = isVercelProduction;
  
  
  if (useCloudinary) {
    const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/loteria-cards`;
    
    let finalUrl = '';
    switch (deckThemeId) {
      case 'horror':
        finalUrl = `${baseUrl}/horror-theme/${standardFilename}-horror.png`;
        break;
      case 'fantasy':
        if (mapping?.fantasy) {
          finalUrl = `${baseUrl}/fantasy-theme/${mapping.fantasy.replace('.png', '')}.png`;
        } else {
          finalUrl = `${baseUrl}/fantasy-theme/${standardFilename}-fantasy.png`;
        }
        break;
      case 'paper-art':
        if (mapping?.paperArt) {
          finalUrl = `${baseUrl}/paper-art-theme/${mapping.paperArt.replace('.png', '')}.png`;
        } else {
          finalUrl = `${baseUrl}/paper-art-theme/${standardFilename}-paper-art.png`;
        }
        break;
      case 'traditional':
      default:
        // Traditional cards stay local - not uploaded to Cloudinary
        finalUrl = `/cards/${standardFilename}.png`;
        break;
    }
    return finalUrl;
  }
  
  // Local development - use local files
  switch (deckThemeId) {
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
    case 'paper-art':
      if (mapping?.paperArt) {
        return `/custom-cards/paper-art-theme/${mapping.paperArt}`;
      }
      return `/custom-cards/paper-art-theme/${standardFilename}-paper-art.png`;
    case 'traditional':
    default:
      return `/cards/${standardFilename}.png`;
  }
}
