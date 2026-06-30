"use client";

import { motion } from "framer-motion";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const EASE = [0.16, 1, 0.3, 1] as const;

const BAR = "#2D4A8C";
const LINE = "#E9A23B";
const HOT = "#E76363";

export interface ParetoDatum {
  label: string;
  count: number;
  cumulativePct: number;
  vital?: boolean; // part of the "vital few" (~20% causing ~80%)
}

/**
 * Pareto chart: defect counts (bars, desc) + cumulative % (line) on a second axis.
 * Bars in the "vital few" are highlighted so the 80/20 cut-off is visible.
 */
export function ParetoChart({ data }: { data: ParetoDatum[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="h-72 w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 40, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="label"
            tick={{ fill: "#9ca3af", fontSize: 10 }}
            angle={-35}
            textAnchor="end"
            interval={0}
            height={60}
          />
          <YAxis yAxisId="left" tick={{ fill: "#9ca3af", fontSize: 10 }} />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fill: "#9ca3af", fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(13,20,38,0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              fontSize: 12,
            }}
            formatter={((value: number, name: string) =>
              name === "cumulativePct"
                ? [`${value}%`, "Cumulative"]
                : [String(value), "Defects"]) as never}
          />
          <Bar yAxisId="left" dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.vital ? HOT : BAR} />
            ))}
          </Bar>
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cumulativePct"
            stroke={LINE}
            strokeWidth={2}
            dot={{ r: 3, fill: LINE }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
