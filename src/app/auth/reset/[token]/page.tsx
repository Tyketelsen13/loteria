"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetWithToken({ params }: { params: Promise<{ token: string }> }) {
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState<string>("");
  const router = useRouter();

  // Extract token from params
  React.useEffect(() => {
    params.then(resolvedParams => {
      setToken(resolvedParams.token);
    });
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/reset/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push("/auth/signin"), 2000);
    } else {
      setError("Invalid or expired token.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md flex flex-col gap-4">
        <h2 className="text-2xl font-bold mb-2">Set New Password</h2>
        <input
          type="password"
          className="border rounded px-3 py-2"
          placeholder="New password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700">
          Reset Password
        </button>
        {success && <div className="text-green-600 mt-2">Password reset! Redirecting to sign in...</div>}
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
    </div>
  );
}
