"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Globe, Building2, Plus, X } from "lucide-react";
import { SlideLayout } from "./SlideLayout";
import { AnimatedRadar, type RadarSeries } from "../charts/AnimatedRadar";
import { useComparatorStore } from "../store";
import type {
  AtlasCountryRow,
  BriefingSnapshot,
  PeerInstitutionRow,
} from "@/lib/briefing/types";

const EASE = [0.16, 1, 0.3, 1] as const;

interface Props {
  snapshot: BriefingSnapshot;
}

type Mode = "country" | "institution";

interface Axis {
  key: string;
  label: string;
}

const COUNTRY_AXES: Axis[] = [
  { key: "maturityScore", label: "Maturity" },
  { key: "coverageRate", label: "Coverage" },
  { key: "replacementRate", label: "Adequacy" },
  { key: "sustainability", label: "Sustainability" },
  { key: "digitalReadiness", label: "Digital" },
];

const UAE_COLOR = "#33C490";

function readCountry(c: AtlasCountryRow, key: string): number {
  const v = (c.metrics as Record<string, number | null>)[key];
  return typeof v === "number" ? Math.max(0, Math.min(100, v)) : 0;
}

function readPeer(p: PeerInstitutionRow, key: string): number {
  const v = p.dimensionScores[key];
  return typeof v === "number" ? Math.max(0, Math.min(100, v)) : 0;
}

