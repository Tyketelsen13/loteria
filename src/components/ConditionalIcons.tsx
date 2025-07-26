"use client";
import { usePathname } from "next/navigation";
import HomeIcon from "./HomeIcon";
import SettingsMenu from "./SettingsMenu";

/**
 * Conditionally renders HomeIcon and SettingsMenu based on current route
 * Hides these icons on authentication pages for a cleaner experience
 */
export default function ConditionalIcons() {
  const pathname = usePathname();
  
  // List of paths where icons should be hidden
  const hideIconsOn = [
    "/auth/signin",
    "/auth/signup", 
    "/auth/reset",
    "/jwt-signin"
  ];
  
  // Check if current path or any parent path should hide icons
  const shouldHideIcons = hideIconsOn.some(path => 
    pathname === path || pathname?.startsWith(`${path}/`)
  );
  
  // Don't render icons on authentication pages
  if (shouldHideIcons) {
    return null;
  }
  
  // Render both icons for all other pages
  return (
    <>
      <SettingsMenu />
      <HomeIcon />
    </>
  );
}
