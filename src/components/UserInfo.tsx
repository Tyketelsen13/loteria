"use client";
import { useSession } from "next-auth/react";

// Displays a welcome message for the signed-in user
export default function UserInfo() {
  const { data: session } = useSession();
  // If not signed in, render nothing
  if (!session?.user) return null;
  return (
    <div className="flex flex-col items-center gap-2 mb-6">
      { /* Show user's name or email */}
      <div className="text-lg font-semibold">Welcome, {session.user.name || session.user.email}!</div>
    </div>
    
  );
}
