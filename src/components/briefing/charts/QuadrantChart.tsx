"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const EASE = [0.16, 1, 0.3, 1] as const;

export interface QuadrantPoint {
  id: string;
  name: string;
  flag?: string | null;
  x: number;
  y: number;
  /** "uae" → UAE/GPSSA pin · "selected" → comparator selection · "default" → faded background. */
  kind: "uae" | "selected" | "default";
  color: string;
}

interface QuadrantChartProps {
  data: QuadrantPoint[];
  xLabel: string;
  yLabel: string;
}

interface DotProps {
  cx?: number;
  cy?: number;
  payload?: QuadrantPoint;
}

function PointDot({ cx, cy, payload }: DotProps) {
  if (cx == null || cy == null || !payload) return null;
  if (payload.kind === "uae") {
    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={14}
          fill="rgba(0,168,107,0.18)"
          stroke="rgba(0,168,107,0.55)"
          strokeWidth={1}
        />
        <circle
          cx={cx}
          cy={cy}
          r={7}
          fill="#33C490"
          stroke="rgba(255,255,255,0.95)"
          strokeWidth={1.6}
        />
        <text
          x={cx}
          y={cy - 18}
          textAnchor="middle"
          fontSize={10}
          fontWeight={600}
          fill="#33C490"
          style={{ letterSpacing: "0.18em", textTransform: "uppercase" }}
        >
          {payload.name}
        </text>
      </g>
    );
  }
  if (payload.kind === "selected") {
    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={6.5}
          fill={payload.color}
          stroke="rgba(255,255,255,0.95)"
          strokeWidth={1.4}
        />
        <text
          x={cx + 8}
          y={cy - 8}
          textAnchor="start"
          fontSize={9.5}
          fill={payload.color}
          fontWeight={600}
        >
          {payload.flag ? `${payload.flag} ` : ""}
          {payload.name}
        </text>
      </g>
    );
  }
  return (
    <circle
      cx={cx}
      cy={cy}
      r={3.5}
      fill="rgba(255,255,255,0.18)"
      stroke="rgba(255,255,255,0.32)"
      strokeWidth={0.8}
    />
  );
}

interface TipProps {
  active?: boolean;
  payload?: { payload: QuadrantPoint }[];
}

function ChartTooltip({ active, payload }: TipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload;
  return (
    <div
      className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] text-cream shadow-2xl"
      style={{
        background:
          "linear-gradient(160deg, rgba(17,34,64,0.95), rgba(7,17,34,0.98))",
      }}
    >
      <div className="font-semibold">
        {p.flag ? `${p.flag} ` : ""}
        {p.name}
      </div>
      <div className="mt-0.5 text-[10px] tabular-nums text-white/55">
        {Math.round(p.x)} · {Math.round(p.y)}
      </div>
    </div>
  );
}

export function QuadrantChart({ data, xLabel, yLabel }: QuadrantChartProps) {
  const sorted = useMemo(() => {
    // Render order: defaults first, then selected, then UAE on top
    return [
      ...data.filter((d) => d.kind === "default"),
      ...data.filter((d) => d.kind === "selected"),
      ...data.filter((d) => d.kind === "uae"),
    ];
  }, [data]);

  return (
    <div className="relative h-full w-full">
      {/* Quadrant labels (overlay) */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <QuadrantLabel position="top-right" text="Leaders" color="#33C490" />
        <QuadrantLabel position="top-left" text="Niche" color="#4899FF" />
        <QuadrantLabel
          position="bottom-right"
          text="Challengers"
          color="#E7B02E"
        />
        <QuadrantLabel
          position="bottom-left"
          text="Laggards"
          color="#E76363"
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="h-full w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 22, right: 28, bottom: 36, left: 28 }}>
            <defs>
              <radialGradient id="quad-uae-glow" cx="50%" cy="50%" r="50%">
                <stop
                  offset="0%"
                  stopColor="rgba(0,168,107,0.5)"
                  stopOpacity={0.7}
                />
                <stop
                  offset="100%"
                  stopColor="rgba(0,168,107,0)"
                  stopOpacity={0}
                />
              </radialGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" />
            <XAxis
              type="number"
              dataKey="x"
              domain={[0, 100]}
              tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 10 }}
              tickLine={{ stroke: "rgba(255,255,255,0.1)" }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              label={{
                value: xLabel,
                position: "insideBottom",
                offset: -10,
                style: {
                  fill: "rgba(255,255,255,0.55)",
                  fontSize: 11,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                },
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[0, 100]}
              tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 10 }}
              tickLine={{ stroke: "rgba(255,255,255,0.1)" }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              label={{
                value: yLabel,
                angle: -90,
                position: "insideLeft",
                offset: -2,
                style: {
                  fill: "rgba(255,255,255,0.55)",
                  fontSize: 11,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  textAnchor: "middle",
                },
              }}
            />
            <ReferenceLine
              x={50}
              stroke="rgba(255,255,255,0.18)"
              strokeDasharray="4 4"
            />
            <ReferenceLine
              y={50}
              stroke="rgba(255,255,255,0.18)"
              strokeDasharray="4 4"
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{
                strokeDasharray: "3 3",
                stroke: "rgba(255,255,255,0.12)",
              }}
            />
            <Scatter data={sorted} shape={<PointDot />} />
          </ScatterChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}

function QuadrantLabel({
  position,
  text,
  color,
}: {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  text: string;
  color: string;
}) {
  const styles: Record<typeof position, string> = {
    "top-left": "left-10 top-3",
    "top-right": "right-10 top-3",
    "bottom-left": "bottom-10 left-10",
    "bottom-right": "bottom-10 right-10",
  };
  return (
    <div
      className={`absolute ${styles[position]} text-[9.5px] uppercase tracking-[0.22em]`}
      style={{ color }}
    >
      {text}
    </div>
  );
}
