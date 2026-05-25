'use client';

import Link from 'next/link';
import { useState } from 'react';
import AuthLayout from '@/components/auth/authlayout';
import AuthInput from '@/components/auth/authinput';
import AuthButton from '@/components/auth/authbutton';

export default function SignInForm() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      });
      const data = await res.json();
      console.log('signin response:', data);
      if (!res.ok) {
        setError(data.error || data.message || data.detail || 'Sign in failed. Please check your credentials.');
        setLoading(false);
        return;
      }
      window.location.href = '/papers';
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Sign in to your account" subtitle="Welcome back! Please sign in to continue">
      <form onSubmit={handleSubmit} autoComplete="on">
        <AuthInput
          label="Username"
          type="text"
          placeholder="Enter your username"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="username"
        />
        <AuthInput
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
        <AuthButton type="submit">{loading ? 'Signing in…' : 'Sign in'}</AuthButton>
        <div className="relative z-20 mt-8 text-center">
          <span className="text-[15px] text-[#7b7f8f]">Need an account? </span>
          <Link href="/signup" className="font-medium text-[#3b3f4a] hover:underline">Sign up</Link>
          <br />
          <span className="text-[15px] text-[#7b7f8f]">Forgot your password? </span>
          <Link href="/reset-password" className="font-medium text-[#3b3f4a] hover:underline">Reset password</Link>
        </div>
      </form>
    </AuthLayout>
  );
}