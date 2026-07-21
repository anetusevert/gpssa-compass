"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import {
  ACT_LABELS,
  ACT_LOCK_REASON,
  ACT_ORDER,
  useConductorStore,
  type ConductorAct,
} from "@/lib/spine/conductor-acts";
import { staggerChildren, tileItem } from "@/lib/motion";

const ACT_ACCENT: Record<ConductorAct, string> = {
  persona: "#00A86B",
  episode: "#00A86B",
  journey: "#3B82C4",
  process: "#C99A3C",
  systemsqa: "#C5A572",
};

export function SpineConductorRail() {
  const reduceMotion = useReducedMotion();
  const statuses = useConductorStore((s) => s.statuses);
  const summaries = useConductorStore((s) => s.summaries);
  const requestAct = useConductorStore((s) => s.requestAct);

  return (
    <motion.div
      variants={staggerChildren}
      initial="hidden"
      animate="show"
      className="flex max-w-full items-stretch gap-1.5 overflow-x-auto px-1 scrollbar-none"
      aria-label="Conduct the spine"
    >
      {ACT_ORDER.map((act, i) => {
        const status = statuses[act];
        const locked = status === "locked";
        const current = status === "current";
        const done = status === "done";
        const accent = ACT_ACCENT[act];
        const summary = summaries[act];
        return (
          <motion.button
            key={act}
            type="button"
            variants={tileItem}
            disabled={locked}
            onClick={() => requestAct(act)}
            whileHover={reduceMotion || locked ? undefined : { y: -3, scale: 1.02 }}
            whileTap={locked ? undefined : { scale: 0.98 }}
            title={locked ? ACT_LOCK_REASON[act] : ACT_LABELS[act].verb}
            className={`relative flex min-w-[118px] max-w-[150px] flex-col items-start gap-0.5 rounded-xl border px-3 py-2 text-left backdrop-blur-md transition ${
              current
                ? "border-[var(--gpssa-green)]/50 bg-[var(--gpssa-green)]/10"
                : done
                  ? "border-white/[0.1] bg-black/35 hover:border-white/25"
                  : locked
                    ? "cursor-not-allowed border-white/[0.05] bg-black/20 opacity-45"
                    : "border-white/[0.08] bg-black/35 hover:border-white/20 hover:bg-white/[0.06]"
            }`}
          >
            <span className="flex w-full items-center gap-1.5">
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8px] font-bold ${
                  done
                    ? "text-[#071322]"
                    : current
                      ? "text-[#071322]"
                      : "bg-white/[0.08] text-white/45"
                }`}
                style={done || current ? { backgroundColor: accent } : undefined}
              >
                {done ? <Check size={9} /> : locked ? <Lock size={8} /> : i + 1}
              </span>
              <span
                className={`truncate text-[11px] font-semibold ${
                  locked ? "text-white/40" : "text-cream"
                }`}
              >
                {ACT_LABELS[act].label}
              </span>
              {current && !reduceMotion && (
                <motion.span
                  className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: accent }}
                  animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.25, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </span>
            <span className="line-clamp-1 w-full pl-[22px] text-[9px] text-white/35">
              {summary || (locked ? ACT_LOCK_REASON[act] : ACT_LABELS[act].verb)}
            </span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
