"use client";

import { motion } from "framer-motion";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  YAxis,
} from "recharts";
import { RagChip, RAG_COLOR_MAP } from "./IndicatorChip";

const EASE = [0.16, 1, 0.3, 1] as const;

export interface MetricTileData {
  id: string;
  name: string;
  unit?: string | null;
  value: number | null;
  target?: number | null;
  rag: string; // green | amber | red | gray
  perspective?: string | null;
  series: { period: string; value: number }[];
}

function fmt(v: number | null | undefined, unit?: string | null) {
  if (v == null) return "—";
  const rounded = Math.round(v * 10) / 10;
  if (unit === "%") return `${rounded}%`;
  if (unit) return `${rounded} ${unit}`;
  return `${rounded}`;
}

export function MetricTile({
  metric,
  index = 0,
}: {
  metric: MetricTileData;
  index?: number;
}) {
  const color = RAG_COLOR_MAP[metric.rag] ?? RAG_COLOR_MAP.gray;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay: index * 0.04 }}
      className="glass-card p-5 flex flex-col"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-sm font-medium text-cream leading-snug">{metric.name}</p>
        <RagChip status={metric.rag} />
      </div>

      <div className="flex items-end gap-3">
        <p className="text-2xl font-bold font-playfair text-cream">
          {fmt(metric.value, metric.unit)}
        </p>
        {metric.target != null && (
          <p className="text-xs text-gray-muted mb-1">
            target {fmt(metric.target, metric.unit)}
          </p>
        )}
      </div>

      <div className="h-12 mt-3 -mx-1">
        {metric.series.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metric.series} margin={{ top: 4, bottom: 4, left: 2, right: 2 }}>
              <YAxis hide domain={["dataMin - 2", "dataMax + 2"]} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center text-[10px] text-gray-muted">
            No trend yet
          </div>
        )}
      </div>
    </motion.div>
  );
}
