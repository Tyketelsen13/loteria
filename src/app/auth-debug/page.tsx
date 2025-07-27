'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export default function AuthTestPage() {
  const { data: session, status } = useSession();

  console.log('Auth Test Page - Status:', status);
  console.log('Auth Test Page - Session:', session);

  if (status === 'loading') {
    return <div className="p-6">Loading session...</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
      
      <div className="space-y-4">
        <div>
          <strong>Status:</strong> {status}
        </div>
        
        {session ? (
          <div className="space-y-2">
            <div><strong>User:</strong> {session.user?.name || 'No name'}</div>
            <div><strong>Email:</strong> {session.user?.email || 'No email'}</div>
            <div><strong>Image:</strong> {session.user?.image || 'No image'}</div>
            <button 
              onClick={() => signOut()}
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div>
            <div>No session found</div>
            <button 
              onClick={() => signIn()}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Sign In
            </button>
          </div>
        )}

        <div className="mt-6">
          <h2 className="text-lg font-semibold">Raw Session Data:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
