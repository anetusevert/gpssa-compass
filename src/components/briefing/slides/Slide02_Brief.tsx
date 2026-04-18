"use client";

import { motion } from "framer-motion";
import { SlideLayout } from "./SlideLayout";

const EASE = [0.16, 1, 0.3, 1] as const;

const QUESTIONS = [
  "What does GPSSA do today, and how well?",
  "How do we compare to global benchmarks?",
  "Where are the biggest gaps and opportunities?",
  "What should we do next, and in what order?",
];

export function Slide02_Brief() {
  return (
    <SlideLayout
      eyebrow="The Brief"
      title="GPSSA asked four questions."
      subtitle="One platform answers all of them."
    >
      <div className="flex h-full flex-col items-center justify-center gap-6">
        <div className="flex w-full max-w-2xl flex-col gap-4">
          {QUESTIONS.map((q, i) => (
            <motion.div
              key={q}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.55,
                delay: 0.6 + i * 0.35,
                ease: EASE,
              }}
              className="group flex items-center gap-5 rounded-2xl px-6 py-4 ring-1 ring-white/[0.05]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(17,34,64,0.55), rgba(7,17,34,0.85))",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.05), 0 12px 36px rgba(0,0,0,0.18)",
              }}
            >
              <motion.div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-playfair text-base font-bold text-cream"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(0,168,107,0.32), rgba(45,74,140,0.32))",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
                }}
                animate={{
                  boxShadow: [
                    "inset 0 1px 0 rgba(255,255,255,0.12), 0 0 0 0 rgba(0,168,107,0)",
                    "inset 0 1px 0 rgba(255,255,255,0.12), 0 0 16px 2px rgba(0,168,107,0.3)",
                    "inset 0 1px 0 rgba(255,255,255,0.12), 0 0 0 0 rgba(0,168,107,0)",
                  ],
                }}
                transition={{
                  duration: 3.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.4,
                }}
              >
                {i + 1}
              </motion.div>
              <div className="text-lg text-cream">{q}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-4 flex items-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 2.4, ease: EASE }}
        >
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <div className="text-[11px] uppercase tracking-[0.32em] text-white/45">
            Compass answers all four
          </div>
          <div className="h-px w-16 bg-gradient-to-l from-transparent via-white/30 to-transparent" />
        </motion.div>
      </div>
    </SlideLayout>
  );
}
