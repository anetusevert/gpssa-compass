"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Compass, X } from "lucide-react";
import {
  ENGAGEMENT_FIRST_KEY,
  ENGAGEMENT_PHASES,
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

function JourneySpine({
  phaseId,
  onSelect,
}: {
  phaseId: EngagementPhaseId;
  onSelect: (id: EngagementPhaseId) => void;
}) {
  const activeIdx = ENGAGEMENT_PHASES.findIndex((p) => p.id === phaseId);
  const progress = activeIdx <= 0 ? 0 : activeIdx / (ENGAGEMENT_PHASES.length - 1);

  return (
    <div className="relative" data-tour="compass-engagement-spine">
      <div className="absolute left-[8%] right-[8%] top-[18px] h-px bg-white/10" />
      <motion.div
        className="absolute left-[8%] top-[18px] h-px origin-left bg-[var(--gpssa-green)]/70"
        style={{ width: "84%" }}
        initial={false}
        animate={{ scaleX: progress }}
        transition={{ duration: 0.45, ease: EASE }}
      />
      <div className="relative flex justify-between gap-1">
        {ENGAGEMENT_PHASES.map((p, i) => {
          const active = p.id === phaseId;
          const done = i < activeIdx;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              className="group flex min-w-0 flex-1 flex-col items-center gap-1.5"
            >
              <span
                className={`relative z-[1] flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-semibold transition ${
                  active
                    ? "scale-110 bg-[var(--gpssa-green)] text-[#071322] shadow-[0_0_24px_rgba(0,168,107,0.35)]"
                    : done
                      ? "bg-[var(--gpssa-green)]/25 text-[#9DE5C2] ring-1 ring-[var(--gpssa-green)]/40"
                      : "bg-white/[0.04] text-white/40 ring-1 ring-white/10 group-hover:text-white/70"
                }`}
              >
                {i + 1}
              </span>
              <span
                className={`truncate text-[10px] font-semibold uppercase tracking-[0.14em] ${
                  active ? "text-cream" : "text-white/40"
                }`}
              >
                {p.label}
              </span>
              <span className="truncate text-[9px] text-white/25">
                {p.weeks}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function EngagementModePanel() {
  const router = useRouter();
  const open = useEngagementStore((s) => s.engagementOpen);
  const phaseId = useEngagementStore((s) => s.phaseId);
  const setPhaseId = useEngagementStore((s) => s.setPhaseId);
  const setOpen = useEngagementStore((s) => s.setEngagementOpen);
  const setNavMode = useEngagementStore((s) => s.setNavMode);
  const phase = getPhase(phaseId);
  const [showCoach, setShowCoach] = useState(false);
  const firstScreen = phase.screens[0];

  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    if (!window.localStorage.getItem(ENGAGEMENT_FIRST_KEY)) {
      setShowCoach(true);
    }
  }, [open]);

  function selectPhase(id: EngagementPhaseId) {
    setPhaseId(id);
    setNavMode("focus");
  }

  function startPhase() {
    if (!firstScreen) return;
    setNavMode("focus");
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ENGAGEMENT_FIRST_KEY, "seen");
      setShowCoach(false);
    }
    if (firstScreen.href === "/dashboard") {
      setOpen(false);
      return;
    }
    router.push(firstScreen.href);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.section
          key="engagement-panel"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="relative z-10 flex min-h-0 flex-1 flex-col"
          data-tour="compass-engagement-panel"
        >
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-0.5 pb-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[var(--gpssa-green)]">
                  RFP GPSSA-016-2026
                </p>
                <h2 className="mt-0.5 font-playfair text-xl font-semibold text-cream sm:text-2xl">
                  {phase.label}
                  <span className="ml-2 text-[13px] font-sans font-normal tracking-normal text-white/35">
                    {phase.weeks} · {phase.rfpRefs}
                  </span>
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.localStorage.setItem(ENGAGEMENT_FIRST_KEY, "seen");
                    setShowCoach(false);
                  }
                  setOpen(false);
                }}
                className="rounded-lg p-1.5 text-white/35 hover:bg-white/[0.06] hover:text-white/70"
                aria-label="Close Engagement Mode"
              >
                <X size={16} />
              </button>
            </div>

            <JourneySpine phaseId={phaseId} onSelect={selectPhase} />

            <AnimatePresence mode="wait">
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="grid gap-3 sm:grid-cols-3"
              >
                {(
                  [
                    { k: "What", v: phase.what },
                    { k: "How", v: phase.how },
                    { k: "Value", v: phase.value },
                  ] as const
                ).map((block) => (
                  <div key={block.k} className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/35">
                      {block.k}
                    </p>
                    <p className="mt-1 text-[12px] leading-relaxed text-cream/85 sm:text-[13px]">
                      {block.v}
                    </p>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>

            <div>
              <button
                type="button"
                onClick={startPhase}
                disabled={!firstScreen}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-semibold text-[#071322] transition active:scale-[0.99] disabled:opacity-40 sm:w-auto"
                style={{
                  background:
                    "linear-gradient(135deg, var(--gpssa-green), color-mix(in srgb, var(--gpssa-green) 70%, #0a2840))",
                  boxShadow: "0 10px 28px rgba(0,168,107,0.28)",
                }}
              >
                Start: {firstScreen?.label ?? "phase"}
                <ArrowRight size={14} />
              </button>
              {showCoach && (
                <p className="mt-2 text-[11px] text-white/40">
                  Work only the screens below. Close Engagement Mode when you want the full command theater.
                </p>
              )}
            </div>

            <div>
              <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/30">
                This phase · {phase.screens.length} screens
              </p>
              <ul className="divide-y divide-white/[0.05]">
                {phase.screens.map((s) => (
                  <li key={s.href}>
                    <Link
                      href={s.href}
                      onClick={() => {
                        setNavMode("focus");
                        if (typeof window !== "undefined") {
                          window.localStorage.setItem(ENGAGEMENT_FIRST_KEY, "seen");
                          setShowCoach(false);
                        }
                      }}
                      className="group flex items-center gap-3 py-2.5 transition hover:bg-white/[0.03]"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[13px] font-medium text-cream group-hover:text-white">
                            {s.label}
                          </span>
                          <span className="truncate text-[10px] uppercase tracking-[0.12em] text-white/25">
                            {s.ownerHint}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-[11px] text-white/40">{s.why}</p>
                      </div>
                      <ArrowRight
                        size={14}
                        className="shrink-0 text-white/20 transition group-hover:translate-x-0.5 group-hover:text-[var(--gpssa-green)]"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
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
