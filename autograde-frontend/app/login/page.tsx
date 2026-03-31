'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
 const { login, loginWithOAuth } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const result = await login(username, password);

    if (result.success) {
    setMessage({ text: 'Login successful! Redirecting...', type: 'success' });
    setTimeout(() => router.push('/dashboard'), 2000);
    } else {
    setMessage({ text: result.error || 'Login failed', type: 'error' });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[1fr_1.1fr]">

      {/* LEFT */}
      <div className="flex flex-col justify-between px-10 py-10 bg-white">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 11 12 14 22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">AutoGrade</span>
        </div>

        {/* Form */}
        <div className="flex flex-col items-center w-full max-w-sm mx-auto">

          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
            <svg className="w-7 h-7 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>

          <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Welcome back</h1>
          <p className="text-sm text-gray-400 mb-8 text-center">Sign in to your AutoGrade account</p>

          {message && (
            <div className={`w-full flex items-center gap-2 text-sm font-medium px-4 py-3 rounded-xl mb-5 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                : 'bg-red-50 text-red-500 border border-red-100'
            }`}>
              {message.type === 'success' ? (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              )}
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-3">

            {/* Username */}
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition-all duration-200 bg-white">
              <svg className="w-4 h-4 text-gray-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter email or username"
                required
                className="flex-1 text-sm text-gray-800 outline-none placeholder:text-gray-300 bg-transparent"
              />
            </div>

            {/* Password */}
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition-all duration-200 bg-white">
              <svg className="w-4 h-4 text-gray-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="flex-1 text-sm text-gray-800 outline-none placeholder:text-gray-300 bg-transparent"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-300 hover:text-gray-500 transition-colors">
                {showPassword ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>

            <div className="flex justify-end">
              <span className="text-xs text-indigo-500 hover:text-indigo-700 cursor-pointer transition-colors font-medium">
                Forgot password?
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-950 hover:bg-gray-800 text-white text-sm font-semibold py-3.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2 mt-1"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  Signing in...
                </>
              ) : 'Continue'}
            </button>

          </form>

            <div className="flex items-center gap-3 w-full my-5">
            <div className="flex-1 h-px bg-gray-100"/>
            <span className="text-xs text-gray-300">or</span>
            <div className="flex-1 h-px bg-gray-100"/>
            </div>

            <button
            type="button"
            onClick={() => loginWithOAuth('google')}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all duration-200 mb-4"
            >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
            </button>

            <p className="text-sm text-gray-400 text-center">
            Don't have an account?{' '}
            <Link href="/register" className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors">
                Sign up
            </Link>
</p>

        </div>

        <p className="text-xs text-gray-300 text-center">
          © 2026 EdGenAI Technologies. All rights reserved.
        </p>
      </div>

      {/* RIGHT */}
      <div
        className="hidden md:block relative"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2832&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/60 via-black/40 to-black/70" />
        <div className="absolute bottom-10 left-8 right-8 z-10">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-200 mb-2">AutoGrade Platform</p>
            <h2 className="text-xl font-black leading-snug mb-1">
              AI-assisted grading,<br/>built for educators
            </h2>
            <p className="text-xs text-white/60 leading-relaxed">
              Upload assessments, configure grading criteria, and review AI-generated feedback — all in one place.
            </p>
            <div className="flex gap-6 mt-4 pt-4 border-t border-white/10">
              <div>
                <p className="text-lg font-black">98%</p>
                <p className="text-xs text-white/50">Accuracy rate</p>
              </div>
              <div>
                <p className="text-lg font-black">10x</p>
                <p className="text-xs text-white/50">Faster grading</p>
              </div>
              <div>
                <p className="text-lg font-black">500+</p>
                <p className="text-xs text-white/50">Educators</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}