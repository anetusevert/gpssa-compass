"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import {
  ENGAGEMENT_FIRST_KEY,
  ENGAGEMENT_PHASES,
  getPhase,
  type EngagementPhaseId,
} from "@/lib/engagement/playbook";
import { useEngagementStore } from "@/lib/engagement/store";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Slim conductor strip — paints the spine; one row, no prose. */
export function EngagementConductor() {
  const router = useRouter();
  const open = useEngagementStore((s) => s.engagementOpen);
  const phaseId = useEngagementStore((s) => s.phaseId);
  const setPhaseId = useEngagementStore((s) => s.setPhaseId);
  const setOpen = useEngagementStore((s) => s.setEngagementOpen);
  const setNavMode = useEngagementStore((s) => s.setNavMode);

  if (!open) return null;

  const phase = getPhase(phaseId);
  const first = phase.screens[0];
  const activeIdx = ENGAGEMENT_PHASES.findIndex((p) => p.id === phaseId);

  function selectPhase(id: EngagementPhaseId) {
    setPhaseId(id);
    setNavMode("focus");
  }

  function start() {
    if (!first) return;
    setNavMode("focus");
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ENGAGEMENT_FIRST_KEY, "seen");
    }
    if (first.href === "/dashboard") {
      setOpen(false);
      return;
    }
    router.push(first.href);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="flex shrink-0 items-center gap-3 rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2"
      data-tour="compass-engagement-spine"
      data-tour-panel="compass-engagement-panel"
    >
      <span
        className="shrink-0 text-[9px] font-semibold uppercase tracking-[0.2em]"
        style={{ color: phase.accent }}
      >
        {phase.weeks}
      </span>

      <div className="flex min-w-0 flex-1 items-center gap-1">
        {ENGAGEMENT_PHASES.map((p, i) => {
          const active = p.id === phaseId;
          const done = activeIdx > i;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => selectPhase(p.id)}
              className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-1.5 py-1 transition ${
                active ? "bg-white/[0.07]" : "hover:bg-white/[0.04]"
              }`}
              title={p.summary}
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full transition ${
                  active
                    ? "bg-[var(--gpssa-green)] shadow-[0_0_10px_rgba(0,168,107,0.6)]"
                    : done
                      ? "bg-[var(--gpssa-green)]/40"
                      : "bg-white/15"
                }`}
              />
              <span
                className={`truncate text-[9px] font-semibold uppercase tracking-[0.12em] ${
                  active ? "text-cream" : "text-white/35"
                }`}
              >
                {p.label}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={start}
        className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[var(--gpssa-green)] px-2.5 py-1.5 text-[11px] font-semibold text-[#071322] transition hover:brightness-110"
      >
        {first?.label}
        <ArrowRight size={11} />
      </button>
    </motion.div>
  );
}
