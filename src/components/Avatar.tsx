'use client';

import { useState, useEffect } from 'react';
import { getAvatarImageUrl } from '@/lib/boardBackgrounds';

interface AvatarProps {
  imageUrl?: string;
  size?: number;
  alt?: string;
  className?: string;
}

export default function Avatar({ imageUrl, size = 64, alt = 'Avatar', className = '' }: AvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [imageError, setImageError] = useState(false);

  // Generate avatar URL client-side to avoid SSR mismatches
  useEffect(() => {
    if (imageUrl) {
      setAvatarUrl(getAvatarImageUrl(imageUrl));
      setImageError(false);
    }
  }, [imageUrl]);

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      // Fallback to ui-avatars service
      const fallbackUrl = `https://ui-avatars.com/api/?name=Player&size=${size}&background=b89c3a&color=ffffff&font-size=0.33&format=png`;
      setAvatarUrl(fallbackUrl);
    }
  };

  if (!imageUrl || !avatarUrl) {
    // Default avatar icon
    return (
      <div 
        className={`flex items-center justify-center bg-gray-200 rounded-full ${className}`}
        style={{ width: size, height: size }}
      >
        <svg 
          width={size * 0.6} 
          height={size * 0.6} 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-gray-500"
        >
          <circle cx="12" cy="7" r="4"/>
          <path d="M5.5 21v-2a4.5 4.5 0 0 1 9 0v2"/>
        </svg>
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full border border-gray-300 object-cover ${className}`}
      onError={handleImageError}
    />
  );
}
