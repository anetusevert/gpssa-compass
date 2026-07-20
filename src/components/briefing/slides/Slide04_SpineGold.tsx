"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { SlideLayout } from "./SlideLayout";
import type { BriefingSnapshot } from "@/lib/briefing/types";

const EASE = [0.16, 1, 0.3, 1] as const;
const CHAIN = ["episode", "journey", "process", "systems", "qa"] as const;
const LABELS: Record<string, string> = {
  episode: "Episode",
  journey: "Journey",
  process: "Process",
  systems: "Systems",
  qa: "QA",
};

export function Slide04_SpineGold({ snapshot }: { snapshot: BriefingSnapshot }) {
  const spine = snapshot.spine;
  const lit = new Set(spine.litNodes);
  const name = spine.goldServiceName ?? "End of Service — Civil";

  const stats = [
    { label: "Episodes", value: spine.episodeCount },
    { label: "Stages", value: spine.stageCount },
    { label: "SOP steps", value: spine.sopStepCount },
    { label: "Cases", value: spine.openCaseCount },
    { label: "Scorecards", value: spine.scorecardCount },
  ];

  return (
    <SlideLayout
      eyebrow="Gold path proof"
      title={name}
      subtitle="One service lit Episode → QA — the rehearsal spine leadership can walk."
      align="left"
    >
      <div className="flex h-full flex-col justify-center gap-8 px-4">
        <div className="flex items-center gap-2">
          <Star size={14} className="text-amber-300" />
          <span className="text-[11px] uppercase tracking-[0.2em] text-amber-200/80">
            Gold path · {lit.size}/5 nodes lit
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {CHAIN.map((id, i) => {
            const on = lit.has(id);
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.1, ease: EASE }}
                className="flex items-center gap-2"
              >
                <div
                  className={`rounded-full px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] ${
                    on
                      ? "bg-[var(--gpssa-green)]/20 text-[#9DE5C2] ring-1 ring-[var(--gpssa-green)]/40"
                      : "bg-white/[0.04] text-white/30"
                  }`}
                >
                  {LABELS[id]}
                </div>
                {i < CHAIN.length - 1 && (
                  <span className="text-white/20">→</span>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-3"
            >
              <p className="text-[9px] uppercase tracking-[0.16em] text-white/35">{s.label}</p>
              <p className="font-playfair text-2xl font-bold text-cream tabular-nums">
                {s.value}
              </p>
            </motion.div>
          ))}
        </div>

        {(spine.activeEpisodeName || spine.activePersonaName) && (
          <p className="text-sm text-white/45">
            {spine.activeEpisodeName && (
              <>
                Active: <span className="text-cream">{spine.activeEpisodeName}</span>
              </>
            )}
            {spine.activePersonaName && (
              <>
                {" · "}Persona: <span className="text-cream">{spine.activePersonaName}</span>
              </>
            )}
          </p>
        )}
      </div>
    </SlideLayout>
  );
}
