'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">

      {/* ─── NAVBAR ─── */}
      <header className="w-full border-b border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center">

          {/* LEFT SIDE (logo + nav) */}
          <div className="flex items-center gap-10">

            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">AI</span>
              </div>
              <span className="font-bold tracking-tight">edgenAI</span>
            </div>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600 font-medium">
              <Link href="#">Home</Link>
              <Link href="#">AutoGrade</Link>
              <Link href="#">Consultancy</Link>
            </nav>

          </div>

          {/* RIGHT SIDE (login) */}
          <div className="ml-auto">
            <Link
              href="/login"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Login
            </Link>
          </div>

        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-20 bg-gray-50">

        <h1 className="text-4xl md:text-5xl font-black leading-tight max-w-3xl">
          AI & Data Consultancy <br />
          That Delivers Real Outcomes
        </h1>

        <p className="mt-4 text-gray-500 max-w-xl text-sm md:text-base">
          Strategy, implementation, and optimisation – tailored to your institution.
        </p>

        <div className="flex gap-4 mt-8">
          <button className="bg-gray-950 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition">
            Book a Consultation
          </button>

          <button className="border border-gray-300 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-100 transition">
            Explore Our Approach
          </button>
        </div>

      </section>

      {/* ─── LOGOS ─── */}
      <section className="px-6 py-12">
        <div className="max-w-4xl mx-auto bg-gray-50 border border-gray-100 rounded-2xl p-8 text-center">

          <p className="text-sm text-gray-500 mb-6">
            Proudly Working With Australia’s Best
          </p>

          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400 font-semibold">
            <span>University of Melbourne</span>
            <span>RMIT</span>
            <span>Monash</span>
            <span>UNSW</span>
          </div>

        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto text-center">

          <h2 className="text-2xl font-black mb-10">Our Services</h2>

          <div className="grid md:grid-cols-3 gap-6">

            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 bg-gray-100 rounded-2xl border border-gray-200"
              />
            ))}

          </div>

        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="px-6 py-20 bg-gray-50 text-center">

        <h2 className="text-2xl md:text-3xl font-black max-w-2xl mx-auto leading-snug">
          Tell us what you’re exploring <br />
          – we’ll help you shape the right approach.
        </h2>

        <button className="mt-8 bg-gray-950 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition">
          Book a Consultation
        </button>

      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-gradient-to-b from-blue-400 to-blue-800 text-white py-20 text-center">
        <p className="text-lg font-semibold opacity-90">Footer</p>
      </footer>

    </div>
  );
}