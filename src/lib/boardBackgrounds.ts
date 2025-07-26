export interface BoardBackgroundOption {
  id: string;
  name: string;
  color: string;
  pattern?: string;
  className?: string;
}

export interface BoardThemeOption {
  id: string;
  name: string;
  borderColor: string;
  borderStyle: string;
  shadow: string;
  className: string;
}

export interface CardDeckOption {
  id: string;
  name: string;
  borderColor: string;
  backgroundColor: string;
  textColor: string;
  className: string;
}

export interface BoardEdgeOption {
  id: string;
  name: string;
  pattern: string;
  className: string;
  style: string;
}

export interface CardStyleOption {
  id: string;
  name: string;
  borderColor: string;
  backgroundColor: string;
  hoverColor: string;
  className: string;
}

export interface DeckThemeOption {
  id: string;
  name: string;
  description: string;
  folder: string;
  preview?: string;
}

export const backgroundOptions: BoardBackgroundOption[] = [
  { id: 'default', name: 'Default', color: '#f3f4f6', className: 'bg-gray-100' },
  { id: 'blue', name: 'Ocean Blue', color: '#3b82f6', className: 'bg-blue-500' },
  { id: 'green', name: 'Forest Green', color: '#10b981', className: 'bg-emerald-500' },
  { id: 'purple', name: 'Royal Purple', color: '#8b5cf6', className: 'bg-violet-500' },
  { id: 'red', name: 'Crimson Red', color: '#ef4444', className: 'bg-red-500' },
  { id: 'orange', name: 'Sunset Orange', color: '#f97316', className: 'bg-orange-500' },
  { id: 'yellow', name: 'Golden Yellow', color: '#eab308', className: 'bg-yellow-500' },
  { id: 'pink', name: 'Rose Pink', color: '#ec4899', className: 'bg-pink-500' },
  { id: 'teal', name: 'Turquoise', color: '#14b8a6', className: 'bg-teal-500' },
  { id: 'indigo', name: 'Deep Indigo', color: '#6366f1', className: 'bg-indigo-500' },
  { 
    id: 'horror', 
    name: 'Ghostly Horror', 
    color: '#2d1b69', 
    className: 'bg-gradient-to-br from-slate-900 via-purple-900 to-black relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-purple-900/20 before:via-transparent before:to-red-900/10 before:animate-pulse' 
  },
  { 
    id: 'mystic-ocean', 
    name: 'Mystic Ocean', 
    color: '#1e40af', 
    className: 'bg-gradient-to-br from-blue-900 via-cyan-800 to-teal-900 relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-400/15 before:via-transparent before:to-cyan-500/10 before:animate-pulse' 
  },
  { 
    id: 'enchanted-forest', 
    name: 'Enchanted Forest', 
    color: '#166534', 
    className: 'bg-gradient-to-br from-emerald-900 via-green-800 to-lime-900 relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-green-400/20 before:via-transparent before:to-yellow-500/10 before:animate-pulse' 
  },
  { 
    id: 'volcanic-fire', 
    name: 'Volcanic Fire', 
    color: '#dc2626', 
    className: 'bg-gradient-to-br from-red-900 via-orange-800 to-yellow-900 relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-orange-400/25 before:via-transparent before:to-red-500/15 before:animate-pulse' 
  },
  { 
    id: 'royal-amethyst', 
    name: 'Royal Amethyst', 
    color: '#7c3aed', 
    className: 'bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900 relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-violet-400/20 before:via-transparent before:to-pink-500/10 before:animate-pulse' 
  },
  { 
    id: 'fantasy', 
    name: 'Enchanted Fantasy', 
    color: '#a855f7', 
    className: 'bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900 relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-purple-400/25 before:via-transparent before:to-cyan-500/15 before:animate-pulse' 
  },
  { 
    id: 'sunset-dream', 
    name: 'Sunset Dream', 
    color: '#f59e0b', 
    className: 'bg-gradient-to-br from-orange-900 via-amber-800 to-rose-900 relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-yellow-400/20 before:via-transparent before:to-pink-500/10 before:animate-pulse' 
  },
  { 
    id: 'arctic-aurora', 
    name: 'Arctic Aurora', 
    color: '#0891b2', 
    className: 'bg-gradient-to-br from-slate-800 via-cyan-900 to-blue-900 relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-cyan-300/15 before:via-emerald-400/10 before:to-blue-400/15 before:animate-pulse' 
  },
  { 
    id: 'golden-temple', 
    name: 'Golden Temple', 
    color: '#d97706', 
    className: 'bg-gradient-to-br from-amber-900 via-yellow-800 to-orange-900 relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-yellow-300/25 before:via-transparent before:to-amber-400/15 before:animate-pulse' 
  },
  { 
    id: 'midnight-rose', 
    name: 'Midnight Rose', 
    color: '#be185d', 
    className: 'bg-gradient-to-br from-gray-900 via-rose-900 to-pink-900 relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-rose-400/20 before:via-transparent before:to-purple-500/10 before:animate-pulse' 
  },
];

