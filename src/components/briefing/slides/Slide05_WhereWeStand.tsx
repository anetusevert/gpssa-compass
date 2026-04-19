"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { SlideLayout } from "./SlideLayout";
import { SlidePlaceholder } from "../SlidePlaceholder";
import { AnimatedRadar, type RadarSeries } from "../charts/AnimatedRadar";
import {
  COMPARATOR_COLORS,
  useComparatorStore,
  type ComparatorRef,
} from "../store";
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

const GPSSA_COLOR = "rgba(0,168,107,1)";

function valuesFor(metrics: Record<string, number | null> | null | undefined): number[] {
  if (!metrics) return AXES.map(() => 0);
  return AXES.map((a) => Number(metrics[a.key] ?? 0));
}

interface ResolvedComparator {
  ref: ComparatorRef;
  values: number[] | null;
}

export function Slide05_WhereWeStand({ snapshot }: Props) {
  const { gpssaMetrics, globalAverageMetrics, globalBestMetrics, aggregates } =
    snapshot.standards;

  const slide5 = useComparatorStore((s) => s.slide5);
  const reset = useComparatorStore((s) => s.reset);
  const remove = useComparatorStore((s) => s.remove);
  const openPicker = useComparatorStore((s) => s.openPicker);

  // Seed defaults: Global Average + Global Best Practice (once per session).
  useEffect(() => {
    if (slide5.length > 0) return;
    const defaults: ComparatorRef[] = [];
    if (globalAverageMetrics) {
      defaults.push({
        id: "aggregate:global-average",
        kind: "aggregate",
        label: "Global Average",
        sublabel: "Mean of evaluated nations",
        color: COMPARATOR_COLORS[0],
      });
    }
    if (globalBestMetrics) {
      defaults.push({
        id: "aggregate:global-best-practice",
        kind: "aggregate",
        label: "Global Best Practice",
        sublabel: "Top quartile frontier",
        color: COMPARATOR_COLORS[1],
      });
    }
    if (defaults.length > 0) reset("slide5", defaults);
    // We intentionally only seed once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resolve each comparator to a metric vector against the 5 radar axes.
  const resolved: ResolvedComparator[] = useMemo(() => {
    return slide5.map((ref) => {
      if (ref.kind === "country") {
        const iso3 = ref.id.split(":")[1];
        const country = snapshot.atlas.countries.find((c) => c.iso3 === iso3);
        if (!country) return { ref, values: null };
        return {
          ref,
          values: valuesFor(country.metrics as Record<string, number | null>),
        };
      }
      if (ref.kind === "aggregate") {
        const id = ref.id.split(":")[1];
        if (id === "global-average")
          return { ref, values: globalAverageMetrics ? valuesFor(globalAverageMetrics) : null };
        if (id === "global-best-practice")
          return { ref, values: globalBestMetrics ? valuesFor(globalBestMetrics) : null };
        const agg = aggregates.find((a) => a.id === id);
        return { ref, values: agg ? valuesFor(agg.metrics) : null };
      }
      // Institutions and individual standards don't map cleanly to the
      // 5-metric country radar — skip on this slide.
      return { ref, values: null };
    });
  }, [slide5, snapshot.atlas.countries, globalAverageMetrics, globalBestMetrics, aggregates]);

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

  const renderable = resolved.filter((r) => r.values != null);

  const series: RadarSeries[] = [
    ...renderable.map((r) => ({
      name: r.ref.label,
      color: r.ref.color,
      values: r.values!,
    })),
    {
      name: "UAE / GPSSA",
      color: GPSSA_COLOR,
      values: valuesFor(gpssaMetrics),
    },
  ];

  // Read-out: strongest vs the strongest comparator on each axis.
  const gpssaValues = valuesFor(gpssaMetrics);
  const axisAnalysis = AXES.map((axis, i) => {
    const competitors = renderable
      .map((r) => r.values![i])
      .filter((v) => Number.isFinite(v));
    const bestCompetitor = competitors.length > 0 ? Math.max(...competitors) : 0;
    return {
      label: axis.label,
      gpssa: gpssaValues[i],
      bestCompetitor,
      gap: gpssaValues[i] - bestCompetitor,
    };
  });
  const sortedByLead = [...axisAnalysis]
    .filter((a) => a.gpssa > 0)
    .sort((a, b) => b.gap - a.gap);
  const strongest = sortedByLead[0] ?? null;
  const weakest = sortedByLead[sortedByLead.length - 1] ?? null;

  // Dynamic title
  let title = "UAE alone — add a comparator to start.";
  if (renderable.length === 1) {
    title = `UAE vs ${renderable[0].ref.label}.`;
  } else if (renderable.length > 1) {
    const first = renderable[0].ref.label;
    title = `UAE vs ${first}${
      renderable.length > 1 ? ` + ${renderable.length - 1} more` : ""
    }.`;
  }

  return (
    <SlideLayout
      eyebrow="Where GPSSA Stands"
      title={title}
      subtitle="UAE shape mapped against the comparators you choose. All five dimensions on a 0–100 scale. Tap chips to swap."
    >
      <div className="grid h-full grid-cols-[1fr_320px] items-center gap-12 max-w-6xl mx-auto">
        <div className="flex flex-col items-center justify-center gap-5">
          <AnimatedRadar
            axes={AXES.map((a) => a.label)}
            series={series}
            size={460}
          />

          {/* Comparator chips */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {slide5.map((ref) => {
              const r = resolved.find((x) => x.ref.id === ref.id);
              const skipped = !r?.values;
              return (
                <motion.button
                  key={ref.id}
                  type="button"
                  onClick={() => remove("slide5", ref.id)}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`group flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] ring-1 transition ${
                    skipped
                      ? "bg-white/[0.03] text-white/40 ring-white/10 line-through decoration-white/30"
                      : "bg-white/[0.05] text-cream ring-white/15 hover:ring-white/30"
                  }`}
                  title={
                    skipped
                      ? `${ref.label} — not compatible with this radar`
                      : `Remove ${ref.label}`
                  }
                >
                  <span
                    className="block h-2 w-2 rounded-full"
                    style={{ backgroundColor: ref.color }}
                  />
                  <span>{ref.label}</span>
                  <X size={11} className="text-white/45 group-hover:text-white/80" />
                </motion.button>
              );
            })}
            <button
              type="button"
              onClick={() => openPicker("slide5")}
              className="flex items-center gap-1.5 rounded-full border border-dashed border-white/20 px-3 py-1.5 text-[12px] text-white/55 transition hover:border-white/40 hover:bg-white/[0.04] hover:text-cream"
            >
              <Plus size={12} />
              Add comparator
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="text-[11px] uppercase tracking-[0.32em] text-white/45">
            Read-out
          </div>

          {strongest && (
            <motion.div
              key={`strongest-${strongest.label}`}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="rounded-xl bg-[#00A86B]/10 px-4 py-3 ring-1 ring-[#00A86B]/30"
            >
              <div className="text-[10px] uppercase tracking-[0.18em] text-[#33C490]">
                {strongest.gap >= 0 ? "Strongest lead" : "Strongest"}
              </div>
              <div className="mt-0.5 flex items-baseline gap-2">
                <span className="font-playfair text-2xl font-bold text-cream">
                  {strongest.label}
                </span>
                <span className="text-sm tabular-nums text-[#33C490]">
                  {Math.round(strongest.gpssa)}
                </span>
              </div>
              {renderable.length > 0 && (
                <div className="mt-1 text-[11px] text-white/50">
                  {strongest.gap >= 0
                    ? `+${Math.round(strongest.gap)} pts vs the best comparator`
                    : `${Math.round(strongest.gap)} pts vs the best comparator`}
                </div>
              )}
            </motion.div>
          )}

          {weakest && weakest.label !== strongest?.label && (
            <motion.div
              key={`weakest-${weakest.label}`}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.35 }}
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
                  {Math.round(weakest.gpssa)}
                </span>
              </div>
              {renderable.length > 0 && (
                <div className="mt-1 text-[11px] text-white/50">
                  {weakest.gap >= 0
                    ? `+${Math.round(weakest.gap)} pts ahead`
                    : `${Math.abs(Math.round(weakest.gap))} pts behind the best comparator`}
                </div>
              )}
            </motion.div>
          )}

          <div className="mt-2 flex flex-col gap-2">
            {series.map((s) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 1.5 }}
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
