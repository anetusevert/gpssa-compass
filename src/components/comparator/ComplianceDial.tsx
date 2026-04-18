"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Props {
  /** Score 0–100. */
  score: number;
  /** Comparator score 0–100 (drawn as a faint reference ring). */
  reference?: number;
  label: string;
  sublabel?: string;
  size?: "sm" | "md" | "lg";
  /** Hex color for the score arc. */
  color?: string;
  /** Tertiary band label, e.g. "Top quartile" / "Below floor". */
  band?: string;
}

const SIZE_MAP = {
  sm: { box: 80, stroke: 7, font: "text-base" },
  md: { box: 130, stroke: 10, font: "text-2xl" },
  lg: { box: 200, stroke: 14, font: "text-4xl" },
} as const;

function bandColorFor(score: number): string {
  if (score >= 85) return "#10B981";
  if (score >= 70) return "#22C55E";
  if (score >= 55) return "#F59E0B";
  if (score >= 40) return "#FB923C";
  return "#EF4444";
}

/**
 * Cinematic circular compliance dial — main GPSSA score, with optional faint
 * reference ring drawn behind it for the chosen comparator.
 */
export function ComplianceDial({
  score,
  reference,
  label,
  sublabel,
  size = "md",
  color,
  band,
}: Props) {
  const cfg = SIZE_MAP[size];
  const cx = cfg.box / 2;
  const cy = cfg.box / 2;
  const r = (cfg.box - cfg.stroke - 4) / 2;
  const circ = 2 * Math.PI * r;
  const arcColor = color ?? bandColorFor(score);

  // animate the displayed number from 0 → score
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const dur = 900;
    const from = displayed;
    const to = Math.round(score);
    let raf = 0;
    function tick() {
      const t = Math.min(1, (Date.now() - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    tick();
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  const dashOffset = circ - (Math.min(100, Math.max(0, score)) / 100) * circ;
  const refDashOffset = reference != null
    ? circ - (Math.min(100, Math.max(0, reference)) / 100) * circ
    : circ;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: cfg.box, height: cfg.box }}>
        <svg width={cfg.box} height={cfg.box} className="-rotate-90">
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={cfg.stroke}
          />
          {reference != null && (
            <motion.circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth={cfg.stroke / 2.2}
              strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: refDashOffset }}
              transition={{ duration: 1.0, ease: "easeOut", delay: 0.05 }}
              strokeDashoffset={refDashOffset}
            />
          )}
          <motion.circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={arcColor}
            strokeWidth={cfg.stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.0, ease: "easeOut", delay: 0.15 }}
            strokeDashoffset={dashOffset}
            style={{ filter: `drop-shadow(0 0 6px ${arcColor}55)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${cfg.font} font-bold tabular-nums text-cream`}>{displayed}</span>
          {reference != null && (
            <span className="text-[9px] text-gray-muted mt-0.5">
              vs <span style={{ color: "#E5E7EB" }}>{Math.round(reference)}</span>
            </span>
          )}
        </div>
      </div>
      <div className="mt-1.5 text-center">
        <p className="text-[11px] font-semibold text-cream leading-tight">{label}</p>
        {sublabel && <p className="text-[9px] text-gray-muted mt-0.5">{sublabel}</p>}
        {band && (
          <span
            className="inline-block mt-1 text-[9px] font-medium px-1.5 py-0.5 rounded"
            style={{ backgroundColor: `${arcColor}22`, color: arcColor }}
          >
            {band}
          </span>
        )}
      </div>
    </div>
  );
}
