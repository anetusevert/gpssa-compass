"use client";

import { SlideLayout } from "./SlideLayout";
import { SlidePlaceholder } from "../SlidePlaceholder";
import { BenchmarkLine, type BenchmarkRow } from "../charts/BenchmarkLine";
import type { BriefingSnapshot } from "@/lib/briefing/types";

interface Props {
  snapshot: BriefingSnapshot;
}

export function Slide06_GlobalBenchmarks({ snapshot }: Props) {
  const evaluated = snapshot.standards.rows.filter(
    (r) =>
      r.gpssaScore != null ||
      r.globalAverage != null ||
      r.topQuartile != null
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

  // Pick the highest-signal 5–6 standards for the slide
  const ranked = evaluated
    .slice()
    .sort((a, b) => {
      const aHas = (a.gpssaScore != null ? 2 : 0) + (a.globalAverage != null ? 1 : 0);
      const bHas = (b.gpssaScore != null ? 2 : 0) + (b.globalAverage != null ? 1 : 0);
      return bHas - aHas;
    })
    .slice(0, 6);

  const rows: BenchmarkRow[] = ranked.map((s) => ({
    id: s.slug,
    label: s.code ? `${s.code} · ${s.title}` : s.title,
    category: s.category,
    gpssa: s.gpssaScore,
    globalAverage: s.globalAverage,
    topQuartile: s.topQuartile,
    floor: s.floor,
  }));

  const meets = rows.filter(
    (r) =>
      r.gpssa != null && r.globalAverage != null && r.gpssa >= r.globalAverage
  ).length;

  return (
    <SlideLayout
      eyebrow="vs. Global Benchmarks"
      title={`GPSSA already meets ${meets} of ${rows.length} canonical benchmarks.`}
      subtitle="Plotted on a 0–100 scale: GPSSA position vs. global average and top-quartile performance per standard."
    >
      <div className="flex h-full items-center justify-center max-w-5xl mx-auto">
        <div className="w-full">
          <BenchmarkLine rows={rows} />
        </div>
      </div>
    </SlideLayout>
  );
}
