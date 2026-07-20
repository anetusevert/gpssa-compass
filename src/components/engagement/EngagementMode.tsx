"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Compass, X } from "lucide-react";
import {
  ENGAGEMENT_PHASES,
  PLAYBOOK_ONE_LINER,
  PROJECT_JOBS,
  getPhase,
  type EngagementPhaseId,
} from "@/lib/engagement/playbook";
import { useEngagementStore } from "@/lib/engagement/store";

const EASE = [0.16, 1, 0.3, 1] as const;

export function EngagementModeTrigger() {
  const open = useEngagementStore((s) => s.engagementOpen);
  const setOpen = useEngagementStore((s) => s.setEngagementOpen);

  return (
    <motion.button
      type="button"
      data-tour="compass-engagement"
      onClick={() => setOpen(!open)}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] transition-colors ${
        open
          ? "border-[var(--gpssa-green)]/50 bg-[var(--gpssa-green)]/15 text-[#9DE5C2]"
          : "border-white/[0.08] bg-white/[0.04] text-white/45 hover:border-[var(--gpssa-green)]/35 hover:text-white/75"
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Compass size={10} className="text-[var(--gpssa-green)]/90" strokeWidth={2} />
      Engagement Mode
    </motion.button>
  );
}

export function EngagementModePanel() {
  const open = useEngagementStore((s) => s.engagementOpen);
  const phaseId = useEngagementStore((s) => s.phaseId);
  const setPhaseId = useEngagementStore((s) => s.setPhaseId);
  const setOpen = useEngagementStore((s) => s.setEngagementOpen);
  const setNavMode = useEngagementStore((s) => s.setNavMode);
  const phase = getPhase(phaseId);

  function selectPhase(id: EngagementPhaseId) {
    setPhaseId(id);
    setNavMode("focus");
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.section
          key="engagement-panel"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="shrink-0 overflow-hidden"
          data-tour="compass-engagement-panel"
        >
          <div className="rounded-2xl border border-white/[0.08] bg-black/25 px-3 py-3 backdrop-blur-sm sm:px-4">
            <div className="mb-2.5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[var(--gpssa-green)]">
                  RFP GPSSA-016-2026 · Three jobs
                </p>
                <p className="mt-0.5 truncate text-[11px] text-white/45">{PLAYBOOK_ONE_LINER}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {PROJECT_JOBS.map((j) => (
                    <span
                      key={j.id}
                      className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[9px] text-white/55 ring-1 ring-white/10"
                      title={j.blurb}
                    >
                      {j.label}
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-white/35 hover:bg-white/[0.06] hover:text-white/70"
                aria-label="Close Engagement Mode"
              >
                <X size={14} />
              </button>
            </div>

            {/* Phase strip */}
            <div className="mb-3 flex gap-1 overflow-x-auto pb-0.5 scrollbar-none">
              {ENGAGEMENT_PHASES.map((p) => {
                const active = p.id === phaseId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectPhase(p.id)}
                    className={`shrink-0 rounded-xl px-2.5 py-1.5 text-left transition ${
                      active
                        ? "bg-[var(--gpssa-green)]/20 ring-1 ring-[var(--gpssa-green)]/45"
                        : "bg-white/[0.03] ring-1 ring-white/10 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div
                      className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${
                        active ? "text-[#9DE5C2]" : "text-white/55"
                      }`}
                    >
                      {p.label}
                    </div>
                    <div className="text-[9px] text-white/35">
                      {p.weeks} · {p.rfpRefs}
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="mb-2 text-[11px] text-white/50">{phase.summary}</p>

            <ul className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
              {phase.screens.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    onClick={() => setNavMode("focus")}
                    className="group flex h-full flex-col rounded-xl border border-white/[0.06] bg-white/[0.02] px-2.5 py-2 transition hover:border-[var(--gpssa-green)]/35 hover:bg-white/[0.05]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12px] font-medium text-cream">{s.label}</span>
                      <ArrowRight
                        size={12}
                        className="shrink-0 text-white/25 transition group-hover:translate-x-0.5 group-hover:text-[var(--gpssa-green)]"
                      />
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-white/40">{s.why}</p>
                    <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-white/30">
                      Owner · {s.ownerHint}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>

            <details className="mt-3 rounded-lg border border-white/[0.05] bg-white/[0.015] px-2.5 py-2">
              <summary className="cursor-pointer text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
                Walkthrough success check
              </summary>
              <ul className="mt-2 space-y-1 text-[11px] text-white/45">
                <li>First useful screen in under 2 minutes</li>
                <li>Can state the three jobs unprompted</li>
                <li>Sees Gold seed banner on ops modules</li>
                <li>Discover → 3 screens → one logged opportunity (no Atlas/Briefing)</li>
              </ul>
            </details>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

/** Compact always-visible phase strip (when panel closed). */
export function EngagementPhaseStrip() {
  const open = useEngagementStore((s) => s.engagementOpen);
  const phaseId = useEngagementStore((s) => s.phaseId);
  const setPhaseId = useEngagementStore((s) => s.setPhaseId);
  const setOpen = useEngagementStore((s) => s.setEngagementOpen);
  const setNavMode = useEngagementStore((s) => s.setNavMode);

  if (open) return null;

  return (
    <div
      className="flex shrink-0 items-center gap-1.5 overflow-x-auto px-0.5 scrollbar-none"
      data-tour="compass-engagement-strip"
    >
      <span className="shrink-0 text-[9px] uppercase tracking-[0.18em] text-white/30">Phase</span>
      {ENGAGEMENT_PHASES.map((p) => {
        const active = p.id === phaseId;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setPhaseId(p.id);
              setNavMode("focus");
              setOpen(true);
            }}
            className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] transition ${
              active
                ? "bg-[var(--gpssa-green)]/20 text-[#9DE5C2]"
                : "bg-white/[0.03] text-white/40 hover:text-white/65"
            }`}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
