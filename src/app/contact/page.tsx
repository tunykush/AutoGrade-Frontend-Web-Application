'use client'

// ── Contact destination ────────────────────────────────────────────────────
const CONTACT_EMAIL = 'contactus@edgenai.com.au'
// ──────────────────────────────────────────────────────────────────────────

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import {
  Mail,
  Clock,
  MessageSquare,
  Building2,
  ArrowRight,
} from 'lucide-react'
import { NeatGradient } from '@firecms/neat'
import Navbar from '@/components/ui/Navbar'

const contactCards = [
  {
    icon: Mail,
    title: 'Email us',
    desc: "Send us a message and we'll get back to you promptly.",
    detail: 'contactus@edgenai.com.au',
  },
  {
    icon: Clock,
    title: 'Response time',
    desc: 'We aim to reply to all enquiries within one business day.',
    detail: '< 24 hours',
  },
  {
    icon: Building2,
    title: 'Enterprise & sales',
    desc: 'Need a custom institutional plan or integration support?',
    detail: 'contactus@edgenai.com.au',
  },
]

const topics = [
  'General enquiry',
  'Technical support',
  'Billing & plans',
  'Enterprise / sales',
  'Partnership',
  'Other',
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', topic: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const gradientRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!gradientRef.current) return
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
    })
    const handleScroll = () => { gradient.yOffset = window.scrollY }
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      gradient.destroy()
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent(`[${form.topic}] Message from ${form.name}`)
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nTopic: ${form.topic}\n\n${form.message}`
    )
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
    setSubmitted(true)
  }

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden" style={{ backgroundColor: '#F8F5F0', color: '#23334A' }}>

      {/* ── HERO + CARDS ON GRADIENT ─────────────────────── */}
      <section style={{ position: 'relative', paddingBottom: '80px' }}>

        {/* Animated gradient canvas */}
        <canvas
          ref={gradientRef}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
        />

        {/* Soft, long fade — starts early so the transition is very gradual */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '340px',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(248,245,240,0.15) 30%, rgba(248,245,240,0.45) 55%, rgba(248,245,240,0.78) 75%, rgba(248,245,240,0.95) 90%, #F8F5F0 100%)',
          zIndex: 1,
        }} />

        <Navbar variant="dark" />

        {/* Hero text */}
        <div className="text-center pt-28 pb-14 px-6" style={{ position: 'relative', zIndex: 10 }}>
          <div className="mx-auto max-w-2xl">
            <span
              className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold"
              style={{
                borderColor: 'rgba(199,217,229,0.3)',
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'rgba(199,217,229,0.9)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
              EdGenAI — Support
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-white mb-6">
              Get in Touch
            </h1>
            <p className="text-base md:text-lg mx-auto max-w-xl" style={{ color: 'rgba(199,217,229,0.85)' }}>
              Have a question, a feature request, or need help getting started? We'd love to hear from you.
            </p>
          </div>
        </div>

        {/* Contact cards — solid white, same as original */}
        <div className="relative px-6 pt-8 md:px-8" style={{ zIndex: 10 }}>
          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
            {contactCards.map(({ icon: Icon, title, desc, detail }) => (
              <div
                key={title}
                className="rounded-2xl p-6 shadow-sm"
                style={{
                  backgroundColor: 'white',
                  border: '1px solid rgba(50,75,115,0.1)',
                }}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: '#23334A' }}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <p className="mt-4 text-sm font-bold" style={{ color: '#23334A' }}>{title}</p>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: '#324B73', opacity: 0.7 }}>{desc}</p>
                <p className="mt-3 text-xs font-semibold" style={{ color: '#324B73' }}>{detail}</p>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* ── CONTACT FORM ─────────────────────────────────── */}
      <section className="px-6 pt-28 pb-28 md:px-8" style={{ backgroundColor: '#F8F5F0' }}>
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 md:grid-cols-2 md:items-start">

            {/* left — info */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#324B73' }}>Contact</p>
              <h2 className="text-2xl font-bold md:text-3xl" style={{ color: '#23334A' }}>Send us a message</h2>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: '#324B73', opacity: 0.75 }}>
                Fill in the form and a member of our team will get back to you within one business day. For urgent issues, email us directly.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  'Describe your issue or request in detail',
                  'Include your institution name if applicable',
                  'Attach screenshots via email if needed',
                  'We reply to every message personally',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm" style={{ color: '#23334A' }}>
                    <div
                      className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#C7D9E5' }}
                    >
                      <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                        <path d="M1 4L4 7L10 1" stroke="#23334A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* right — form */}
            <div className="rounded-2xl p-8" style={{ backgroundColor: 'white', border: '1px solid rgba(50,75,115,0.1)' }}>
              {submitted ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: '#23334A' }}>
                    <MessageSquare className="h-7 w-7 text-white" />
                  </div>
                  <p className="mt-5 text-base font-bold" style={{ color: '#23334A' }}>Message sent!</p>
                  <p className="mt-2 text-sm" style={{ color: '#324B73', opacity: 0.75 }}>
                    Thanks for reaching out. We'll reply within one business day.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: '', email: '', topic: '', message: '' }) }}
                    className="mt-8 rounded-full px-6 py-2.5 text-xs font-semibold transition hover:opacity-90"
                    style={{ backgroundColor: '#23334A', color: 'white' }}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold" style={{ color: '#23334A' }}>Full name</label>
                    <input
                      name="name" type="text" required placeholder="Jane Smith"
                      value={form.name} onChange={handleChange}
                      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition"
                      style={{ border: '1px solid rgba(50,75,115,0.2)', backgroundColor: '#F8F5F0', color: '#23334A' }}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold" style={{ color: '#23334A' }}>Email address</label>
                    <input
                      name="email" type="email" required placeholder="jane@university.edu.au"
                      value={form.email} onChange={handleChange}
                      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition"
                      style={{ border: '1px solid rgba(50,75,115,0.2)', backgroundColor: '#F8F5F0', color: '#23334A' }}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold" style={{ color: '#23334A' }}>Topic</label>
                    <select
                      name="topic" required value={form.topic} onChange={handleChange}
                      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition"
                      style={{ border: '1px solid rgba(50,75,115,0.2)', backgroundColor: '#F8F5F0', color: form.topic ? '#23334A' : 'rgba(35,51,74,0.45)' }}
                    >
                      <option value="" disabled>Select a topic</option>
                      {topics.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold" style={{ color: '#23334A' }}>Message</label>
                    <textarea
                      name="message" required rows={5} placeholder="Tell us how we can help…"
                      value={form.message} onChange={handleChange}
                      className="w-full resize-none rounded-xl px-4 py-2.5 text-sm outline-none transition"
                      style={{ border: '1px solid rgba(50,75,115,0.2)', backgroundColor: '#F8F5F0', color: '#23334A' }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-transform duration-300 hover:scale-[1.02]"
                    style={{ backgroundColor: '#324B73' }}
                  >
                    Send message <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="py-12 md:py-16" style={{ backgroundColor: '#23334A' }}>
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-10 items-start">
          <div>
            <p className="text-2xl md:text-3xl font-semibold leading-snug" style={{ color: '#C7D9E5' }}>
              Step into the future<br />of learning with us.
            </p>
          </div>
          <nav className="flex flex-col gap-3">
            {['Home', 'AutoGrade', 'Consultancy', 'About Us'].map((link) => (
              <a key={link} href="#" className="text-sm transition hover:opacity-100" style={{ color: '#C7D9E5', opacity: 0.7 }}>{link}</a>
            ))}
          </nav>
        </div>
        <div
          className="max-w-[1200px] mx-auto px-6 md:px-10 mt-10 pt-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center"
          style={{ borderTop: '1px solid rgba(199,217,229,0.15)' }}
        >
          <div className="flex gap-4 flex-wrap">
            {['Website Privacy', 'Acceptable Use Policy', 'Terms of Use', 'Cookies Settings'].map((item) => (
              <a key={item} href="#" className="text-xs transition hover:opacity-100" style={{ color: '#C7D9E5', opacity: 0.5 }}>{item}</a>
            ))}
          </div>
          <p className="text-xs" style={{ color: '#C7D9E5', opacity: 0.4 }}>© {new Date().getFullYear()} EdGenAI Technologies, Inc. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}