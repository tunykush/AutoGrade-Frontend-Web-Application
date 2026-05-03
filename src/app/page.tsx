'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from "react";
import Image from 'next/image';

import FeatureCard from '@/components/ui/FeatureCard';
import ProgressBar from '@/components/ui/ProgressBar';
import StatCard from '@/components/ui/StatCard';
import SummaryItem from '@/components/ui/SummaryItem';

import Step from '@/components/sections/Step';
import Testimonial from '@/components/sections/Testimonial';
import FAQItem from '@/components/sections/FAQItem';

// Single source of truth for horizontal padding
const CONTAINER = "max-w-[1600px] mx-auto px-4";

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
    }, { threshold: 0.12, ...options });
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
        transform: inView ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.55s ease-in ${delay}ms, transform 0.55s ease-in ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function HomePage() {

  const exploreItems = [
    {
      title: "Business Automation",
      description: "We help education providers streamline complex administrative processes using secure, reliable GenAI solutions.",
      bullets: [
        "Workflow automation for admin, support, and academic teams",
        "AI-driven knowledge bases and helpdesk assistants",
        "Automated student onboarding, reminders, and progress nudges",
        "Custom integrations connecting LMS, SIS, CRM, and communication platforms",
        "Compatible with LMS platforms including Moodle, Canvas, and LTI-enabled systems",
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
        "Techniques for providing AI-supported personalized feedback",
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
        "AI risk, auditability, and bias-mitigation frameworks",
        "Staff guidelines, governance playbooks, and responsible AI policies",
      ],
    },
    {
      title: "Course Design",
      description: "We support educators in creating courses that leverage AI to improve engagement, clarity, and student outcomes without sacrificing academic integrity.",
      bullets: [
        "Modular, outcome-aligned course design frameworks",
        "AI-assisted creation of lessons, activities, readings, and resources",
        "Adaptive content pathways based on learner progress",
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
        "Automated formative and summative feedback at scale",
        "Bias-aware and integrity-focused assessment frameworks",
        "Analytics to track performance, engagement, and learning outcomes",
      ],
    },
    {
      title: "AI Coaching & Advisory",
      description: "We partner with leaders, educators, and technical teams to help them use AI effectively, sustainably, and ethically, no matter the starting point.",
      bullets: [
        "1:1 or team-based AI strategy and implementation guidance",
        "Review of existing workflows, pain points, and opportunities",
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

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ─── NAVBAR ─── */}
      <header className="w-full py-4">
        <div className={`${CONTAINER} flex items-center`}>

          <div className="flex items-center gap-6 bg-[#C7D9E5] rounded-full px-6 py-3">
            <div className="flex items-center gap-2">
              <Link href="/homepage">
                <Image
                  src="/logos/EdGenAI_Logo.png"
                  alt="EdGenAI"
                  width={50}
                  height={50}
                  style={{ filter: 'brightness(0) invert(0)', color: '#23334A' }}
                />
              </Link>
              <span className="font-bold text-base">EdGenAI</span>
            </div>

            <nav className="hidden md:flex gap-2">
              <Link href="#" className="px-4 py-2 text-base font-medium text-gray-700 hover:bg-white rounded-full transition">AutoGrade</Link>
              <Link href="#" className="px-4 py-2 text-base font-medium text-gray-700 hover:bg-white rounded-full transition">Consultancy</Link>
              <Link href="#" className="px-4 py-2 text-base font-medium text-gray-700 hover:bg-white rounded-full transition">About Us</Link>
            </nav>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <Link href="/login" className="text-base font-medium text-gray-700">Log in</Link>
            <button className="bg-gray-900 text-white px-6 py-2.5 rounded-full text-base font-semibold hover:bg-gray-800 transition">
              Book a demo
            </button>
          </div>

        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="bg-white py-12">
        <div className={`${CONTAINER} grid md:grid-cols-2 gap-8 items-center`}>

          <Animate delay={0}>
            <h1 className="text-3xl md:text-4xl font-black leading-tight">
              Grade Assignments <br /> 10x Faster with AI
            </h1>

            <p className="mt-3 text-base text-gray-600">
              AI-powered grading for university tutors. Save hours of marking while
              maintaining consistency and control.
            </p>

            <div className="flex gap-3 mt-6">
              <button className="bg-gray-900 text-white px-5 py-2 rounded-xl text-base font-semibold">
                Try AutoGrade Free
              </button>
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-500 mb-2">Supported by leading universities</p>
              <div className="flex gap-4 text-gray-400 text-base font-semibold">
                <Image src="/logos/UniMelb_Logo.svg" alt="UniMelb" width={0} height={0} className="h-12 w-auto" />
                <Image src="/logos/RMIT_Logo.svg" alt="RMIT" width={0} height={0} className="h-12 w-auto" />
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm text-gray-500 mb-3">Integrates seamlessly with LMS platforms</p>
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-1.5" title="Moodle">
                  <Image src="/logos/Moodle_Logo.svg" alt="Moodle" width={0} height={0} className="h-8 w-auto" />
                </div>
                <div className="flex items-center gap-1.5" title="Canvas LMS">
                  <Image src="/logos/Canvas_Logo.svg" alt="Canvas" width={0} height={0} className="h-12 w-auto relative top-1" />
                </div>
              </div>
            </div>
          </Animate>

          {/* Video Demo panel */}
          <Animate delay={120}>
            <div className="w-full aspect-video bg-[#23334A] rounded-2xl shadow-md flex flex-col items-center justify-center gap-4 cursor-pointer group relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              <div className="relative z-10 w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center group-hover:bg-white/30 transition">
                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[18px] border-l-white ml-1" />
              </div>
              <p className="relative z-10 text-white/70 text-base font-medium tracking-wide">Watch Demo</p>
            </div>
          </Animate>

        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="bg-gray-50 py-12">
        <div className={`${CONTAINER} grid md:grid-cols-3 gap-6 text-center`}>
          {[
            { value: "7+ hrs", label: "saved weekly" },
            { value: "98%", label: "consistency rate" },
            { value: "3x", label: "more detailed feedback" },
          ].map((stat, i) => (
            <Animate key={i} delay={i * 80}>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </Animate>
          ))}
        </div>
      </section>

      {/* ─── WORKFLOW ─── */}
      <section className="bg-white py-12">
        <div className={CONTAINER}>

          <Animate>
            <div className="bg-gray-100 rounded-2xl p-6 relative overflow-hidden mb-8">
              <div className="absolute inset-0 opacity-30 bg-[url('/your-image.jpg')] bg-cover bg-center" />
              <div className="relative z-10">
                <div className="relative">
                  <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-400 -translate-y-1/2" />
                  <div className="grid grid-cols-4 relative">
                    {[1, 2, 3, 4].map((num) => (
                      <div key={num} className="flex justify-center">
                        <div className="w-8 h-8 rounded-full border-2 border-gray-700 bg-white flex items-center justify-center text-base font-semibold">
                          {num}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Animate>

          <div className="grid md:grid-cols-4 gap-6 text-center">
            {[
              { title: "Upload Assignments", desc: "Drag and drop student work in any format, including handwritten scans, PDFs, Word docs, or images." },
              { title: "Set your Rubric", desc: "Define your grading criteria once and reuse across submissions." },
              { title: "AI grades & suggests", desc: "Automatically generate consistent, rubric-aligned feedback." },
              { title: "Review & Approve", desc: "Edit, refine, and approve before sharing with students." },
            ].map((step, i) => (
              <Animate key={i} delay={i * 80}>
                <Step title={step.title} desc={step.desc} />
              </Animate>
            ))}
          </div>

        </div>
      </section>

      {/* ─── PROBLEM SECTION ─── */}
      <section className="py-12 bg-gray-50">
        <div className={CONTAINER}>

          <div className="grid md:grid-cols-4 gap-6 mb-6">
            {[
              { title: "5.7", suffix: "hrs/wk", subtitle: "Grading Workload", desc: "Teachers spend about 5.7 hours a week on marking, above the OECD average.", source: "OECD, AITSL" },
              { title: "50", suffix: "%", subtitle: "Stress from grading", desc: "Up to half of teachers say too much marking drives stress.", source: "acer.org" },
              { title: "Bias", suffix: "Risk", subtitle: "Bias, inconsistency & feedback quality", desc: "Human grading can be inconsistent and subjective.", source: "OECD, AITSL" },
              { title: "46.4", suffix: "hrs/wk", subtitle: "Work beyond standard hours", desc: "Teachers often work nights and weekends.", source: "OECD, AITSL" },
            ].map((card, i) => (
              <Animate key={i} delay={i * 80}>
                <StatCard title={card.title} suffix={card.suffix} subtitle={card.subtitle} desc={card.desc} source={card.source} />
              </Animate>
            ))}
          </div>

          <Animate>
            <div className="bg-gray-200 rounded-2xl py-10 px-6 grid md:grid-cols-3 text-center gap-6">
              <SummaryItem title="10+ hrs" desc="10+ hours on marking is common for secondary teachers" />
              <SummaryItem title="1 in 4" desc="Secondary teachers report 10+ hours of marking weekly" />
              <SummaryItem title="After-hours" desc="Grading and paperwork spill into personal time" />
            </div>
          </Animate>

        </div>
      </section>

      {/* ─── TIME SAVED SECTION ─── */}
      <section className="py-12 bg-gray-50">
        <div className={CONTAINER}>

          <Animate>
            <h2 className="text-4xl font-black mb-3">Time saved, life reclaimed</h2>
            <p className="text-base text-gray-600 mb-12">See how AutoGrade transforms hours of marking into minutes.</p>
          </Animate>

          <div className="grid md:grid-cols-2 gap-8">
            <Animate delay={0}>
              <FeatureCard title="Average time per assignment batch">
                <p className="text-base text-gray-500 mb-6">Class of 30 students, essay assignment</p>
                <div className="flex flex-col gap-6 flex-1 justify-center">
                  <ProgressBar label="Manual" value={90} rightText="10 hrs" />
                  <ProgressBar label="AutoGrade" value={15} rightText="1.5 hrs" />
                </div>
                <p className="mt-6 text-base text-gray-600 text-center">
                  Save up to <span className="font-bold text-xl">85%</span> of your marking time
                </p>
              </FeatureCard>
            </Animate>

            <Animate delay={120}>
              <FeatureCard title="Minutes per task comparison">
                <p className="text-base text-gray-500 mb-6">Traditional vs AutoGrade assisted</p>
                <ProgressBar label="Essay Marking" value={85} subValue={15} rightText="45 min → 8 min" />
                <ProgressBar label="Q&A Grading" value={70} subValue={10} rightText="30 min → 5 min" />
                <ProgressBar label="Report Review" value={80} subValue={14} rightText="40 min → 7 min" />
                <ProgressBar label="Report Writing" value={60} subValue={12} rightText="25 min → 4 min" />
                <div className="flex gap-4 mt-6 text-sm text-gray-500 justify-center">
                  <span className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-300 rounded-full" />Traditional</span>
                  <span className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-800 rounded-full" />With AutoGrade</span>
                </div>
              </FeatureCard>
            </Animate>
          </div>

        </div>
      </section>

      {/* ─── TESTIMONIAL SECTION ─── */}
      <section className="bg-gray-50 py-12">
        <div className={CONTAINER}>
          <Animate>
            <div className="relative rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-[#2E3B55]" />
              <div className="relative z-10 px-6 py-8 text-white">
                <div className="grid md:grid-cols-3 divide-x divide-white/20">
                  <Testimonial title="Save up to 85% of grading time" />
                  <Testimonial title="Generate consistent, rubric-aligned feedback" />
                  <Testimonial title="Handle large classes with ease" />
                </div>
              </div>
            </div>
          </Animate>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="bg-white py-12">
        <div className={CONTAINER}>
          <Animate>
            <div className="bg-gray-900 text-white rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <h3 className="text-2xl font-bold">Reclaim your time. Revolutionise your classroom.</h3>
              <button className="bg-white text-gray-900 px-5 py-2 rounded-xl text-base font-semibold">
                Start free trial
              </button>
            </div>
          </Animate>
        </div>
      </section>

      {/* ─── CONTROL SECTION ─── */}
      <section className="bg-gray-50 py-12">
        <div className={`${CONTAINER} grid md:grid-cols-2 gap-8 items-center`}>

          <Animate delay={0}>
            <div className="bg-[#23334A] h-[220px] rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer group relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
              <div className="relative z-10 w-12 h-12 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center group-hover:bg-white/30 transition">
                <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[14px] border-l-white ml-1" />
              </div>
              <p className="relative z-10 text-white/70 text-base font-medium tracking-wide">Watch Demo</p>
            </div>
          </Animate>

          <Animate delay={120}>
            <div className="text-right">
              <h2 className="text-3xl font-black mb-4">You stay in control, always</h2>
              <ul className="space-y-2 text-base text-gray-600">
                <li>✔ Review AI suggestions before finalising</li>
                <li>✔ Customise feedback tone</li>
                <li>✔ Apply professional judgement</li>
                <li>✔ Full transparency with students</li>
              </ul>
              <div className="flex gap-3 mt-6 justify-center">
                <button className="bg-gray-900 text-white px-5 py-2 rounded-xl text-base">Try AutoGrade Free</button>
                <button className="border px-5 py-2 rounded-xl text-base">View Demo</button>
              </div>
            </div>
          </Animate>

        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="bg-white py-12">
        <div className={CONTAINER}>
          <Animate>
            <h2 className="text-2xl font-bold mb-4 text-center">FAQ</h2>
          </Animate>
          <div className="space-y-3">
            {[
              { q: "How does AutoGrade handle handwritten assignments?", a: "AutoGrade uses advanced OCR technology trained on handwritten text. Scan or photograph work and the AI digitises and analyses it against your rubric." },
              { q: "Can I customise the grading rubric?", a: "Absolutely! You control the rubric criteria. Create from scratch, modify templates, or import your school standards." },
              { q: "What if I disagree with the AI?", a: "You are always in control. Every AI-generated grade and feedback item is a suggestion you can revise or override." },
              { q: "How much time can I save?", a: "Australian educators using AutoGrade save an average of 7+ hours per week on marking tasks, turning 10-hour workloads into under 2 hours." },
            ].map((item, i) => (
              <Animate key={i} delay={i * 60}>
                <FAQItem question={item.q} answer={item.a} />
              </Animate>
            ))}
          </div>
        </div>
      </section>

      {/* ─── EXPLORE SECTION ─── */}
      <section className="bg-gray-50 py-12">
        <div className={CONTAINER}>

          <Animate>
            <h2 className="text-3xl font-black mb-2 text-center">Scale AI Across Your Institution</h2>
            <p className="text-center text-base text-gray-600 mb-10">
              AutoGrade is just the beginning. Expand AI across your entire teaching workflow.
            </p>
          </Animate>

          <Animate delay={80}>
            <div className="grid md:grid-cols-4 gap-4 items-start">

              <div className="bg-[#2E3B55] text-white rounded-2xl p-4">
                <p className="text-md font-semibold opacity-80 mb-3">EXPLORE</p>
                <ul className="space-y-2 text-md">
                  {exploreItems.map((item, index) => (
                    <li
                      key={index}
                      onClick={() => setActiveIndex(index)}
                      className={`cursor-pointer transition ${
                        activeIndex === index ? "opacity-100 font-semibold" : "opacity-60 hover:opacity-80"
                      }`}
                    >
                      {item.title}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="md:col-span-3 rounded-2xl overflow-hidden border border-blue-500 flex flex-col justify-center h-[300px]">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{exploreItems[activeIndex].title}</h3>
                  <p className="text-base text-gray-600 mb-3">{exploreItems[activeIndex].description}</p>
                  {exploreItems[activeIndex].bullets && (
                    <ul className="list-disc pl-5 space-y-1 text-md text-gray-600">
                      {exploreItems[activeIndex].bullets.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

            </div>
          </Animate>

        </div>
      </section>

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
          backgroundColor: '#23334A',
          color: 'white',
          fontSize: '1.25rem',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
          border: '2px solid rgba(255,255,255,0.2)',
          cursor: 'pointer',
          opacity: showTop ? 1 : 0,
          pointerEvents: showTop ? 'auto' : 'none',
          transform: showTop ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}
      >
        ↑
      </button>

      {/* ─── FOOTER ─── */}
      <footer className="bg-gray-900 text-white py-16 text-center">
        <p className="opacity-80">© 2026 EdGenAI</p>
      </footer>

    </div>
  );
}
