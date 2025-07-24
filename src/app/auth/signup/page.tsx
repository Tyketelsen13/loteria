"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, password }),
    });
    if (res.ok) {
      router.push("/auth/signin?signup=success");
    } else {
      const data = await res.json();
      setError(data.error || "Registration failed");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8ecd7] bg-[url('/parchment-bg.png')] bg-cover p-4">
      <form onSubmit={handleSubmit} className="bg-white/90 border-4 border-[#b89c3a] rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col gap-4 drop-shadow-xl">
        <h2 className="text-3xl font-western font-bold text-center text-[#8c2f2b] mb-4 tracking-widest drop-shadow">
          ¡Únete a Nosotros!
        </h2>
        <h3 className="text-lg font-semibold text-center text-[#3b2c1a] mb-4">
          Create your account to play Lotería
        </h3>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full p-3 border-2 border-[#b89c3a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e1b866] bg-[#fff8e1] text-lg transition-all duration-150"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-3 border-2 border-[#b89c3a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e1b866] bg-[#fff8e1] text-lg transition-all duration-150"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full p-3 border-2 border-[#b89c3a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e1b866] bg-[#fff8e1] text-lg transition-all duration-150"
          required
        />
        {error && (
          <div className="text-red-600 mb-2 text-center bg-red-100 border border-red-400 rounded-lg p-2">
            {error}
          </div>
        )}
        <button 
          type="submit" 
          className="w-full bg-gradient-to-b from-[#e1b866] to-[#b89c3a] text-[#8c2f2b] font-western font-semibold py-3 rounded-xl border-2 border-[#8c2f2b] shadow-lg hover:from-[#ffe7a0] hover:to-[#e1b866] hover:text-[#6a1a1a] transition-all duration-150 text-lg tracking-wide"
        >
          Create Account
        </button>
        <div className="text-center mt-4 text-[#3b2c1a]">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-[#8c2f2b] hover:text-[#b89c3a] font-bold transition-colors text-lg">
            Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}
