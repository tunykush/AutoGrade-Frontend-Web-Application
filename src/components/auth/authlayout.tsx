'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import BorderGlow from '@/components/ui/BorderGlow';

const LiquidEther = dynamic(() => import('@/components/ui/LiquidEther'), { ssr: false });

export default function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 text-[#111111] sm:px-6">
      {/* Animated liquid ether background - full screen */}
      <div className="absolute inset-0" style={{ background: '#0f1923' }}>
        <LiquidEther
          colors={['#324B73', '#485770', '#23334A']}
          mouseForce={20}
          cursorSize={120}
          resolution={0.5}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          autoResumeDelay={2000}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      <Link
        href="/"
        className="absolute left-4 top-4 z-20 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[13px] font-medium text-white/86 backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/18 sm:left-6 sm:top-6"
      >
        ← Homepage
      </Link>

      {/* Card with hover-based glowing blue border */}
      <BorderGlow
        className="relative z-10 w-full max-w-[440px] shadow-[0_24px_80px_rgba(3,10,20,0.36)]"
        borderRadius={28}
        glowColor="210 88 62"
        backgroundColor="rgba(248, 251, 255, 0.94)"
        glowRadius={46}
        glowIntensity={1.9}
        edgeSensitivity={12}
        coneSpread={30}
        colors={['#324B73', '#4f7fc3', '#38bdf8']}
        fillOpacity={0.28}
      >
        <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(241,247,255,0.92))] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
          <div className="px-6 py-8 sm:px-8 sm:py-9">
            <div className="text-center">
              <h1 className="text-[24px] font-semibold tracking-[-0.035em] text-[#10131a] sm:text-[26px]">
                {title}
              </h1>
              <p className="mx-auto mt-2 max-w-[320px] text-[14px] leading-6 text-[#7d8494] sm:text-[15px]">
                {subtitle}
              </p>
            </div>

            <div className="mt-7">{children}</div>
          </div>

          <div className="border-t border-black/5 bg-white/45 px-6 py-4 text-center sm:px-8">
            <p className="text-[13px] font-medium tracking-[0.18em] text-[#838b9c]">EdGenAI</p>
          </div>
        </div>
      </BorderGlow>
    </main>
  );
}