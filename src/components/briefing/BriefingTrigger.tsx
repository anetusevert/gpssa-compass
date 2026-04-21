"use client";

import { motion } from "framer-motion";
import { Play, Sparkles } from "lucide-react";
import { useBriefingStore } from "./store";

interface BriefingTriggerProps {
  collapsed: boolean;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export function BriefingTrigger({ collapsed }: BriefingTriggerProps) {
  const openDeck = useBriefingStore((s) => s.openDeck);

  if (collapsed) {
    return (
      <div className="flex justify-center px-2 pb-1.5 pt-1">
        <motion.button
          onClick={openDeck}
          title="Executive Briefing"
          className="group relative flex h-8 w-8 items-center justify-center rounded-full overflow-hidden"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          style={{
            background:
              "linear-gradient(135deg, rgba(0,168,107,0.22), rgba(45,74,140,0.22))",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <motion.span
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(0,168,107,0)",
                "0 0 16px 2px rgba(0,168,107,0.5)",
                "0 0 0 0 rgba(0,168,107,0)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <Play
            size={11}
            className="relative z-10 text-cream"
            strokeWidth={2}
            fill="currentColor"
          />
        </motion.button>
      </div>
    );
  }

  return (
    <div className="px-3 pb-2 pt-1">
      <motion.button
        onClick={openDeck}
        title="Open Executive Briefing"
        className="shimmer-border group relative flex w-full items-center gap-2 overflow-hidden rounded-xl px-3 py-2 text-left"
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.25, ease: EASE }}
        style={{
          background:
            "linear-gradient(135deg, rgba(0,168,107,0.18), rgba(45,74,140,0.22))",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.07), 0 6px 22px rgba(0,168,107,0.10)",
        }}
      >
        {/* Breathing halo */}
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-xl"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(0,168,107,0)",
              "0 0 22px 2px rgba(0,168,107,0.32)",
              "0 0 0 0 rgba(0,168,107,0)",
            ],
          }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Drifting glow blob */}
        <motion.span
          className="pointer-events-none absolute -left-6 -top-6 h-16 w-16 rounded-full opacity-50"
          style={{
            background:
              "radial-gradient(circle, rgba(0,168,107,0.45) 0%, transparent 70%)",
          }}
          animate={{ x: [0, 24, 0], y: [0, 6, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />

        <span
          className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,168,107,0.32), rgba(0,168,107,0.12))",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 6px rgba(0,0,0,0.25)",
          }}
        >
          <Play
            size={11}
            className="text-cream"
            strokeWidth={2}
            fill="currentColor"
          />
        </span>

        <span className="relative z-10 text-[12px] font-semibold leading-tight text-cream">
          Executive Briefing
        </span>

        <Sparkles
          size={11}
          className="relative z-10 ml-auto text-white/40 transition-colors duration-200 group-hover:text-[#33C490]"
          strokeWidth={1.8}
        />
      </motion.button>
    </div>
  );
}
