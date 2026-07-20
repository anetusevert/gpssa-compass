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
import { PHASE_SPINE_EMPHASIS } from "@/lib/spine/conductor";
import { useEngagementStore } from "@/lib/engagement/store";

const EASE = [0.16, 1, 0.3, 1] as const;

const NODE_SHORT: Record<string, string> = {
  episode: "Episode",
  journey: "Journey",
  process: "Process",
  systems: "Systems",
  qa: "QA",
};

/** Slim conductor strip — paints the spine; does not replace it. */
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
  const emphasis = PHASE_SPINE_EMPHASIS[phaseId];

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
      className="shrink-0 rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2.5"
      data-tour="compass-engagement-spine"
      data-tour-panel="compass-engagement-panel"
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--gpssa-green)]">
            Project conductor · {phase.weeks}
          </p>
          <p className="truncate text-[12px] text-white/50">
            Emphasises{" "}
            <span className="text-cream">
              {emphasis.map((n) => NODE_SHORT[n]).join(" · ")}
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={start}
          className="inline-flex items-center gap-1 rounded-lg bg-[var(--gpssa-green)] px-2.5 py-1.5 text-[11px] font-semibold text-[#071322]"
        >
          Start: {first?.label}
          <ArrowRight size={12} />
        </button>
      </div>

      <div className="relative flex justify-between gap-1">
        <div className="absolute left-[6%] right-[6%] top-[14px] h-px bg-white/10" />
        {ENGAGEMENT_PHASES.map((p, i) => {
          const active = p.id === phaseId;
          const done = ENGAGEMENT_PHASES.findIndex((x) => x.id === phaseId) > i;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => selectPhase(p.id)}
              className="relative z-[1] flex min-w-0 flex-1 flex-col items-center gap-1"
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold transition ${
                  active
                    ? "bg-[var(--gpssa-green)] text-[#071322] shadow-[0_0_20px_rgba(0,168,107,0.4)]"
                    : done
                      ? "bg-[var(--gpssa-green)]/25 text-[#9DE5C2]"
                      : "bg-white/[0.05] text-white/35 ring-1 ring-white/10"
                }`}
              >
                {i + 1}
              </span>
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

      <p className="mt-2 line-clamp-2 text-[11px] text-white/40">
        <span className="text-white/55">How · </span>
        {phase.how}
      </p>
    </motion.div>
  );
}