export const boardThemeOptions: BoardThemeOption[] = [
  { 
    id: 'classic', 
    name: 'Classic', 
    borderColor: '#fbbf24', 
    borderStyle: 'border-2', 
    shadow: 'shadow-2xl',
    className: 'border-2 border-yellow-400 shadow-2xl rounded-lg'
  },
  { 
    id: 'elegant', 
    name: 'Elegant', 
    borderColor: '#6d28d9', 
    borderStyle: 'border-4', 
    shadow: 'shadow-xl shadow-violet-500/25',
    className: 'border-4 border-violet-600 shadow-xl shadow-violet-500/25 rounded-xl'
  },
  { 
    id: 'modern', 
    name: 'Modern', 
    borderColor: '#059669', 
    borderStyle: 'border-2', 
    shadow: 'shadow-lg shadow-emerald-500/20',
    className: 'border-2 border-emerald-600 shadow-lg shadow-emerald-500/20 rounded-2xl'
  },
  { 
    id: 'vintage', 
    name: 'Vintage', 
    borderColor: '#92400e', 
    borderStyle: 'border-3', 
    shadow: 'shadow-2xl shadow-amber-700/30',
    className: 'border-4 border-amber-700 shadow-2xl shadow-amber-700/30 rounded-md'
  },
  { 
    id: 'neon', 
    name: 'Neon', 
    borderColor: '#06ffa5', 
    borderStyle: 'border-2', 
    shadow: 'shadow-2xl shadow-emerald-500/50',
    className: 'border-2 border-emerald-400 shadow-2xl shadow-emerald-500/50 rounded-xl'
  },
  { 
    id: 'minimal', 
    name: 'Minimal', 
    borderColor: '#e5e7eb', 
    borderStyle: 'border', 
    shadow: 'shadow-sm',
    className: 'border border-gray-200 shadow-sm rounded-lg'
  },
  { 
    id: 'horror-gothic', 
    name: 'Gothic Horror', 
    borderColor: '#1f1f1f', 
    borderStyle: 'border-4', 
    shadow: 'shadow-2xl shadow-red-900/60',
    className: 'border-4 border-gray-900 shadow-2xl shadow-red-900/60 rounded-none'
  },
  { 
    id: 'blood-moon', 
    name: 'Blood Moon', 
    borderColor: '#7f1d1d', 
    borderStyle: 'border-3', 
    shadow: 'shadow-2xl shadow-red-600/50',
    className: 'border-3 border-red-900 shadow-2xl shadow-red-600/50 rounded-lg'
  },
  { 
    id: 'haunted-mansion', 
    name: 'Haunted Mansion', 
    borderColor: '#374151', 
    borderStyle: 'border-4', 
    shadow: 'shadow-2xl shadow-purple-900/40',
    className: 'border-4 border-gray-700 shadow-2xl shadow-purple-900/40 rounded-md'
  },
  { 
    id: 'witch-cauldron', 
    name: 'Witch Cauldron', 
    borderColor: '#166534', 
    borderStyle: 'border-3', 
    shadow: 'shadow-2xl shadow-green-600/50',
    className: 'border-3 border-green-800 shadow-2xl shadow-green-600/50 rounded-full'
  },
  { 
    id: 'vampire-castle', 
    name: 'Vampire Castle', 
    borderColor: '#450a0a', 
    borderStyle: 'border-4', 
    shadow: 'shadow-2xl shadow-red-800/60',
    className: 'border-4 border-red-950 shadow-2xl shadow-red-800/60 rounded-sm'
  },
  { 
    id: 'mystic-portal', 
    name: 'Mystic Portal', 
    borderColor: '#581c87', 
    borderStyle: 'border-3', 
    shadow: 'shadow-2xl shadow-violet-600/50',
    className: 'border-3 border-purple-900 shadow-2xl shadow-violet-600/50 rounded-2xl'
  },
  { 
    id: 'cursed-tome', 
    name: 'Cursed Tome', 
    borderColor: '#365314', 
    borderStyle: 'border-4', 
    shadow: 'shadow-2xl shadow-lime-700/40',
    className: 'border-4 border-green-900 shadow-2xl shadow-lime-700/40 rounded-md'
  },
  { 
    id: 'spectral-mist', 
    name: 'Spectral Mist', 
    borderColor: '#1e1b4b', 
    borderStyle: 'border-2', 
    shadow: 'shadow-2xl shadow-blue-600/30',
    className: 'border-2 border-indigo-900 shadow-2xl shadow-blue-600/30 rounded-3xl'
  },
  { 
    id: 'demon-portal', 
    name: 'Demon Portal', 
    borderColor: '#7f1d1d', 
    borderStyle: 'border-4', 
    shadow: 'shadow-2xl shadow-orange-600/60',
    className: 'border-4 border-red-900 shadow-2xl shadow-orange-600/60 rounded-none'
  },
  { 
    id: 'graveyard-fog', 
    name: 'Graveyard Fog', 
    borderColor: '#52525b', 
    borderStyle: 'border-3', 
    shadow: 'shadow-2xl shadow-gray-500/40',
    className: 'border-3 border-zinc-600 shadow-2xl shadow-gray-500/40 rounded-lg'
  }
];

