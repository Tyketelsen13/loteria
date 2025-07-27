'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [imgError, setImgError] = useState(false);
  
  const user = session?.user;

  // Simple loading state while user data loads
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const firstLetter = user.name?.charAt(0).toUpperCase() || 'U';
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
  ];
  const bgColor =
    user.name && user.name.length > 0
      ? colors[user.name.charCodeAt(0) % colors.length]
      : colors[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8 text-center">

          {/* ✅ Avatar or Fallback */}
          {!imgError && user.image ? (
            <img
              src={user.image}
              alt="User Avatar"
              width={120}
              height={120}
              className="rounded-full mx-auto border border-gray-300 object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className={`${bgColor} rounded-full mx-auto flex items-center justify-center text-white font-bold`}
              style={{ width: 120, height: 120, fontSize: 48 }}
            >
              {firstLetter}
            </div>
          )}

          <h1 className="mt-4 text-2xl font-bold text-gray-900">{user.name}</h1>
          <p className="mt-2 text-gray-600">{user.email}</p>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Welcome to your profile page!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
