'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from "react";
import Image from 'next/image';
import ProgressBar from '@/components/ui/ProgressBar';
import FAQItem from '@/components/sections/FAQItem';
import { NeatGradient } from '@firecms/neat';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
 
// Single source of truth for horizontal padding
const CONTAINER = "max-w-[1200px] mx-auto px-6 md:px-10";
 
// Hook: returns true once the element has entered the viewport
function useInView(options = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, { threshold: 0.08, ...options });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, inView };
}
 
// Wrapper that applies the fade-up animation when in view
function Animate({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
 
// Shared liquid glass style — responsive via w-full + maxWidth
const glassStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '24px',
  padding: '20px 28px',
  width: '100%',
  maxWidth: '420px',
  height: '90px',
  borderRadius: '20px',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.10) 100%)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.35)',
  boxShadow: '0 8px 32px rgba(35,51,74,0.18), inset 0 1px 0 rgba(255,255,255,0.45)',
  overflowX: 'hidden',
};

export default function HomePage() {
  const exploreItems = [
    {
      title: "Business Automation",
      description: "We help education providers streamline complex administrative processes using secure, reliable GenAI solutions.",
      bullets: [
        "Workflow automation for admin, support, and academic teams",
        "AI-driven knowledge bases and helpdesk assistants",
        "Custom integrations connecting LMS, SIS, CRM, and communication platforms",
        "Efficiency analytics to track time savings and ROI",
      ],
    },
    {
      title: "Professional Development & Training",
      description: "We provide hands-on, evidence-based training tailored for educators, support staff, and leadership teams looking to implement GenAI in teaching, operations, and student engagement.",
      bullets: [
        "Practical GenAI use cases for teaching, assessment, and administration",
        "Ready-to-use prompts, templates, and lesson " + '"recipes"',
        "Strategies for designing AI-assisted assessments",
        "Ethical and safe AI use: bias, integrity, transparency, and oversight",
      ],
    },
    {
      title: "Security & Data Governance",
      description: "Ensure student data is protected with enterprise-grade security and full transparency.",
      bullets: [
        "Privacy-first AI adoption strategy",
        "Compliance with local regulations and institutional policies",
        "Secure data handling and model-access controls",
        "Staff guidelines, governance playbooks, and responsible AI policies",
      ],
    },
    {
      title: "Course Design",
      description: "We support educators in creating courses that leverage AI to improve engagement, clarity, and student outcomes without sacrificing academic integrity.",
      bullets: [
        "Modular, outcome-aligned course design frameworks",
        "AI-assisted creation of lessons, activities, readings, and resources",
        "Integration of AI products into curriculum delivery",
        "Templates and design kits for rapid course development",
      ],
    },
    {
      title: "Assessment Design",
      description: "We help institutions modernize assessment systems by combining pedagogy, automation, and learning analytics.",
      bullets: [
        "AI-assisted design of quizzes, assignments, and exams",
        "Rubric-aligned tasks that maintain academic rigor",
        "Bias-aware and integrity-focused assessment frameworks",
        "Analytics to track performance, engagement, and learning outcomes",
      ],
    },
    {
      title: "AI Coaching & Advisory",
      description: "We partner with leaders, educators, and technical teams to help them use AI effectively, sustainably, and ethically, no matter the starting point.",
      bullets: [
        "1:1 or team-based AI strategy and implementation guidance",
        "Hands-on support in prompt engineering and product selection",
        "Roadmaps for scaling AI pilots across departments",
        "Continuous improvement and impact monitoring",
      ],
    },
  ];
 
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const handleScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
 
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverUni, setHoverUni] = useState(false);
  const [hoverLms, setHoverLms] = useState(false);

  const [hoverTryFree, setHoverTryFree] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(document.cookie.includes('is_logged_in'));
  }, []);
  const [hoverViewDemo, setHoverViewDemo] = useState(false);
  const [hoverBookDemo, setHoverBookDemo] = useState(false);

  const [hoverTimeSaved, setHoverTimeSaved] = useState(false);

  const [hoverConsult, setHoverConsult] = useState(false);


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
      speed: 3,
      horizontalPressure: 5,
      verticalPressure: 7,
      waveFrequencyX: 2,
      waveFrequencyY: 2,
      waveAmplitude: 8,
      shadows: 6,
      highlights: 8,
      colorBrightness: 1,
      colorSaturation: 7,
      wireframe: false,
      colorBlending: 10,
      backgroundColor: '#23334A',
      backgroundAlpha: 1,
      grainScale: 3,
      grainSparsity: 0,
      grainIntensity: 0.3,
      grainSpeed: 1,
      resolution: 1,
    });

    const handleScroll = () => { gradient.yOffset = window.scrollY; };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      gradient.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#F8F5F0', color: '#23334A'}}>
 
      {/* ─── NAVBAR + HERO (single unified dark section) ─── */}
      <section style={{ position: 'relative', paddingBottom: '80px' }}>

        {/* Animated gradient canvas */}
        <canvas
          ref={gradientRef}
          id="gradient"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
          }}
        />

        {/* Fade at the bottom */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '400px',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(248,245,240,0.4) 40%, rgba(248,245,240,0.85) 70%, #F8F5F0 100%)',
          zIndex: 1,
        }} />
        <Navbar variant="dark"/>
 
        {/* Hero content */}
        <div className={`${CONTAINER} text-center pt-32 pb-8`} style={{ position: 'relative', zIndex: 10 }}>
          <Animate delay={0}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-white mb-6">
              Grade Assignments<br />10x Faster with EdGenAI
            </h1>
            <p className="text-base md:text-lg mb-10 mx-auto max-w-xl" style={{ color: 'rgba(199,217,229,0.85)' }}>
              AutoGrade - AI-powered grading for university tutors that automatically assesses essays,
              provides feedback, and cut grading time by up to 80%.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href={isLoggedIn ? '/papers' : '/signup'}
                onMouseEnter={() => setHoverTryFree(true)}
                onMouseLeave={() => setHoverTryFree(false)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-semibold cursor-pointer transition"
                style={{
                  backgroundColor: hoverTryFree ? '#23334a9e' : 'white',
                  color: hoverTryFree ? 'white' : '#23334A',
                  border: '1.5px solid white',
                }}
              >
                Try AutoGrade Free
              </Link>
              <button
                className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-semibold cursor-pointer transition hover:bg-white/30"
                style={{ color: 'white', border: '1.5px solid rgba(255,255,255,0.45)' }}
              >
                View Demo
              </button>
            </div>
          </Animate>
 
          {/* University & LMS logo boxes — liquid glass */}
          <Animate delay={160}>
            <div className="mt-28 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-32">
 
              {/* Universities */}
              <div className="flex flex-col items-center gap-3 w-full md:w-[380px] md:h-[150px]">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#f8f5f0b5', letterSpacing: '0.1em' }}>
                  Supported by leading universities
                </p>
                <div
                  // onMouseEnter={() => setHoverLms(true)}
                  // onMouseLeave={() => setHoverLms(false)}
                  style={{
                    ...glassStyle,
                    overflowX: 'hidden',
                    transform: hoverLms ? 'scale(1.06)' : 'scale(1)',
                    transition: 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                >
                  <Image src="/logos/RMIT_Logo.svg" alt="RMIT" width={0} height={0} className="h-10 w-auto" unoptimized />
                  <div style={{ width: '1px', height: '32px', flexShrink: 0, backgroundColor: 'rgba(255,255,255,0.3)' }} />
                  <Image src="/logos/uni-melb-logo_3.png" alt="UniMelb" width={0} height={0} className="h-9 w-auto" unoptimized />
                </div>
              </div>
 
              {/* LMS Platforms */}
              <div className="flex flex-col items-center gap-3 w-full md:w-[380px] md:h-[150px]">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#f8f5f0b5', letterSpacing: '0.1em' }}>
                  Integrates seamlessly with LMS platforms
                </p>
                <div
                  // onMouseEnter={() => setHoverUni(true)}
                  // onMouseLeave={() => setHoverUni(false)}
                  style={{
                    ...glassStyle,
                    transform: hoverUni ? 'scale(1.06)' : 'scale(1)',
                    transition: 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                >
                  {/* <Image src="/logos/Moodle_Logo.svg" alt="Moodle" width={0} height={0} className="h-9 w-auto" unoptimized /> */}
                  <Image src="/logos/Moodle_Logo.svg" alt="Moodle" width={0} height={0} className="h-9 w-auto max-w-[120px]" unoptimized />
                  <div style={{ width: '1px', height: '32px', flexShrink: 0, backgroundColor: 'rgba(255,255,255,0.3)' }} />
                  {/* <Image src="/logos/canvaslogo.png" alt="Canvas" width={0} height={0} className="h-10 w-auto" unoptimized /> */}
                  <Image src="/logos/canvaslogo.png" alt="Canvas" width={0} height={0} className="h-8 w-auto max-w-[120px]" unoptimized />
                </div>
              </div>
 
            </div>
          </Animate>
        </div>
 
      </section>
 
      {/* ─── VIDEO + FEATURE LIST SECTION ─── */}
      <section className="pt-8 md:pt-12 pb-24 md:pb-32" style={{ backgroundColor: '#F8F5F0' }}>
        <div className={`${CONTAINER} max-w-7xl mx-auto grid md:grid-cols-[4fr_3fr] gap-12 items-center justify-center`}>
          <Animate delay={0}>
            <div
              className="w-full aspect-video rounded-2xl shadow-lg flex items-center justify-center relative overflow-hidden"
              style={{ backgroundColor: '#e8e3dc' }}
            >
              {/* placeholder — video to be inserted */}
            </div>
          </Animate>
          <Animate delay={120}>
            <div className="flex flex-col justify-center h-full gap-5">
              {[
                "Review AI suggestions before finalising grades",
                "Apply your professional judgement at every step",
                "Maintain complete transparency with students",
                "Customise feedback tone and detail level",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#C7D9E5' }}
                  >
                    <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                      <path d="M1 4L4 7L10 1" stroke="#23334A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: '#23334A' }}>{item}</p>
                </div>
              ))}
              <div className="mt-4 flex md:block justify-center">
                <Link
                  href={isLoggedIn ? '/papers' : '/signup'}
                  className="self-center mt-4 px-20 py-4 rounded-full text-sm font-semibold cursor-pointer transition-transform duration-300 hover:scale-105 text-white"
                  style={{ backgroundColor: '#324B73' }}
                >
                  Try AutoGrade Free
                </Link>
              </div>
            </div>
          </Animate>
        </div>
      </section>
 
      {/* ─── WORKFLOW ─── */}
      <section className="py-24 md:py-24" style={{ background: 'linear-gradient(135deg, #23334A 0%, #1a2a3a 50%, #2a4060 100%)' }}>
        <div className={CONTAINER}>
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <Animate>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight" style={{ color: '#C7D9E5' }}>
                Transform your grading<br />workflow using just<br />
                <span className="font-black text-white">4 steps</span>
              </h2>
            </Animate>
            <div className="grid grid-cols-2 gap-4 items-stretch">
              {[
                { title: "Upload Assignments", desc: "Drag and drop student work in any format, including handwritten scans, PDFs, Word docs, or images." },
                { title: "Set your Rubric", desc: "Define your grading criteria once and reuse across multiple submission uploads." },
                { title: "AI grades & suggests", desc: "Automatically generate consistent, rubric-aligned feedback." },
                { title: "Review & Approve", desc: "Edit, refine, and approve before sharing with students." },
              ].map((step, i) => (
                <Animate key={i} delay={i * 80}>
                  <div className="rounded-xl p-5 text-center h-full flex flex-col items-center justify-center" style={{ backgroundColor: 'rgba(199,217,229,0.08)', border: '1px solid rgba(199,217,229,0.15)' }}>
                    <h3 className="font-bold text-base mb-2" style={{ color: 'white' }}>{i + 1}. {step.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: '#C7D9E5', opacity: 0.75 }}>{step.desc}</p>
                  </div>
                </Animate>
              ))}
            </div>
          </div>
        </div>
      </section>
 
      {/* ─── TIME SAVED SECTION ─── */}
      <section className="py-28 md:py-28" style={{ backgroundColor: '#F8F5F0' }}>
        <div className={CONTAINER}>
          
          {/* Full-width centered heading */}
          <Animate delay={0}>
            <div className="text-center mb-10 md:mb-14">
              <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight" style={{ color: '#23334A' }}>
                Time saved, life reclaimed
              </h2>
              <p className="text-base max-w-xl mx-auto" style={{ color: '#324B73', opacity: 0.75 }}>
                AutoGrade transforms hours of marking into minutes, giving you back the time that matters.
              </p>
            </div>
          </Animate>

          {/* Two columns */}
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <Animate delay={80}>
              <div className="flex flex-col gap-4">
                <div className="rounded-2xl p-6 md:p-8 shadow-sm" style={{ backgroundColor: 'white', border: '1px solid rgba(50,75,115,0.1)' }}>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#324B73', opacity: 0.8 }}>Average time per assignment batch</p>
                  <p className="text-sm mb-6" style={{ color: '#23334A', opacity: 1 }}>Class of 30 students, essay assignment</p>
                  <div className="flex flex-col gap-5">
                    <ProgressBar label="Manual" value={90} rightText="10 hrs" />
                    <ProgressBar label="AutoGrade" value={15} rightText="1.5 hrs" />
                  </div>
                  <p className="mt-6 text-sm text-center" style={{ color: '#23334A' }}>
                    Save up to <span className="font-bold text-xl">85%</span> of your marking time
                  </p>
                </div>
                <Link
                  href={isLoggedIn ? '/papers' : '/signup'}
                  className="self-center mt-4 px-20 py-4 rounded-full text-sm font-semibold cursor-pointer transition-transform duration-300 hover:scale-105 text-white"
                  style={{ backgroundColor: '#324B73' }}
                >
                  Try AutoGrade Free
                </Link>
              </div>
            </Animate>
            <Animate delay={160}>
              <div className="rounded-2xl p-5 md:p-6" style={{ backgroundColor: '#23334A' }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#C7D9E5', opacity: 1 }}>Minutes per task comparison</p>
                <p className="text-sm mb-5" style={{ color: '#C7D9E5', opacity: 0.55 }}>Traditional vs AutoGrade assisted</p>
                <div className="flex flex-col gap-4">
                  <ProgressBar label="Essay Marking" value={85} subValue={15} rightText="45 min → 8 min" />
                  <ProgressBar label="Q&A Grading" value={70} subValue={10} rightText="30 min → 5 min" />
                  <ProgressBar label="Report Review" value={80} subValue={14} rightText="40 min → 7 min" />
                  <ProgressBar label="Report Writing" value={60} subValue={12} rightText="25 min → 4 min" />
                </div>
                <div className="flex gap-5 mt-5 text-xs justify-center" style={{ color: '#C7D9E5', opacity: 1 }}>
                  <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'rgba(199,217,229,0.35)' }} />Traditional</span>
                  <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ffffff' }} />With AutoGrade</span>
                </div>
              </div>
            </Animate>
          </div>
        </div>
      </section>
 
      {/* ─── TESTIMONIAL SECTION ─── */}
      <section className="py-16 md:py-20" style={{ background: 'linear-gradient(135deg, #23334A 0%, #324B73 50%, #2a4060 100%)' }}>
        <div className={CONTAINER}>
          <Animate>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 md:divide-x" style={{ borderColor: 'rgba(199,217,229,0.2)' }}>
              {[
                { stat: "Save up to 85% of grading time", quote: '"AutoGrade reduced my grading time from 8 hours to under 2 hours." — John Doe' },
                { stat: "Generate consistent, rubric-aligned feedback", quote: '"AutoGrade reduced my grading time from 8 hours to under 2 hours." — John Doe' },
                { stat: "Handle large classes with ease", quote: '"AutoGrade reduced my grading time from 8 hours to under 2 hours." — John Doe' },
              ].map((t, i) => (
                <div key={i} className="px-4 md:px-8 py-4 text-center" style={{ borderColor: 'rgba(199,217,229,0.2)' }}>
                  <p className="font-bold text-base md:text-lg mb-3 text-white">{t.stat}</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#C7D9E5', opacity: 0.7 }}>{t.quote}</p>
                </div>
              ))}
            </div>
          </Animate>
        </div>
      </section>
 
      {/* ─── FAQ ─── */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#F8F5F0' }}>
        <div className={CONTAINER}>
          <Animate>
            <h2 className="text-2xl md:text-3xl font-black mb-10 text-center" style={{ color: '#23334A' }}>FAQ</h2>
          </Animate>
          <div className="flex flex-col gap-3">
            {[
              { q: "How does AutoGrade handle handwritten assignments?", a: "AutoGrade uses advanced OCR technology trained on handwritten text. Scan or photograph work and the AI digitises and analyses it against your rubric." },
              { q: "Can I customise the grading rubric?", a: "Absolutely! You control the rubric criteria. Create from scratch, modify templates, or import your school standards." },
              { q: "What if I disagree with the AI's assessment?", a: "You are always in control. Every AI-generated grade and feedback item is a suggestion you can revise or override." },
              { q: "How much time can I really save?", a: "Australian educators using AutoGrade save an average of 7+ hours per week on marking tasks, turning 10-hour workloads into under 2 hours." },
            ].map((item, i) => (
              <Animate key={i} delay={i * 60}>
                <FAQItem question={item.q} answer={item.a} />
              </Animate>
            ))}
          </div>
        </div>
      </section>
 
      {/* ─── EXPLORE / CONSULTANCY SECTION ─── */}
      <section id="consultancy" className="py-24 md:py-24" style={{ backgroundColor: '#F8F5F0' }}>
        <div className={CONTAINER}>
          <Animate>
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#324B73' }}>Our Services</p>
            <h2 className="text-3xl md:text-4xl font-black mb-3 leading-tight" style={{ color: '#23334A' }}>
              AutoGrade is just the beginning.<br />
              Expand AI across your entire<br />teaching workflow.
            </h2>
          </Animate>
          <Animate delay={80}>
            <div className="flex flex-nowrap gap-2 mt-8 md:mt-10 mb-6 md:mb-8 border-b pb-4 overflow-x-auto" style={{ borderColor: 'rgba(50,75,115,0.15)' }}>
              {exploreItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition whitespace-nowrap flex-shrink-0"
                  style={{
                    backgroundColor: activeIndex === index ? '#23334A' : 'transparent',
                    color: activeIndex === index ? 'white' : '#324B73',
                    border: `1px solid ${activeIndex === index ? '#23334A' : 'rgba(50,75,115,0.2)'}`,
                  }}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </Animate>
          <Animate delay={120}>
            <div className="rounded-2xl shadow-sm relative overflow-hidden" style={{ backgroundColor: 'white', border: '1px solid rgba(50,75,115,0.1)', minHeight: '300px' }}>
              
              {/* Background image with low opacity */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('/logos/consultancy.jpg')`,
                  opacity: 0.8,
                }}
              />

              {/* Blue filter overlay */}
              <div
                className="absolute inset-0"
                style={{ backgroundColor: '#23334A', opacity: 0.5 }}
              />

              {/* Content sits on top */}
              <div className="relative z-10 p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold mb-3" style={{ color: 'white' }}>{exploreItems[activeIndex].title}</h3>
                <p className="text-sm leading-relaxed mb-5" style={{ color: 'white', opacity: 0.8 }}>{exploreItems[activeIndex].description}</p>
                {exploreItems[activeIndex].bullets && (
                  <ul className="flex flex-col gap-2">
                    {exploreItems[activeIndex].bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm" style={{ color: 'white' }}>
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'white' }} />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-8">
                  <button
                    onMouseEnter={() => setHoverConsult(true)}
                    onMouseLeave={() => setHoverConsult(false)}
                    className="px-7 py-3 rounded-full text-sm font-semibold cursor-pointer transition"
                    style={{
                      backgroundColor: hoverConsult ? '#23334A' : 'white',
                      color: hoverConsult ? 'white' : '#23334A',
                      border: hoverConsult ? '2px solid white' : '2px solid transparent',
                    }}
                  >
                    Book a consultation
                  </button>
                </div>
              </div>
            </div>
          </Animate>
        </div>
      </section>
 
      {/* ─── FOOTER ─── */}
      <Footer />
 
      {/* ─── BACK TO TOP ─── */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 50,
          width: '3rem',
          height: '3rem',
          borderRadius: '9999px',
          backgroundColor: '#324B73',
          color: 'white',
          fontSize: '1.25rem',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
          border: '2px solid rgba(199,217,229,0.3)',
          cursor: 'pointer',
          opacity: showTop ? 1 : 0,
          pointerEvents: showTop ? 'auto' : 'none',
          transform: showTop ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}
      >
        ↑
      </button>
 
    </div>
  );
}