"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Smartphone,
  Building2,
  PhoneCall,
  Handshake,
  Plug,
  MessageCircle,
  Mail,
  Wallet,
  Briefcase,
  FileText,
  HeartPulse,
  Users,
  Shield,
  GraduationCap,
  Building,
  type LucideIcon,
} from "lucide-react";

export interface HeatmapCell {
  row: string;
  col: string;
  level: string; // "Full" | "Partial" | "Planned" | "None" | other
}

export interface HeatmapRow {
  /** Display label (truncated). */
  label: string;
  /** Optional category used for grouping rows. */
  category?: string | null;
}

interface HeatmapProps {
  rows: HeatmapRow[];
  cols: string[];
  cells: HeatmapCell[];
  /** Compact mode shrinks padding/font to keep things on one screen. */
  compact?: boolean;
}

const LEVEL_GRADIENT: Record<string, string> = {
  Full: "linear-gradient(135deg, #00A86B 0%, #2DD4BF 100%)",
  Partial: "linear-gradient(135deg, rgba(0,168,107,0.55) 0%, rgba(45,212,191,0.55) 100%)",
  Planned: "linear-gradient(135deg, rgba(197,165,114,0.55) 0%, rgba(197,165,114,0.30) 100%)",
  None: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
};

const LEVEL_GLOW: Record<string, string> = {
  Full: "0 0 14px rgba(45,212,191,0.45)",
  Partial: "0 0 8px rgba(45,212,191,0.20)",
  Planned: "0 0 6px rgba(197,165,114,0.20)",
  None: "none",
};

function gradientFor(level: string): string {
  return LEVEL_GRADIENT[level] ?? LEVEL_GRADIENT.None;
}
function glowFor(level: string): string {
  return LEVEL_GLOW[level] ?? "none";
}

/** Channel icon lookup (matches the snapshot channel names). */
function iconForChannel(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (n.includes("portal") || n.includes("web")) return Globe;
  if (n.includes("mobile") || n.includes("app")) return Smartphone;
  if (n.includes("center") || n.includes("branch")) return Building2;
  if (n.includes("call")) return PhoneCall;
  if (n.includes("partner")) return Handshake;
  if (n.includes("api")) return Plug;
  if (n.includes("whatsapp") || n.includes("chat")) return MessageCircle;
  if (n.includes("email") || n.includes("mail")) return Mail;
  return Globe;
}

/** Category icon lookup. */
function iconForCategory(cat: string): LucideIcon {
  const n = cat.toLowerCase();
  if (n.includes("benefit") || n.includes("pension")) return Wallet;
  if (n.includes("contribution") || n.includes("payment")) return Briefcase;
  if (n.includes("document") || n.includes("certif")) return FileText;
  if (n.includes("medical") || n.includes("disab") || n.includes("health")) return HeartPulse;
  if (n.includes("member") || n.includes("registration")) return Users;
  if (n.includes("compliance") || n.includes("inspect")) return Shield;
  if (n.includes("retir") || n.includes("educ")) return GraduationCap;
  if (n.includes("employer")) return Building;
  return Briefcase;
}

interface TooltipState {
  x: number;
  y: number;
  row: string;
  col: string;
  level: string;
}

