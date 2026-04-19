"use client";

import { motion } from "framer-motion";

export interface BenchmarkRow {
  id: string;
  label: string;
  category?: string;
  /** Plain-English explainer rendered under the label. */
  oneLiner?: string;
  gpssa: number | null;
  globalAverage: number | null;
  /** Top quartile / "Leaders" frontier. */
  topQuartile: number | null;
  /** Bottom quartile / "Laggards" floor. */
  bottomQuartile: number | null;
  floor: number | null;
}

interface BenchmarkLineProps {
  rows: BenchmarkRow[];
  /** Override the inline label used for the plotted entity (default "UAE"). */
  entityLabel?: string;
}

const EASE = [0.16, 1, 0.3, 1] as const;

function clamp(v: number) {
  return Math.max(0, Math.min(100, v));
}

export function BenchmarkLine({ rows, entityLabel = "UAE" }: BenchmarkLineProps) {
  return (
    <div className="flex flex-col gap-7 w-full">
      {rows.map((row, i) => (
        <motion.div
          key={row.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 + i * 0.12, ease: EASE }}
          className="grid grid-cols-[260px_1fr] items-center gap-6"
        >
          <div className="text-right">
            <div className="text-lg font-semibold leading-tight text-cream">
              {row.label}
            </div>
            {row.oneLiner && (
              <div className="mt-0.5 text-[12px] leading-snug text-white/55">
                {row.oneLiner}
              </div>
            )}
          </div>

          <div className="relative h-14">
            {/* Track gradient: red (laggard) → amber (avg) → green (leader) */}
            <div
              className="absolute inset-y-[26px] left-0 right-0 h-1 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, rgba(197,165,114,0.18) 0%, rgba(255,255,255,0.10) 50%, rgba(45,212,191,0.22) 100%)",
              }}
            />

            {/* 0–100 ticks */}
            {[0, 25, 50, 75, 100].map((t) => (
              <div
                key={t}
                className="absolute top-1/2 h-2 w-px -translate-y-1/2 bg-white/10"
                style={{ left: `${t}%` }}
              />
            ))}

            {/* Floor marker (ILO etc.) */}
            {row.floor != null && (
              <motion.div
                className="absolute -top-1 bottom-1 flex flex-col items-center"
                style={{ left: `${clamp(row.floor)}%` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.12 }}
              >
                <div className="h-full w-px bg-[#C5A572]/45" />
                <div className="absolute -bottom-4 -translate-x-1/2 text-[10px] uppercase tracking-[0.16em] text-[#C5A572]/70 whitespace-nowrap">
                  Floor
                </div>
              </motion.div>
            )}

            {/* Laggards (bottom-quartile) marker */}
            {row.bottomQuartile != null && (
              <motion.div
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${clamp(row.bottomQuartile)}%` }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.55,
                  delay: 0.55 + i * 0.12,
                  ease: EASE,
                }}
              >
                <div className="flex flex-col items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#C5A572]/85 ring-2 ring-[#C5A572]/15" />
                  <div className="absolute -bottom-4 -translate-x-1/2 text-[10px] uppercase tracking-[0.14em] text-[#C5A572]/70 whitespace-nowrap">
                    Laggards
                  </div>
                </div>
              </motion.div>
            )}

            {/* Average dot */}
            {row.globalAverage != null && (
              <motion.div
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${clamp(row.globalAverage)}%` }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.7 + i * 0.12,
                  ease: EASE,
                }}
              >
                <div className="flex flex-col items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-white/65 ring-2 ring-white/10" />
                  <div className="absolute -bottom-4 -translate-x-1/2 text-[10px] uppercase tracking-[0.14em] text-white/55 whitespace-nowrap">
                    Average
                  </div>
                </div>
              </motion.div>
            )}

            {/* Leaders (top-quartile) marker */}
            {row.topQuartile != null && (
              <motion.div
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${clamp(row.topQuartile)}%` }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.85 + i * 0.12,
                  ease: EASE,
                }}
              >
                <div className="flex flex-col items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#2DD4BF] ring-2 ring-[#2DD4BF]/15" />
                  <div className="absolute -bottom-4 -translate-x-1/2 text-[10px] uppercase tracking-[0.14em] text-[#2DD4BF]/80 whitespace-nowrap">
                    Leaders
                  </div>
                </div>
              </motion.div>
            )}

            {/* Entity (UAE/GPSSA) dot — biggest, animated travelling in */}
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
                      className="h-5 w-5 rounded-full bg-[#00A86B]"
                      style={{ boxShadow: "0 0 22px rgba(0,168,107,0.55)" }}
                      animate={{
                        boxShadow: [
                          "0 0 18px rgba(0,168,107,0.45)",
                          "0 0 30px rgba(0,168,107,0.75)",
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
                  <div className="mt-1.5 text-[12px] font-semibold tabular-nums text-[#33C490] whitespace-nowrap">
                    {entityLabel} · {Math.round(row.gpssa)}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
