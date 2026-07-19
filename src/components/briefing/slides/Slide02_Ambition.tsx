"use client";

import { motion } from "framer-motion";
import { Map, ShieldCheck, Sparkles } from "lucide-react";
import { SlideLayout } from "./SlideLayout";

const EASE = [0.16, 1, 0.3, 1] as const;

const WORKSTREAMS = [
  {
    numeral: "A",
    title: "Product & Service Roadmap",
    line: "Diagnose the portfolio, prioritise opportunities, and sequence a 12-month dual-workstream plan.",
    icon: Map,
    accent: "#C5A572",
    proofs: ["Atlas & peers", "Catalogue gaps", "Backlog → roadmap"],
  },
  {
    numeral: "B",
    title: "Operational Excellence",
    line: "Assure quality, fulfil on time, measure benefits — with governance that sticks.",
    icon: ShieldCheck,
    accent: "#00A86B",
    proofs: ["COPC QA", "SLA & breach", "KPI · VoC · CoE"],
  },
];

export function Slide02_Ambition() {
  return (
    <SlideLayout
      eyebrow="The ambition"
      title="Deliver social security at global-benchmark quality."
      subtitle="One ask. Two workstreams. One operating system — Compass — that GPSSA leadership can run tomorrow."
    >
      <div className="flex h-full flex-col">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-6 flex items-center justify-center gap-2 text-center"
        >
          <Sparkles size={13} className="text-[#33C490]/80" />
          <p className="text-[12px] uppercase tracking-[0.22em] text-white/50">
            RFP #GPSSA-016-2026 · Strategy and operations in one console
          </p>
        </motion.div>

        <div className="mx-auto grid w-full max-w-4xl flex-1 grid-cols-1 gap-5 md:grid-cols-2">
          {WORKSTREAMS.map((ws, i) => {
            const Icon = ws.icon;
            return (
              <motion.div
                key={ws.numeral}
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.65, ease: EASE, delay: 0.15 + i * 0.15 }}
                className="relative flex flex-col overflow-hidden rounded-2xl px-6 py-7"
                style={{
                  background:
                    "linear-gradient(160deg, rgba(17,34,64,0.85), rgba(7,17,34,0.95))",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: `0 24px 60px rgba(0,0,0,0.35), 0 0 60px ${ws.accent}22`,
                }}
              >
                <motion.div
                  className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${ws.accent}33 0%, transparent 70%)`,
                  }}
                  animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="relative z-10 mb-4 flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{
                      background: `linear-gradient(135deg, ${ws.accent}33, ${ws.accent}11)`,
                    }}
                  >
                    <Icon size={20} style={{ color: ws.accent }} strokeWidth={1.5} />
                  </div>
                  <span
                    className="font-playfair text-3xl font-bold"
                    style={{ color: ws.accent }}
                  >
                    {ws.numeral}
                  </span>
                </div>
                <h3 className="relative z-10 font-playfair text-xl font-bold text-cream">
                  {ws.title}
                </h3>
                <p className="relative z-10 mt-2 text-sm leading-relaxed text-white/50">
                  {ws.line}
                </p>
                <div className="relative z-10 mt-5 flex flex-wrap gap-2">
                  {ws.proofs.map((p, j) => (
                    <motion.span
                      key={p}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.45 + i * 0.1 + j * 0.08, ease: EASE }}
                      className="rounded-lg bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/45"
                    >
                      {p}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="mt-5 text-center text-[11px] uppercase tracking-[0.24em] text-white/30"
        >
          ~3 minutes · space to pause · arrows to navigate
        </motion.p>
      </div>
    </SlideLayout>
  );
}
