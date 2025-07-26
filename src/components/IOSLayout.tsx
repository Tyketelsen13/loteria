"use client";
import { ReactNode, useEffect, useState } from "react";

interface IOSLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * iOS-optimized layout wrapper that handles safe areas, viewport units, and iOS-specific behaviors
 */
export default function IOSLayout({ children, className = "" }: IOSLayoutProps) {
  const [isIOS, setIsIOS] = useState(false);
  const [viewportHeight, setViewportHeight] = useState<number>(0);

  useEffect(() => {
    // Detect iOS devices
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
    setIsIOS(isIOSDevice);

    // Handle viewport height for iOS
    const updateViewportHeight = () => {
      // Use visual viewport API if available (modern browsers)
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height);
      } else {
        // Fallback for older browsers
        setViewportHeight(window.innerHeight);
      }
    };

    updateViewportHeight();

    // Listen for viewport changes (keyboard, etc.)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewportHeight);
    }
    window.addEventListener('resize', updateViewportHeight);
    window.addEventListener('orientationchange', updateViewportHeight);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewportHeight);
      }
      window.removeEventListener('resize', updateViewportHeight);
      window.removeEventListener('orientationchange', updateViewportHeight);
    };
  }, []);

  const layoutStyle = isIOS ? {
    minHeight: `${viewportHeight}px`,
    height: `${viewportHeight}px`,
    maxHeight: `${viewportHeight}px`,
  } : {
    minHeight: '100dvh',
  };

  return (
    <div 
      className={`ios-layout relative overflow-x-hidden ${className}`}
      style={layoutStyle}
    >
      {/* Safe area padding wrapper */}
      <div className="safe-area-wrapper h-full pt-safe-top pb-safe-bottom pl-safe-left pr-safe-right">
        {children}
      </div>
    </div>
  );
}
