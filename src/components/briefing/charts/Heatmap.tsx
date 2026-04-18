"use client";

import { motion } from "framer-motion";

export interface HeatmapCell {
  row: string;
  col: string;
  level: string; // "Full" | "Partial" | "Planned" | "None" | other
}

interface HeatmapProps {
  rows: string[];
  cols: string[];
  cells: HeatmapCell[];
  rowGroupOf?: (row: string) => string | null;
}

const LEVEL_COLOR: Record<string, string> = {
  Full: "rgba(0, 168, 107, 0.92)",
  Partial: "rgba(0, 168, 107, 0.45)",
  Planned: "rgba(197, 165, 114, 0.55)",
  None: "rgba(255, 255, 255, 0.04)",
};

function colorFor(level: string): string {
  return LEVEL_COLOR[level] ?? "rgba(255,255,255,0.04)";
}

export function Heatmap({ rows, cols, cells }: HeatmapProps) {
  const lookup = new Map<string, string>();
  for (const c of cells) lookup.set(`${c.row}::${c.col}`, c.level);

  return (
    <div
      className="grid w-full text-[10px]"
      style={{
        gridTemplateColumns: `minmax(160px, 220px) repeat(${cols.length}, minmax(40px, 1fr))`,
      }}
    >
      {/* Header row */}
      <div />
      {cols.map((col, i) => (
        <motion.div
          key={`col-${col}`}
          className="px-1 pb-2 text-center text-[10px] uppercase tracking-[0.14em] text-white/55 truncate"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 + i * 0.04 }}
          title={col}
        >
          {col}
        </motion.div>
      ))}

      {/* Body rows */}
      {rows.map((row, rIdx) => (
        <FragmentRow
          key={row}
          row={row}
          cols={cols}
          rIdx={rIdx}
          lookup={lookup}
        />
      ))}
    </div>
  );
}

function FragmentRow({
  row,
  cols,
  rIdx,
  lookup,
}: {
  row: string;
  cols: string[];
  rIdx: number;
  lookup: Map<string, string>;
}) {
  return (
    <>
      <motion.div
        className="flex items-center pr-3 text-[11px] text-white/75 truncate"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, delay: 0.2 + rIdx * 0.025 }}
        title={row}
      >
        {row}
      </motion.div>
      {cols.map((col, cIdx) => {
        const level = lookup.get(`${row}::${col}`) ?? "None";
        return (
          <motion.div
            key={`${row}-${col}`}
            className="m-[2px] aspect-square rounded-md ring-1 ring-white/[0.04]"
            style={{ backgroundColor: colorFor(level) }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.35,
              delay: 0.25 + rIdx * 0.025 + cIdx * 0.02,
            }}
            title={`${row} · ${col} · ${level}`}
          />
        );
      })}
    </>
  );
}

export function HeatmapLegend() {
  const items: { label: string; level: string }[] = [
    { label: "Full", level: "Full" },
    { label: "Partial", level: "Partial" },
    { label: "Planned", level: "Planned" },
    { label: "None", level: "None" },
  ];
  return (
    <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.16em] text-white/55">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-1.5">
          <span
            className="block h-3 w-3 rounded-sm ring-1 ring-white/[0.06]"
            style={{ backgroundColor: colorFor(it.level) }}
          />
          {it.label}
        </div>
      ))}
    </div>
  );
}
