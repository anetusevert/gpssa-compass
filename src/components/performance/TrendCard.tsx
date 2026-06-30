"use client";

import { motion } from "framer-motion";
import {
  Area,
  ComposedChart,
  Line,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const EASE = [0.16, 1, 0.3, 1] as const;

export interface TrendPoint {
  period: string;
  value: number;
}

interface TrendCardProps {
  title: string;
  subtitle?: string;
  data: TrendPoint[];
  color: string;
  unit?: string;
  /** Benchmark band shaded behind the line (e.g. "good" range). */
  band?: { from: number; to: number; label?: string };
  /** Y domain override. */
  domain?: [number | string, number | string];
  caveat?: string;
  index?: number;
}

export function TrendCard({
  title,
  subtitle,
  data,
  color,
  unit = "",
  band,
  domain,
  caveat,
  index = 0,
}: TrendCardProps) {
  const latest = data.length ? data[data.length - 1].value : null;
  const prev = data.length > 1 ? data[data.length - 2].value : null;
  const delta = latest != null && prev != null ? latest - prev : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay: index * 0.05 }}
      className="glass-card p-5 flex flex-col"
    >
      <div className="flex items-start justify-between gap-3 mb-1">
        <div>
          <p className="text-sm font-semibold text-cream">{title}</p>
          {subtitle && <p className="text-[11px] text-gray-muted mt-0.5">{subtitle}</p>}
        </div>
        <div className="text-right">
          <p className="text-xl font-bold font-playfair" style={{ color }}>
            {latest != null ? `${Math.round(latest * 10) / 10}${unit}` : "—"}
          </p>
          {delta != null && (
            <p className="text-[11px] text-gray-muted">
              {delta >= 0 ? "+" : ""}
              {Math.round(delta * 10) / 10}
              {unit} vs prev
            </p>
          )}
        </div>
      </div>

      <div className="h-32 mt-2 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 6, bottom: 0, left: 0, right: 6 }}>
            <defs>
              <linearGradient id={`grad-${title.replace(/\W/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            {band && (
              <ReferenceArea
                y1={band.from}
                y2={band.to}
                fill="#00A86B"
                fillOpacity={0.06}
                strokeOpacity={0}
              />
            )}
            <XAxis
              dataKey="period"
              tick={{ fill: "#9CA3AF", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={domain ?? ["dataMin - 4", "dataMax + 4"]}
              tick={{ fill: "#9CA3AF", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={28}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(13,20,33,0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                fontSize: 12,
                color: "#F5EFE0",
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="none"
              fill={`url(#grad-${title.replace(/\W/g, "")})`}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2.5}
              dot={{ r: 2.5, fill: color }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {band?.label && (
        <p className="text-[10px] text-gray-muted mt-2">
          Shaded band: {band.label}
        </p>
      )}
      {caveat && (
        <p className="text-[10px] text-amber-300/80 mt-1.5 leading-snug">{caveat}</p>
      )}
    </motion.div>
  );
}