export function Slide09_Quadrant({ snapshot }: Props) {
  const [mode, setMode] = useState<Mode>("country");
  const slide5 = useComparatorStore((s) => s.slide5);
  const remove = useComparatorStore((s) => s.remove);
  const openPicker = useComparatorStore((s) => s.openPicker);

  const institutionAxes: Axis[] = useMemo(
    () =>
      snapshot.benchmarks.dimensionList.map((d) => ({
        key: d.slug,
        label: d.name,
      })),
    [snapshot.benchmarks.dimensionList]
  );

  const axes: Axis[] = mode === "country" ? COUNTRY_AXES : institutionAxes.slice(0, 7);

  // Build series — UAE / GPSSA always first, then selected comparators.
  const series: RadarSeries[] = useMemo(() => {
    const out: RadarSeries[] = [];

    if (mode === "country") {
      const uae = snapshot.atlas.countries.find((c) => c.iso3 === "ARE");
      if (uae) {
        out.push({
          name: "UAE",
          color: UAE_COLOR,
          values: axes.map((a) => readCountry(uae, a.key)),
        });
      }

      // Global average reference, if present in standards aggregates
      if (snapshot.standards.globalAverageMetrics) {
        const m = snapshot.standards.globalAverageMetrics;
        out.push({
          name: "Global average",
          color: "rgba(255,255,255,0.55)",
          values: axes.map((a) => {
            const v = m[a.key];
            return typeof v === "number" ? Math.max(0, Math.min(100, v)) : 0;
          }),
        });
      }

      const refs = slide5.filter((r) => r.kind === "country");
      for (const ref of refs) {
        const iso = ref.id.replace(/^country:/, "");
        const c = snapshot.atlas.countries.find((cc) => cc.iso3 === iso);
        if (!c) continue;
        out.push({
          name: c.name,
          color: ref.color,
          values: axes.map((a) => readCountry(c, a.key)),
        });
      }
    } else {
      const gpssa = snapshot.benchmarks.allPeers.find((p) => p.isGpssa);
      if (gpssa) {
        out.push({
          name: gpssa.shortName ?? gpssa.name,
          color: UAE_COLOR,
          values: axes.map((a) => readPeer(gpssa, a.key)),
        });
      }
      const refs = slide5.filter((r) => r.kind === "institution");
      for (const ref of refs) {
        const id = ref.id.replace(/^institution:/, "");
        const p = snapshot.benchmarks.allPeers.find((pp) => pp.id === id);
        if (!p) continue;
        out.push({
          name: p.shortName ?? p.name,
          color: ref.color,
          values: axes.map((a) => readPeer(p, a.key)),
        });
      }
    }

    return out;
  }, [mode, axes, snapshot, slide5]);

  // Action sub-line — average score gap UAE vs cohort.
  const subLine = useMemo(() => {
    if (series.length === 0) {
      return mode === "country"
        ? "Pick countries to compare against the UAE on the same dimensions."
        : "Pick peer institutions to compare against GPSSA across all scoring dimensions.";
    }
    const us = series[0];
    const usAvg = us.values.reduce((s, v) => s + v, 0) / us.values.length;
    const others = series.slice(1);
    if (others.length === 0) {
      return `${us.name}: average score ${Math.round(usAvg)}/100 across ${axes.length} dimensions.`;
    }
    const otherAvg =
      others
        .flatMap((s) => s.values)
        .reduce((s, v) => s + v, 0) /
      (others.flatMap((s) => s.values).length || 1);
    const gap = Math.round(usAvg - otherAvg);
    return gap >= 0
      ? `${us.name} leads the comparator group by ~${gap} points on average across ${axes.length} dimensions.`
      : `${us.name} trails the comparator group by ~${Math.abs(gap)} points on average — clear runway on ${axes.length} dimensions.`;
  }, [series, axes, mode]);

  return (
    <SlideLayout
      eyebrow="Compare · Spider"
      title="One picture. Every dimension. Every gap."
      subtitle={subLine}
    >
      <div className="flex h-full flex-col gap-3">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg bg-white/[0.04] p-0.5 ring-1 ring-white/10">
              <ModeButton
                active={mode === "country"}
                onClick={() => setMode("country")}
                Icon={Globe}
                label="Countries"
              />
              <ModeButton
                active={mode === "institution"}
                onClick={() => setMode("institution")}
                Icon={Building2}
                label="Institutions"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {slide5.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {slide5.map((r) => (
                  <motion.button
                    key={r.id}
                    type="button"
                    onClick={() => remove("slide5", r.id)}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="group inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[10px] text-cream"
                    style={{
                      background: `${r.color}1F`,
                      border: `1px solid ${r.color}55`,
                    }}
                    title="Remove from comparator"
                  >
                    {r.flag && <span className="leading-none">{r.flag}</span>}
                    <span className="font-medium">{r.label}</span>
                    <X
                      size={10}
                      className="text-white/45 transition-colors group-hover:text-white"
                    />
                  </motion.button>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => openPicker("slide5")}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10.5px] text-cream transition hover:bg-white/[0.1]"
            >
              <Plus size={11} />
              <span className="uppercase tracking-[0.16em]">Add</span>
            </button>
          </div>
        </div>

        {/* Spider area */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15, ease: EASE }}
          className="grid min-h-0 flex-1 grid-cols-12 gap-3"
        >
          {/* Radar */}
          <div className="col-span-9 relative flex min-h-0 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.018] p-2">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, rgba(51,196,144,0.06) 0%, transparent 65%)",
              }}
            />
            {series.length > 0 ? (
              <AnimatedRadar
                axes={axes.map((a) => a.label)}
                series={series}
                size={520}
              />
            ) : (
              <div className="text-center text-[12px] text-white/45">
                Pick at least one comparator to render the spider.
              </div>
            )}
          </div>

          {/* Legend / score table */}
          <aside className="col-span-3 flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.018] p-3">
            <div className="mb-2 text-[9.5px] uppercase tracking-[0.2em] text-white/45">
              Series
            </div>
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
              {series.map((s) => {
                const avg = Math.round(
                  s.values.reduce((acc, v) => acc + v, 0) / (s.values.length || 1)
                );
                return (
                  <div
                    key={s.name}
                    className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-sm"
                          style={{ background: s.color }}
                        />
                        <span className="truncate text-[11.5px] font-medium text-cream">
                          {s.name}
                        </span>
                      </div>
                      <span className="font-playfair text-[12px] font-semibold tabular-nums text-cream/85">
                        {avg}
                      </span>
                    </div>
                  </div>
                );
              })}
              {series.length === 0 && (
                <div className="text-[11px] text-white/40">
                  No series yet — add comparators to populate.
                </div>
              )}
            </div>
            <div className="mt-2 text-[9px] uppercase tracking-[0.18em] text-white/35">
              {axes.length} dimensions · scored 0–100
            </div>
          </aside>
        </motion.div>
      </div>
    </SlideLayout>
  );
}

function ModeButton({
  active,
  onClick,
  Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  Icon: typeof Globe;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.16em] transition ${
        active
          ? "bg-white/[0.08] text-cream"
          : "text-white/50 hover:bg-white/[0.04] hover:text-white/85"
      }`}
    >
      <Icon size={11} />
      {label}
    </button>
  );
}
