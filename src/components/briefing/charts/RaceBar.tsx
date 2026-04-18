"use client";

import { motion } from "framer-motion";

export interface RaceBarRow {
  id: string;
  label: string;
  sub?: string;
  value: number; // 0–100 (or any common unit)
  color: string;
  highlight?: boolean;
}

interface RaceBarProps {
  rows: RaceBarRow[];
  max?: number;
  delayBase?: number;
  showValue?: boolean;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export function RaceBar({
  rows,
  max,
  delayBase = 0.2,
  showValue = true,
}: RaceBarProps) {
  const computedMax =
    max ??
    Math.max(...rows.map((r) => r.value), 1) * 1.05;

  return (
    <div className="flex flex-col gap-3 w-full">
      {rows.map((row, i) => {
        const pct = Math.max(2, (row.value / computedMax) * 100);
        return (
          <motion.div
            key={row.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: delayBase + i * 0.08 }}
            className="grid grid-cols-[180px_1fr_72px] items-center gap-4"
          >
            <div className="text-right">
              <div
                className={`text-sm font-medium leading-tight ${
                  row.highlight ? "text-cream font-semibold" : "text-white/75"
                }`}
              >
                {row.label}
              </div>
              {row.sub && (
                <div className="text-[10px] uppercase tracking-[0.16em] text-white/35">
                  {row.sub}
                </div>
              )}
            </div>

            <div className="relative h-6 overflow-hidden rounded-full bg-white/[0.04] ring-1 ring-white/[0.04]">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${row.color}, color-mix(in srgb, ${row.color} 70%, white))`,
                  boxShadow: row.highlight
                    ? `0 0 18px color-mix(in srgb, ${row.color} 40%, transparent)`
                    : undefined,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{
                  duration: 1.4,
                  ease: EASE,
                  delay: delayBase + i * 0.12 + 0.2,
                }}
              />
              {row.highlight && (
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                    width: "60%",
                  }}
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.6,
                  }}
                />
              )}
            </div>

            {showValue && (
              <motion.div
                className={`text-right font-playfair text-base font-bold tabular-nums ${
                  row.highlight ? "text-[#33C490]" : "text-cream/85"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.4,
                  delay: delayBase + i * 0.12 + 1.2,
                }}
              >
                {Math.round(row.value)}
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
