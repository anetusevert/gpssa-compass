"use client";

import { motion } from "framer-motion";
import { Scale, Landmark, ScrollText, Network as NetworkIcon } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

interface MandateHeroProps {
  counts: {
    standards: number;
    requirements: number;
    milestones: number;
    sourcePages: number;
    obligationLinks: number;
  };
}

const TIMELINE_STEPS = [
  { year: 1999, label: "Federal Law No. 7", note: "Pension & Social Security Law" },
  { year: 2000, label: "GPSSA established", note: "FL No. 6 of 1999 in force" },
  { year: 2023, label: "Federal Law No. 57", note: "Modernised primary law" },
  { year: 2026, label: "Today", note: "RFI-02-2026 roadmap" },
] as const;

export function MandateHero({ counts }: MandateHeroProps) {
  return (
    <section className="relative isolate overflow-hidden">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/3 h-[420px] w-[420px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(0,168,107,0.22) 0%, rgba(0,168,107,0.04) 45%, transparent 75%)",
        }}
        animate={{ scale: [1, 1.08, 1], rotate: [0, 6, 0] }}
        transition={{ duration: 16, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 right-10 h-[360px] w-[360px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(45,74,140,0.18) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 18, ease: "easeInOut", repeat: Infinity, delay: 2 }}
      />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-8 pb-16 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="max-w-3xl"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-[10px] uppercase tracking-[0.32em] text-white/55">
            <Scale size={11} className="text-[#00A86B]" strokeWidth={2} />
            GPSSA Legal Mandate
          </div>
          <h1 className="font-playfair text-5xl font-bold leading-[1.05] text-cream sm:text-6xl">
            The mandate that anchors every service,
            <span className="relative ml-2 inline-block text-[#00A86B]">
              product
              <motion.span
                aria-hidden
                className="absolute inset-x-0 -bottom-1 h-[2px] origin-left rounded-full bg-[#00A86B]/70"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.1, ease: EASE, delay: 0.4 }}
              />
            </span>{" "}
            and channel.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65">
            From Federal Law No. 6 of 1999 that established the General Pension
            and Social Security Authority to the modernised Federal Law No. 57
            of 2023, this is the legal foundation we honour, decode and align
            against the RFI&nbsp;-02-2026 product &amp; service development roadmap.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <CountTile icon={ScrollText} label="Statutory instruments" value={counts.standards} accent="#00A86B" />
          <CountTile icon={Landmark} label="Articles & obligations" value={counts.requirements} accent="#7DB9A4" />
          <CountTile icon={NetworkIcon} label="Obligation → app links" value={counts.obligationLinks} accent="#4899FF" />
          <CountTile icon={Scale} label="Source pages indexed" value={counts.sourcePages} accent="#C5A572" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
          className="relative overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.015] px-6 py-8"
        >
          <div className="absolute inset-x-6 top-1/2 -z-10 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-[#00A86B]/40 to-transparent" />
          <div className="grid grid-cols-2 gap-y-8 sm:grid-cols-4">
            {TIMELINE_STEPS.map((step, i) => (
              <motion.div
                key={step.year}
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.5 + i * 0.1 }}
              >
                <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full border border-[#00A86B]/40 bg-[#00A86B]/10 text-[10px] font-semibold text-[#7DB9A4]">
                  {i + 1}
                </div>
                <span className="font-playfair text-2xl font-bold text-cream">{step.year}</span>
                <span className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/55">{step.label}</span>
                <span className="mt-1 max-w-[160px] text-[11px] leading-snug text-white/45">{step.note}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CountTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Scale;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div
      className="glass-panel relative overflow-hidden rounded-xl px-5 py-4"
      style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 12px 32px rgba(0,0,0,0.3), 0 0 36px ${accent}10` }}
    >
      <div
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ background: `linear-gradient(180deg, ${accent}, transparent)` }}
      />
      <div className="flex items-center gap-3">
        <Icon size={16} style={{ color: accent }} strokeWidth={1.7} />
        <span className="text-[10px] uppercase tracking-[0.22em] text-white/50">{label}</span>
      </div>
      <div className="mt-3 font-playfair text-3xl font-bold text-cream">{value.toLocaleString()}</div>
    </div>
  );
}
