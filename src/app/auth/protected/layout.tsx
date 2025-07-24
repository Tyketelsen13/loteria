/**
 * Protected Layout Component
 * Wraps pages that require authentication - automatically redirects unauthenticated users
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  // Check if user has valid session on server-side
  const session = await getServerSession(authOptions);
  
  // Redirect to sign-in page if no valid session found
  if (!session) {
    redirect("/auth/signin");
  }
  
  // Render protected content if user is authenticated
  return <>{children}</>;
}
