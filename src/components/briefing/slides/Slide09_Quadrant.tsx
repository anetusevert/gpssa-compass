"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Globe, Building2, Plus, X } from "lucide-react";
import { SlideLayout } from "./SlideLayout";
import { QuadrantChart, type QuadrantPoint } from "../charts/QuadrantChart";
import { useComparatorStore } from "../store";
import type { BriefingSnapshot } from "@/lib/briefing/types";

const EASE = [0.16, 1, 0.3, 1] as const;

interface Props {
  snapshot: BriefingSnapshot;
}

type Mode = "country" | "institution";

const COUNTRY_DIMS: { key: keyof CountryMetrics; label: string }[] = [
  { key: "maturityScore", label: "Maturity score" },
  { key: "coverageRate", label: "Coverage" },
  { key: "replacementRate", label: "Replacement" },
  { key: "sustainability", label: "Sustainability" },
  { key: "digitalReadiness", label: "Digital readiness" },
];

interface CountryMetrics {
  maturityScore: number | null;
  coverageRate: number | null;
  replacementRate: number | null;
  sustainability: number | null;
  digitalReadiness: number | null;
}

function quadrantOf(x: number, y: number): string {
  const right = x >= 50;
  const top = y >= 50;
  if (right && top) return "Leaders";
  if (!right && top) return "Niche";
  if (right && !top) return "Challengers";
  return "Laggards";
}

export function Slide09_Quadrant({ snapshot }: Props) {
  const [mode, setMode] = useState<Mode>("country");
  const slide5 = useComparatorStore((s) => s.slide5);
  const remove = useComparatorStore((s) => s.remove);
  const openPicker = useComparatorStore((s) => s.openPicker);

  // Default axes per mode
  const countryDimList = useMemo(() => COUNTRY_DIMS, []);
  const institutionDimList = useMemo(
    () => snapshot.benchmarks.dimensionList,
    [snapshot]
  );

  const [xKey, setXKey] = useState<string>(COUNTRY_DIMS[1].key); // Coverage
  const [yKey, setYKey] = useState<string>(COUNTRY_DIMS[3].key); // Sustainability

  // When mode flips, pick sensible defaults
  useEffect(() => {
    if (mode === "country") {
      setXKey(COUNTRY_DIMS[1].key);
      setYKey(COUNTRY_DIMS[3].key);
    } else if (institutionDimList.length >= 2) {
      setXKey(institutionDimList[0].slug);
      setYKey(institutionDimList[1].slug);
    }
  }, [mode, institutionDimList]);

  const dimList =
    mode === "country"
      ? countryDimList.map((d) => ({ slug: d.key, name: d.label }))
      : institutionDimList.map((d) => ({ slug: d.slug, name: d.name }));

  const xLabel =
    dimList.find((d) => d.slug === xKey)?.name ??
    (dimList[0]?.name ?? "");
  const yLabel =
    dimList.find((d) => d.slug === yKey)?.name ??
    (dimList[1]?.name ?? "");

  const points: QuadrantPoint[] = useMemo(() => {
    if (mode === "country") {
      const selectedIds = new Set(
        slide5.filter((r) => r.kind === "country").map((r) => r.id)
      );
      return snapshot.atlas.countries
        .map((c) => {
          const x = (c.metrics as Record<string, number | null>)[xKey];
          const y = (c.metrics as Record<string, number | null>)[yKey];
          if (x == null || y == null) return null;
          const id = `country:${c.iso3}`;
          const isUae = c.iso3 === "ARE";
          const ref = slide5.find((r) => r.id === id);
          let kind: QuadrantPoint["kind"] = "default";
          let color = "rgba(255,255,255,0.32)";
          if (isUae) {
            kind = "uae";
            color = "#33C490";
          } else if (selectedIds.has(id) && ref) {
            kind = "selected";
            color = ref.color;
          }
          return {
            id,
            name: isUae ? "UAE" : c.name,
            flag: c.flag,
            x,
            y,
            kind,
            color,
          } as QuadrantPoint;
        })
        .filter((p): p is QuadrantPoint => p !== null);
    }
    // institution mode
    const selectedIds = new Set(
      slide5.filter((r) => r.kind === "institution").map((r) => r.id)
    );
    return snapshot.benchmarks.allPeers
      .map((p) => {
        const x = p.dimensionScores[xKey];
        const y = p.dimensionScores[yKey];
        if (x == null || y == null) return null;
        const id = `institution:${p.id}`;
        const ref = slide5.find((r) => r.id === id);
        let kind: QuadrantPoint["kind"] = "default";
        let color = "rgba(255,255,255,0.32)";
        if (p.isGpssa) {
          kind = "uae";
          color = "#33C490";
        } else if (selectedIds.has(id) && ref) {
          kind = "selected";
          color = ref.color;
        }
        return {
          id,
          name: p.shortName ?? p.name,
          x,
          y,
          kind,
          color,
        } as QuadrantPoint;
      })
      .filter((p): p is QuadrantPoint => p !== null);
  }, [mode, snapshot, slide5, xKey, yKey]);

  // Dynamic action sub-line
  const subLine = useMemo(() => {
    const uae = points.find((p) => p.kind === "uae");
    if (!uae) {
      return mode === "country"
        ? "UAE has no score on the chosen dimensions yet."
        : "GPSSA has no score on the chosen dimensions yet.";
    }
    const total = points.length;
    const ahead = points.filter(
      (p) => p.kind !== "uae" && p.x + p.y < uae.x + uae.y
    ).length;
    const q = quadrantOf(uae.x, uae.y);
    return `On ${xLabel} × ${yLabel}, the UAE sits in the ${q} quadrant — ahead of ${ahead} of ${total - 1} ${mode === "country" ? "peer countries" : "peer institutions"}.`;
  }, [points, mode, xLabel, yLabel]);

  return (
    <SlideLayout
      eyebrow="Compare · Quadrant"
      title="Pick the two axes that matter."
      subtitle={subLine}
    >
      <div className="flex h-full flex-col gap-3">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            {/* Mode toggle */}
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

            <AxisSelect
              label="X"
              value={xKey}
              onChange={setXKey}
              options={dimList.map((d) => ({ value: d.slug, label: d.name }))}
            />
            <AxisSelect
              label="Y"
              value={yKey}
              onChange={setYKey}
              options={dimList.map((d) => ({ value: d.slug, label: d.name }))}
            />
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

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15, ease: EASE }}
          className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.018] p-2"
        >
          <QuadrantChart data={points} xLabel={xLabel} yLabel={yLabel} />
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

function AxisSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[10.5px] text-cream">
      <span className="text-white/45">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer bg-transparent pr-1 text-cream outline-none"
        style={{ colorScheme: "dark" }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#071122]">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
