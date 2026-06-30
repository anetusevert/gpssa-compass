"use client";

import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

const STATUS_COLORS: Record<string, string> = {
  realised: "#00A86B",
  "on-track": "#2D4A8C",
  "at-risk": "#E9A23B",
  missed: "#E76363",
};

export interface BenefitBarData {
  id: string;
  title: string;
  metric: string;
  baseline: number;
  target: number;
  actual?: number | null;
  unit?: string | null;
  status: string;
  initiativeTitle?: string | null;
  note?: string | null;
  validatedBy?: string | null;
}

function fmt(v: number | null | undefined, unit?: string | null) {
  if (v == null) return "—";
  const r = Math.round(v * 10) / 10;
  return unit ? `${r}${unit === "%" ? "%" : " " + unit}` : `${r}`;
}

/**
 * A baseline → target → actual variance bar. The track spans the full
 * baseline..target travel; the fill shows how far `actual` has moved toward
 * (or past) the target, regardless of improvement direction.
 */
export function BenefitBar({ benefit, index = 0 }: { benefit: BenefitBarData; index?: number }) {
  const color = STATUS_COLORS[benefit.status] ?? "#9CA3AF";
  const { baseline, target, actual } = benefit;

  const span = Math.abs(target - baseline) || 1;
  const progressRaw = actual != null ? Math.abs(actual - baseline) / span : 0;
  const progress = Math.max(0, Math.min(1, progressRaw));
  const pct = Math.round(progress * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay: index * 0.04 }}
      className="glass-card p-4"
    >
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-cream truncate">{benefit.title}</p>
          <p className="text-[11px] text-gray-muted mt-0.5">{benefit.metric}</p>
        </div>
        <span
          className="shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide leading-none"
          style={{ color, background: color + "22" }}
        >
          {benefit.status}
        </span>
      </div>

      <div className="mt-3">
        <div className="relative h-2 rounded-full bg-white/8 overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: color }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: EASE }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5 text-[10px] text-gray-muted">
          <span>Baseline {fmt(baseline, benefit.unit)}</span>
          <span className="font-semibold" style={{ color }}>
            Actual {fmt(actual, benefit.unit)}
          </span>
          <span>Target {fmt(target, benefit.unit)}</span>
        </div>
      </div>

      {benefit.initiativeTitle && (
        <p className="text-[10px] text-gray-muted mt-2">
          Initiative: <span className="text-cream/80">{benefit.initiativeTitle}</span>
        </p>
      )}
      {benefit.note && (
        <p className="text-[11px] text-gray-muted mt-1.5 leading-snug">{benefit.note}</p>
      )}
      {benefit.validatedBy && (
        <p className="text-[10px] text-gpssa-green/80 mt-1">Validated by {benefit.validatedBy}</p>
      )}
    </motion.div>
  );
}
