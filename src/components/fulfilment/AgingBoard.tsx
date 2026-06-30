"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

export interface AgingBucket {
  bucket: string;
  total: number;
  amber: number;
  red: number;
  breached: number;
}

const BUCKET_ORDER = ["0–10 days", "11–20 days", "21–30 days", ">30 days"];

/**
 * Aging-bucket board: four columns (0–10/11–20/21–30/>30 days) with amber/red
 * early-warning highlighting derived from live aging counts.
 */
export function AgingBoard({ buckets }: { buckets: AgingBucket[] }) {
  const ordered = BUCKET_ORDER.map(
    (b) =>
      buckets.find((x) => x.bucket === b) ?? {
        bucket: b,
        total: 0,
        amber: 0,
        red: 0,
        breached: 0,
      }
  );
  const maxTotal = Math.max(1, ...ordered.map((b) => b.total));

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {ordered.map((b, i) => {
        const danger = b.red + b.breached;
        const elevated = b.bucket === ">30 days";
        return (
          <motion.div
            key={b.bucket}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: i * 0.05 }}
            className={`rounded-xl border p-3 ${
              elevated
                ? "bg-rose-500/[0.06] border-rose-500/20"
                : danger > 0
                ? "bg-amber-500/[0.05] border-amber-500/15"
                : "bg-white/[0.03] border-white/[0.07]"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-cream">{b.bucket}</span>
              {(elevated || danger > 0) && (
                <AlertTriangle
                  size={12}
                  className={elevated ? "text-rose-300" : "text-amber-300"}
                />
              )}
            </div>
            <p className="text-2xl font-bold text-cream font-playfair tabular-nums">
              {b.total}
            </p>
            <p className="text-[9px] text-gray-muted uppercase tracking-wide mb-2">
              open cases
            </p>

            {/* Stacked risk bar */}
            <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden flex">
              {b.breached > 0 && (
                <div
                  className="h-full bg-rose-500"
                  style={{ width: `${(b.breached / maxTotal) * 100}%` }}
                />
              )}
              {b.red > 0 && (
                <div
                  className="h-full bg-rose-400/80"
                  style={{ width: `${(b.red / maxTotal) * 100}%` }}
                />
              )}
              {b.amber > 0 && (
                <div
                  className="h-full bg-amber-400/80"
                  style={{ width: `${(b.amber / maxTotal) * 100}%` }}
                />
              )}
            </div>

            <div className="flex items-center gap-2 mt-2 text-[9px]">
              {b.amber > 0 && <span className="text-amber-300">{b.amber} at-risk</span>}
              {b.red > 0 && <span className="text-rose-300">{b.red} critical</span>}
              {b.breached > 0 && (
                <span className="text-rose-400 font-medium">{b.breached} breached</span>
              )}
              {b.amber + b.red + b.breached === 0 && (
                <span className="text-gpssa-green">all on track</span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
