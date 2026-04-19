"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { SlideLayout } from "./SlideLayout";
import { SlidePlaceholder } from "../SlidePlaceholder";
import {
  Heatmap,
  HeatmapLegend,
  type HeatmapCell,
  type HeatmapRow,
} from "../charts/Heatmap";
import type { BriefingSnapshot } from "@/lib/briefing/types";

interface Props {
  snapshot: BriefingSnapshot;
}

const MAX_ROWS = 12;
const MAX_COLS = 8;

const LEVEL_WEIGHT: Record<string, number> = {
  Full: 3,
  Partial: 2,
  Planned: 1,
  None: 0,
};

export function Slide08_ServiceChannelHeatmap({ snapshot }: Props) {
  const { channelCapabilities, channelNames, count, capabilityLevelCounts } =
    snapshot.services;

  const { rows, cells, cols, fullPct } = useMemo(() => {
    // Group cells by service
    const byService = new Map<string, { category: string; cells: HeatmapCell[] }>();
    for (const c of channelCapabilities) {
      const entry =
        byService.get(c.serviceName) ?? { category: c.serviceCategory, cells: [] };
      entry.cells.push({
        row: c.serviceName,
        col: c.channelName,
        level: c.capabilityLevel,
      });
      byService.set(c.serviceName, entry);
    }

    // Score each service for ranking and pick the top by coverage
    const ranked = Array.from(byService.entries())
      .map(([name, v]) => {
        const score = v.cells.reduce(
          (s, c) => s + (LEVEL_WEIGHT[c.level] ?? 0),
          0
        );
        return { name, category: v.category, cells: v.cells, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_ROWS);

    // Group rows by category preserving the strongest within each
    const byCategory = new Map<string, typeof ranked>();
    for (const r of ranked) {
      const list = byCategory.get(r.category) ?? [];
      list.push(r);
      byCategory.set(r.category, list);
    }

    // Order categories by their best service score
    const categoryOrder = Array.from(byCategory.entries())
      .sort((a, b) => {
        const aBest = Math.max(...a[1].map((r) => r.score));
        const bBest = Math.max(...b[1].map((r) => r.score));
        return bBest - aBest;
      });

    const rowList: HeatmapRow[] = [];
    const flatCells: HeatmapCell[] = [];
    for (const [cat, items] of categoryOrder) {
      for (const it of items) {
        rowList.push({ label: it.name, category: cat });
        flatCells.push(...it.cells);
      }
    }

    const colList = channelNames.slice(0, MAX_COLS);

    const total =
      (capabilityLevelCounts.Full ?? 0) +
      (capabilityLevelCounts.Partial ?? 0) +
      (capabilityLevelCounts.Planned ?? 0) +
      (capabilityLevelCounts.None ?? 0);
    const fullCount = capabilityLevelCounts.Full ?? 0;
    const fullCoverage = total === 0 ? 0 : Math.round((fullCount / total) * 100);

    return { rows: rowList, cells: flatCells, cols: colList, fullPct: fullCoverage };
  }, [channelCapabilities, channelNames, capabilityLevelCounts]);

  if (channelCapabilities.length === 0) {
    return (
      <SlidePlaceholder
        pillar="Service x Channel"
        done={snapshot.completeness.services.done}
        total={snapshot.completeness.services.total}
        message="The capability matrix lights up once the services and channels research agents have finished mapping each service against each channel."
      />
    );
  }

  return (
    <SlideLayout
      eyebrow="Service x Channel Coverage"
      title="Coverage at a glance — every service, every channel, every gap."
      subtitle="Each cell scored by autonomous agents against current GPSSA channel capabilities."
    >
      <div className="flex h-full flex-col items-stretch justify-center gap-4 max-w-6xl mx-auto">
        {/* Stats strip */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Stat value={count} label="services" />
            <Stat value={cols.length} label="channels" />
            <Stat value={`${fullPct}%`} label="full coverage" highlight />
          </div>
          <HeatmapLegend />
        </div>

        {/* Matrix */}
        <motion.div
          className="overflow-hidden rounded-2xl px-5 py-4 ring-1 ring-white/[0.05]"
          style={{
            background:
              "linear-gradient(160deg, rgba(17,34,64,0.45), rgba(7,17,34,0.85))",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.05), 0 14px 40px rgba(0,0,0,0.18)",
          }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Heatmap rows={rows} cols={cols} cells={cells} compact />
        </motion.div>
      </div>
    </SlideLayout>
  );
}

interface StatProps {
  value: string | number;
  label: string;
  highlight?: boolean;
}

function Stat({ value, label, highlight }: StatProps) {
  return (
    <div
      className={`flex items-baseline gap-1.5 rounded-full px-3 py-1.5 ring-1 ${
        highlight
          ? "bg-[#00A86B]/10 ring-[#00A86B]/30"
          : "bg-white/[0.04] ring-white/10"
      }`}
    >
      <span
        className={`font-playfair text-lg font-bold tabular-nums ${
          highlight ? "text-[#33C490]" : "text-cream"
        }`}
      >
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-[0.16em] text-white/55">
        {label}
      </span>
    </div>
  );
}
