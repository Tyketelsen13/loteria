"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    
    console.log('[SignIn] Attempting sign in with:', email);
    
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    
    console.log('[SignIn] Sign in response:', res);
    
    if (res?.ok) {
      console.log('[SignIn] Sign in successful, authentication working!');
      // Authentication is working, but cross-domain session is the issue
      alert('✅ Authentication Successful!\n\nThe backend authentication is working perfectly.\nThe issue is cross-domain session cookies.\n\nSee DEPLOYMENT_STATUS.md for solutions.');
      // Don't redirect to avoid 404 issues
    } else {
      console.log('[SignIn] Sign in failed:', res?.error);
      setError(res?.error || "Invalid email or password");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8ecd7] bg-[url('/parchment-bg.png')] bg-cover p-4">
      <form onSubmit={handleSubmit} className="bg-white/90 border-4 border-[#b89c3a] rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col gap-4 drop-shadow-xl">
        <h2 className="text-3xl font-western font-bold text-center text-[#8c2f2b] mb-4 tracking-widest drop-shadow">
          ¡Bienvenido!
        </h2>
        <h3 className="text-lg font-semibold text-center text-[#3b2c1a] mb-4">
          Sign in to play Lotería
        </h3>
        {searchParams?.get("signup") === "success" && (
          <div className="text-green-600 mb-2 text-center bg-green-100 border border-green-400 rounded-lg p-2">
            Account created! Please sign in.
          </div>
        )}
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
        <div className="w-full text-right mb-2">
          <Link href="/auth/reset" className="text-[#8c2f2b] hover:text-[#b89c3a] text-sm font-medium transition-colors">
            Forgot password?
          </Link>
        </div>
        {error && (
          <div className="text-red-600 mb-2 text-center bg-red-100 border border-red-400 rounded-lg p-2">
            {error}
          </div>
        )}
        <button 
          type="submit" 
          className="w-full bg-gradient-to-b from-[#e1b866] to-[#b89c3a] text-[#8c2f2b] font-western font-semibold py-3 rounded-xl border-2 border-[#8c2f2b] shadow-lg hover:from-[#ffe7a0] hover:to-[#e1b866] hover:text-[#6a1a1a] transition-all duration-150 text-lg tracking-wide"
        >
          Sign In
        </button>
      </form>
      {/* Moved the sign up link outside the form to prevent form submission issues */}
      <div className="text-center mt-6 bg-white/80 border-2 border-[#b89c3a] rounded-xl p-4 text-[#3b2c1a]">
        Don't have an account?{' '}
        <Link 
          href="/auth/signup" 
          className="text-[#8c2f2b] hover:text-[#b89c3a] font-bold transition-colors text-lg"
          onClick={() => { console.log('[SignIn] Sign Up link clicked'); }}
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}
