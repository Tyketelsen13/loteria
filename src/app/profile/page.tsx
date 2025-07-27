'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  image?: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [imgError, setImgError] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user-profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
          setUserProfile(data.user);
        } else {
          setError(data.error || 'Failed to fetch user profile');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [session]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L2.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // No profile data
  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <p className="text-gray-600">No profile data available</p>
        </div>
      </div>
    );
  }

  const user = userProfile;

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