export const cardDeckOptions: CardDeckOption[] = [
  { 
    id: 'traditional', 
    name: 'Traditional', 
    borderColor: '#dc2626', 
    backgroundColor: '#fef2f2', 
    textColor: '#991b1b',
    className: 'border-red-600 bg-red-50 text-red-800'
  },
  { 
    id: 'ocean', 
    name: 'Ocean', 
    borderColor: '#2563eb', 
    backgroundColor: '#eff6ff', 
    textColor: '#1e40af',
    className: 'border-blue-600 bg-blue-50 text-blue-800'
  },
  { 
    id: 'forest', 
    name: 'Forest', 
    borderColor: '#059669', 
    backgroundColor: '#ecfdf5', 
    textColor: '#047857',
    className: 'border-emerald-600 bg-emerald-50 text-emerald-800'
  },
  { 
    id: 'sunset', 
    name: 'Sunset', 
    borderColor: '#ea580c', 
    backgroundColor: '#fff7ed', 
    textColor: '#c2410c',
    className: 'border-orange-600 bg-orange-50 text-orange-700'
  },
  { 
    id: 'royal', 
    name: 'Royal', 
    borderColor: '#7c3aed', 
    backgroundColor: '#faf5ff', 
    textColor: '#6d28d9',
    className: 'border-violet-600 bg-violet-50 text-violet-800'
  },
  { 
    id: 'rose', 
    name: 'Rose', 
    borderColor: '#e11d48', 
    backgroundColor: '#fff1f2', 
    textColor: '#be185d',
    className: 'border-rose-600 bg-rose-50 text-rose-700'
  },
  { 
    id: 'gold', 
    name: 'Gold', 
    borderColor: '#d97706', 
    backgroundColor: '#fffbeb', 
    textColor: '#92400e',
    className: 'border-amber-600 bg-amber-50 text-amber-800'
  },
  { 
    id: 'midnight', 
    name: 'Midnight', 
    borderColor: '#374151', 
    backgroundColor: '#f9fafb', 
    textColor: '#111827',
    className: 'border-gray-700 bg-gray-50 text-gray-900'
  }
];