export function Heatmap({ rows, cols, cells, compact = true }: HeatmapProps) {
  const lookup = new Map<string, string>();
  for (const c of cells) lookup.set(`${c.row}::${c.col}`, c.level);

  const [tip, setTip] = useState<TooltipState | null>(null);

  // Group rows by category preserving original order.
  const grouped: Array<{ category: string | null; rows: HeatmapRow[] }> = [];
  for (const r of rows) {
    const cat = r.category ?? null;
    const existing = grouped[grouped.length - 1];
    if (existing && existing.category === cat) {
      existing.rows.push(r);
    } else {
      grouped.push({ category: cat, rows: [r] });
    }
  }

  const labelColWidth = compact ? "200px" : "240px";

  return (
    <div className="relative w-full">
      {/* Header row */}
      <div
        className="grid items-end pb-2"
        style={{
          gridTemplateColumns: `${labelColWidth} repeat(${cols.length}, minmax(0, 1fr))`,
        }}
      >
        <div />
        {cols.map((col, i) => {
          const Icon = iconForChannel(col);
          return (
            <motion.div
              key={`col-${col}`}
              className="flex flex-col items-center gap-1 px-1 text-center"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.04 }}
              title={col}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05] ring-1 ring-white/10">
                <Icon size={14} className="text-white/65" />
              </div>
              <div className="text-[9px] uppercase tracking-[0.12em] text-white/55 truncate w-full">
                {col}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Grouped rows */}
      <div className="flex flex-col">
        {grouped.map((g, gIdx) => {
          const CatIcon = g.category ? iconForCategory(g.category) : null;
          const baseRowIdx = grouped.slice(0, gIdx).reduce((s, x) => s + x.rows.length, 0);
          return (
            <div key={`group-${gIdx}-${g.category ?? "none"}`} className="flex flex-col">
              {g.category && (
                <motion.div
                  className="grid items-center"
                  style={{
                    gridTemplateColumns: `${labelColWidth} repeat(${cols.length}, minmax(0, 1fr))`,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.15 + gIdx * 0.08 }}
                >
                  <div className="flex items-center gap-1.5 pr-3 py-1">
                    {CatIcon && <CatIcon size={11} className="text-[#33C490]" />}
                    <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#33C490]/85 truncate">
                      {g.category}
                    </span>
                  </div>
                  <div
                    className="col-span-full ml-0 h-px bg-gradient-to-r from-[#33C490]/25 via-white/5 to-transparent"
                    style={{ gridColumn: `2 / span ${cols.length}` }}
                  />
                </motion.div>
              )}
              {g.rows.map((row, rIdx) => {
                const absIdx = baseRowIdx + rIdx;
                return (
                  <div
                    key={`row-${row.label}-${absIdx}`}
                    className="grid items-center"
                    style={{
                      gridTemplateColumns: `${labelColWidth} repeat(${cols.length}, minmax(0, 1fr))`,
                    }}
                  >
                    <motion.div
                      className="flex items-center pr-3 text-[11px] text-white/80 truncate py-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: 0.2 + absIdx * 0.03 }}
                      title={row.label}
                    >
                      {row.label}
                    </motion.div>
                    {cols.map((col, cIdx) => {
                      const level = lookup.get(`${row.label}::${col}`) ?? "None";
                      return (
                        <motion.div
                          key={`${row.label}-${col}`}
                          className="m-[3px] h-7 cursor-pointer rounded-md ring-1 ring-white/[0.05] transition-transform"
                          style={{
                            background: gradientFor(level),
                            boxShadow: glowFor(level),
                          }}
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.06 }}
                          transition={{
                            duration: 0.3,
                            delay: 0.25 + absIdx * 0.025 + cIdx * 0.02,
                          }}
                          onMouseEnter={(e) =>
                            setTip({
                              x: (e.target as HTMLElement).getBoundingClientRect().left + 16,
                              y: (e.target as HTMLElement).getBoundingClientRect().top - 8,
                              row: row.label,
                              col,
                              level,
                            })
                          }
                          onMouseLeave={() => setTip(null)}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Tooltip */}
      {tip && (
        <div
          className="pointer-events-none fixed z-[100] rounded-lg border border-white/15 bg-[#071122]/95 px-3 py-2 text-[11px] text-cream shadow-xl backdrop-blur-md"
          style={{ left: tip.x, top: tip.y, transform: "translate(-50%, -100%)" }}
        >
          <div className="font-semibold">{tip.row}</div>
          <div className="text-white/60">{tip.col}</div>
          <div className="mt-1">
            <span className="text-[10px] uppercase tracking-[0.16em] text-[#33C490]">
              {tip.level}
            </span>
          </div>
        </div>
      )}
    </div>
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
    <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-white/55">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-1.5">
          <span
            className="block h-3 w-3 rounded-sm ring-1 ring-white/[0.06]"
            style={{ background: gradientFor(it.level) }}
          />
          {it.label}
        </div>
      ))}
    </div>
  );
}
