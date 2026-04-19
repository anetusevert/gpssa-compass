"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Hexagon, Plus, X } from "lucide-react";
import { SlideLayout } from "./SlideLayout";
import { SlidePlaceholder } from "../SlidePlaceholder";
import { RaceBar, type RaceBarRow } from "../charts/RaceBar";
import { AnimatedRadar, type RadarSeries } from "../charts/AnimatedRadar";
import {
  COMPARATOR_COLORS,
  useComparatorStore,
  type ComparatorRef,
} from "../store";
import type {
  BriefingSnapshot,
  PeerInstitutionRow,
} from "@/lib/briefing/types";

interface Props {
  snapshot: BriefingSnapshot;
}

const REGION_COLOR: Record<string, string> = {
  GCC: "#00A86B",
  MENA: "#33C490",
  Europe: "#2D4A8C",
  "Asia Pacific": "#2DD4BF",
  "Asia-Pacific": "#2DD4BF",
  Americas: "#C5A572",
  Africa: "#AA9CFF",
};

const GPSSA_COLOR = "rgba(0,168,107,1)";

function colorFor(region: string, isGpssa: boolean): string {
  if (isGpssa) return "#00A86B";
  return REGION_COLOR[region] ?? "rgba(255,255,255,0.55)";
}

const DEFAULT_PEER_NAMES = [
  "CPF",
  "GOSI",
  "AP6",
  "NPS",
  "Singapore",
  "Korea",
  "Sweden",
  "Saudi",
];

type ViewMode = "race" | "spider";

