"use client";

import { motion } from "framer-motion";

export interface RadarSeries {
  name: string;
  color: string;
  values: number[]; // 0–100
}

interface AnimatedRadarProps {
  axes: string[];
  series: RadarSeries[];
  size?: number;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export function AnimatedRadar({
  axes,
  series,
  size = 440,
}: AnimatedRadarProps) {
  const center = size / 2;
  const radius = size * 0.36;
  const n = axes.length;

  function pointFor(i: number, value: number): [number, number] {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const r = (Math.max(0, Math.min(100, value)) / 100) * radius;
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
  }

  function axisPoint(i: number, scale: number): [number, number] {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [
      center + radius * scale * Math.cos(angle),
      center + radius * scale * Math.sin(angle),
    ];
  }

  function polygonPath(values: number[]): string {
    return values
      .map((v, i) => {
        const [x, y] = pointFor(i, v);
        return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ") + " Z";
  }

  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="overflow-visible"
    >
      {/* Concentric rings */}
      {rings.map((r, i) => (
        <motion.polygon
          key={`ring-${i}`}
          points={Array.from({ length: n })
            .map((_, idx) => {
              const [x, y] = axisPoint(idx, r);
              return `${x},${y}`;
            })
            .join(" ")}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 * i }}
        />
      ))}

      {/* Axis lines */}
      {Array.from({ length: n }).map((_, i) => {
        const [x, y] = axisPoint(i, 1);
        return (
          <motion.line
            key={`axis-${i}`}
            x1={center}
            y1={center}
            x2={x}
            y2={y}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.4 + i * 0.05, ease: EASE }}
          />
        );
      })}

      {/* Axis labels */}
      {axes.map((label, i) => {
        const [x, y] = axisPoint(i, 1.18);
        return (
          <motion.text
            key={`label-${i}`}
            x={x}
            y={y}
            fontSize="11"
            fill="rgba(232,240,245,0.7)"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="var(--font-dm-sans), sans-serif"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 + i * 0.05 }}
          >
            {label}
          </motion.text>
        );
      })}

      {/* Series polygons */}
      {series.map((s, sIdx) => (
        <g key={s.name}>
          <motion.path
            d={polygonPath(s.values)}
            fill={s.color}
            fillOpacity={0.12}
            stroke={s.color}
            strokeWidth={2}
            strokeLinejoin="round"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ transformOrigin: `${center}px ${center}px` }}
            transition={{
              duration: 0.9,
              delay: 1 + sIdx * 0.45,
              ease: EASE,
            }}
          />
          {s.values.map((v, i) => {
            const [x, y] = pointFor(i, v);
            return (
              <motion.circle
                key={`${s.name}-pt-${i}`}
                cx={x}
                cy={y}
                r={3.5}
                fill={s.color}
                stroke="rgba(7,17,34,1)"
                strokeWidth={1.5}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  duration: 0.4,
                  delay: 1.3 + sIdx * 0.45 + i * 0.05,
                  ease: EASE,
                }}
              />
            );
          })}
        </g>
      ))}
    </svg>
  );
}
