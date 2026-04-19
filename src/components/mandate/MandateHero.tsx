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

/**
 * Slim "count strip" used at the top of the Mandate hub page.
 * Designed to occupy ~110-130px of vertical space so the four
 * pillar tiles below can fit a single viewport without scroll.
 */
export function MandateHero({ counts }: MandateHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="relative overflow-hidden rounded-xl border border-white/[0.05] bg-white/[0.012] px-3 py-2.5"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-3 top-1/2 -z-10 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-[var(--gpssa-primary,#1B7A4A)]/35 to-transparent"
      />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <CountTile icon={ScrollText} label="Statutory instruments" value={counts.standards} accent="#1B7A4A" />
        <CountTile icon={Landmark} label="Articles & obligations" value={counts.requirements} accent="#7DB9A4" />
        <CountTile icon={NetworkIcon} label="Obligation → app links" value={counts.obligationLinks} accent="#4899FF" />
        <CountTile icon={Scale} label="Source pages indexed" value={counts.sourcePages} accent="#C5A572" />
      </div>
    </motion.div>
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
      className="glass-panel relative flex items-center gap-3 overflow-hidden rounded-lg px-3 py-2"
      style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 6px 18px rgba(0,0,0,0.28)` }}
    >
      <div
        className="absolute inset-y-0 left-0 w-[2px]"
        style={{ background: `linear-gradient(180deg, ${accent}, transparent)` }}
      />
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
        style={{ background: `linear-gradient(135deg, ${accent}22, ${accent}05)` }}
      >
        <Icon size={14} style={{ color: accent }} strokeWidth={1.7} />
      </div>
      <div className="min-w-0">
        <div className="font-playfair text-xl font-bold leading-none text-cream">
          {value.toLocaleString("en-US")}
        </div>
        <div className="mt-1 truncate text-[9px] uppercase tracking-[0.2em] text-white/45">
          {label}
        </div>
      </div>
    </div>
  );
}
