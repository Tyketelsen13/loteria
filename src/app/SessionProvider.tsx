/**
 * NextAuth Session Provider Wrapper for Next.js 14 App Router
 * Provides authentication context and session management to all child components
 */

"use client";
import { SessionProvider } from "next-auth/react";

/**
 * Session Provider Component
 * 
 * A simple wrapper around NextAuth's SessionProvider that enables
 * session management throughout the application. This component
 * must be marked as "use client" to handle session state.
 */
export default function NextAuthSessionProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <SessionProvider 
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      {children}
    </SessionProvider>
  );
}
