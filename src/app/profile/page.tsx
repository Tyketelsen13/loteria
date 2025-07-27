'use client';

import { useEffect, useState } from 'react';
import Avatar from '@/components/Avatar';

interface UserProfile {
  name?: string;
  email: string;
  image?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Mock user data - replace with actual data source as needed
  const mockUser: UserProfile = {
    name: 'John Doe',
    email: 'john.doe@example.com'
  };

  useEffect(() => {
    // Simulate loading and set mock user data
    setTimeout(() => {
      setUser(mockUser);
      setLoading(false);
    }, 500);
  }, []);

  // Simple avatar component with first letter
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

  if (loading) {
    return <div className="p-6 text-center">Loading profile...</div>;
  }

  if (!user) {
    return <div className="p-6 text-center text-red-500">Failed to load profile</div>;
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-8">Profile</h1>
        
        <div className="flex flex-col items-center space-y-6">
          {/* Profile Picture */}
          <LetterAvatar name={user.name} size={120} />
          
          {/* User Info */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-gray-800">
              {user.name || 'User'}
            </h2>
            <p className="text-gray-600 text-lg">
              {user.email}
            </p>
          </div>
        </div>

        {/* Optional: Additional profile sections */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">About</h3>
          <p className="text-gray-600">
            Welcome to your profile page! This is where you can view your account information.
          </p>
        </div>
      </div>
    </div>
  );
}
