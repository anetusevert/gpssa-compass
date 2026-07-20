"use client";

import { motion } from "framer-motion";
import { SlideLayout } from "./SlideLayout";
import type { BriefingSnapshot } from "@/lib/briefing/types";

const EASE = [0.16, 1, 0.3, 1] as const;

const FALLBACK_STAGES = [
  "Submit claim",
  "Verify entitlement",
  "Calculate benefit",
  "Approve & pay",
  "Notify member",
];

export function Slide06_Journey({ snapshot }: { snapshot: BriefingSnapshot }) {
  const n = snapshot.spine.stageCount || FALLBACK_STAGES.length;
  const stages = FALLBACK_STAGES.slice(0, Math.min(5, Math.max(3, n)));

  return (
    <SlideLayout
      eyebrow="Journey"
      title="Stages from research and persona."
      subtitle="Choose an existing journey or set up a new one — then the process follows."
    >
      <div className="flex h-full flex-col items-center justify-center">
        <div className="flex w-full max-w-4xl flex-wrap items-stretch justify-center gap-2">
          {stages.map((name, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.1, ease: EASE }}
              className="flex min-w-[120px] flex-1 flex-col items-center rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-4"
            >
              <span className="text-[20px] font-bold text-[var(--gpssa-green)]">{i + 1}</span>
              <span className="mt-1 text-center text-[12px] text-cream">{name}</span>
            </motion.div>
          ))}
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-sm text-white/40"
        >
          {snapshot.spine.stageCount
            ? `${snapshot.spine.stageCount} stages live on the gold-path service`
            : "Stages drafted from persona journey and peer research"}
        </motion.p>
      </div>
    </SlideLayout>
  );
}
