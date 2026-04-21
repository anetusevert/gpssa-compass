"use client";

import { motion } from "framer-motion";
import { Database, Globe2, Map, Compass, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SlideLayout } from "./SlideLayout";

const EASE = [0.16, 1, 0.3, 1] as const;

interface Chapter {
  numeral: string;
  name: string;
  header: string;
  preview: string;
  soWhat: string;
  Icon: LucideIcon;
  accent: string;
}

const CHAPTERS: Chapter[] = [
  {
    numeral: "I",
    name: "Foundation",
    header: "If it's a number, it has a citation.",
    preview: "5 pillars · 1,000+ data points · every source linked.",
    soWhat: "Trust the numbers.",
    Icon: Database,
    accent: "#1B7A4A",
  },
  {
    numeral: "II",
    name: "UAE today",
    header: "The system, the mandate, the people behind every benefit.",
    preview: "6 branches · 4 coverage classes · 10 personas, 10 journeys.",
    soWhat: "Know what we're really asking of.",
    Icon: Map,
    accent: "#4899FF",
  },
  {
    numeral: "III",
    name: "Compare",
    header: "Where the UAE actually plays — by country, by peer, by dimension.",
    preview: "Atlas · benchmarks · quadrant · peer institutions · channels.",
    soWhat: "Set the bar globally.",
    Icon: Globe2,
    accent: "#E7B02E",
  },
  {
    numeral: "IV",
    name: "Decide",
    header: "From insight to a sequenced 12-month plan.",
    preview: "Decision walkthrough · roadmap · Q1–Q4 sequencing.",
    soWhat: "Move.",
    Icon: Compass,
    accent: "#CA63D5",
  },
];

interface Slide02Props {
  total: number;
}

export function Slide02_Outline({ total }: Slide02Props) {
  return (
    <SlideLayout
      eyebrow="Outline"
      title="From evidence to decision."
      subtitle="How this deck moves GPSSA from informed to ready."
    >
      <div className="flex h-full flex-col">
        {/* North star */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mx-auto mb-6 flex max-w-3xl items-center justify-center gap-3 text-center"
        >
          <Sparkles size={13} className="shrink-0 text-[#33C490]/80" />
          <p className="text-[12.5px] uppercase tracking-[0.22em] text-white/55">
            GPSSA's ambition · deliver social security at global benchmark quality
          </p>
          <Sparkles size={13} className="shrink-0 text-[#33C490]/80" />
        </motion.div>

        {/* Four chapter cards with connecting arrow */}
        <div className="relative mx-auto w-full max-w-6xl flex-1 min-h-0">
          {/* Animated horizontal connector */}
          <svg
            aria-hidden
            className="pointer-events-none absolute left-[6%] right-[6%] top-[44%] h-px w-[88%]"
            viewBox="0 0 1000 4"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="outline-arrow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1B7A4A" stopOpacity="0" />
                <stop offset="20%" stopColor="#1B7A4A" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#4899FF" stopOpacity="0.45" />
                <stop offset="80%" stopColor="#E7B02E" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#CA63D5" stopOpacity="0" />
              </linearGradient>
            </defs>
            <motion.line
              x1="0"
              y1="2"
              x2="1000"
              y2="2"
              stroke="url(#outline-arrow)"
              strokeWidth="1.4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.1, delay: 1.0, ease: EASE }}
            />
          </svg>

          <div className="relative grid h-full grid-cols-1 gap-4 md:grid-cols-4">
            {CHAPTERS.map((c, i) => {
              const Icon = c.Icon;
              return (
                <motion.div
                  key={c.numeral}
                  initial={{ opacity: 0, y: 24, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.55,
                    delay: 0.4 + i * 0.12,
                    ease: EASE,
                  }}
                  className="glass-panel relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-white/[0.06] p-5"
                  style={{
                    background:
                      "linear-gradient(160deg, rgba(17,34,64,0.62), rgba(7,17,34,0.85))",
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 12px 36px rgba(0,0,0,0.32), 0 0 32px ${c.accent}12`,
                  }}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-50"
                    style={{
                      background: `radial-gradient(circle, ${c.accent}22 0%, transparent 70%)`,
                    }}
                  />
                  <div className="relative z-10 flex items-center justify-between">
                    <div
                      className="font-playfair text-3xl font-bold leading-none"
                      style={{ color: c.accent }}
                    >
                      {c.numeral}
                    </div>
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg"
                      style={{
                        background: `linear-gradient(135deg, ${c.accent}28, ${c.accent}08)`,
                      }}
                    >
                      <Icon size={15} style={{ color: c.accent }} strokeWidth={1.7} />
                    </div>
                  </div>

                  <div className="relative z-10">
                    <div
                      className="text-[10px] uppercase tracking-[0.24em]"
                      style={{ color: c.accent }}
                    >
                      {c.name}
                    </div>
                    <h3 className="mt-1.5 font-playfair text-[15.5px] font-semibold leading-snug text-cream">
                      {c.header}
                    </h3>
                  </div>

                  <div className="relative z-10 mt-1 text-[11px] text-white/55">
                    <div className="text-[9px] uppercase tracking-[0.22em] text-white/40">
                      What you'll see
                    </div>
                    <p className="mt-1 leading-snug">{c.preview}</p>
                  </div>

                  <div
                    className="relative z-10 mt-auto rounded-md px-2.5 py-1.5 text-[11px] font-medium"
                    style={{
                      color: c.accent,
                      background: `linear-gradient(90deg, ${c.accent}18, transparent)`,
                      borderLeft: `2px solid ${c.accent}`,
                    }}
                  >
                    So what for GPSSA · {c.soWhat}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Deliverable promise */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.6, ease: EASE }}
          className="mt-6 flex items-center justify-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.32em] text-white/40"
        >
          <span className="h-px w-12 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          <span>{total} slides · ~7 minutes · one operating picture</span>
          <span className="h-px w-12 bg-gradient-to-l from-transparent via-white/25 to-transparent" />
        </motion.div>
      </div>
    </SlideLayout>
  );
}
