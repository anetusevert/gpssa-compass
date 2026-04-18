"use client";

import { motion } from "framer-motion";
import type { ComparatorMetric } from "@/lib/comparator/types";

interface Props {
  metrics: ComparatorMetric[];
  size?: number;
  /** GPSSA series color. */
  gpssaColor?: string;
  /** Comparator series color. */
  referenceColor?: string;
  /** Comparator label (used in legend). */
  referenceLabel?: string;
  /** Show min-max band as a translucent ring (top-quartile spread). */
  showBand?: boolean;
}

/**
 * Radar chart with optional range-band shading.
 *
 *   • GPSSA polygon (filled, glowing)
 *   • Reference polygon (dashed)
 *   • Optional band ring between min/max of the comparator cohort
 */
export function RangeBandRadar({
  metrics,
  size = 320,
  gpssaColor = "#22C55E",
  referenceColor = "#0EA5E9",
  referenceLabel = "Reference",
  showBand = true,
}: Props) {
  const n = metrics.length;
  if (n < 3) {
    return (
      <div className="flex items-center justify-center text-[11px] text-gray-muted py-8">
        Need at least 3 dimensions for a radar.
      </div>
    );
  }

  const cx = size / 2;
  const cy = size / 2;
  const r = (size - 80) / 2;
  const max = 100;
  const angleStep = (2 * Math.PI) / n;

  function polar(idx: number, value: number) {
    const a = idx * angleStep - Math.PI / 2;
    const norm = (Math.max(0, Math.min(max, value)) / max) * r;
    return { x: cx + norm * Math.cos(a), y: cy + norm * Math.sin(a) };
  }

  function poly(values: number[]) {
    return values.map((v, i) => { const p = polar(i, v); return `${p.x},${p.y}`; }).join(" ");
  }

  const gpssaPoints = poly(metrics.map((m) => m.gpssa));
  const refPoints   = poly(metrics.map((m) => m.reference));
  const minPoints   = showBand ? poly(metrics.map((m) => m.band?.min ?? m.reference)) : null;
  const maxPoints   = showBand ? poly(metrics.map((m) => m.band?.max ?? m.reference)) : null;

  const gpssaAvg = Math.round(metrics.reduce((s, m) => s + m.gpssa, 0) / n);
  const refAvg   = Math.round(metrics.reduce((s, m) => s + m.reference, 0) / n);
  const gap      = gpssaAvg - refAvg;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-md" style={{ aspectRatio: "1 / 1" }}>
        {/* concentric grid */}
        {[0.25, 0.5, 0.75, 1].map((p) => (
          <polygon
            key={p}
            points={Array.from({ length: n }, (_, i) => { const pt = polar(i, max * p); return `${pt.x},${pt.y}`; }).join(" ")}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />
        ))}
        {metrics.map((m, i) => {
          const p = polar(i, max);
          return (
            <line key={`ax-${m.key}`} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.05)" />
          );
        })}

        {/* range band */}
        {showBand && maxPoints && minPoints && (
          <g>
            <motion.polygon
              points={maxPoints}
              fill={`${referenceColor}10`}
              stroke={`${referenceColor}40`}
              strokeWidth={1}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            <motion.polygon
              points={minPoints}
              fill="rgba(11,18,32,0.7)"
              stroke={`${referenceColor}30`}
              strokeWidth={1}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          </g>
        )}

        {/* reference polygon */}
        <motion.polygon
          points={refPoints}
          fill="none"
          stroke={referenceColor}
          strokeWidth={1.6}
          strokeDasharray="4 3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        />

        {/* gpssa polygon */}
        <motion.polygon
          points={gpssaPoints}
          fill={`${gpssaColor}28`}
          stroke={gpssaColor}
          strokeWidth={2}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.18 }}
          style={{ filter: `drop-shadow(0 0 6px ${gpssaColor}55)`, transformOrigin: `${cx}px ${cy}px` }}
        />
        {metrics.map((m, i) => {
          const p = polar(i, m.gpssa);
          return <circle key={`g-${m.key}`} cx={p.x} cy={p.y} r={3} fill={gpssaColor} />;
        })}

        {/* axis labels */}
        {metrics.map((m, i) => {
          const p = polar(i, max + max * 0.18);
          const halign = Math.abs(p.x - cx) < 1 ? "middle" : p.x > cx ? "start" : "end";
          return (
            <text
              key={`lbl-${m.key}`}
              x={p.x}
              y={p.y}
              fill="#E5E7EB"
              fontSize={9}
              textAnchor={halign as "start" | "middle" | "end"}
              dominantBaseline="middle"
              style={{ pointerEvents: "none" }}
            >
              {m.label}
            </text>
          );
        })}
      </svg>

      <div className="flex items-center gap-4 text-[10px] text-cream mt-2">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: gpssaColor }} />
          GPSSA · <span className="tabular-nums font-semibold">{gpssaAvg}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm border" style={{ borderColor: referenceColor, backgroundColor: `${referenceColor}30` }} />
          {referenceLabel} · <span className="tabular-nums font-semibold">{refAvg}</span>
        </span>
        <span
          className="text-[10px] font-semibold tabular-nums"
          style={{ color: gap >= 0 ? "#10B981" : "#F59E0B" }}
        >
          {gap >= 0 ? "+" : ""}{gap}
        </span>
      </div>
    </div>
  );
}
