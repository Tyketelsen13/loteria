'use client';

import { useState } from 'react';
import Avatar from '@/components/Avatar';

export default function TestAvatarPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [prompt, setPrompt] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleGenerateAvatar = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/test-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (res.ok) {
        setAvatarUrl(data.avatarUrl);
        setResult(data);
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

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Avatar Generation Test</h1>
      
      <div className="space-y-4">
        <h3 className="font-semibold">Test AI Avatar Generation</h3>
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
          {loading ? 'Generating...' : 'Generate Test Avatar'}
        </button>
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {result && (
        <div className="space-y-4 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold">Generation Result:</h3>
          <p><strong>Used Fallback:</strong> {result.usedFallback ? 'Yes (ui-avatars)' : 'No (AI)'}</p>
          <p><strong>Message:</strong> {result.message}</p>
          
          {avatarUrl && (
            <div className="space-y-2">
              <p><strong>Generated Avatar:</strong></p>
              <Avatar imageUrl={avatarUrl} size={100} />
              <p className="text-sm text-gray-600 break-all">URL: {avatarUrl}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
