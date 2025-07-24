"use client";
import { useState } from "react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) setSent(true);
    else setError("Could not send reset email. Please try again.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100">
      <div className="bg-white/90 p-8 rounded-2xl shadow-xl w-full max-w-md flex flex-col gap-6 border border-blue-100">
        <h2 className="text-3xl font-extrabold text-center text-blue-700 mb-2">
          Forgot your password?
        </h2>
        <p className="text-center text-gray-600 mb-4">
          Enter your email and we'll send you a link to reset your password.
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <input
            type="email"
            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-center transition"
          >
            Send Reset Link
          </button>
        </form>
        {sent && (
          <div className="text-green-600 text-center mt-2">
            If your email is registered, a reset link has been sent.
          </div>
        )}
        {error && (
          <div className="text-red-600 text-center mt-2">{error}</div>
        )}
      </div>
    </div>
  );
}
