'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ─── NAVBAR ─── */}
      <header className="w-full border-b border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center">
          
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">AI</span>
              </div>
              <span className="font-bold">AutoGrade</span>
            </div>

            <nav className="hidden md:flex gap-8 text-sm text-gray-600 font-medium">
              <Link href="#">AutoGrade</Link>
              <Link href="#">Consultancy</Link>
              <Link href="#">About Us</Link>
            </nav>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium">Log in</Link>
            <button className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-semibold">
              Book a demo
            </button>
          </div>

        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">

        <div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight">
            Grade Assignments <br /> 10x Faster with AI
          </h1>

          <p className="mt-4 text-gray-600">
            AI-powered grading for university tutors. Save hours of marking while
            maintaining consistency and control.
          </p>

          <div className="flex gap-4 mt-8">
            <button className="bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold">
              Try AutoGrade Free
            </button>
            <button className="border px-6 py-3 rounded-xl font-semibold">
              View Demo
            </button>
          </div>

          <div className="mt-10">
            <p className="text-sm text-gray-500 mb-3">
              Supported by leading universities
            </p>
            <div className="flex gap-6 text-gray-400 font-semibold">
              <span>RMIT</span>
              <span>University of Melbourne</span>
            </div>
          </div>
        </div>

        {/* Placeholder Video Demo panel */}
        <div className="h-[320px] bg-gray-100 rounded-2xl shadow-md" />
      </section>

      {/* ─── STATS ─── */}
      <section className="max-w-6xl mx-auto px-6 pb-16 grid md:grid-cols-3 gap-6 text-center">
        <div>
          <p className="text-2xl font-bold">7+ hrs</p>
          <p className="text-sm text-gray-500">saved weekly</p>
        </div>
        <div>
          <p className="text-2xl font-bold">98%</p>
          <p className="text-sm text-gray-500">consistency rate</p>
        </div>
        <div>
          <p className="text-2xl font-bold">3x</p>
          <p className="text-sm text-gray-500">more detailed feedback</p>
        </div>
      </section>

      {/* ─── WORKFLOW ─── */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto bg-gray-100 rounded-2xl p-10 relative overflow-hidden">

          {/* Background image (optional) */}
          <div className="absolute inset-0 opacity-30 bg-[url('/your-image.jpg')] bg-cover bg-center" />

          {/* Content */}
          <div className="relative z-10">

            {/* TOP LINE */}
            <div className="relative mb-12">
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-400 -translate-y-1/2" />

              <div className="grid grid-cols-4 relative">
                {[1, 2, 3, 4].map((num) => (
                  <div key={num} className="flex justify-center">
                    <div className="w-10 h-10 rounded-full border-2 border-gray-700 bg-white flex items-center justify-center font-semibold">
                      {num}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* STEPS CONTENT */}
            <div className="grid md:grid-cols-4 gap-8 text-center">

              <Step
                title="Upload Assignments"
                desc="Drag and drop student work in any format, including handwritten scans, PDFs, Word docs, or images."
              />
              <Step
                title="Set your Rubric"
                desc="Define your grading criteria once and reuse across submissions."
              />
              <Step
                title="AI grades & suggests"
                desc="Automatically generate consistent, rubric-aligned feedback."
              />
              <Step
                title="Review & Approve"
                desc="Edit, refine, and approve before sharing with students."
              />

            </div>

          </div>
        </div>
      </section>

      {/* ─── PROBLEM SECTION ─── */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">

          {/* TOP CARDS */}
          <div className="grid md:grid-cols-4 gap-6 mb-6">

            <StatCard
              title="5.7"
              suffix="hrs/wk"
              subtitle="Grading Workload"
              desc="Teachers spend about 5.7 hours a week on marking, above the OECD average."
              source="OECD, AITSL"
            />

            <StatCard
              title="50"
              suffix="%"
              subtitle="Stress from grading"
              desc="Up to half of teachers say too much marking drives stress."
              source="acer.org"
            />

            <StatCard
              title="Bias"
              suffix="Risk"
              subtitle="Bias, inconsistency & feedback quality"
              desc="Human grading can be inconsistent and subjective."
              source="OECD, AITSL"
            />

            <StatCard
              title="46.4"
              suffix="hrs/wk"
              subtitle="Work beyond standard hours"
              desc="Teachers often work nights and weekends."
              source="OECD, AITSL"
              // highlight
            />

          </div>

          {/* BOTTOM STRIP */}
          <div className="bg-gray-200 rounded-2xl py-10 px-6 grid md:grid-cols-3 text-center gap-6">

            <SummaryItem
              title="10+ hrs"
              desc="10+ hours on marking is common for secondary teachers"
            />

            <SummaryItem
              title="1 in 4"
              desc="Secondary teachers report 10+ hours of marking weekly"
            />

            <SummaryItem
              title="After-hours"
              desc="Grading and paperwork spill into personal time"
            />

          </div>

        </div>
      </section>

      {/* ─── TIME SAVED SECTION ─── */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">

          <h2 className="text-3xl font-black mb-3">
            Time saved, life reclaimed
          </h2>
          <p className="text-gray-600 mb-12">
            See how AutoGrade transforms hours of marking into minutes.
          </p>

          <div className="grid md:grid-cols-2 gap-8">

            {/* LEFT CARD */}
            <FeatureCard title="Average time per assignment batch">
              {/* TOP */}
              <p className="text-sm text-gray-500 mb-6">
                Class of 30 students, essay assignment
              </p>

              {/* MIDDLE (takes remaining space) */}
              <div className="flex flex-col gap-6 flex-1 justify-center">
                <ProgressBar label="Manual" value={90} rightText="10 hrs" />
                <ProgressBar label="AutoGrade" value={15} rightText="1.5 hrs" />
              </div>

              {/* BOTTOM */}
              <p className="mt-6 text-sm text-gray-600 text-center">
                Save up to <span className="font-bold text-lg">85%</span> of your marking time
              </p>
          </FeatureCard>

            {/* RIGHT CARD */}
            <FeatureCard title="Minutes per task comparison">
              <p className="text-sm text-gray-500 mb-6">
                Traditional vs AutoGrade assisted
              </p>

              <ProgressBar label="Essay Marking" value={85} subValue={15} rightText="45 min → 8 min" />
              <ProgressBar label="Q&A Grading" value={70} subValue={10} rightText="30 min → 5 min" />
              <ProgressBar label="Report Review" value={80} subValue={14} rightText="40 min → 7 min" />
              <ProgressBar label="Report Writing" value={60} subValue={12} rightText="25 min → 4 min" />

              <div className="flex gap-4 mt-6 text-xs text-gray-500 justify-center">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full" />
                  Traditional
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-800 rounded-full" />
                  With AutoGrade
                </span>
              </div>
            </FeatureCard>

          </div>
        </div>
      </section>

      {/* ─── TESTIMONIAL SECTION ─── */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto relative rounded-3xl overflow-hidden">

          {/* Background Overlay */}
          <div className="absolute inset-0 bg-[#2E3B55]" />

          {/* Content */}
          <div className="relative z-10 px-10 py-12 text-white">

            <div className="grid md:grid-cols-3 divide-x divide-white/20">

              <Testimonial title="Save up to 85% of grading time" />

              <Testimonial title="Generate consistent, rubric-aligned feedback" />

              <Testimonial title="Handle large classes with ease" />

            </div>

          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto bg-gray-900 text-white rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold">
              Reclaim your time. Revolutionise your classroom.
            </h3>
          </div>

          <button className="bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold">
            Start free trial
          </button>
        </div>
      </section>

      {/* ─── CONTROL SECTION ─── */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center">

        {/* LEFT */}
        <div className="bg-gray-100 h-[300px] rounded-xl" />

        {/* RIGHT */}
        <div className="text-right">
          <h2 className="text-3xl font-black mb-6">
            You stay in control, always
          </h2>

          <ul className="space-y-4 text-gray-600">
            <li>✔ Review AI suggestions before finalising</li>
            <li>✔ Customise feedback tone</li>
            <li>✔ Apply professional judgement</li>
            <li>✔ Full transparency with students</li>
          </ul>

          <br></br>

          <div className="flex gap-4 mt-6 justify-center">
            <button className="bg-gray-900 text-white px-6 py-3 rounded-xl">
              Try AutoGrade Free
            </button>
            <button className="border px-6 py-3 rounded-xl">
              View Demo
            </button>
          </div>
        </div>

      </section>

      {/* ─── FAQ ─── */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold mb-6 text-center">FAQ</h2>

        <div className="space-y-4">
          {[
            {
              q: "How does AutoGrade handle handwritten assignments?",
              a: "AutoGrade uses advanced OCR technology trained on handwritten text. Scan or photograph work and the AI digitises and analyses it against your rubric.",
            },
            {
              q: "Can I customise the grading rubric?",
              a: "Absolutely! You control the rubric criteria. Create from scratch, modify templates, or import your school standards.",
            },
            {
              q: "What if I disagree with the AI?",
              a: "You are always in control. Every AI-generated grade and feedback item is a suggestion you can revise or override.",
            },
            {
              q: "How much time can I save?",
              a: "Australian educators using AutoGrade save an average of 7+ hours per week on marking tasks, turning 10-hour workloads into under 2 hours.",
            },
          ].map((item, i) => (
            <FAQItem key={i} question={item.q} answer={item.a} />
          ))}
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-gray-900 text-white py-16 text-center">
        <p className="opacity-80">© 2025 EdGenAI</p>
      </footer>

    </div>
  );
}

function FeatureCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col">
      <h3 className="font-semibold text-lg mb-4">{title}</h3>
      <div className="flex flex-col flex-1">
        {children}
      </div>
    </div>
  );
}

function ProgressBar({
  label,
  value,
  subValue,
  rightText,
}: {
  label: string;
  value: number;     // main bar (traditional)
  subValue?: number; // darker overlay (AI)
  rightText?: string;
}) {
  return (
    <div className="mb-5">

      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="text-gray-500">{rightText}</span>
      </div>

      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">

        {/* Traditional */}
        <div
          className="h-full bg-gray-300 rounded-full"
          style={{ width: `${value}%` }}
        />

        {/* AutoGrade overlay */}
        {subValue !== undefined && (
          <div
            className="absolute top-0 left-0 h-full bg-gray-800 rounded-full"
            style={{ width: `${subValue}%` }}
          />
        )}
      </div>

    </div>
  );
}

function Step({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">
        {desc}
      </p>
    </div>
  );
}

function SummaryItem({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div>
      <p className="text-3xl font-bold mb-2">{title}</p>
      <p className="text-sm text-gray-700">{desc}</p>
    </div>
  );
}

function StatCard({
  title,
  suffix,
  subtitle,
  desc,
  source,
  highlight = false,
}: {
  title: string;
  suffix?: string;
  subtitle: string;
  desc: string;
  source: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`
        rounded-2xl p-6 shadow-sm border transition transform hover:-translate-y-1
        ${highlight
          ? "bg-gray-800 text-white border-gray-800"
          : "bg-gray-100 text-gray-900 border-gray-200"}
      `}
    >
      {/* TOP */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-bold">{title}</span>
        {suffix && (
          <span className="text-sm font-semibold opacity-80">{suffix}</span>
        )}
      </div>

      {/* SUBTITLE */}
      <p className="font-semibold mb-2">{subtitle}</p>

      {/* DESC */}
      <p className="text-sm opacity-80 mb-6">{desc}</p>

      {/* SOURCE */}
      <p className="text-xs opacity-60">Source: {source}</p>
    </div>
  );
}

function Testimonial({ title }: { title: string }) {
  return (
    <div className="px-6 flex flex-col justify-center text-center md:text-left">

      <p className="font-semibold mb-4">{title}</p>

      <p className="text-sm italic opacity-90">
        “AutoGrade reduced my grading time from 8 hours to under 2.”
      </p>

      <p className="text-sm mt-2 opacity-80">– John Doe</p>
    </div>
  );
}

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-gray-900 text-white rounded-lg overflow-hidden">
      
      {/* Question */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center p-4 text-left font-medium"
      >
        {question}
        <span className="text-xl">{open ? "−" : "+"}</span>
      </button>

      {/* Answer */}
      <div
        className={`px-4 pb-4 text-sm text-gray-300 transition-all duration-300 ${
          open ? "block" : "hidden"
        }`}
      >
        {answer}
      </div>
    </div>
  );
}