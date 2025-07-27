'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Avatar from '@/components/Avatar'; // optional, not used if we just render <img>
import Link from 'next/link';

interface UserProfile {
  name?: string;
  email: string;
  image?: string;
  isAuthenticated?: boolean;
  error?: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/user-profile');
      const data = await res.json();
      
      if (data.status === 'ok' && data.user) {
        setUser({
          name: data.user.name,
          email: data.user.email,
          image: data.user.image,
          isAuthenticated: true
        });
      } else {
        setUser({
          name: 'Sample User',
          email: 'sample@example.com',
          isAuthenticated: false
        });
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      setUser({
        name: 'Sample User',
        email: 'sample@example.com',
        isAuthenticated: false
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [session]);

  const LetterAvatar = ({ name, size = 100 }: { name?: string; size?: number }) => {
    const firstLetter = name ? name.charAt(0).toUpperCase() : 'U';
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;
    const bgColor = colors[colorIndex];

    return (
      <div 
        className={`${bgColor} rounded-full flex items-center justify-center text-white font-bold`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {firstLetter}
      </div>
    );
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="p-6 text-center text-red-500">Failed to load profile</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="text-center">

            {/* ✅ Avatar or Fallback */}
            {user.image ? (
              <img
                src={user.image}
                alt="Profile avatar"
                width={120}
                height={120}
                className="rounded-full mx-auto object-cover border border-gray-300"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <LetterAvatar name={user.name} size={120} />
            )}

            {/* ✅ Name & Email */}
            <h1 className="mt-4 text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="mt-2 text-gray-600">{user.email}</p>

            {/* ✅ Error if any */}
            {user.error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{user.error}</p>
              </div>
            )}

            {/* ✅ Status + Sign In Prompt */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status:</span>
                <span className={user.isAuthenticated ? "text-green-600" : "text-orange-600"}>
                  {user.isAuthenticated ? "Authenticated" : "Guest"}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Session:</span>
                <span className={session ? "text-green-600" : "text-red-600"}>
                  {session ? "Active" : "None"}
                </span>
              </div>
            </div>

            {/* ✅ Sign-in Options if Not Authenticated */}
            {!user.isAuthenticated && (
              <div className="mt-6 space-y-3">
                <p className="text-sm text-gray-500">Sign in to see your personal profile</p>
                <div className="space-y-2">
                  <Link 
                    href="/auth/signin"
                    className="block w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/signup"
                    className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Welcome to Lotería! This is your personal profile page.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