export const boardEdgeOptions: BoardEdgeOption[] = [
  {
    id: 'classic',
    name: 'Classic Stripes',
    pattern: 'repeating-linear-gradient(135deg, #b94a48 0 14px, #e1b866 14px 28px)',
    className: 'bg-gradient-classic',
    style: 'repeating-linear-gradient(135deg, #b94a48 0 14px, #e1b866 14px 28px)'
  },
  {
    id: 'ocean',
    name: 'Ocean Waves',
    pattern: 'repeating-linear-gradient(135deg, #1e40af 0 14px, #60a5fa 14px 28px)',
    className: 'bg-gradient-ocean',
    style: 'repeating-linear-gradient(135deg, #1e40af 0 14px, #60a5fa 14px 28px)'
  },
  {
    id: 'forest',
    name: 'Forest Canopy',
    pattern: 'repeating-linear-gradient(135deg, #065f46 0 14px, #34d399 14px 28px)',
    className: 'bg-gradient-forest',
    style: 'repeating-linear-gradient(135deg, #065f46 0 14px, #34d399 14px 28px)'
  },
  {
    id: 'sunset',
    name: 'Sunset Rays',
    pattern: 'repeating-linear-gradient(135deg, #c2410c 0 14px, #fed7aa 14px 28px)',
    className: 'bg-gradient-sunset',
    style: 'repeating-linear-gradient(135deg, #c2410c 0 14px, #fed7aa 14px 28px)'
  },
  {
    id: 'royal',
    name: 'Royal Pattern',
    pattern: 'repeating-linear-gradient(135deg, #5b21b6 0 14px, #c4b5fd 14px 28px)',
    className: 'bg-gradient-royal',
    style: 'repeating-linear-gradient(135deg, #5b21b6 0 14px, #c4b5fd 14px 28px)'
  },
  {
    id: 'geometric',
    name: 'Geometric',
    pattern: 'repeating-linear-gradient(45deg, #1f2937 0 10px, #374151 10px 20px)',
    className: 'bg-gradient-geometric',
    style: 'repeating-linear-gradient(45deg, #1f2937 0 10px, #374151 10px 20px)'
  },
  {
    id: 'horror-skulls',
    name: 'Horror Skulls',
    pattern: 'repeating-linear-gradient(135deg, #1a1a2e 0 12px, #16213e 12px 24px, #0f3460 24px 36px)',
    className: 'bg-gradient-horror',
    style: 'repeating-linear-gradient(135deg, #1a1a2e 0 12px, #16213e 12px 24px, #0f3460 24px 36px)'
  },
  {
    id: 'blood-drips',
    name: 'Blood Drips',
    pattern: 'repeating-linear-gradient(90deg, #7f1d1d 0 8px, #991b1b 8px 16px, #dc2626 16px 24px)',
    className: 'bg-gradient-blood',
    style: 'repeating-linear-gradient(90deg, #7f1d1d 0 8px, #991b1b 8px 16px, #dc2626 16px 24px)'
  },
  {
    id: 'mystic-runes',
    name: 'Mystic Runes',
    pattern: 'repeating-linear-gradient(60deg, #312e81 0 10px, #4338ca 10px 20px, #6366f1 20px 30px)',
    className: 'bg-gradient-mystic',
    style: 'repeating-linear-gradient(60deg, #312e81 0 10px, #4338ca 10px 20px, #6366f1 20px 30px)'
  },
  {
    id: 'fantasy-magic',
    name: 'Fantasy Magic',
    pattern: 'repeating-linear-gradient(45deg, #7c3aed 0 8px, #a855f7 8px 16px, #c084fc 16px 24px, #ddd6fe 24px 32px)',
    className: 'bg-gradient-fantasy',
    style: 'repeating-linear-gradient(45deg, #7c3aed 0 8px, #a855f7 8px 16px, #c084fc 16px 24px, #ddd6fe 24px 32px)'
  },
  {
    id: 'haunted-shadows',
    name: 'Haunted Shadows',
    pattern: 'repeating-linear-gradient(45deg, #111827 0 15px, #374151 15px 30px, #1f2937 30px 45px)',
    className: 'bg-gradient-haunted',
    style: 'repeating-linear-gradient(45deg, #111827 0 15px, #374151 15px 30px, #1f2937 30px 45px)'
  },
  {
    id: 'witch-brew',
    name: 'Witch Brew',
    pattern: 'repeating-linear-gradient(135deg, #166534 0 11px, #15803d 11px 22px, #22c55e 22px 33px)',
    className: 'bg-gradient-witch',
    style: 'repeating-linear-gradient(135deg, #166534 0 11px, #15803d 11px 22px, #22c55e 22px 33px)'
  },
  {
    id: 'vampire-fangs',
    name: 'Vampire Fangs',
    pattern: 'repeating-linear-gradient(120deg, #450a0a 0 9px, #7f1d1d 9px 18px, #b91c1c 18px 27px)',
    className: 'bg-gradient-vampire',
    style: 'repeating-linear-gradient(120deg, #450a0a 0 9px, #7f1d1d 9px 18px, #b91c1c 18px 27px)'
  },
  {
    id: 'ghostly-chains',
    name: 'Ghostly Chains',
    pattern: 'repeating-linear-gradient(0deg, #374151 0 6px, #6b7280 6px 12px, #9ca3af 12px 18px)',
    className: 'bg-gradient-chains',
    style: 'repeating-linear-gradient(0deg, #374151 0 6px, #6b7280 6px 12px, #9ca3af 12px 18px)'
  },
  {
    id: 'arcane-symbols',
    name: 'Arcane Symbols',
    pattern: 'repeating-linear-gradient(75deg, #581c87 0 13px, #7c3aed 13px 26px, #a855f7 26px 39px)',
    className: 'bg-gradient-arcane',
    style: 'repeating-linear-gradient(75deg, #581c87 0 13px, #7c3aed 13px 26px, #a855f7 26px 39px)'
  },
  {
    id: 'midnight-mist',
    name: 'Midnight Mist',
    pattern: 'repeating-linear-gradient(30deg, #1e1b4b 0 16px, #312e81 16px 32px, #4338ca 32px 48px)',
    className: 'bg-gradient-mist',
    style: 'repeating-linear-gradient(30deg, #1e1b4b 0 16px, #312e81 16px 32px, #4338ca 32px 48px)'
  },
  {
    id: 'cursed-thorns',
    name: 'Cursed Thorns',
    pattern: 'repeating-linear-gradient(150deg, #365314 0 14px, #4d7c0f 14px 28px, #65a30d 28px 42px)',
    className: 'bg-gradient-thorns',
    style: 'repeating-linear-gradient(150deg, #365314 0 14px, #4d7c0f 14px 28px, #65a30d 28px 42px)'
  }
];

