"use client";
import { useSession } from "next-auth/react";
import { useJWTAuth } from "../context/JWTAuthContext";

// Displays a welcome message for the signed-in user
export default function UserInfo() {
  const { data: session } = useSession();
  const { user: jwtUser } = useJWTAuth();
  
  // Use either NextAuth or JWT user
  const user = session?.user || jwtUser;
  
  // If not signed in, render nothing
  if (!user) return null;
  
  return (
    <div className="flex flex-col items-center gap-2 mb-6">
      { /* Show user's name or email */}
      <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">Welcome, {user.name || user.email}!</div>
    </div>
    
  );
}
