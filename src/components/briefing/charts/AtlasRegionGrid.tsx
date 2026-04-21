"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AtlasCountryRow } from "@/lib/briefing/types";

const EASE = [0.16, 1, 0.3, 1] as const;

interface AtlasRegionGridProps {
  countries: AtlasCountryRow[];
  selectedIds: Set<string>;
  onToggle: (c: AtlasCountryRow) => void;
}

const REGION_ORDER = [
  "Middle East",
  "Europe",
  "Asia",
  "Americas",
  "Africa",
  "Oceania",
];

const MATURITY_COLORS: Record<string, string> = {
  Leading: "#33C490",
  Advanced: "#1B7A4A",
  Developed: "#4899FF",
  Emerging: "#E7B02E",
  Foundational: "#E76363",
  Nascent: "#9696AA",
};

function colorFor(label: string | null | undefined): string {
  if (!label) return "#6b7280";
  return MATURITY_COLORS[label] ?? "#6b7280";
}

function sizeFor(score: number | null): number {
  // 22px–34px chip height based on coverage rate
  if (score == null) return 22;
  return 22 + Math.round(((Math.max(0, Math.min(100, score)) / 100) * 12));
}

interface MetricBarProps {
  label: string;
  value: number | null;
  color: string;
}

function MetricBar({ label, value, color }: MetricBarProps) {
  const pct = value == null ? 0 : Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 shrink-0 text-[9.5px] uppercase tracking-[0.16em] text-white/55">
        {label}
      </div>
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: EASE }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: color }}
        />
      </div>
      <div className="w-8 text-right text-[10px] tabular-nums text-cream/85">
        {value == null ? "—" : Math.round(value)}
      </div>
    </div>
  );
}

export function AtlasRegionGrid({
  countries,
  selectedIds,
  onToggle,
}: AtlasRegionGridProps) {
  const [hovered, setHovered] = useState<AtlasCountryRow | null>(null);

  const grouped = useMemo(() => {
    const buckets = new Map<string, AtlasCountryRow[]>();
    for (const c of countries) {
      const region = c.region || "Unknown";
      if (!buckets.has(region)) buckets.set(region, []);
      buckets.get(region)!.push(c);
    }
    buckets.forEach((list) => {
      list.sort(
        (a: AtlasCountryRow, b: AtlasCountryRow) =>
          (b.maturityScore ?? 0) - (a.maturityScore ?? 0)
      );
    });
    const sortedRegions = Array.from(buckets.keys()).sort((a, b) => {
      const ai = REGION_ORDER.indexOf(a);
      const bi = REGION_ORDER.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
    return sortedRegions.map((r) => ({ region: r, list: buckets.get(r)! }));
  }, [countries]);

  return (
    <div className="relative grid h-full grid-cols-6 gap-2">
      {grouped.slice(0, 6).map(({ region, list }, ci) => (
        <motion.div
          key={region}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: ci * 0.06, ease: EASE }}
          className="flex min-h-0 flex-col rounded-xl border border-white/[0.05] bg-white/[0.018] p-2"
        >
          <div className="mb-1.5 flex items-baseline justify-between">
            <div className="truncate text-[10px] uppercase tracking-[0.18em] text-white/55">
              {region}
            </div>
            <div className="text-[9.5px] tabular-nums text-white/35">
              {list.length}
            </div>
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden">
            {list.slice(0, 14).map((c, i) => {
              const color = colorFor(c.maturityLabel);
              const isUae = c.iso3 === "ARE";
              const id = `country:${c.iso3}`;
              const isSelected = selectedIds.has(id);
              const height = sizeFor(c.metrics.coverageRate);
              return (
                <motion.button
                  key={c.iso3}
                  type="button"
                  onClick={() => onToggle(c)}
                  onMouseEnter={() => setHovered(c)}
                  onMouseLeave={() => setHovered(null)}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: 0.2 + ci * 0.04 + i * 0.02,
                    ease: EASE,
                  }}
                  className="group relative flex shrink-0 items-center gap-1.5 overflow-hidden rounded-md px-1.5 text-left transition-all"
                  style={{
                    height,
                    background: `linear-gradient(90deg, ${color}28, ${color}10)`,
                    border: isUae
                      ? "1px solid rgba(0,168,107,0.85)"
                      : isSelected
                        ? `1px solid ${color}aa`
                        : "1px solid rgba(255,255,255,0.04)",
                    boxShadow: isUae
                      ? `inset 0 1px 0 rgba(255,255,255,0.06), 0 0 14px ${color}55`
                      : isSelected
                        ? `inset 0 1px 0 rgba(255,255,255,0.06), 0 0 10px ${color}45`
                        : "inset 0 1px 0 rgba(255,255,255,0.03)",
                  }}
                >
                  {c.flag && (
                    <span className="text-[11px] leading-none">{c.flag}</span>
                  )}
                  <span className="truncate text-[10.5px] font-medium leading-none text-cream">
                    {c.name}
                  </span>
                  <span className="ml-auto pl-1 text-[9.5px] tabular-nums text-white/55">
                    {c.maturityScore == null
                      ? "—"
                      : Math.round(c.maturityScore)}
                  </span>
                </motion.button>
              );
            })}
            {list.length > 14 && (
              <div className="mt-auto pt-1 text-center text-[9px] uppercase tracking-[0.18em] text-white/30">
                + {list.length - 14} more
              </div>
            )}
          </div>
        </motion.div>
      ))}

      {/* Hover scorecard */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="pointer-events-none absolute right-2 top-2 z-30 w-[260px] rounded-xl border border-white/10 p-3 shadow-2xl"
            style={{
              background:
                "linear-gradient(160deg, rgba(17,34,64,0.96), rgba(7,17,34,0.99))",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.07), 0 24px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div className="flex items-center gap-2">
              {hovered.flag && (
                <span className="text-base leading-none">{hovered.flag}</span>
              )}
              <div className="min-w-0">
                <div className="truncate font-playfair text-[14px] font-semibold text-cream">
                  {hovered.name}
                </div>
                <div className="text-[9.5px] uppercase tracking-[0.18em] text-white/45">
                  {hovered.region}
                  {hovered.maturityLabel ? ` · ${hovered.maturityLabel}` : ""}
                </div>
              </div>
            </div>
            <div className="mt-2.5 flex flex-col gap-1.5">
              <MetricBar
                label="Maturity"
                value={hovered.metrics.maturityScore}
                color={colorFor(hovered.maturityLabel)}
              />
              <MetricBar
                label="Coverage"
                value={hovered.metrics.coverageRate}
                color="#1B7A4A"
              />
              <MetricBar
                label="Replacement"
                value={hovered.metrics.replacementRate}
                color="#4899FF"
              />
              <MetricBar
                label="Sustainability"
                value={hovered.metrics.sustainability}
                color="#E7B02E"
              />
              <MetricBar
                label="Digital"
                value={hovered.metrics.digitalReadiness}
                color="#CA63D5"
              />
            </div>
            <div className="mt-2 text-[9px] uppercase tracking-[0.18em] text-white/35">
              Click to add to comparator
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
