"use client";

import { SlideLayout } from "./SlideLayout";
import { SlidePlaceholder } from "../SlidePlaceholder";
import { BenchmarkLine, type BenchmarkRow } from "../charts/BenchmarkLine";
import type { BriefingSnapshot } from "@/lib/briefing/types";

interface Props {
  snapshot: BriefingSnapshot;
}

export function Slide08_GlobalBenchmarks({ snapshot }: Props) {
  const evaluated = snapshot.standards.rows.filter(
    (r) =>
      r.gpssaScore != null ||
      r.globalAverage != null ||
      r.topQuartile != null ||
      r.bottomQuartile != null
  );

  if (evaluated.length === 0) {
    return (
      <SlidePlaceholder
        pillar="Standards & Compliance"
        done={snapshot.standards.evaluatedCount}
        total={snapshot.standards.count}
        message="ILO C102, ISSA Guidelines, OECD framework benchmarks render here once compliance scoring agents finish their first pass."
      />
    );
  }

  // Prefer rows where UAE has a score; fill out to 6 rows with highest-signal others.
  const withGpssa = evaluated.filter((r) => r.gpssaScore != null);
  const withoutGpssa = evaluated
    .filter((r) => r.gpssaScore == null)
    .sort((a, b) => {
      const aSig = (a.globalAverage != null ? 1 : 0) + (a.topQuartile != null ? 1 : 0) + (a.bottomQuartile != null ? 1 : 0);
      const bSig = (b.globalAverage != null ? 1 : 0) + (b.topQuartile != null ? 1 : 0) + (b.bottomQuartile != null ? 1 : 0);
      return bSig - aSig;
    });

  const TARGET = 6;
  const ranked = [
    ...withGpssa.slice(0, TARGET),
    ...withoutGpssa.slice(0, Math.max(0, TARGET - withGpssa.length)),
  ].slice(0, TARGET);

  const rows: BenchmarkRow[] = ranked.map((s) => ({
    id: s.slug,
    label: s.shortLabel,
    oneLiner: s.oneLiner,
    gpssa: s.gpssaScore,
    globalAverage: s.globalAverage,
    topQuartile: s.topQuartile,
    bottomQuartile: s.bottomQuartile,
    floor: s.floor,
  }));

  return (
    <SlideLayout
      eyebrow="vs. Global Benchmarks"
      title="Where the UAE leads, lags, and has runway."
      subtitle="Pension dimensions scored 0–100. UAE position vs the global laggard floor, the global average, and the leader frontier."
    >
      <div className="flex h-full items-center justify-center max-w-5xl mx-auto pb-4">
        <div className="w-full">
          <BenchmarkLine rows={rows} entityLabel="UAE" />
        </div>
      </div>
    </SlideLayout>
  );
}
