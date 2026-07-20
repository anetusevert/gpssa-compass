"use client";

import { motion } from "framer-motion";
import { SlideLayout } from "./SlideLayout";
import type { BriefingSnapshot } from "@/lib/briefing/types";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Slide05_PersonaEpisode({ snapshot }: { snapshot: BriefingSnapshot }) {
  const personaCount = snapshot.delivery.personaCount;
  const episode = snapshot.spine.activeEpisodeName ?? "Member claims end-of-service benefits";
  const persona = snapshot.spine.activePersonaName ?? "Emirati Government Employee";

  return (
    <SlideLayout
      eyebrow="Persona × episode"
      title="Who the work is for."
      subtitle="Every spine starts with a customer life moment bound to a persona."
    >
      <div className="flex h-full flex-col items-center justify-center gap-8">
        <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 text-left"
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Persona</p>
            <p className="mt-2 font-playfair text-2xl font-bold text-cream">{persona}</p>
            <p className="mt-3 text-sm text-white/45">
              {personaCount} personas in the delivery library — linked from research and coverage.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.1 }}
            className="rounded-2xl border border-[var(--gpssa-green)]/30 bg-[var(--gpssa-green)]/10 p-6 text-left"
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--gpssa-green)]">
              Episode
            </p>
            <p className="mt-2 font-playfair text-2xl font-bold text-cream">{episode}</p>
            <p className="mt-3 text-sm text-white/45">
              Lifecycle library covers join → contribute → claim → end of service → survivor.
            </p>
          </motion.div>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="max-w-lg text-center text-sm text-white/40"
        >
          So what: design starts with a real person in a real moment — not an abstract process map.
        </motion.p>
      </div>
    </SlideLayout>
  );
}
