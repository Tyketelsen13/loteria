/**
 * Development Authentication Reset Component
 * Automatically clears sessions in development when server restarts
 */

"use client";
import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DevAuthReset() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Only run in development mode
    if (process.env.NODE_ENV !== "development") return;

    // Check if this is a fresh server start
    const serverStartTime = sessionStorage.getItem("serverStartTime");
    const currentTime = Date.now().toString();

    if (!serverStartTime) {
      // First visit - store current time and clear any existing session
      sessionStorage.setItem("serverStartTime", currentTime);
      
      if (status === "authenticated") {
        console.log("[DEV] Server restarted - clearing existing session");
        signOut({ redirect: false }).then(() => {
          router.push("/auth/signin");
        });
      }
    }
  }, [status, router]);

  return null; // This component doesn't render anything
}
