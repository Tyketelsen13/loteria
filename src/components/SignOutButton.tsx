"use client";
import { signOut } from "next-auth/react";

// Button to sign out the current user
export default function SignOutButton() {
  return (
    <button
      // signs user out and redirects to sign-in page
      onClick={() => signOut({ callbackUrl: "/auth/signin" })}
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
    >
      Sign Out
    </button>
  );
}
