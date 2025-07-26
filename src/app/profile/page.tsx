'use client';

import { useEffect, useState } from 'react';
import ProfileMenu from '@/components/ProfileMenu'; // adjust path as needed
import Avatar from '@/components/Avatar';

interface UserProfile {
  name?: string;
  email: string;
  image?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const fetchProfile = async () => {
    const res = await fetch('/api/profile');
    const data = await res.json();
    if (res.ok) {
      setUser(data);
    } else {
      console.error('Failed to load profile:', data.error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleGenerateAvatar = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generateAI: true, customPrompt: prompt }),
      });

      const data = await res.json();
      if (res.ok) {
        await fetchProfile();
        setPrompt('');
      } else {
        setError(data.error || 'Failed to generate avatar');
      }
    } catch (err) {
      setError('Error generating avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAvatar = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await fetch('/api/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        await fetchProfile();
        setFile(null);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Error uploading avatar');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="p-6">Loading profile...</div>;
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-6">
        <Avatar imageUrl={user.image} size={100} />
        <div>
          <h2 className="text-2xl font-bold">{user.name || 'Lotería Player'}</h2>
          <p className="text-gray-600">{user.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Generate AI Avatar</h3>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your avatar (optional)"
          className="border rounded px-3 py-2 w-full"
        />
        <button
          onClick={handleGenerateAvatar}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate with AI'}
        </button>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Upload Avatar</h3>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border rounded px-3 py-2 w-full"
        />
        <button
          onClick={handleUploadAvatar}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Upload Image'}
        </button>
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
