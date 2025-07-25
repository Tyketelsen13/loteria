"use client";
// User profile page for Lotería Online
// Allows users to view and update their profile and avatar
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useRef } from "react";

// Helper to call AI avatar generation API route
async function generateAIAvatar(customPrompt?: string) {
  const res = await fetch("/api/profile/avatar", { 
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      generateAI: true,
      customPrompt: customPrompt 
    })
  });
  
  if (!res.ok) {
    // Try to get the actual error message from the server
    let errorMessage = "Failed to generate AI avatar";
    try {
      const errorData = await res.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch (e) {
      // If we can't parse the error response, use the default message
    }
    console.error("Avatar generation failed:", res.status, errorMessage);
    throw new Error(errorMessage);
  }
  
  return res.json();
}

export default function ProfilePage() {
  // Get user session and state for avatar upload
  const { data: session, status, update } = useSession();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Show loading spinner while session is loading
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg text-gray-500">Loading...</span>
      </div>
    );
  }

  // If not signed in, prompt user to sign in
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <span className="text-lg text-gray-500 mb-4">You must be signed in to view your profile.</span>
        <Link href="/auth/signin" className="text-blue-600 hover:underline font-semibold">Sign In</Link>
      </div>
    );
  }

  const user = session.user;

  // Handle avatar file upload
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError("");
    setSuccess("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("avatar", file);
    const res = await fetch("/api/profile/avatar", {
      method: "POST",
      body: formData,
    });
    setUploading(false);
    if (res.ok) {
      update(); // Refresh session
    } else {
      setError("Failed to upload avatar.");
    }
  }

  // Handle AI-generated avatar
  async function handleAIAvatar() {
    setError("");
    setSuccess("");
    setUploading(true);
    try {
      const response = await generateAIAvatar(customPrompt.trim() || undefined);
      if (response.success && response.imageUrl) {
        setSuccess("🎨 New AI avatar generated successfully!");
        setCustomPrompt(""); // Clear the input after successful generation
        
        // Force session refresh to get updated user data from database
        await update();
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError("Failed to generate AI avatar. Please try again.");
      }
    } catch (err) {
      console.error("AI Avatar generation error:", err);
      // Show the actual error message from the server
      const errorMessage = err instanceof Error ? err.message : "Could not generate AI avatar. Please check your connection and try again.";
      setError(errorMessage);
    }
    setUploading(false);
  }

  // Profile page styled with vintage/western theme
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8ecd7] dark:bg-[#18181b] bg-[url('/parchment-bg.png')] dark:bg-none bg-cover transition-colors">
      <div className="bg-white/90 dark:bg-gray-900/90 border-4 border-[#b89c3a] dark:border-yellow-700 p-8 rounded-2xl shadow-2xl w-full max-w-md flex flex-col items-center gap-6 drop-shadow-xl transition-colors">
        {/* Profile Heading */}
        <h2 className="text-3xl font-western font-extrabold text-center text-[#8c2f2b] dark:text-yellow-200 mb-2 tracking-widest drop-shadow transition-colors">Your Profile</h2>
        {/* Avatar and upload button */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative group">
            <img
              src={user?.image ? `${user.image}?v=${uploading ? 'loading' : Date.now()}` : "https://ui-avatars.com/api/?name=Player&size=80&background=b89c3a&color=ffffff&font-size=0.33&format=png"}
              alt="Profile"
              width={80}
              height={80}
              className="rounded-full border-2 border-[#b89c3a] dark:border-yellow-700 object-cover shadow-md transition-colors"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                // Use a reliable fallback avatar service
                const fallbackUrl = "https://ui-avatars.com/api/?name=Player&size=80&background=b89c3a&color=ffffff&font-size=0.33&format=png";
                if (target.src !== fallbackUrl) {
                  target.src = fallbackUrl;
                }
              }}
            />
            <button
              type="button"
              className="absolute bottom-0 right-0 bg-gradient-to-b from-[#e1b866] to-[#b89c3a] text-[#8c2f2b] rounded-full p-1 shadow hover:from-[#ffe7a0] hover:to-[#e1b866] hover:text-[#6a1a1a] transition group-hover:scale-110 border-2 border-[#8c2f2b]"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Change avatar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2a2.828 2.828 0 11-4-4 2.828 2.828 0 014 4z" />
              </svg>
            </button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              disabled={uploading}
            />
          </div>
          
          {/* Custom avatar prompt input */}
          <div className="w-full max-w-sm">
            <label className="block text-sm font-western font-semibold text-[#8c2f2b] dark:text-yellow-200 mb-2 transition-colors">
              Describe your avatar (optional):
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g., friendly person with glasses wearing a colorful shirt, smiling, cartoon style"
              className="w-full px-3 py-2 text-sm border-2 border-[#b89c3a] dark:border-yellow-700 rounded-lg focus:outline-none focus:border-[#8c2f2b] dark:focus:border-yellow-500 bg-white dark:bg-gray-800 text-[#3b2c1a] dark:text-gray-200 transition-colors resize-none"
              rows={3}
              disabled={uploading}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">
              Leave empty for a random Lotería-themed avatar
            </p>
          </div>
          
          <button
            type="button"
            className="mt-2 px-4 py-2 bg-gradient-to-b from-[#e1b866] to-[#b89c3a] text-[#8c2f2b] font-western font-semibold rounded-xl border-2 border-[#8c2f2b] shadow-lg hover:from-[#ffe7a0] hover:to-[#e1b866] hover:text-[#6a1a1a] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAIAvatar}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <span className="inline-block animate-spin mr-2">🎨</span>
                Generating...
              </>
            ) : (
              <>🎨 Generate AI Avatar</>
            )}
          </button>
          <span className="text-xl font-western font-semibold text-[#8c2f2b] dark:text-yellow-200 drop-shadow transition-colors">{user?.name || "No name"}</span>
          <span className="text-[#3b2c1a] dark:text-gray-200 transition-colors">{user?.email}</span>
        </div>
        {/* Success message */}
        {success && (
          <div className="text-green-600 text-center bg-green-100 border border-green-400 rounded-lg p-2 animate-pulse">
            {success}
          </div>
        )}
        {/* Error message if avatar upload fails */}
        {error && <div className="text-red-600 text-center bg-red-100 border border-red-400 rounded-lg p-2">{error}</div>}
        {/* Back to dashboard button */}
        <Link
          href="/"
          className="mt-4 bg-gradient-to-b from-[#e1b866] to-[#b89c3a] text-[#8c2f2b] dark:text-yellow-900 font-western font-semibold py-2 px-6 rounded-xl border-2 border-[#8c2f2b] dark:border-yellow-700 shadow-lg hover:from-[#ffe7a0] hover:to-[#e1b866] hover:text-[#6a1a1a] transition-all duration-150 text-center drop-shadow"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