export const cardStyleOptions: CardStyleOption[] = [
  {
    id: 'classic',
    name: 'Classic',
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    hoverColor: '#fef3c7',
    className: 'border-gray-300 bg-white hover:bg-yellow-100'
  },
  {
    id: 'modern',
    name: 'Modern',
    borderColor: '#6b7280',
    backgroundColor: '#f9fafb',
    hoverColor: '#f3f4f6',
    className: 'border-gray-500 bg-gray-50 hover:bg-gray-100'
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    borderColor: '#ec4899',
    backgroundColor: '#fdf2f8',
    hoverColor: '#fce7f3',
    className: 'border-pink-500 bg-pink-50 hover:bg-pink-100'
  },
  {
    id: 'elegant',
    name: 'Elegant',
    borderColor: '#7c3aed',
    backgroundColor: '#faf5ff',
    hoverColor: '#f3e8ff',
    className: 'border-violet-600 bg-violet-50 hover:bg-violet-100'
  },
  {
    id: 'warm',
    name: 'Warm',
    borderColor: '#f59e0b',
    backgroundColor: '#fffbeb',
    hoverColor: '#fef3c7',
    className: 'border-amber-500 bg-amber-50 hover:bg-amber-100'
  },
  {
    id: 'cool',
    name: 'Cool',
    borderColor: '#0ea5e9',
    backgroundColor: '#f0f9ff',
    hoverColor: '#e0f2fe',
    className: 'border-sky-500 bg-sky-50 hover:bg-sky-100'
  }
];