export function Slide07_PeerInstitutions({ snapshot }: Props) {
  const allPeers = snapshot.benchmarks.allPeers;
  const dimensions = snapshot.benchmarks.dimensionList;

  const slide7 = useComparatorStore((s) => s.slide7);
  const reset = useComparatorStore((s) => s.reset);
  const remove = useComparatorStore((s) => s.remove);
  const openPicker = useComparatorStore((s) => s.openPicker);

  const [mode, setMode] = useState<ViewMode>("race");

  // Seed defaults: pick up to 4 leading peers (CPF, GOSI, AP6, NPS) with score data.
  useEffect(() => {
    if (slide7.length > 0) return;
    const candidates = allPeers
      .filter((p) => !p.isGpssa && p.averageScore != null)
      .filter((p) =>
        DEFAULT_PEER_NAMES.some(
          (n) =>
            p.name.toLowerCase().includes(n.toLowerCase()) ||
            (p.shortName ?? "").toLowerCase().includes(n.toLowerCase()) ||
            p.country.toLowerCase().includes(n.toLowerCase())
        )
      )
      .slice(0, 4);
    // Fall back to top-by-score if none matched
    const fallback =
      candidates.length === 0
        ? allPeers.filter((p) => !p.isGpssa && p.averageScore != null).slice(0, 4)
        : candidates;
    if (fallback.length === 0) return;
    const refs: ComparatorRef[] = fallback.map((p, i) => ({
      id: `institution:${p.id}`,
      kind: "institution",
      label: p.shortName ?? p.name,
      sublabel: p.country,
      color: COMPARATOR_COLORS[i % COMPARATOR_COLORS.length],
    }));
    reset("slide7", refs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resolve each comparator to a peer-institution-style row (label + scores).
  interface ResolvedPeer {
    ref: ComparatorRef;
    peer: PeerInstitutionRow | null;
  }

  const resolved: ResolvedPeer[] = useMemo(() => {
    return slide7.map((ref) => {
      if (ref.kind === "institution") {
        const id = ref.id.split(":")[1];
        return { ref, peer: allPeers.find((p) => p.id === id) ?? null };
      }
      if (ref.kind === "country") {
        // Try to find an institution from that country
        const iso3 = ref.id.split(":")[1];
        const inst =
          allPeers.find((p) => p.countryCode?.toUpperCase() === iso3) ?? null;
        return { ref, peer: inst };
      }
      return { ref, peer: null };
    });
  }, [slide7, allPeers]);

  const gpssa = allPeers.find((p) => p.isGpssa);

  // Choose handful of dimensions to plot on the spider; cap at 8.
  const radarDimensions = useMemo(() => {
    const slugSet = new Set<string>();
    if (gpssa) Object.keys(gpssa.dimensionScores).forEach((k) => slugSet.add(k));
    resolved.forEach((r) => {
      if (r.peer) Object.keys(r.peer.dimensionScores).forEach((k) => slugSet.add(k));
    });
    const ordered = dimensions.filter((d) => slugSet.has(d.slug));
    return ordered.slice(0, 8);
  }, [dimensions, gpssa, resolved]);

  const validResolved = resolved.filter((r) => r.peer && r.peer.averageScore != null);

  if (allPeers.filter((p) => p.averageScore != null).length === 0) {
    return (
      <SlidePlaceholder
        pillar="Peer Benchmarking"
        done={allPeers.length}
        total={Math.max(allPeers.length, 8)}
        message="Race-bar comparison against CPF Singapore, GOSI KSA, NSSF, AP6 Sweden, Korea NPS and more — appears once the benchmark scoring agents have run."
      />
    );
  }

  // Race-bar rows (GPSSA + selected peers)
  const raceRows: RaceBarRow[] = [];
  if (gpssa && gpssa.averageScore != null) {
    raceRows.push({
      id: gpssa.id,
      label: gpssa.shortName ?? gpssa.name,
      sub: gpssa.country,
      value: gpssa.averageScore,
      color: GPSSA_COLOR,
      highlight: true,
    });
  }
  for (const r of validResolved) {
    raceRows.push({
      id: r.peer!.id,
      label: r.peer!.shortName ?? r.peer!.name,
      sub: r.peer!.country,
      value: r.peer!.averageScore!,
      color: r.ref.color,
    });
  }
  raceRows.sort((a, b) => b.value - a.value);

  // Spider series
  const radarSeries: RadarSeries[] = [];
  for (const r of validResolved) {
    radarSeries.push({
      name: r.ref.label,
      color: r.ref.color,
      values: radarDimensions.map((d) => r.peer!.dimensionScores[d.slug] ?? 0),
    });
  }
  if (gpssa) {
    radarSeries.push({
      name: gpssa.shortName ?? gpssa.name,
      color: GPSSA_COLOR,
      values: radarDimensions.map((d) => gpssa.dimensionScores[d.slug] ?? 0),
    });
  }

  // Dynamic title and gap subline
  const leaderRow = raceRows[0];
  const gpssaRow = raceRows.find((r) => r.id === gpssa?.id);
  let title = "GPSSA in the global frontier.";
  let subline = `Average score across ${snapshot.benchmarks.dimensions} benchmark dimensions. Higher is better.`;

  if (validResolved.length === 1) {
    title = `GPSSA vs ${validResolved[0].ref.label}.`;
  } else if (validResolved.length > 1) {
    const gccCount = validResolved.filter((r) =>
      (r.peer?.region ?? "").toUpperCase().includes("GCC")
    ).length;
    if (gccCount >= validResolved.length - 1) {
      title = `GPSSA in the GCC cohort.`;
    } else {
      title = `GPSSA vs ${validResolved[0].ref.label} + ${validResolved.length - 1} more.`;
    }
  }

  if (gpssaRow && leaderRow && leaderRow.id !== gpssaRow.id) {
    const gap = leaderRow.value - gpssaRow.value;
    const median =
      raceRows.length > 0
        ? raceRows[Math.floor(raceRows.length / 2)].value
        : null;
    const medianGap = median != null ? gpssaRow.value - median : null;
    if (gap >= 0 && medianGap != null) {
      subline =
        gap > 0
          ? `${Math.round(gap)} points behind the leader, ${
              medianGap >= 0 ? Math.round(medianGap) + " ahead" : Math.abs(Math.round(medianGap)) + " behind"
            } of the cohort median.`
          : `Tied with the leader; ${Math.abs(Math.round(medianGap))} ahead of the cohort median.`;
    } else if (gap >= 0) {
      subline = `${Math.round(gap)} points behind the leader.`;
    }
  } else if (gpssaRow && leaderRow && leaderRow.id === gpssaRow.id) {
    subline = "Leading the selected cohort.";
  }

  return (
    <SlideLayout eyebrow="vs. Peer Institutions" title={title} subtitle={subline}>
      <div className="flex h-full flex-col items-stretch justify-center gap-6 max-w-5xl mx-auto">
        {/* Toggle row */}
        <div className="flex items-center justify-between gap-3">
          <div className="text-[11px] uppercase tracking-[0.32em] text-white/45">
            {mode === "race" ? "Average score, 0–100" : `Per-dimension shape · ${radarDimensions.length} axes`}
          </div>
          <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
            <button
              type="button"
              onClick={() => setMode("race")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] transition ${
                mode === "race"
                  ? "bg-white/[0.08] text-cream"
                  : "text-white/45 hover:text-white/80"
              }`}
            >
              <BarChart3 size={12} />
              Race
            </button>
            <button
              type="button"
              onClick={() => setMode("spider")}
              disabled={radarDimensions.length < 3}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] transition disabled:cursor-not-allowed disabled:opacity-30 ${
                mode === "spider"
                  ? "bg-white/[0.08] text-cream"
                  : "text-white/45 hover:text-white/80"
              }`}
            >
              <Hexagon size={12} />
              Spider
            </button>
          </div>
        </div>

        {/* Chart area */}
        <div className="flex min-h-[360px] items-center justify-center">
          {mode === "race" ? (
            <div className="w-full">
              <RaceBar rows={raceRows} max={100} />
            </div>
          ) : (
            <div className="flex w-full items-center justify-center gap-12">
              <AnimatedRadar
                axes={radarDimensions.map((d) => d.name)}
                series={radarSeries}
                size={420}
              />
              <div className="flex flex-col gap-1.5">
                {radarSeries.map((s) => (
                  <div key={s.name} className="flex items-center gap-2 text-[11px]">
                    <span
                      className="block h-2 w-2 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-white/65">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Comparator chips */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {slide7.map((ref) => {
            const r = resolved.find((x) => x.ref.id === ref.id);
            const skipped = !r?.peer || r.peer.averageScore == null;
            const peer = r?.peer;
            void colorFor; // keep imported helper available even when not used directly
            return (
              <motion.button
                key={ref.id}
                type="button"
                onClick={() => remove("slide7", ref.id)}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`group flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] ring-1 transition ${
                  skipped
                    ? "bg-white/[0.03] text-white/40 ring-white/10 line-through decoration-white/30"
                    : "bg-white/[0.05] text-cream ring-white/15 hover:ring-white/30"
                }`}
                title={
                  skipped
                    ? `${ref.label} — no benchmark scores yet`
                    : `Remove ${ref.label}`
                }
              >
                <span
                  className="block h-2 w-2 rounded-full"
                  style={{ backgroundColor: ref.color }}
                />
                <span>{ref.label}</span>
                {peer?.averageScore != null && (
                  <span className="tabular-nums text-white/55">
                    {Math.round(peer.averageScore)}
                  </span>
                )}
                <X size={11} className="text-white/45 group-hover:text-white/80" />
              </motion.button>
            );
          })}
          <button
            type="button"
            onClick={() => openPicker("slide7")}
            className="flex items-center gap-1.5 rounded-full border border-dashed border-white/20 px-3 py-1.5 text-[12px] text-white/55 transition hover:border-white/40 hover:bg-white/[0.04] hover:text-cream"
          >
            <Plus size={12} />
            Add comparator
          </button>
        </div>
      </div>
    </SlideLayout>
  );
}
