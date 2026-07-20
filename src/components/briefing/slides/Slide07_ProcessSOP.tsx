"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { SlideLayout } from "./SlideLayout";
import type { BriefingSnapshot } from "@/lib/briefing/types";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Slide07_ProcessSOP({ snapshot }: { snapshot: BriefingSnapshot }) {
  const steps = snapshot.spine.sopStepCount;

  return (
    <SlideLayout
      eyebrow="Process & SOP"
      title="How the journey is run."
      subtitle="Agentic draft → amend → apply. The SOP realises the journey stages."
    >
      <div className="flex h-full flex-col items-center justify-center gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="flex max-w-md flex-col items-center rounded-2xl border border-[var(--gpssa-green)]/30 bg-[var(--gpssa-green)]/10 px-10 py-8 text-center"
        >
          <Sparkles size={22} className="text-[var(--gpssa-green)]" />
          <p className="mt-3 font-playfair text-5xl font-bold text-cream tabular-nums">
            {steps || "—"}
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/40">
            SOP steps on gold path
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3">
          {["Draft with AI", "Amend inline", "Apply to service", "QA checkpoints"].map(
            (label, i) => (
              <motion.span
                key={label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[11px] text-cream"
              >
                {label}
              </motion.span>
            )
          )}
        </div>
      </div>
    </SlideLayout>
  );
}
