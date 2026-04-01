"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const sections = [
  { id: "contact-overview", label: "How to Contact Us" },
  { id: "why-reach-out", label: "Why Reach Out to EdGenAI" },
  { id: "support-options", label: "Support & Enquiry Options" },
  { id: "what-we-help-with", label: "What We Can Help With" },
  { id: "before-you-contact", label: "Before You Contact Us" },
  { id: "next-step", label: "Ready to Start?" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

function SectionCard({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      id={id}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="scroll-mt-24 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] md:p-8"
    >
      <h2 className="text-[28px] font-semibold leading-tight tracking-[-0.02em] text-slate-900">
        {title}
      </h2>
      <div className="mt-4 text-[15px] leading-8 text-slate-600">{children}</div>
    </motion.section>
  );
}

function InfoBox({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="rounded-[24px] border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-5 shadow-[0_6px_24px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(15,23,42,0.08)]"
    >
      <h3 className="text-[18px] font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-[15px] leading-7 text-slate-600">{desc}</p>
    </motion.div>
  );
}

export default function ContactPage() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#f3f7fb_38%,#f8fafc_100%)] px-4 py-8 md:px-6 md:py-10 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-6">
            <motion.section
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="overflow-hidden rounded-[32px] border border-sky-100 bg-white shadow-[0_18px_50px_rgba(14,30,57,0.06)]"
            >
              <div className="border-b border-slate-100 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_35%),linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-6 py-8 md:px-10 md:py-10">
                <div className="text-sm font-medium text-sky-700/80">
                  EdGenAI Support / General Enquiries / Getting in Touch
                </div>

                <div className="mt-6 max-w-3xl">
                  <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-slate-950 md:text-5xl">
                    How to contact
                    <span className="block text-sky-700">EdGenAI</span>
                  </h1>

                  <p className="mt-5 max-w-2xl text-[16px] leading-8 text-slate-600">
                    We support institutions, educators, and teams who want to
                    adopt AI in a practical, responsible, and high-impact way.
                    Whether you want to explore AutoGrade, discuss consultancy,
                    or ask about training, governance, course design, or
                    assessment workflows, this page gives you a clear place to
                    start.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <div className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-800">
                      AutoGrade
                    </div>
                    <div className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-800">
                      Consultancy
                    </div>
                    <div className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-800">
                      Training
                    </div>
                    <div className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-800">
                      Governance
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white px-6 py-6 md:px-10">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Best for
                  </p>
                  <p className="mt-2 text-[15px] leading-8 text-slate-600">
                    Product enquiries, demos, AI adoption planning,
                    rubric-aligned assessment support, professional development,
                    security and governance discussions, and partnership
                    conversations.
                  </p>
                </div>
              </div>
            </motion.section>

            <SectionCard id="contact-overview" title="How to Contact Us">
              <p>
                If you are interested in AI-powered assessment, business
                automation, staff capability uplift, secure implementation, or
                responsible AI adoption, the best approach is to send a clear
                enquiry explaining your goals, your context, and the challenge
                you are trying to solve.
              </p>

              <div className="mt-6 space-y-4">
                <InfoBox
                  title="1. General Enquiries"
                  desc="Use this for questions about EdGenAI, service fit, implementation pathways, partnerships, or where to begin."
                />
                <InfoBox
                  title="2. Product Enquiries"
                  desc="Reach out if you want to learn more about AutoGrade, rubric-aligned feedback, grading workflows, and how human oversight remains central."
                />
                <InfoBox
                  title="3. Consultancy Discussions"
                  desc="Contact us if your institution needs support with AI strategy, governance, assessment redesign, staff development, or long-term implementation planning."
                />
              </div>
            </SectionCard>

            <SectionCard id="why-reach-out" title="Why Reach Out to EdGenAI">
              <p>
                EdGenAI helps organisations adopt AI with more clarity,
                confidence, and practical value. Our work spans both product and
                consultancy, from AI-assisted grading and workflow improvement
                through to policy alignment, staff training, and implementation
                support.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoBox
                  title="Practical AI adoption"
                  desc="Move beyond experimentation and into workflows that are useful, sustainable, and aligned with your goals."
                />
                <InfoBox
                  title="Assessment support"
                  desc="Improve grading consistency, save educator time, and keep decision-making transparent and accountable."
                />
                <InfoBox
                  title="Capability building"
                  desc="Upskill staff and teams with training that focuses on real-world usage rather than abstract theory."
                />
                <InfoBox
                  title="Responsible implementation"
                  desc="Address governance, privacy, safety, and institutional confidence while planning your rollout."
                />
              </div>
            </SectionCard>

            <SectionCard id="support-options" title="Support & Enquiry Options">
              <p>
                To make the process easier, choose the enquiry type that best
                matches your current need.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoBox
                  title="AutoGrade Demo"
                  desc="For educators or institutions exploring faster marking, AI-assisted grading, and clearer rubric-aligned feedback workflows."
                />
                <InfoBox
                  title="AI Consultancy"
                  desc="For teams needing guidance around AI planning, implementation strategy, workflow redesign, or scaling adoption."
                />
                <InfoBox
                  title="Training & Professional Development"
                  desc="For organisations seeking workshops, capability building, or practical GenAI education for staff and leadership."
                />
                <InfoBox
                  title="Security & Governance"
                  desc="For conversations related to privacy, responsible AI, risk management, and secure deployment in real environments."
                />
              </div>
            </SectionCard>

            <SectionCard id="what-we-help-with" title="What We Can Help With">
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  "AI-powered grading and educator workflow support",
                  "Business automation for internal teams",
                  "Professional development and AI readiness",
                  "Security, privacy, and governance planning",
                  "Course design and AI-enhanced learning experiences",
                  "Assessment design with academic integrity in mind",
                  "Strategic advisory for long-term AI adoption",
                  "Implementation support for education and operations",
                ].map((item) => (
                  <motion.div
                    key={item}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.42, ease: "easeOut" }}
                    className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4 text-[15px] leading-7 text-slate-700"
                  >
                    {item}
                  </motion.div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              id="before-you-contact"
              title="Before You Contact Us"
            >
              <p>
                To help us understand your enquiry quickly, include a short
                summary of your organisation, your current challenge, and the
                outcome you are aiming for. This makes it easier to guide you
                toward the right product conversation, consultancy discussion,
                or next step.
              </p>

              <div className="mt-6 rounded-[24px] border border-sky-100 bg-[linear-gradient(180deg,#f0f9ff_0%,#ffffff_100%)] p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-sky-700">
                  Helpful details to include
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {[
                    "Your institution, school, or team type",
                    "Whether your enquiry is product or consultancy related",
                    "Your current pain points or goals",
                    "The scale or timeline you are working with",
                    "Whether you want a demo, advice, or discovery call",
                    "Any policy, governance, or assessment constraints",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-[18px] border border-sky-100 bg-white px-4 py-3 text-[15px] leading-7 text-slate-700"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>

            <motion.section
              id="next-step"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.18 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.06)]"
            >
              <div className="bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.14),_transparent_28%),linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-6 py-8 md:px-8 md:py-10">
                <h2 className="text-[32px] font-semibold leading-tight tracking-[-0.03em] text-slate-950 md:text-[40px]">
                  Ready to start the conversation?
                </h2>
                <p className="mt-4 max-w-2xl text-[16px] leading-8 text-slate-600">
                  Whether you are exploring AutoGrade, planning AI adoption, or
                  trying to implement safer and more effective workflows, we can
                  help you take the next step with more confidence.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    type="button"
                    className="rounded-full border border-sky-700 bg-sky-700 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(3,105,161,0.18)] transition-colors duration-300 hover:bg-white hover:text-sky-700"
                  >
                    Contact EdGenAI
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDemoOpen(true)}
                    className="rounded-full border border-sky-700 bg-white px-6 py-3 text-sm font-semibold text-sky-700 transition-colors duration-300 hover:bg-sky-700 hover:text-white"
                  >
                    Book a Demo
                  </button>
                </div>
              </div>
            </motion.section>
          </div>

          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="hidden lg:block"
          >
            <div className="sticky top-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
              <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-slate-900">
                In this page
              </h2>

              <nav className="mt-5">
                <ul className="space-y-3">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-sky-50 hover:text-sky-700"
                      >
                        {section.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Related areas
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    "AutoGrade",
                    "Consultancy",
                    "Training",
                    "Governance",
                    "Assessment Design",
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>

      <AnimatePresence>
        {isDemoOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-8 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDemoOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
            >
              <div className="bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.14),_transparent_28%),linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-6 py-6 md:px-8">
                <button
                  type="button"
                  onClick={() => setIsDemoOpen(false)}
                  className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-500 transition-colors hover:border-sky-200 hover:text-sky-700"
                >
                  ×
                </button>

                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-700">
                  Book a demo
                </p>

                <h3 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950 md:text-4xl">
                  Let&apos;s learn more about your needs
                </h3>

                <p className="mt-3 max-w-2xl text-[15px] leading-7 text-slate-600">
                  Tell us a little about your organisation and what you want to
                  explore. This helps us prepare the right conversation for your
                  demo.
                </p>
              </div>

              <div className="px-6 py-6 md:px-8 md:py-8">
                <form className="space-y-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-800">
                        Full name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-800">
                        Work email
                      </label>
                      <input
                        type="email"
                        placeholder="Enter your work email"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-800">
                        Organisation
                      </label>
                      <input
                        type="text"
                        placeholder="Your organisation or institution"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-800">
                        Role
                      </label>
                      <input
                        type="text"
                        placeholder="Your role"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">
                      What are you interested in?
                    </label>
                    <select className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100">
                      <option>AutoGrade demo</option>
                      <option>AI consultancy</option>
                      <option>Training & professional development</option>
                      <option>Security & governance</option>
                      <option>Assessment design</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">
                      Tell us more
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Briefly describe your goals, challenges, or what you would like to see in the demo"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    />
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="submit"
                      className="rounded-full border border-sky-700 bg-sky-700 px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-white hover:text-sky-700"
                    >
                      Submit request
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsDemoOpen(false)}
                      className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors duration-300 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}