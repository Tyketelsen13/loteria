"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface SessionData {
  user?: {
    name?: string;
    email?: string;
    image?: string;
  };
  expires?: string;
  error?: string;
}

export default function SessionDebug() {
  const { data: session, status } = useSession();
  const [clientSession, setClientSession] = useState<SessionData | null>(null);

  useEffect(() => {
    // Test direct session fetch to backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const sessionUrl = backendUrl ? `${backendUrl}/api/auth/session` : '/api/auth/session';
    
    console.log('Fetching session from:', sessionUrl);
    
    fetch(sessionUrl, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(res => {
        console.log('Session fetch response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('Direct session fetch result:', data);
        setClientSession(data);
      })
      .catch(err => {
        console.error('Session fetch error:', err);
        setClientSession({ error: err.message });
      });
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Session Debug</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">useSession() Status:</h2>
          <p>Status: {status}</p>
          <pre className="mt-2 text-sm overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">Direct /api/auth/session fetch:</h2>
          <pre className="mt-2 text-sm overflow-auto">
            {JSON.stringify(clientSession, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">Environment:</h2>
          <p>NEXT_PUBLIC_API_URL: {process.env.NEXT_PUBLIC_API_URL}</p>
        </div>
      </div>
    </div>
  );
}
