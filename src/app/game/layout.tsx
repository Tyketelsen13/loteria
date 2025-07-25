"use client";

import { useSession } from "next-auth/react";
import { useJWTAuth } from "../../context/JWTAuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const { user: jwtUser, loading: jwtLoading } = useJWTAuth();
  const router = useRouter();

  // Check if user is authenticated via either NextAuth or JWT
  const isAuthenticated = session?.user || jwtUser;
  const authLoading = status === "loading" || jwtLoading;

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (authLoading) return; // Still loading
    if (!isAuthenticated) {
      router.push("/auth/signin");
      return;
    }
  }, [isAuthenticated, authLoading, router]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f8ecd7] flex items-center justify-center">
        <div className="text-xl font-medium text-[#8c2f2b]">Loading...</div>
      </div>
    );
  }

  // Don't render anything if not authenticated (redirect in progress)
  if (!isAuthenticated) {
    return null;
  }

  // Render children if authenticated
  return <>{children}</>;
}
