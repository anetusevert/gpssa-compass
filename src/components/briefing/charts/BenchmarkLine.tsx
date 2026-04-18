"use client";

import { motion } from "framer-motion";

export interface BenchmarkRow {
  id: string;
  label: string;
  category?: string;
  gpssa: number | null;
  globalAverage: number | null;
  topQuartile: number | null;
  floor: number | null;
}

interface BenchmarkLineProps {
  rows: BenchmarkRow[];
}

const EASE = [0.16, 1, 0.3, 1] as const;

function clamp(v: number) {
  return Math.max(0, Math.min(100, v));
}

export function BenchmarkLine({ rows }: BenchmarkLineProps) {
  return (
    <div className="flex flex-col gap-5 w-full">
      {rows.map((row, i) => (
        <motion.div
          key={row.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 + i * 0.12, ease: EASE }}
          className="grid grid-cols-[200px_1fr] items-center gap-5"
        >
          <div className="text-right">
            <div className="text-[13px] font-medium text-cream leading-tight">
              {row.label}
            </div>
            {row.category && (
              <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">
                {row.category}
              </div>
            )}
          </div>

          <div className="relative h-10">
            {/* Track */}
            <div className="absolute inset-y-[18px] left-0 right-0 h-0.5 bg-white/[0.06]" />

            {/* 0–100 ticks */}
            {[0, 25, 50, 75, 100].map((t) => (
              <div
                key={t}
                className="absolute top-1/2 h-1.5 w-px -translate-y-1/2 bg-white/10"
                style={{ left: `${t}%` }}
              />
            ))}

            {/* Floor marker */}
            {row.floor != null && (
              <motion.div
                className="absolute -top-1 bottom-1 flex flex-col items-center"
                style={{ left: `${clamp(row.floor)}%` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.12 }}
              >
                <div className="h-full w-px bg-[#C5A572]/45" />
                <div className="absolute -bottom-3 -translate-x-1/2 text-[8px] uppercase tracking-[0.16em] text-[#C5A572]/70">
                  Floor
                </div>
              </motion.div>
            )}

            {/* Global avg dot */}
            {row.globalAverage != null && (
              <motion.div
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${clamp(row.globalAverage)}%` }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.6 + i * 0.12,
                  ease: EASE,
                }}
              >
                <div className="flex flex-col items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-white/55 ring-2 ring-white/10" />
                  <div className="absolute -bottom-3 -translate-x-1/2 text-[8px] uppercase tracking-[0.14em] text-white/40 whitespace-nowrap">
                    avg
                  </div>
                </div>
              </motion.div>
            )}

            {/* Top quartile dot */}
            {row.topQuartile != null && (
              <motion.div
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${clamp(row.topQuartile)}%` }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.8 + i * 0.12,
                  ease: EASE,
                }}
              >
                <div className="flex flex-col items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#2DD4BF] ring-2 ring-[#2DD4BF]/15" />
                  <div className="absolute -bottom-3 -translate-x-1/2 text-[8px] uppercase tracking-[0.14em] text-[#2DD4BF]/70 whitespace-nowrap">
                    top 25
                  </div>
                </div>
              </motion.div>
            )}

            {/* GPSSA dot — biggest, animated travelling in */}
            {row.gpssa != null && (
              <motion.div
                className="absolute top-1/2 -translate-y-1/2"
                initial={{ left: "0%", opacity: 0, scale: 0 }}
                animate={{
                  left: `${clamp(row.gpssa)}%`,
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  duration: 1.4,
                  delay: 1 + i * 0.12,
                  ease: EASE,
                }}
              >
                <div className="-translate-x-1/2 flex flex-col items-center">
                  <div className="relative">
                    <motion.div
                      className="h-4 w-4 rounded-full bg-[#00A86B]"
                      style={{ boxShadow: "0 0 18px rgba(0,168,107,0.55)" }}
                      animate={{
                        boxShadow: [
                          "0 0 18px rgba(0,168,107,0.45)",
                          "0 0 28px rgba(0,168,107,0.7)",
                          "0 0 18px rgba(0,168,107,0.45)",
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </div>
                  <div className="mt-1 text-[10px] font-semibold tabular-nums text-[#33C490]">
                    GPSSA · {Math.round(row.gpssa)}
                  </div>
                </div>
              </motion.div>
            )}

            {/* No GPSSA score yet */}
            {row.gpssa == null && (
              <div className="absolute inset-y-0 right-0 flex items-center text-[10px] text-white/40">
                not yet evaluated
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
