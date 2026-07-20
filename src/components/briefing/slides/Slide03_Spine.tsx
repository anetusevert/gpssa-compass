"use client";

import { motion } from "framer-motion";
import { SlideLayout } from "./SlideLayout";

const EASE = [0.16, 1, 0.3, 1] as const;

const NODES = [
  { id: "episode", label: "Episode", sub: "Life moment", color: "#00A86B" },
  { id: "journey", label: "Journey", sub: "Stages", color: "#3B82C4" },
  { id: "process", label: "Process", sub: "SOP", color: "#C99A3C" },
  { id: "systems", label: "Systems", sub: "Fulfilment", color: "#B0764A" },
  { id: "qa", label: "QA", sub: "CAPA", color: "#C5A572" },
];

export function Slide03_Spine() {
  return (
    <SlideLayout
      eyebrow="The Service Operating Spine"
      title="One service. Operable end to end."
      subtitle="Episode → Journey → Process → Systems → QA — the leave-behind chain that turns strategy into run."
    >
      <div className="flex h-full flex-col items-center justify-center">
        <div className="relative mb-2 w-full max-w-5xl px-4">
          <svg
            className="pointer-events-none absolute left-0 right-0 top-1/2 hidden h-2 -translate-y-1/2 md:block"
            viewBox="0 0 1000 8"
            preserveAspectRatio="none"
          >
            <motion.path
              d="M 40 4 H 960"
              fill="none"
              stroke="rgba(0,168,107,0.4)"
              strokeWidth="2"
              strokeDasharray="8 6"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.4, ease: EASE, delay: 0.2 }}
            />
          </svg>

          <div className="relative z-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 md:gap-4">
            {NODES.map((node, i) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 20, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.55, ease: EASE, delay: 0.15 + i * 0.12 }}
                className="flex flex-col items-center rounded-2xl px-3 py-5 text-center"
                style={{
                  background:
                    "linear-gradient(160deg, rgba(17,34,64,0.9), rgba(7,17,34,0.96))",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: `0 16px 40px rgba(0,0,0,0.3), 0 0 40px ${node.color}22`,
                }}
              >
                <motion.div
                  className="mb-3 h-14 w-14 rounded-full"
                  style={{
                    background: `radial-gradient(circle at 35% 30%, ${node.color}, ${node.color}88 55%, #0a1628 100%)`,
                    boxShadow: `0 0 28px ${node.color}55`,
                  }}
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 2.8, repeat: Infinity, delay: i * 0.25 }}
                />
                <div className="font-playfair text-base font-bold text-cream">{node.label}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/40">
                  {node.sub}
                </div>
                <div
                  className="mt-3 text-[10px] font-semibold tabular-nums"
                  style={{ color: node.color }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mt-8 max-w-xl text-center text-sm text-white/45"
        >
          So what: every recommendation lands on a runnable service — not a slide deck.
        </motion.p>
      </div>
    </SlideLayout>
  );
}
