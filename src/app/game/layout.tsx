"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
  }, [status, router]);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#f8ecd7] flex items-center justify-center">
        <div className="text-xl font-medium text-[#8c2f2b]">Loading...</div>
      </div>
    );
  }

  // Don't render anything if not authenticated (redirect in progress)
  if (status === "unauthenticated") {
    return null;
  }

  // Render children if authenticated
  return <>{children}</>;
}
