'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OAuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState('Completing sign in...');

  useEffect(() => {
    const exchangeToken = async () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace('#', ''));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (!accessToken) {
        setStatus('Sign in failed. Redirecting...');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      try {
        const res = await fetch('/api/auth/oauth-exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: accessToken,
            refresh_token: refreshToken,
          }),
        });

        if (!res.ok) {
          setStatus('Sign in failed. Redirecting...');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        const data = await res.json();
        localStorage.setItem('autograde_user', JSON.stringify({
          username: data.username,
          email: data.email,
          accessToken: data.access,
          refreshToken: data.refresh,
        }));

        setStatus('Signed in! Redirecting...');
        setTimeout(() => router.push('/dashboard'), 1500);

      } catch {
        setStatus('Something went wrong. Redirecting...');
        setTimeout(() => router.push('/login'), 2000);
      }
    };

    exchangeToken();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-indigo-600 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
        </div>
        <p className="text-sm text-gray-500 font-medium">{status}</p>
      </div>
    </div>
  );
}