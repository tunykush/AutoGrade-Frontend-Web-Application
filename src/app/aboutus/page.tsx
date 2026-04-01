"use client";

import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Layers3, GraduationCap } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const cardHover = {
  y: -8,
  transition: { duration: 0.3, ease: "easeOut" },
};

export default function WhyEdGenAI() {
  return (
    <main className="relative overflow-hidden bg-[#f7fbff] text-slate-800">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-[-120px] top-[-80px] h-[320px] w-[320px] rounded-full bg-cyan-200/30 blur-3xl" />
        <div className="absolute right-[-100px] top-[180px] h-[300px] w-[300px] rounded-full bg-blue-300/20 blur-3xl" />
        <div className="absolute bottom-[-100px] left-[20%] h-[260px] w-[260px] rounded-full bg-sky-200/30 blur-3xl" />
      </div>

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-16 lg:py-28">
        {/* Hero */}
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/80 px-4 py-2 text-sm font-medium text-cyan-700 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              About EdGenAI
            </div>

            <h1 className="max-w-2xl text-4xl font-bold leading-tight text-slate-900 md:text-5xl lg:text-6xl">
              Building AI for education with{" "}
              <span className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 bg-clip-text text-transparent">
                clarity, trust, and real impact
              </span>
            </h1>

            <p className="max-w-xl text-lg leading-8 text-slate-600">
              At EdGenAI, we believe technology should strengthen teaching, not
              replace it. We create thoughtful AI products that help educators
              work more effectively while preserving authentic learning,
              critical thinking, and human guidance.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-cyan-200 transition duration-300 hover:scale-[1.02] hover:shadow-xl">
                Explore Our Vision
              </button>
              <button className="rounded-full border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition duration-300 hover:border-cyan-300 hover:text-cyan-700">
                Learn How We Work
              </button>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0.15}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-[32px] border border-white/60 bg-white/70 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-cyan-600">EdGenAI</p>
                  <h3 className="text-2xl font-bold text-slate-900">
                    Human-centered AI for learning
                  </h3>
                </div>
                <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-600">
                  <GraduationCap className="h-6 w-6" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Transparency</p>
                  <p className="mt-2 font-semibold text-slate-800">
                    Clear AI outputs and understandable reasoning
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Modularity</p>
                  <p className="mt-2 font-semibold text-slate-800">
                    Flexible tools that adapt to curriculum needs
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Privacy</p>
                  <p className="mt-2 font-semibold text-slate-800">
                    Responsible protection of student and institution data
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Impact</p>
                  <p className="mt-2 font-semibold text-slate-800">
                    Support deeper teaching and meaningful learning outcomes
                  </p>
                </div>
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 rounded-3xl border border-white/70 bg-white/80 px-5 py-4 shadow-lg backdrop-blur"
            >
              <p className="text-sm text-slate-500">Focused on</p>
              <p className="font-bold text-slate-900">Educators + Institutions</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About Cards */}
      <section className="mx-auto max-w-7xl px-6 pb-20 md:px-10 lg:px-16 lg:pb-28">
        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeUp}
            custom={0}
            whileHover={cardHover}
            className="rounded-[28px] border border-white/70 bg-white/80 p-8 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur"
          >
            <div className="mb-5 inline-flex rounded-2xl bg-cyan-50 p-3 text-cyan-600">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="mb-4 text-2xl font-bold text-slate-900">Our Mission</h2>
            <p className="leading-8 text-slate-600">
              Our mission is to transform education by making generative AI
              transparent, equitable, and aligned with authentic learning
              outcomes. We see AI as a tool that amplifies educator expertise,
              helping teachers create richer and more meaningful learning
              experiences.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeUp}
            custom={0.1}
            whileHover={cardHover}
            className="rounded-[28px] border border-white/70 bg-white/80 p-8 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur"
          >
            <div className="mb-5 inline-flex rounded-2xl bg-sky-50 p-3 text-sky-600">
              <Layers3 className="h-6 w-6" />
            </div>
            <h2 className="mb-4 text-2xl font-bold text-slate-900">How We Work</h2>
            <p className="leading-8 text-slate-600">
              We work closely with educators, instructional designers, and
              institutions to co-create practical AI solutions. Every product
              decision is shaped by real academic feedback, tested in authentic
              learning settings, and refined continuously to fit diverse
              teaching environments.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeUp}
            custom={0.2}
            whileHover={cardHover}
            className="rounded-[28px] border border-white/70 bg-white/80 p-8 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur"
          >
            <div className="mb-5 inline-flex rounded-2xl bg-blue-50 p-3 text-blue-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="mb-4 text-2xl font-bold text-slate-900">Our AI Principles</h2>
            <p className="leading-8 text-slate-600">
              Our systems are grounded in transparency, modularity, and privacy.
              We design AI to support critical reasoning, reflection, and
              scalable feedback, while protecting data and preserving the
              integrity of the learning process.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Bottom statement */}
      <section className="mx-auto max-w-6xl px-6 pb-24 md:px-10 lg:px-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          custom={0}
          className="overflow-hidden rounded-[32px] border border-cyan-100 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 p-[1px] shadow-[0_20px_60px_rgba(14,165,233,0.18)]"
        >
          <div className="rounded-[31px] bg-white/95 px-8 py-10 text-center backdrop-blur">
            <p className="mx-auto max-w-3xl text-xl font-medium leading-9 text-slate-700 md:text-2xl">
              We are not building AI to replace educators. We are building AI to
              help education become more transparent, more adaptive, and more
              deeply human.
            </p>
          </div>
        </motion.div>
      </section>
    </main>
  );
}