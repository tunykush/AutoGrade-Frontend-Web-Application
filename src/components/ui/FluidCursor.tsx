'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * FluidCursor — a liquid-glass lens that follows the mouse and refracts
 * the content underneath, inspired by reactbits.dev/components/fluid-glass.
 *
 * Uses an SVG feDisplacementMap filter for the distortion and
 * backdrop-filter for the glass sheen. Desktop-only, purely decorative.
 */
export default function FluidCursor() {
  const lensRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -200, y: -200 });
  const currentRef = useRef({ x: -200, y: -200 });
  const rafRef = useRef<number>(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    };

    const handlePointerLeave = () => {
      setVisible(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    document.documentElement.addEventListener('pointerleave', handlePointerLeave);

    const LERP = 0.12;

    const animate = () => {
      const cur = currentRef.current;
      const target = posRef.current;

      cur.x += (target.x - cur.x) * LERP;
      cur.y += (target.y - cur.y) * LERP;

      if (lensRef.current) {
        lensRef.current.style.transform = `translate(${cur.x}px, ${cur.y}px) translate(-50%, -50%)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('pointermove', handlePointerMove);
      document.documentElement.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [visible]);

  return (
    <>
      {/* SVG filter for liquid glass distortion — hidden, zero-size */}
      <svg style={{ position: 'fixed', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden="true">
        <defs>
          <filter id="fluid-glass-filter" x="-50%" y="-50%" width="200%" height="200%">
            {/* Turbulence creates the organic, liquid-like displacement pattern */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.015"
              numOctaves="3"
              seed="2"
              result="noise"
            />
            {/* Displacement map warps the backdrop through the noise */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="28"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            {/* Slight chromatic split for realism */}
            <feColorMatrix
              in="displaced"
              type="matrix"
              // values="1.08 0 0 0 0
              //         0 1.02 0 0 0
              //         0 0 1.12 0 0
              //         0 0 0 1 0"
              values="1.08 0 0 0 0 0 1.02 0 0 0 0 0 1.12 0 0 0 0 0 1 0"
              result="color-shifted"
            />
            {/* Subtle gaussian for glass softness */}
            <feGaussianBlur in="color-shifted" stdDeviation="0.5" result="softened" />
            {/* Merge with slight brightness boost */}
            <feComponentTransfer in="softened">
              <feFuncR type="linear" slope="1.05" intercept="0.02" />
              <feFuncG type="linear" slope="1.05" intercept="0.02" />
              <feFuncB type="linear" slope="1.05" intercept="0.02" />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>

      {/* The glass lens element */}
      <div
        ref={lensRef}
        className="pointer-events-none fixed top-0 left-0 z-30"
        style={{
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease',
          willChange: 'transform',
          // The glass effect layers
          backdropFilter: 'url(#fluid-glass-filter) brightness(1.08) contrast(1.05) saturate(1.1)',
          WebkitBackdropFilter: 'url(#fluid-glass-filter) brightness(1.08) contrast(1.05) saturate(1.1)',
          // Glass border & shadow
          boxShadow: `
            inset 0 0 30px rgba(255,255,255,0.15),
            inset 0 1px 0 rgba(255,255,255,0.4),
            inset 0 -1px 0 rgba(0,0,0,0.1),
            0 8px 32px rgba(0,0,0,0.15),
            0 0 0 1.5px rgba(255,255,255,0.25)
          `,
          // Subtle glass gradient overlay
          background: `
            radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.2) 0%, transparent 60%),
            radial-gradient(ellipse at 70% 75%, rgba(0,0,0,0.05) 0%, transparent 60%),
            linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 50%, rgba(0,0,0,0.03) 100%)
          `,
        }}
      >
        {/* Inner highlight ring for depth */}
        <div
          style={{
            position: 'absolute',
            inset: '3px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.12)',
            pointerEvents: 'none',
          }}
        />
        {/* Specular highlight */}
        <div
          style={{
            position: 'absolute',
            top: '12%',
            left: '18%',
            width: '40%',
            height: '25%',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.3) 0%, transparent 70%)',
            transform: 'rotate(-15deg)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </>
  );
}