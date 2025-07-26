"use client";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useJWTAuth } from "../context/JWTAuthContext";
import { useRouter } from "next/navigation";

/**
 * User profile dropdown menu with avatar and sign-out option
 */
export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const { user: jwtUser, logout: jwtLogout } = useJWTAuth();
  const router = useRouter();
  
  // Use either NextAuth or JWT user
  const user = session?.user || jwtUser;
  
  const handleLogout = () => {
    if (session) {
      // NextAuth logout
      signOut({ callbackUrl: "/auth/signin" });
    } else if (jwtUser) {
      // JWT logout
      jwtLogout();
      router.push("/auth/signin");
    }
  };
  
  if (!user) return null;
  
  return (
    <div className="relative">
      {/* Profile avatar button */}
      <button
        aria-label="Profile"
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        onClick={() => setOpen((o) => !o)}
      >
        {user?.image ? (
          <img
            src={user.image}
            alt="Profile"
            width={32}
            height={32}
            className="rounded-full border border-gray-300 dark:border-gray-600 object-cover"
            onError={(e) => {
              // Fallback to ui-avatars service on image load error
              const target = e.target as HTMLImageElement;
              const userName = user?.name || user?.email || 'Player';
              const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&size=32&background=b89c3a&color=ffffff&font-size=0.33&format=png`;
              if (target.src !== fallbackUrl) {
                target.src = fallbackUrl;
              }
            }}
          />
        ) : (
          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700 dark:text-gray-200"><circle cx="12" cy="7" r="4"/><path d="M5.5 21v-2a4.5 4.5 0 0 1 9 0v2"/></svg>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 flex flex-col gap-2 border border-gray-100 dark:border-gray-700 z-50">
          <a href="/profile" className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-200">Profile</a>
          <button
            onClick={handleLogout}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition text-red-600 text-left"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
