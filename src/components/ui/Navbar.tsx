'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkAuth = useCallback(() => {
    setIsLoggedIn(!!getCookie('is_logged_in'));
  }, []);

  useEffect(() => { checkAuth(); }, [pathname, checkAuth]);
  useEffect(() => {
    window.addEventListener('focus', checkAuth);
    return () => window.removeEventListener('focus', checkAuth);
  }, [checkAuth]);

  const handleLogout = useCallback(async () => {
    try { await fetch('/api/signout', { method: 'POST' }); } catch { /* ignore */ }
    setIsLoggedIn(false);
    setMenuOpen(false);
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
            <button onClick={handleLogout} className={linkClass} style={{ color: textColor }}>Log Out</button>
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
              <button onClick={handleLogout}
                className="px-4 py-3 text-sm font-medium rounded-xl text-left" style={{ color: textColor }}>
                Log Out
              </button>
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