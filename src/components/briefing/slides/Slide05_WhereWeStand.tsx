"use client";

import { motion } from "framer-motion";
import { SlideLayout } from "./SlideLayout";
import { SlidePlaceholder } from "../SlidePlaceholder";
import { AnimatedRadar, type RadarSeries } from "../charts/AnimatedRadar";
import type { BriefingSnapshot } from "@/lib/briefing/types";

interface Props {
  snapshot: BriefingSnapshot;
}

const AXES = [
  { key: "maturityScore", label: "Maturity" },
  { key: "coverageRate", label: "Coverage" },
  { key: "replacementRate", label: "Replacement" },
  { key: "sustainability", label: "Sustainability" },
  { key: "digitalReadiness", label: "Digital" },
] as const;

function valuesFor(metrics: Record<string, number> | null): number[] {
  if (!metrics) return AXES.map(() => 0);
  return AXES.map((a) => Number(metrics[a.key] ?? 0));
}

export function Slide05_WhereWeStand({ snapshot }: Props) {
  const { gpssaMetrics, globalAverageMetrics, globalBestMetrics } =
    snapshot.standards;

  if (!gpssaMetrics && !globalAverageMetrics) {
    return (
      <SlidePlaceholder
        pillar="Atlas & Standards"
        done={snapshot.completeness.countries.done}
        total={snapshot.completeness.countries.total}
        message="The radar comes online once at least the UAE and a handful of comparator countries have completed their performance research pass."
      />
    );
  }

  const series: RadarSeries[] = [
    {
      name: "Global Average",
      color: "rgba(255,255,255,0.55)",
      values: valuesFor(globalAverageMetrics),
    },
    {
      name: "Global Best Practice",
      color: "rgba(45,212,191,0.95)",
      values: valuesFor(globalBestMetrics),
    },
    {
      name: "GPSSA",
      color: "rgba(0,168,107,1)",
      values: valuesFor(gpssaMetrics),
    },
  ];

  // Quick read-out of GPSSA's strongest and weakest axes
  const gpssaValues = valuesFor(gpssaMetrics);
  const indexed = AXES.map((a, i) => ({ label: a.label, value: gpssaValues[i] }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);
  const strongest = indexed[0] ?? null;
  const weakest = indexed[indexed.length - 1] ?? null;

  return (
    <SlideLayout
      eyebrow="Where GPSSA Stands"
      title="Strong on coverage. Headroom on digital and sustainability."
      subtitle="GPSSA shape mapped against global average and the top quartile of pension authorities. All five dimensions on a 0–100 scale."
    >
      <div className="grid h-full grid-cols-[1fr_320px] items-center gap-12 max-w-6xl mx-auto">
        <div className="flex items-center justify-center">
          <AnimatedRadar
            axes={AXES.map((a) => a.label)}
            series={series}
            size={460}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="text-[11px] uppercase tracking-[0.32em] text-white/45">
            Read-out
          </div>

          {strongest && (
            <motion.div
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.4 }}
              className="rounded-xl bg-[#00A86B]/10 px-4 py-3 ring-1 ring-[#00A86B]/30"
            >
              <div className="text-[10px] uppercase tracking-[0.18em] text-[#33C490]">
                Strongest
              </div>
              <div className="mt-0.5 flex items-baseline gap-2">
                <span className="font-playfair text-2xl font-bold text-cream">
                  {strongest.label}
                </span>
                <span className="text-sm tabular-nums text-[#33C490]">
                  {Math.round(strongest.value)}
                </span>
              </div>
            </motion.div>
          )}

          {weakest && weakest !== strongest && (
            <motion.div
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.55 }}
              className="rounded-xl bg-[#C5A572]/10 px-4 py-3 ring-1 ring-[#C5A572]/30"
            >
              <div className="text-[10px] uppercase tracking-[0.18em] text-[#C5A572]">
                Greatest headroom
              </div>
              <div className="mt-0.5 flex items-baseline gap-2">
                <span className="font-playfair text-2xl font-bold text-cream">
                  {weakest.label}
                </span>
                <span className="text-sm tabular-nums text-[#C5A572]">
                  {Math.round(weakest.value)}
                </span>
              </div>
            </motion.div>
          )}

          <div className="mt-4 flex flex-col gap-2">
            {series.map((s) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 1.7 }}
                className="flex items-center gap-2 text-[11px]"
              >
                <span
                  className="block h-2 w-2 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-white/65">{s.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}
