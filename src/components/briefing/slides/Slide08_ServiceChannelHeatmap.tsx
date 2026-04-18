"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { SlideLayout } from "./SlideLayout";
import { SlidePlaceholder } from "../SlidePlaceholder";
import { Heatmap, HeatmapLegend, type HeatmapCell } from "../charts/Heatmap";
import type { BriefingSnapshot } from "@/lib/briefing/types";

interface Props {
  snapshot: BriefingSnapshot;
}

const MAX_ROWS = 16;

export function Slide08_ServiceChannelHeatmap({ snapshot }: Props) {
  const { channelCapabilities, channelNames, count } = snapshot.services;

  // Pick services that have at least one non-None entry, ranked by coverage
  const { rows, cells, gaps } = useMemo(() => {
    const byService = new Map<string, HeatmapCell[]>();
    for (const c of channelCapabilities) {
      const arr = byService.get(c.serviceName) ?? [];
      arr.push({
        row: c.serviceName,
        col: c.channelName,
        level: c.capabilityLevel,
      });
      byService.set(c.serviceName, arr);
    }

    const ranked = Array.from(byService.entries())
      .map(([name, arr]) => {
        const score = arr.reduce((s, c) => {
          if (c.level === "Full") return s + 3;
          if (c.level === "Partial") return s + 2;
          if (c.level === "Planned") return s + 1;
          return s;
        }, 0);
        return { name, arr, score };
      })
      .sort((a, b) => b.score - a.score);

    const top = ranked.slice(0, MAX_ROWS);
    const rowNames = top.map((r) => r.name);
    const flat = top.flatMap((r) => r.arr);

    const gapCount = flat.filter(
      (c) => c.level === "None" || c.level === "Planned"
    ).length;

    return { rows: rowNames, cells: flat, gaps: gapCount };
  }, [channelCapabilities]);

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
      title={`${count} services. ${channelNames.length} channels. ${gaps} capability gaps mapped.`}
      subtitle="Each cell scored by autonomous agents against current GPSSA channel capabilities. Green = full delivery; gold = planned; faded = no coverage."
    >
      <div className="flex h-full flex-col items-center justify-center gap-6 max-w-6xl mx-auto">
        <div className="w-full overflow-hidden rounded-2xl px-6 py-5 ring-1 ring-white/[0.05]"
          style={{
            background:
              "linear-gradient(160deg, rgba(17,34,64,0.45), rgba(7,17,34,0.85))",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.05), 0 14px 40px rgba(0,0,0,0.18)",
          }}
        >
          <Heatmap rows={rows} cols={channelNames} cells={cells} />
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.2 }}
          className="flex items-center gap-4"
        >
          <HeatmapLegend />
        </motion.div>
      </div>
    </SlideLayout>
  );
}
