"use client";
import { useEffect, useState } from 'react';

interface IOSInfo {
  isIOS: boolean;
  isIPad: boolean;
  isIPhone: boolean;
  version: string | null;
  hasNotch: boolean;
  isStandalone: boolean;
}

/**
 * Custom hook for detecting iOS devices and handling iOS-specific behaviors
 */
export function useIOSDetection(): IOSInfo {
  const [iosInfo, setIosInfo] = useState<IOSInfo>({
    isIOS: false,
    isIPad: false,
    isIPhone: false,
    version: null,
    hasNotch: false,
    isStandalone: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !('MSStream' in window as any);
    const isIPad = /iPad/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isIPhone = /iPhone/.test(userAgent);
    
    // Extract iOS version
    const versionMatch = userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
    const version = versionMatch ? `${versionMatch[1]}.${versionMatch[2]}${versionMatch[3] ? '.' + versionMatch[3] : ''}` : null;
    
    // Detect notch (devices with safe area insets)
    const hasNotch = CSS.supports('padding: max(0px)') && 
                     (window.screen.height === 812 || // iPhone X, XS
                      window.screen.height === 896 || // iPhone XR, XS Max
                      window.screen.height === 844 || // iPhone 12, 12 Pro
                      window.screen.height === 926 || // iPhone 12 Pro Max
                      window.screen.height === 852);  // iPhone 14 Pro
    
    // Detect standalone mode (PWA)
    const isStandalone = (window.navigator as any).standalone === true ||
                        window.matchMedia('(display-mode: standalone)').matches;

    setIosInfo({
      isIOS,
      isIPad,
      isIPhone,
      version,
      hasNotch,
      isStandalone,
    });
  }, []);

  return iosInfo;
}

/**
 * Hook for handling iOS viewport height changes (keyboard, rotation, etc.)
 */
export function useIOSViewport() {
  const [viewportHeight, setViewportHeight] = useState<number>(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateViewportHeight = () => {
      const newHeight = window.visualViewport?.height || window.innerHeight;
      const screenHeight = window.screen.height;
      
      setViewportHeight(newHeight);
      
      // Detect keyboard (significant height reduction)
      const heightReduction = screenHeight - newHeight;
      setIsKeyboardOpen(heightReduction > 150);
    };

    updateViewportHeight();

    // Listen for viewport changes
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewportHeight);
    }
    
    window.addEventListener('resize', updateViewportHeight);
    window.addEventListener('orientationchange', () => {
      // Delay to allow orientation change to complete
      setTimeout(updateViewportHeight, 100);
    });

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewportHeight);
      }
      window.removeEventListener('resize', updateViewportHeight);
    };
  }, []);

  return { viewportHeight, isKeyboardOpen };
}

/**
 * Hook for preventing iOS zoom on input focus
 */
export function usePreventIOSZoom() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const preventZoom = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        const originalFontSize = target.style.fontSize;
        target.style.fontSize = '16px';
        
        // Restore original font size after focus
        setTimeout(() => {
          target.style.fontSize = originalFontSize;
        }, 100);
      }
    };

    document.addEventListener('focusin', preventZoom);
    return () => document.removeEventListener('focusin', preventZoom);
  }, []);
}

/**
 * Hook for handling iOS-specific touch behaviors
 */
export function useIOSTouch() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    const preventDoubleTouch = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    // Prevent pinch zoom
    const preventPinchZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchend', preventDoubleTouch, { passive: false });
    document.addEventListener('touchstart', preventPinchZoom, { passive: false });

    return () => {
      document.removeEventListener('touchend', preventDoubleTouch);
      document.removeEventListener('touchstart', preventPinchZoom);
    };
  }, []);
}
