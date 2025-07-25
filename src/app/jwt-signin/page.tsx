"use client";

import React, { useState } from 'react';
import { useJWTAuth } from '../../context/JWTAuthContext';
import dynamic from 'next/dynamic';

// Dynamic import to prevent server-side rendering
const JWTSigninContent = dynamic(() => Promise.resolve(JWTSigninInner), { 
  ssr: false 
});

function JWTSigninInner() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useJWTAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(email, password);
    
    if (success) {
      alert('🎉 JWT Login Successful!\n\nYou are now authenticated with JWT tokens!\nThis works perfectly for cross-domain authentication.');
      // Could redirect to home page here
    } else {
      setError('Invalid email or password');
    }
    
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f8ecd7',
      padding: '1rem'
    }}>
      <form onSubmit={handleSubmit} style={{
        backgroundColor: 'white',
        border: '4px solid #b89c3a',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{
          color: '#8c2f2b',
          textAlign: 'center',
          marginBottom: '1.5rem',
          fontSize: '2rem',
          fontWeight: 'bold'
        }}>
          JWT Sign In
        </h2>

        <div style={{ marginBottom: '1rem' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #b89c3a',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #b89c3a',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            border: '1px solid #f44336',
            color: '#c62828',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            backgroundColor: loading ? '#ccc' : '#b89c3a',
            color: '#8c2f2b',
            padding: '12px',
            border: '2px solid #8c2f2b',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Signing In...' : 'Sign In with JWT'}
        </button>

        <div style={{
          marginTop: '1rem',
          padding: '12px',
          backgroundColor: '#e3f2fd',
          border: '1px solid #2196f3',
          borderRadius: '4px',
          fontSize: '14px',
          color: '#1976d2'
        }}>
          <strong>Test Credentials:</strong><br />
          Email: test@example.com<br />
          Password: password123
        </div>
      </form>
    </div>
  );
}

export default function JWTSignin() {
  return <JWTSigninContent />;
}
