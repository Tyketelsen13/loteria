"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
}

interface JWTAuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const JWTAuthContext = createContext<JWTAuthContextType | undefined>(undefined);

export function JWTAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      // Use relative URL to leverage Next.js API rewrites
      const response = await fetch('/api/auth/jwt-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('jwt_token');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('jwt_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Use relative URL to leverage Next.js API rewrites
      const response = await fetch('/api/auth/jwt-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('jwt_token', data.token);
        setUser(data.user);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setUser(null);
  };

  return (
    <JWTAuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </JWTAuthContext.Provider>
  );
}

export function useJWTAuth() {
  const context = useContext(JWTAuthContext);
  if (context === undefined) {
    throw new Error('useJWTAuth must be used within a JWTAuthProvider');
  }
  return context;
}