export const deckThemeOptions: DeckThemeOption[] = [
  {
    id: 'traditional',
    name: 'Traditional',
    description: 'Classic Mexican Lotería cards with authentic artwork',
    folder: 'cards',
    preview: '/cards/el-corazon.png'
  },
  {
    id: 'cute-adorable',
    name: 'Cute & Adorable',
    description: 'Cute and adorable themed cards with cheerful designs',
    folder: 'custom-cards/68796740a83d8baf97ca977a',
    preview: '/custom-cards/68796740a83d8baf97ca977a/large-cute-and-adorable-mexican-loteria-deck-item-1-1752794219242.png'
  },
  {
    id: 'dark-mysterious',
    name: 'Dark & Mysterious',
    description: 'Dark and mysterious themed cards with gothic aesthetics',
    folder: 'custom-cards/68796740a83d8baf97ca977a',
    preview: '/custom-cards/68796740a83d8baf97ca977a/large-evil-and-dark-themed-objects-item-1-1752790851683.png'
  },
  {
    id: 'horror',
    name: 'Horror',
    description: 'Spooky horror-themed cards for a frightening experience',
    folder: 'custom-cards/horror-theme',
    preview: '/custom-cards/horror-theme/el-corazon-horror.png'
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    description: 'Magical fantasy-themed cards with enchanted designs',
    folder: 'custom-cards/fantasy-theme',
    preview: '/custom-cards/fantasy-theme/el-corazon-fantasy.png'
  }
];

// Helper function to get preview image URL for deck themes (client-side only)
export const getDeckThemePreviewUrl = (themeId: string): string => {
  const theme = deckThemeOptions.find(opt => opt.id === themeId);
  if (!theme?.preview) return '';
  
  // Only apply Cloudinary transformation on client-side in production
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    switch (themeId) {
      case 'cute-adorable':
        return 'https://res.cloudinary.com/deessrmbv/image/upload/68796740a83d8baf97ca977a/large-cute-and-adorable-mexican-loteria-deck-item-1-1752794219242.png';
      case 'dark-mysterious':
        return 'https://res.cloudinary.com/deessrmbv/image/upload/68796740a83d8baf97ca977a/large-evil-and-dark-themed-objects-item-1-1752790851683.png';
      case 'horror':
        return 'https://res.cloudinary.com/deessrmbv/image/upload/horror-theme/el-corazon-horror.png';
      case 'fantasy':
        return 'https://res.cloudinary.com/deessrmbv/image/upload/fantasy-theme/el-corazon-fantasy.png';
      default:
        return theme.preview;
    }
  }
  
  // Local development or non-Vercel environments use local files
  return theme.preview;
};

// Helper function to get avatar image URL (client-side only)
export function getAvatarImageUrl(image: string | undefined): string {
  if (!image) return '';

  // If it's already a full URL, return as-is
  if (image.startsWith('http')) {
    return image;
  }

  // Handle local avatar paths - only in development
  if (image.startsWith('/avatars/')) {
    // In production (Vercel), avatars should be stored in Cloudinary
    // This case should only happen in development or for old data
    if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
      // Try to construct Cloudinary URL, but this might not work for old local files
      const imageName = image.split('/').pop()?.replace('.png', '').replace('.jpg', '').replace('.jpeg', ''); 
      if (imageName) {
        return `https://res.cloudinary.com/deessrmbv/image/upload/avatars/${imageName}`;
      }
    }
    // For development, return the local path
    return image;
  }

  // For Cloudinary images without full URL, construct the URL
  const cloudinaryBase = 'https://res.cloudinary.com/deessrmbv/image/upload';
  return `${cloudinaryBase}/${image}`;
};

export const getBoardBackgroundClass = (backgroundId: string): string => {
  const background = backgroundOptions.find(opt => opt.id === backgroundId);
  return background?.className || 'bg-gray-100';
};

export const getBoardThemeClass = (themeId: string): string => {
  const theme = boardThemeOptions.find(opt => opt.id === themeId);
  return theme?.className || 'border-2 border-yellow-600 shadow-2xl';
};

export const getCardDeckClass = (deckId: string): string => {
  const deck = cardDeckOptions.find(opt => opt.id === deckId);
  return deck?.className || 'border-red-600 bg-red-50 text-red-800';
};

export const getBoardEdgeStyle = (edgeId: string): string => {
  const edge = boardEdgeOptions.find(opt => opt.id === edgeId);
  return edge?.style || 'repeating-linear-gradient(135deg, #b94a48 0 14px, #e1b866 14px 28px)';
};

export const getCardStyleClass = (styleId: string): string => {
  const style = cardStyleOptions.find(opt => opt.id === styleId);
  return style?.className || 'border-gray-300 bg-white hover:bg-yellow-100';
};

export const getDeckThemeFolder = (deckTheme: string): string => {
  const deck = deckThemeOptions.find(opt => opt.id === deckTheme);
  return deck?.folder || 'cards';
};
