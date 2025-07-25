"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useJWTAuth } from "../../../context/JWTAuthContext";
import Link from "next/link";

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login: jwtLogin } = useJWTAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    console.log('[SignIn] Attempting sign in with:', email);
    
    // Try JWT authentication first
    try {
      const jwtSuccess = await jwtLogin(email, password);
      if (jwtSuccess) {
        console.log('[SignIn] JWT authentication successful');
        router.push('/');
        return;
      }
    } catch (jwtError) {
      console.log('[SignIn] JWT authentication failed, trying NextAuth:', jwtError);
    }
    
    // Fallback to NextAuth if JWT fails
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    
    console.log('[SignIn] NextAuth response:', res);
    
    if (res?.ok) {
      console.log('[SignIn] NextAuth successful');
      router.push('/');
    } else {
      console.log('[SignIn] Both authentication methods failed');
      setError("Invalid email or password");
    }
    
    setLoading(false);
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
        <div className="text-sm text-center text-[#8c2f2b] mb-4 bg-[#fff8e1] border border-[#b89c3a] rounded-lg p-2">
          <strong>Test Account:</strong> test@example.com / password123
        </div>
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
          disabled={loading}
          className="w-full bg-gradient-to-b from-[#e1b866] to-[#b89c3a] text-[#8c2f2b] font-western font-semibold py-3 rounded-xl border-2 border-[#8c2f2b] shadow-lg hover:from-[#ffe7a0] hover:to-[#e1b866] hover:text-[#6a1a1a] transition-all duration-150 text-lg tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing In...' : 'Sign In'}
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
