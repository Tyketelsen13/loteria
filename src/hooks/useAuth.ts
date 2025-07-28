"use client";

import { useSession } from "next-auth/react";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
}

export interface UseAuthReturn {
  user: AuthUser | null;
  jwtToken: string | null;
  loading: boolean;
  isAuthenticated: boolean;
}

/**
 * Unified authentication hook that provides:
 * - NextAuth session for UI state
 * - JWT token for API calls to backend
 */
export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();
  
  const loading = status === "loading";
  const isAuthenticated = !!session?.user;
  
  const user: AuthUser | null = session?.user ? {
    id: (session.user as any)?.id || '',
    email: session.user.email || '',
    name: session.user.name || '',
    image: session.user.image ?? undefined
  } : null;
  
  // Extract JWT token from session for API calls
  const jwtToken: string | null = (session as any)?.jwtToken || null;
  
  return {
    user,
    jwtToken,
    loading,
    isAuthenticated
  };
}

/**
 * Helper function to make authenticated API calls to backend
 */
export async function authenticatedFetch(
  url: string, 
  options: RequestInit = {},
  jwtToken?: string | null
): Promise<Response> {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add JWT token if available
  if (jwtToken) {
    (headers as any)['Authorization'] = `Bearer ${jwtToken}`;
  }
  
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Include cookies for CORS
  });
}
