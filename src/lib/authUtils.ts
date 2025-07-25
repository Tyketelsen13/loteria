/**
 * Authentication Utility Functions
 * Helper functions for managing authentication state
 */

import { signOut } from "next-auth/react";

/**
 * Clear all authentication data and redirect to sign-in
 * Useful for debugging or when restarting the server
 */
export async function forceSignOut() {
  try {
    await signOut({ 
      redirect: true, 
      callbackUrl: "/auth/signin" 
    });
  } catch (error) {
    console.error("Error signing out:", error);
    // Fallback: clear localStorage and redirect
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/auth/signin";
    }
  }
}

/**
 * Clear browser storage and cookies
 * Use this for complete session cleanup
 */
export function clearAllAuthData() {
  if (typeof window !== "undefined") {
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear NextAuth cookies
    const cookies = document.cookie.split(";");
    cookies.forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (name.includes("next-auth") || name.includes("__Secure-next-auth")) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
    });
  }
}
