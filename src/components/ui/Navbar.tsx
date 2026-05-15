'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';

type NavbarProps = {
  variant?: 'dark' | 'light';
};

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  return document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='))
    ?.split('=')[1];
}

export default function Navbar({ variant = 'dark' }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropOpen, setUserDropOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const checkAuth = useCallback(() => {
    setIsLoggedIn(!!getCookie('is_logged_in'));
  }, []);

  useEffect(() => { checkAuth(); }, [pathname, checkAuth]);
  useEffect(() => {
    window.addEventListener('focus', checkAuth);
    return () => window.removeEventListener('focus', checkAuth);
  }, [checkAuth]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setUserDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = useCallback(async () => {
    try { await fetch('/api/signout', { method: 'POST' }); } catch { /* ignore */ }
    setIsLoggedIn(false);
    setMenuOpen(false);
    setUserDropOpen(false);
    router.push('/');
  }, [router]);

  const handleConsultancy = useCallback(() => {
    setMenuOpen(false);
    if (pathname === '/') {
      document.getElementById('consultancy')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push('/#consultancy');
    }
  }, [pathname, router]);

  const isDark = variant === 'dark';
  const textColor = isDark ? 'rgba(255,255,255,0.85)' : '#1e293b';
  const linkClass = `nav-link px-4 py-2 text-base font-medium rounded-full transition cursor-pointer`;

  return (
    <header
      className="w-full sticky top-0 z-40 py-4"
      style={{ backgroundColor: isDark ? 'transparent' : 'white', borderBottom: isDark ? 'none' : '1px solid #f1f5f9' }}
    >
      <div className="w-full px-6 md:px-10 flex items-center">

        {/* Logo */}
        <Link href="/">
          <Image
            src="/logos/EdGenAI_Logo.png"
            alt="EdGenAI"
            width={60}
            height={60}
            style={{ filter: isDark ? 'brightness(0) invert(1)' : 'brightness(0)' }}
            unoptimized
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-1 ml-6">
          <Link href="/papers" className={linkClass} style={{ color: textColor }}>AutoGrade</Link>
          <button onClick={handleConsultancy} className={linkClass} style={{ color: textColor }}>
            Consultancy
          </button>
          <Link href="/about" className={linkClass} style={{ color: textColor }}>About Us</Link>
        </nav>

        {/* Desktop right side */}
        <div className="hidden md:flex ml-auto items-center gap-6">
          {isLoggedIn ? (
            /* User dropdown */
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setUserDropOpen(p => !p)}
                className={`${linkClass} flex items-center gap-1.5`}
                style={{ color: textColor }}
              >
                Account
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.6, transition: 'transform 0.2s', transform: userDropOpen ? 'rotate(180deg)' : 'none' }}>
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {userDropOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl overflow-hidden shadow-xl"
                  style={{ background: 'white', border: '1px solid #e2e8f0' }}>
                  <Link href="/account"
                    onClick={() => setUserDropOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <circle cx="7.5" cy="5" r="3" stroke="#64748b" strokeWidth="1.3" />
                      <path d="M1.5 13.5c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="#64748b" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                    Account Settings
                  </Link>
                  <div style={{ height: '1px', background: '#f1f5f9', margin: '0 12px' }} />
                  <button onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 transition">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <path d="M5.5 2H3a1 1 0 00-1 1v9a1 1 0 001 1h2.5" stroke="#e11d48" strokeWidth="1.3" strokeLinecap="round" />
                      <path d="M10 10l3-2.5L10 5" stroke="#e11d48" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="13" y1="7.5" x2="6" y2="7.5" stroke="#e11d48" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/signin" className={linkClass} style={{ color: textColor }}>Log In</Link>
          )}

          <button
            className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-semibold cursor-pointer transition"
            style={isDark
              ? { color: 'white', border: '1.5px solid rgba(255,255,255,0.45)' }
              : { color: '#23334A', border: '1.5px solid #cbd5e1' }
            }
          >
            Book a demo
          </button>
        </div>

        {/* Hamburger — mobile only */}
        <button
          className="md:hidden ml-auto flex flex-col gap-1.5 cursor-pointer p-2"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Toggle menu"
        >
          {[
            { transform: menuOpen ? 'rotate(45deg) translateY(6px)' : 'none' },
            { opacity: menuOpen ? 0 : 1 },
            { transform: menuOpen ? 'rotate(-45deg) translateY(-6px)' : 'none' },
          ].map((style, i) => (
            <span key={i} style={{
              display: 'block', width: '22px', height: '2px',
              backgroundColor: isDark ? 'white' : '#1e293b',
              borderRadius: '2px', transition: 'all 0.2s ease', ...style,
            }} />
          ))}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="md:hidden mx-4 mt-2 rounded-2xl overflow-hidden"
          style={isDark
            ? { background: 'rgba(35,51,74,0.95)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.15)' }
            : { background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }
          }
        >
          <nav className="flex flex-col p-2">
            <Link href="/papers" onClick={() => setMenuOpen(false)}
              className="px-4 py-3 text-sm font-medium rounded-xl" style={{ color: textColor }}>
              AutoGrade
            </Link>
            <button onClick={handleConsultancy}
              className="px-4 py-3 text-sm font-medium rounded-xl text-left cursor-pointer"
              style={{ color: textColor }}>
              Consultancy
            </button>
            <Link href="/about" onClick={() => setMenuOpen(false)}
              className="px-4 py-3 text-sm font-medium rounded-xl" style={{ color: textColor }}>
              About Us
            </Link>
            <div style={{ height: '1px', backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', margin: '4px 16px' }} />
            {isLoggedIn ? (
              <>
                <Link href="/account" onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 text-sm font-medium rounded-xl" style={{ color: textColor }}>
                  Account Settings
                </Link>
                <button onClick={handleLogout}
                  className="px-4 py-3 text-sm font-medium rounded-xl text-left text-rose-500">
                  Log Out
                </button>
              </>
            ) : (
              <Link href="/signin" onClick={() => setMenuOpen(false)}
                className="px-4 py-3 text-sm font-medium rounded-xl" style={{ color: textColor }}>
                Log In
              </Link>
            )}
            <div className="p-2">
              <button className="w-full px-5 py-2.5 rounded-full text-sm font-semibold cursor-pointer"
                style={isDark
                  ? { backgroundColor: 'white', color: '#23334A' }
                  : { backgroundColor: '#23334A', color: 'white' }
                }>
                Book a demo
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}