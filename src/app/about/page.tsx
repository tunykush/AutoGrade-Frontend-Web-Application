'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  GraduationCap, ArrowRight, Sparkles, ShieldCheck,
  BarChart3, Clock, CheckSquare, Building2, Users, Lightbulb,
} from 'lucide-react';
import { NeatGradient } from '@firecms/neat';
import Navbar from '@/components/ui/Navbar';

const CONTAINER = "max-w-[1200px] mx-auto px-6 md:px-10";

function useInView(options = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); observer.disconnect(); }
    }, { threshold: 0.08, ...options });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, inView };
}

function Animate({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

const stats = [
  { value: '12+', label: 'Institutions onboarded', sub: 'across 4 countries' },
  { value: '50K+', label: 'Submissions graded', sub: 'and counting' },
  { value: '5.7×', label: 'Workload reduction', sub: 'vs manual grading' },
  { value: '46.4', label: 'NPS from early users', sub: 'industry-leading satisfaction' },
];

const values = [
  { icon: ShieldCheck, title: 'Human first', desc: 'AI assists — educators decide. Every score is auditable, overridable, and yours to own.' },
  { icon: Sparkles, title: 'Relentless accuracy', desc: 'We fine-tune on real academic rubrics, not generic benchmarks. Quality over speed, always.' },
  { icon: BarChart3, title: 'Radical transparency', desc: 'We show our reasoning. Every grade comes with cited evidence so educators can trust or challenge it.' },
  { icon: Clock, title: 'Time is sacred', desc: 'We obsess over minutes saved. Evenings and weekends belong to educators, not marking piles.' },
  { icon: Lightbulb, title: 'Continuous learning', desc: 'Your overrides train our model. The more you correct, the sharper EdGenAI gets for your context.' },
  { icon: Building2, title: 'Built for institutions', desc: 'Enterprise-grade security, SSO, LMS integrations, and dedicated support from day one.' },
];

const team = [
  { name: 'Aisha Rahman', role: 'Co-founder & CEO', bg: 'bg-slate-800', initial: 'A', bio: 'Former lecturer at NUS. Spent 12 years grading before deciding there had to be a better way.' },
  { name: 'Marcus Lim', role: 'Co-founder & CTO', bg: 'bg-slate-600', initial: 'M', bio: 'ML researcher with a focus on document understanding and rubric-aligned scoring models.' },
  { name: 'Priya Nair', role: 'Head of Product', bg: 'bg-slate-700', initial: 'P', bio: 'EdTech veteran. Shipped products used by 500K+ students across Southeast Asia.' },
  { name: 'Jordan Osei', role: 'Head of Customer Success', bg: 'bg-slate-500', initial: 'J', bio: 'Worked with university registrars for 8 years. Knows exactly where grading workflows break down.' },
];

const milestones = [
  { year: '2022', event: 'Founded in Singapore — frustrated lecturers meet frustrated ML researchers.' },
  { year: '2023', event: 'Launched private beta with 3 pilot universities. 10,000 submissions graded in month one.' },
  { year: '2024', event: 'Raised seed round. Expanded to 12 institutions across Singapore, Australia, and the UK.' },
  { year: '2025', event: 'Released enterprise tier with SSO, LMS integrations, and custom rubric libraries.' },
  { year: 'Now', event: 'Grading 50,000+ submissions a month. Still obsessed with saving educators time.' },
];

export default function AboutPage() {
  const gradientRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!gradientRef.current) return;
    const gradient = new NeatGradient({
      ref: gradientRef.current,
      colors: [
        { color: '#324B73', enabled: true },
        { color: '#3f4756', enabled: true },
        { color: '#23334A', enabled: true },
        { color: '#485770', enabled: true },
      ],
      speed: 3, horizontalPressure: 5, verticalPressure: 7,
      waveFrequencyX: 2, waveFrequencyY: 2, waveAmplitude: 8,
      shadows: 6, highlights: 8, colorBrightness: 1, colorSaturation: 7,
      wireframe: false, colorBlending: 10, backgroundColor: '#23334A',
      backgroundAlpha: 1, grainScale: 3, grainSparsity: 0,
      grainIntensity: 0.3, grainSpeed: 1, resolution: 1,
    });
    const handleScroll = () => { gradient.yOffset = window.scrollY; };
    window.addEventListener('scroll', handleScroll);
    return () => { window.removeEventListener('scroll', handleScroll); gradient.destroy(); };
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#F8F5F0', color: '#23334A' }}>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{ position: 'relative', paddingBottom: '80px' }}>
        <canvas ref={gradientRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, width: '100%', height: '300px',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(248,245,240,0.4) 40%, rgba(248,245,240,0.85) 70%, #F8F5F0 100%)',
          zIndex: 1,
        }} />
        <Navbar variant="dark" />
        <div className={`${CONTAINER} text-center pt-32 pb-16`} style={{ position: 'relative', zIndex: 10 }}>
          <Animate delay={0}>
            <span className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)' }}>
              <GraduationCap className="h-3.5 w-3.5" />
              EdGenAI — Our Story
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-white mb-6">
              Built by educators,<br />for educators
            </h1>
            <p className="text-base md:text-lg mx-auto max-w-xl" style={{ color: 'rgba(199,217,229,0.85)' }}>
              We started EdGenAI because we lived the problem — late nights buried in marking, rubrics that didn't survive contact with real submissions, and feedback that never had the depth students deserved.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup"
                className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold transition"
                style={{ backgroundColor: 'white', color: '#23334A', border: '1.5px solid white' }}>
                Get started free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contact"
                className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold transition hover:bg-white/20"
                style={{ color: 'white', border: '1.5px solid rgba(255,255,255,0.45)' }}>
                Contact us
              </Link>
            </div>
          </Animate>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section className="py-16" style={{ backgroundColor: '#F8F5F0' }}>
        <div className={CONTAINER}>
          <Animate delay={0}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
              {stats.map(({ value, label, sub }) => (
                <div key={label}>
                  <p className="text-4xl font-extrabold" style={{ color: '#23334A' }}>{value}</p>
                  <p className="mt-1 text-xs font-semibold" style={{ color: '#23334A' }}>{label}</p>
                  <p className="mt-0.5 text-xs" style={{ color: '#23334A', opacity: 0.45 }}>{sub}</p>
                </div>
              ))}
            </div>
          </Animate>
        </div>
      </section>

      {/* ── MISSION ──────────────────────────────────────── */}
      <section className="py-24" style={{ backgroundColor: '#eeeae4' }}>
        <div className={CONTAINER}>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <Animate delay={0}>
              <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: '#F8F5F0', border: '1px solid rgba(35,51,74,0.08)' }}>
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: '#23334A' }}>
                  <GraduationCap className="h-9 w-9 text-white" />
                </div>
                <p className="mt-6 text-sm font-bold" style={{ color: '#23334A' }}>Our mission</p>
                <p className="mt-2 text-xs leading-relaxed mx-auto max-w-xs" style={{ color: '#23334A', opacity: 0.6 }}>
                  Give every educator the time and insight to focus on what actually matters — teaching.
                </p>
                <div className="mt-8 flex justify-center gap-3">
                  <div className="rounded-xl px-4 py-2 text-xs font-bold text-white" style={{ backgroundColor: '#23334A' }}>5× faster grading</div>
                  <div className="rounded-xl px-4 py-2 text-xs font-semibold" style={{ border: '1px solid rgba(35,51,74,0.2)', color: '#23334A' }}>100% auditable</div>
                </div>
              </div>
            </Animate>
            <Animate delay={120}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#23334A', opacity: 0.45 }}>Why we exist</p>
                <h2 className="text-3xl font-bold leading-tight mb-4" style={{ color: '#23334A' }}>
                  Marking is necessary.<br />Spending 20 minutes per paper is not.
                </h2>
                <p className="text-sm leading-relaxed mb-3" style={{ color: '#23334A', opacity: 0.65 }}>
                  Multiplied by 150 students, that time comes at the cost of lesson prep, student support, and personal wellbeing.
                </p>
                <p className="text-sm leading-relaxed" style={{ color: '#23334A', opacity: 0.65 }}>
                  EdGenAI doesn't replace the educator. It eliminates the mechanical work so educators can spend more time on the parts only a human can do — nuanced feedback, pastoral care, and genuine connection with students.
                </p>
                <ul className="mt-8 space-y-3">
                  {['Reduce grading time by up to 80%', 'Maintain consistent, rubric-anchored standards', 'Surface insights across whole-class performance'].map(item => (
                    <li key={item} className="flex items-start gap-3 text-sm" style={{ color: '#23334A', opacity: 0.75 }}>
                      <CheckSquare className="mt-0.5 h-4 w-4 shrink-0" style={{ color: '#23334A' }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Animate>
          </div>
        </div>
      </section>

      {/* ── TIMELINE ─────────────────────────────────────── */}
      <section className="py-24" style={{ backgroundColor: '#F8F5F0' }}>
        <div className={`${CONTAINER} max-w-3xl`}>
          <Animate delay={0}>
            <p className="text-center text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#23334A', opacity: 0.45 }}>Journey</p>
            <h2 className="text-center text-3xl font-bold mb-14" style={{ color: '#23334A' }}>How we got here</h2>
          </Animate>
          <div className="space-y-0">
            {milestones.map(({ year, event }, i) => (
              <Animate key={year} delay={i * 80}>
                <div className="relative flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#23334A' }}>
                      {i + 1}
                    </div>
                    {i < milestones.length - 1 && <div className="mt-1 w-px flex-1 mb-1" style={{ backgroundColor: 'rgba(35,51,74,0.15)' }} />}
                  </div>
                  <div className="pb-8">
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#23334A', opacity: 0.4 }}>{year}</p>
                    <p className="mt-1 text-sm leading-relaxed" style={{ color: '#23334A', opacity: 0.75 }}>{event}</p>
                  </div>
                </div>
              </Animate>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────────── */}
      <section className="py-24" style={{ backgroundColor: '#23334A' }}>
        <div className={CONTAINER}>
          <Animate delay={0}>
            <p className="text-center text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(199,217,229,0.5)' }}>Values</p>
            <h2 className="text-center text-3xl font-bold text-white mb-14">What we stand for</h2>
          </Animate>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {values.map(({ icon: Icon, title, desc }, i) => (
              <Animate key={title} delay={i * 70}>
                <div className="rounded-2xl p-7 h-full" style={{ border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="mt-5 text-sm font-bold text-white">{title}</p>
                  <p className="mt-2 text-xs leading-relaxed" style={{ color: 'rgba(199,217,229,0.65)' }}>{desc}</p>
                </div>
              </Animate>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ─────────────────────────────────────────── */}
      <section className="py-24" style={{ backgroundColor: '#F8F5F0' }}>
        <div className={CONTAINER}>
          <Animate delay={0}>
            <p className="text-center text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#23334A', opacity: 0.45 }}>Team</p>
            <h2 className="text-center text-3xl font-bold mb-3" style={{ color: '#23334A' }}>The people behind EdGenAI</h2>
            <p className="text-center text-sm mx-auto max-w-lg mb-14" style={{ color: '#23334A', opacity: 0.55 }}>
              A small, focused team with deep roots in both education and machine learning.
            </p>
          </Animate>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map(({ name, role, bg, initial, bio }, i) => (
              <Animate key={name} delay={i * 80}>
                <div className="rounded-2xl p-6 h-full" style={{ backgroundColor: '#eeeae4', border: '1px solid rgba(35,51,74,0.08)' }}>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${bg} text-base font-bold text-white`}>
                    {initial}
                  </div>
                  <p className="mt-4 text-sm font-bold" style={{ color: '#23334A' }}>{name}</p>
                  <p className="text-xs font-semibold" style={{ color: '#23334A', opacity: 0.45 }}>{role}</p>
                  <p className="mt-3 text-xs leading-relaxed" style={{ color: '#23334A', opacity: 0.6 }}>{bio}</p>
                </div>
              </Animate>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOIN US ──────────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: '#eeeae4' }}>
        <div className={CONTAINER}>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { icon: Users, title: "We're hiring", desc: "We're a small team looking for people who care deeply about education and craft. If that's you, get in touch.", link: 'See open roles' },
              { icon: Building2, title: 'Partner with us', desc: "LMS providers, assessment publishers, and EdTech platforms — let's build something together.", link: 'Get in touch' },
            ].map(({ icon: Icon, title, desc, link }, i) => (
              <Animate key={title} delay={i * 80}>
                <div className="flex gap-4 rounded-2xl p-7 h-full" style={{ backgroundColor: '#F8F5F0', border: '1px solid rgba(35,51,74,0.08)' }}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: '#23334A' }}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#23334A' }}>{title}</p>
                    <p className="mt-1 text-xs leading-relaxed" style={{ color: '#23334A', opacity: 0.55 }}>{desc}</p>
                    <Link href="/contact" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold hover:underline" style={{ color: '#23334A' }}>
                      {link} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </Animate>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-14" style={{ backgroundColor: '#23334A' }}>
        <div className={`${CONTAINER} flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left`}>
          <Animate delay={0}>
            <div>
              <h2 className="text-xl font-bold text-white md:text-2xl">Ready to reclaim your time?</h2>
              <p className="mt-2 text-sm" style={{ color: 'rgba(199,217,229,0.65)' }}>Join hundreds of educators already saving hours every week with EdGenAI.</p>
            </div>
          </Animate>
          <Animate delay={80}>
            <Link href="/signup"
              className="shrink-0 inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold transition"
              style={{ backgroundColor: 'white', color: '#23334A' }}>
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
          </Animate>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="py-8 text-center" style={{ borderTop: '1px solid rgba(35,51,74,0.08)', backgroundColor: '#F8F5F0' }}>
        <p className="text-xs" style={{ color: '#23334A', opacity: 0.35 }}>© {new Date().getFullYear()} EdGenAI. All rights reserved.</p>
      </footer>

    </div>
  );
}