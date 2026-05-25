'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'AutoGrade', href: '/papers' },
  { label: 'Consultancy', href: null },
  { label: 'About Us', href: '/about' },
];

const LEGAL_LINKS = [
  { label: 'Website Privacy', href: '/privacy' },
  { label: 'Acceptable Use Policy', href: '/acceptable-use' },
  { label: 'Terms of Use', href: '/terms' },
  { label: 'Cookies Settings', href: '/cookies' },
];

const linkStyle = { color: '#C7D9E5', opacity: 0.7 };
const linkClass = 'text-sm transition hover:opacity-100';

export default function Footer() {
  const pathname = usePathname();
  const router = useRouter();

  const handleConsultancy = useCallback(() => {
    if (pathname === '/') {
      document.getElementById('consultancy')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push('/#consultancy');
    }
  }, [pathname, router]);

  return (
    <footer className="py-12 md:py-16" style={{ backgroundColor: '#23334A' }}>
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-10 md:gap-12 items-start">
        <div>
          <div className="flex items-center gap-5 mb-5">
            <Image
              src="/logos/EdGenAI_Logo.png"
              alt="EdGenAI"
              width={110}
              height={110}
              style={{ filter: 'brightness(0) invert(1)' }}
              unoptimized
            />
            <p className="text-2xl md:text-3xl font-semibold leading-snug" style={{ color: '#C7D9E5' }}>
              Step into the future<br />of learning with us.
            </p>
          </div>
        </div>
        <nav className="flex flex-col gap-3">
          {NAV_LINKS.map(({ label, href }) =>
            href === null ? (
              <button
                key={label}
                onClick={handleConsultancy}
                className={`${linkClass} text-left`}
                style={linkStyle}
              >
                {label}
              </button>
            ) : (
              <Link key={label} href={href} className={linkClass} style={linkStyle}>
                {label}
              </Link>
            )
          )}
        </nav>
      </div>

      <div
        className="max-w-[1200px] mx-auto px-6 md:px-10 mt-10 md:mt-12 pt-6 flex flex-col sm:flex-row flex-wrap gap-4 justify-between items-start sm:items-center"
        style={{ borderTop: '1px solid rgba(199,217,229,0.15)' }}
      >
        <div className="flex gap-4 flex-wrap">
          {LEGAL_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-xs transition hover:opacity-100"
              style={{ color: '#C7D9E5', opacity: 0.5 }}
            >
              {label}
            </Link>
          ))}
        </div>
        <p className="text-xs" style={{ color: '#C7D9E5', opacity: 0.4 }}>
          © {new Date().getFullYear()} EdGenAI Technologies, Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}