"use client";

/**
 * Channel Capabilities — guided three-section narrative
 *
 *   1. Channel Mix at a Glance        — six channel KPI tiles + omnichannel headline.
 *   2. Service-by-Channel Coverage    — full coverage matrix with sticky header.
 *   3. How Our Channels Compare       — full-width benchmark cockpit (rail picker, dial, radar, gap table).
 *
 * Every service in the database is routed via the heuristic classifier so the
 * coverage matrix never silently drops a row.
 */

import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Globe2,
  Layers,
  Radio,
  Sparkles,
  Code2,
  ArrowDown,
  Scale,
  CheckCircle2,
  Filter,
  RotateCcw,
  Telescope,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { StatBar, type StatBarItem } from "@/components/ui/StatBar";
import { COUNTRIES } from "@/lib/countries/catalog";

import {
  CHANNELS,
  CHANNEL_LEVELS,
  CHANNEL_LEVEL_SCORES,
  CHANNEL_LEVEL_COLORS,
  type Channel,
  type ChannelLevel,
  type ChannelSlug,
  classifyServiceFunction,
  UNCLASSIFIED_FUNCTION,
  SERVICE_FUNCTIONS_WITH_OTHER,
} from "@/lib/taxonomy";

import { ComparatorPicker } from "@/components/comparator/ComparatorPicker";
import { ComplianceDial } from "@/components/comparator/ComplianceDial";
import { RangeBandRadar } from "@/components/comparator/RangeBandRadar";
import { useComparators } from "@/lib/comparator/hooks";
import type { ComparatorOption, ComparatorMetric } from "@/lib/comparator/types";
import { MandateBasisChip } from "@/components/mandate/MandateBasisChip";

/* ═══════════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════════ */

interface ServiceChannelRow {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  channels: Record<ChannelSlug, ChannelLevel>;
  notes?: string;
}

interface IntlChannelRow {
  countryIso3: string;
  countryName: string;
  id: string;
  name: string;
  category: string;
  channels: Record<ChannelSlug, ChannelLevel>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Static seed
   ═══════════════════════════════════════════════════════════════════════════ */

const STATIC_SERVICE_MATRIX: ServiceChannelRow[] = [
  { id: "s-01", name: "Registration of an Insured", category: "Employer", channels: { portal: "Full", mobile: "Partial", centers: "Full", call: "Partial", partner: "Planned", api: "Planned" } },
  { id: "s-02", name: "Employers Registration", category: "Employer", channels: { portal: "Full", mobile: "Partial", centers: "Full", call: "Full", partner: "None", api: "Partial" } },
  { id: "s-10", name: "Merge Service Period — Civil", category: "Insured", channels: { portal: "Partial", mobile: "None", centers: "Full", call: "Partial", partner: "None", api: "Planned" } },
  { id: "s-11", name: "Purchase of Service Years", category: "Insured", channels: { portal: "Partial", mobile: "Planned", centers: "Full", call: "Partial", partner: "None", api: "None" } },
  { id: "s-13", name: "Pension Advisory Service", category: "Insured", channels: { portal: "Partial", mobile: "Partial", centers: "Full", call: "Full", partner: "None", api: "None" } },
  { id: "s-17", name: "Beneficiary Registration", category: "Beneficiary", channels: { portal: "Planned", mobile: "None", centers: "Full", call: "Partial", partner: "None", api: "Planned" } },
  { id: "s-19", name: "Report a Death", category: "Beneficiary", channels: { portal: "Partial", mobile: "Planned", centers: "Full", call: "Full", partner: "Partial", api: "Planned" } },
  { id: "s-20", name: "Agent Enrollment", category: "Agent/Guardian", channels: { portal: "Partial", mobile: "None", centers: "Full", call: "Partial", partner: "None", api: "None" } },
  { id: "s-23", name: "Registration of GCC Nationals", category: "GCC", channels: { portal: "Partial", mobile: "Partial", centers: "Full", call: "Partial", partner: "Partial", api: "Planned" } },
  { id: "s-25", name: "End of Service — GCC Nationals", category: "GCC", channels: { portal: "Partial", mobile: "None", centers: "Full", call: "Full", partner: "Partial", api: "Planned" } },
  { id: "s-27", name: "End of Service — Military", category: "Military", channels: { portal: "None", mobile: "None", centers: "Full", call: "Partial", partner: "None", api: "None" } },
  { id: "s-28", name: "Merge Service Period — Military", category: "Military", channels: { portal: "None", mobile: "None", centers: "Full", call: "Partial", partner: "None", api: "Planned" } },
  { id: "s-29", name: "Generate Certificates", category: "General", channels: { portal: "Full", mobile: "Full", centers: "Partial", call: "Partial", partner: "None", api: "Partial" } },
  { id: "s-30", name: "Submit Complaint", category: "General", channels: { portal: "Partial", mobile: "Partial", centers: "Full", call: "Full", partner: "None", api: "Planned" } },
  { id: "s-31", name: "Submit Inquiry / Suggestion", category: "General", channels: { portal: "Full", mobile: "Partial", centers: "Partial", call: "Full", partner: "None", api: "None" } },
];

/* ═══════════════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════════════ */

function channelMaturity(rows: { channels: Record<ChannelSlug, ChannelLevel> }[], slug: ChannelSlug): number {
  if (rows.length === 0) return 0;
  const sum = rows.reduce((acc, r) => acc + CHANNEL_LEVEL_SCORES[r.channels[slug] ?? "None"], 0);
  return Math.round(sum / rows.length);
}

function channelDistribution(rows: { channels: Record<ChannelSlug, ChannelLevel> }[], slug: ChannelSlug) {
  const dist = { Full: 0, Partial: 0, Planned: 0, None: 0 };
  for (const r of rows) {
    dist[r.channels[slug] ?? "None"] += 1;
  }
  return dist;
}

function maturityBand(score: number): string {
  if (score >= 75) return "Mature";
  if (score >= 50) return "Progressing";
  if (score >= 30) return "Foundational";
  if (score > 0) return "Emerging";
  return "Absent";
}

/* ═══════════════════════════════════════════════════════════════════════════
   Section 1 — Channel KPI tile (flat, accent bar)
   ═══════════════════════════════════════════════════════════════════════════ */

function ChannelTile({
  channel,
  rows,
  index,
  active,
  onClick,
}: {
  channel: Channel;
  rows: ServiceChannelRow[];
  index: number;
  active: boolean;
  onClick: () => void;
}) {
  const score = channelMaturity(rows, channel.slug as ChannelSlug);
  const dist = channelDistribution(rows, channel.slug as ChannelSlug);
  const band = maturityBand(score);

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className={`group relative text-left rounded-xl bg-white/[0.025] border p-4 overflow-hidden transition-colors ${
        active
          ? "border-cream/30 bg-white/[0.05]"
          : "border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.04]"
      }`}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ backgroundColor: channel.color }}
      />
      <div className="pl-2">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-cream leading-tight">{channel.label}</h3>
            <span className="text-[9px] uppercase tracking-wider text-gray-muted">{channel.osiPillar}</span>
          </div>
          <Radio size={12} style={{ color: channel.color }} className="shrink-0 mt-0.5" />
        </div>
        <p className="text-[10px] text-gray-muted/90 line-clamp-2 mb-3 leading-snug min-h-[28px]">
          {channel.description}
        </p>

        <div className="flex items-baseline justify-between mb-2">
          <span className="text-2xl font-bold text-cream tabular-nums leading-none">{score}</span>
          <span className="text-[10px] text-gray-muted">{band}</span>
        </div>

        <div className="h-1.5 rounded-full overflow-hidden flex bg-white/[0.04]">
          {(CHANNEL_LEVELS as readonly ChannelLevel[]).map((lvl) => {
            const w = rows.length === 0 ? 0 : (dist[lvl] / rows.length) * 100;
            if (w === 0) return null;
            return (
              <motion.div
                key={lvl}
                initial={{ width: 0 }}
                animate={{ width: `${w}%` }}
                transition={{ duration: 0.6, delay: 0.15 + index * 0.03 }}
                style={{ backgroundColor: CHANNEL_LEVEL_COLORS[lvl] }}
                className="h-full"
                title={`${lvl}: ${dist[lvl]}`}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-1.5 text-[9px] text-gray-muted">
          <span><span className="text-cream font-semibold tabular-nums">{dist.Full}</span> Full</span>
          <span><span className="text-cream/80 tabular-nums">{dist.Partial}</span> Partial</span>
          <span className="tabular-nums">{dist.Planned} Planned</span>
        </div>
      </div>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Section 2 — Coverage matrix
   ═══════════════════════════════════════════════════════════════════════════ */

interface CoverageRow {
  fnSlug: string;
  fnLabel: string;
  fnColor: string;
  values: { ch: Channel; v: number }[];
  n: number;
}

function buildCoverage(rows: ServiceChannelRow[]): CoverageRow[] {
  const grid = new Map<string, Map<ChannelSlug, number>>();
  const counts = new Map<string, number>();
  for (const fn of SERVICE_FUNCTIONS_WITH_OTHER) {
    grid.set(fn.slug, new Map());
    counts.set(fn.slug, 0);
  }
  for (const r of rows) {
    const fn = classifyServiceFunction({ name: r.name, description: r.description, category: r.category });
    const fnGrid = grid.get(fn.slug)!;
    counts.set(fn.slug, (counts.get(fn.slug) ?? 0) + 1);
    for (const ch of CHANNELS) {
      const lvl = r.channels[ch.slug as ChannelSlug] ?? "None";
      const cur = fnGrid.get(ch.slug as ChannelSlug) ?? 0;
      fnGrid.set(ch.slug as ChannelSlug, cur + CHANNEL_LEVEL_SCORES[lvl]);
    }
  }
  const result: CoverageRow[] = [];
  for (const fn of SERVICE_FUNCTIONS_WITH_OTHER) {
    const n = counts.get(fn.slug) ?? 0;
    if (n === 0) continue;
    const fnGrid = grid.get(fn.slug)!;
    const values = CHANNELS.map((ch) => ({
      ch,
      v: Math.round((fnGrid.get(ch.slug as ChannelSlug) ?? 0) / n),
    }));
    result.push({ fnSlug: fn.slug, fnLabel: fn.shortLabel, fnColor: fn.color, values, n });
  }
  return result;
}

function CoverageMatrix({ rows }: { rows: ServiceChannelRow[] }) {
  const cells = useMemo(() => buildCoverage(rows), [rows]);

  if (cells.length === 0) {
    return <div className="text-center text-xs text-gray-muted py-12">No services to flow.</div>;
  }

  return (
    <div className="rounded-xl bg-white/[0.025] border border-white/[0.06] overflow-hidden">
      {/* Header row — sticky inside the matrix */}
      <div
        className="grid items-end sticky top-0 z-10 bg-navy/90 backdrop-blur-md border-b border-white/[0.06]"
        style={{ gridTemplateColumns: `200px repeat(${CHANNELS.length}, 1fr)` }}
      >
        <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-gray-muted">Branch</div>
        {CHANNELS.map((ch) => (
          <div key={ch.slug} className="px-2 py-2 text-center">
            <div
              className="inline-flex items-center justify-center w-6 h-6 rounded-md mb-1"
              style={{ backgroundColor: `${ch.color}22` }}
            >
              <Radio size={11} style={{ color: ch.color }} />
            </div>
            <p className="text-[10px] text-cream font-medium leading-tight">{ch.shortLabel}</p>
            <p className="text-[8px] text-gray-muted truncate">{ch.osiPillar}</p>
          </div>
        ))}
      </div>

      {cells.map((row, rowIdx) => (
        <motion.div
          key={row.fnSlug}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: Math.min(rowIdx, 12) * 0.025 }}
          className="grid border-t border-white/[0.05] hover:bg-white/[0.02] transition-colors"
          style={{ gridTemplateColumns: `200px repeat(${CHANNELS.length}, 1fr)` }}
        >
          <div className="flex items-center gap-2 px-3 py-2.5">
            <span className="w-1 h-7 rounded-full" style={{ backgroundColor: row.fnColor }} />
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-cream truncate">{row.fnLabel}</p>
              <p className="text-[9px] text-gray-muted">{row.n} service{row.n !== 1 ? "s" : ""}</p>
            </div>
          </div>
          {row.values.map(({ ch, v }) => (
            <div key={ch.slug} className="px-2 py-2 flex flex-col items-center justify-center">
              <div className="w-full h-7 rounded-md relative overflow-hidden bg-white/[0.04]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${v}%` }}
                  transition={{ duration: 0.5, delay: Math.min(rowIdx, 12) * 0.02 + 0.1 }}
                  className="h-full rounded-md"
                  style={{ background: ch.color, opacity: 0.6 + (v / 100) * 0.4 }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-semibold text-cream tabular-nums z-10">
                  {v}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Section 3 — Cockpit
   ═══════════════════════════════════════════════════════════════════════════ */

function ChannelCockpit({
  rows,
  comparator,
  setComparator,
  comparatorOptions,
  comparatorLoading,
  intl,
}: {
  rows: ServiceChannelRow[];
  comparator: ComparatorOption | null;
  setComparator: (c: ComparatorOption | null) => void;
  comparatorOptions: ComparatorOption[];
  comparatorLoading: boolean;
  intl: IntlChannelRow[];
}) {
  const [refMaturity, setRefMaturity] = useState<Record<string, number> | null>(null);
  const [refLoading, setRefLoading] = useState(false);

  useEffect(() => {
    if (!comparator) {
      setRefMaturity(null);
      return;
    }
    let cancelled = false;
    async function load() {
      if (!comparator) return;
      setRefLoading(true);
      try {
        if (comparator.kind === "computed") {
          const res = await fetch(`/api/references/computed/${comparator.id}`);
          if (!res.ok) throw new Error("ref");
          const data = await res.json();
          const out: Record<string, number> = {};
          for (const ch of CHANNELS) {
            out[ch.slug] = Number(data.payload?.channelMaturity?.[ch.slug] ?? 0);
          }
          if (!cancelled) setRefMaturity(out);
        } else if (comparator.kind === "country") {
          const intlForCountry = intl.filter((s) => s.countryIso3 === comparator.id);
          const out: Record<string, number> = {};
          for (const ch of CHANNELS) out[ch.slug] = channelMaturity(intlForCountry, ch.slug as ChannelSlug);
          if (!cancelled) setRefMaturity(out);
        } else {
          const out: Record<string, number> = {};
          for (const ch of CHANNELS) {
            out[ch.slug] = ch.standardSlugs.includes(comparator.id) ? 80 : 30;
          }
          if (!cancelled) setRefMaturity(out);
        }
      } finally {
        if (!cancelled) setRefLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [comparator, intl]);

  const headlineGpssa = useMemo(() => {
    if (rows.length === 0) return 0;
    const all = CHANNELS.map((ch) => channelMaturity(rows, ch.slug as ChannelSlug));
    return Math.round(all.reduce((a, b) => a + b, 0) / all.length);
  }, [rows]);

  const headlineRef = useMemo(() => {
    if (!refMaturity) return undefined;
    const vals = Object.values(refMaturity);
    if (vals.length === 0) return undefined;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [refMaturity]);

  const metrics: ComparatorMetric[] = useMemo(() => {
    return CHANNELS.map((ch) => ({
      label: ch.shortLabel,
      key: ch.slug,
      gpssa: channelMaturity(rows, ch.slug as ChannelSlug),
      reference: refMaturity?.[ch.slug] ?? 0,
      pillar: ch.osiPillar,
    }));
  }, [rows, refMaturity]);

  const headlineGap = comparator && headlineRef != null ? headlineGpssa - headlineRef : 0;

  const presets = useMemo(() => {
    const findOpt = (kind: ComparatorOption["kind"], id: string) =>
      comparatorOptions.find((o) => o.kind === kind && o.id === id);
    return [
      findOpt("standard", "un-egov-survey"),
      findOpt("computed", "gcc-average"),
      findOpt("country", "SGP"),
    ].filter(Boolean) as ComparatorOption[];
  }, [comparatorOptions]);

  return (
    <div className="space-y-4">
      <ComparatorPicker
        options={comparatorOptions}
        selected={comparator}
        onChange={setComparator}
        loading={comparatorLoading}
        variant="rail"
      />

      {!comparator ? (
        <div className="rounded-2xl bg-white/[0.025] border border-white/[0.06] p-8 text-center">
          <Telescope size={28} className="text-gpssa-green/60 mx-auto mb-3" />
          <h3 className="font-playfair text-lg text-cream mb-1">Pick a comparator above to begin</h3>
          <p className="text-xs text-gray-muted max-w-md mx-auto mb-5">
            We&apos;ll compare GPSSA&apos;s six-channel mix against your chosen reference and show every channel
            gap on a single radar.
          </p>
          {presets.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-gray-muted/80 mr-1">Try:</span>
              {presets.map((opt) => (
                <button
                  key={`${opt.kind}-${opt.id}`}
                  onClick={() => setComparator(opt)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.18] text-[11px] text-cream transition-colors"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: opt.color }} />
                  {opt.kind === "country" && opt.iso3 && <CountryFlag code={opt.iso3} size="xs" />}
                  Compare to {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-4 space-y-3">
              <div className="rounded-xl bg-white/[0.025] border border-white/[0.06] p-5">
                <p className="text-[10px] uppercase tracking-wider text-gray-muted mb-4 text-center">
                  Composite channel maturity
                </p>
                <div className="flex justify-center">
                  <ComplianceDial
                    score={headlineGpssa}
                    reference={headlineRef}
                    label="Channel Maturity"
                    sublabel={`vs ${comparator.shortLabel}`}
                    size="lg"
                    color="#0EA5E9"
                    band={maturityBand(headlineGpssa)}
                  />
                </div>
                <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-around text-center">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-gray-muted">GPSSA</p>
                    <p className="text-xl font-bold tabular-nums text-cream">{headlineGpssa}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-gray-muted">{comparator.shortLabel}</p>
                    <p className="text-xl font-bold tabular-nums text-cream">{headlineRef ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-gray-muted">Δ</p>
                    <p
                      className="text-xl font-bold tabular-nums"
                      style={{ color: headlineGap >= 0 ? "#10B981" : "#F59E0B" }}
                    >
                      {headlineGap >= 0 ? "+" : ""}{headlineGap}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-white/[0.025] border border-white/[0.06] p-4">
                <div className="flex items-start gap-2">
                  <span className="inline-block w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: comparator.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-cream truncate">{comparator.label}</p>
                    <p className="text-[9px] uppercase tracking-wider text-gray-muted">{comparator.kind}</p>
                    {comparator.description && (
                      <p className="text-[10px] text-gray-muted/90 mt-2 leading-relaxed line-clamp-5">
                        {comparator.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="xl:col-span-8 rounded-xl bg-white/[0.025] border border-white/[0.06] p-5 min-h-[520px] flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-cream">Channel maturity radar</h3>
                {refLoading && <span className="text-[10px] text-gray-muted animate-pulse">loading</span>}
              </div>
              <p className="text-[11px] text-gray-muted mb-3">
                GPSSA&apos;s six channels overlaid against <span className="text-cream">{comparator.label}</span>.
              </p>
              <div className="flex-1 flex items-center justify-center">
                <RangeBandRadar
                  metrics={metrics}
                  preset="xl"
                  referenceColor={comparator.color}
                  referenceLabel={comparator.shortLabel}
                  showBand={false}
                />
              </div>
            </div>
          </div>

          {/* Per-channel gap table */}
          <div className="rounded-xl bg-white/[0.025] border border-white/[0.06] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-cream">Channel-by-channel gap</h3>
              <span className="text-[10px] uppercase tracking-wider text-gray-muted">
                GPSSA · {comparator.shortLabel} · Δ
              </span>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {CHANNELS.map((ch) => {
                const gv = channelMaturity(rows, ch.slug as ChannelSlug);
                const rv = refMaturity?.[ch.slug] ?? 0;
                const gap = Math.round(gv - rv);
                return (
                  <div key={ch.slug} className="grid grid-cols-12 items-center px-4 py-2.5 text-[11px] hover:bg-white/[0.02]">
                    <div className="col-span-4 flex items-center gap-2 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ch.color }} />
                      <span className="text-cream truncate">{ch.label}</span>
                      <span className="text-[9px] text-gray-muted truncate hidden md:inline">· {ch.osiPillar}</span>
                    </div>
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden relative">
                        <motion.div
                          className="absolute left-0 top-0 h-full rounded-full"
                          style={{ backgroundColor: "#0EA5E9" }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(2, gv)}%` }}
                          transition={{ duration: 0.6 }}
                        />
                        <motion.div
                          className="absolute left-0 top-0 h-full rounded-full mix-blend-screen"
                          style={{ backgroundColor: comparator.color, opacity: 0.45 }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(2, rv)}%` }}
                          transition={{ duration: 0.6, delay: 0.05 }}
                        />
                      </div>
                    </div>
                    <div className="col-span-3 flex items-center justify-end gap-3 tabular-nums">
                      <span className="text-cream w-7 text-right">{gv}</span>
                      <span className="text-gray-muted w-7 text-right">{rv}</span>
                      <span
                        className="font-semibold w-9 text-right"
                        style={{ color: gap >= 0 ? "#10B981" : "#F59E0B" }}
                      >
                        {gap >= 0 ? "+" : ""}{gap}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Page Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function ChannelCapabilitiesPage() {
  const [serviceMatrix, setServiceMatrix] = useState<ServiceChannelRow[]>(STATIC_SERVICE_MATRIX);
  const [intlServices, setIntlServices] = useState<IntlChannelRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeChannel, setActiveChannel] = useState<ChannelSlug | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [comparator, setComparator] = useState<ComparatorOption | null>(null);
  const [detailModal, setDetailModal] = useState<ServiceChannelRow | null>(null);

  const { allOptions, loading: comparatorLoading } = useComparators();

  const overviewRef = useRef<HTMLDivElement>(null);
  const browseRef = useRef<HTMLDivElement>(null);
  const benchmarkRef = useRef<HTMLDivElement>(null);

  /* ── Data loading ── */
  useEffect(() => {
    fetch("/api/services/channels")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const rowMap = new Map<string, ServiceChannelRow>();
        for (const item of data) {
          const svc = item.service;
          if (!svc) continue;
          const serviceId = String(svc.id);
          if (!rowMap.has(serviceId)) {
            rowMap.set(serviceId, {
              id: serviceId,
              name: String(svc.name ?? ""),
              category: String(svc.category ?? "General"),
              description: svc.description ? String(svc.description) : null,
              channels: { portal: "None", mobile: "None", centers: "None", call: "None", partner: "None", api: "None" },
            });
          }
          const row = rowMap.get(serviceId)!;
          const chName = String(item.channelName ?? "") as ChannelSlug;
          if (chName in row.channels) row.channels[chName] = String(item.capabilityLevel ?? "None") as ChannelLevel;
          if (item.notes) row.notes = String(item.notes);
        }
        if (rowMap.size > 0) setServiceMatrix(Array.from(rowMap.values()));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* ── Country comparator → load intl ── */
  useEffect(() => {
    if (!comparator || comparator.kind !== "country") {
      setIntlServices([]);
      return;
    }
    let cancelled = false;
    const params = new URLSearchParams({ countries: comparator.id });
    fetch(`/api/international/services?${params}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Record<string, unknown>[]) => {
        if (!Array.isArray(data) || cancelled) return;
        const rows: IntlChannelRow[] = data
          .filter((s) => s.channelCapabilities)
          .map((s) => {
            const channels: Record<ChannelSlug, ChannelLevel> = {
              portal: "None", mobile: "None", centers: "None", call: "None", partner: "None", api: "None",
            };
            try {
              const parsed = typeof s.channelCapabilities === "string"
                ? JSON.parse(s.channelCapabilities as string)
                : s.channelCapabilities;
              for (const [k, v] of Object.entries(parsed as Record<string, string>)) {
                if (k in channels) channels[k as ChannelSlug] = (v as ChannelLevel) ?? "None";
              }
            } catch { /* keep defaults */ }
            const country = COUNTRIES.find((c) => c.iso3 === s.countryIso3);
            return {
              countryIso3: s.countryIso3 as string,
              countryName: country?.name ?? (s.countryIso3 as string),
              id: s.id as string,
              name: s.name as string,
              category: s.category as string,
              channels,
            };
          });
        if (!cancelled) setIntlServices(rows);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [comparator]);

  /* ── Stats ── */
  const fullyDigital = useMemo(
    () => serviceMatrix.filter((r) => r.channels.portal === "Full" && r.channels.mobile === "Full").length,
    [serviceMatrix]
  );
  const apiReady = useMemo(
    () => serviceMatrix.filter((r) => r.channels.api === "Full" || r.channels.api === "Partial").length,
    [serviceMatrix]
  );
  const omnichannel = useMemo(
    () => serviceMatrix.filter((r) => CHANNELS.filter((c) => r.channels[c.slug as ChannelSlug] !== "None").length >= 4).length,
    [serviceMatrix]
  );

  const unclassifiedCount = useMemo(
    () =>
      serviceMatrix.filter((r) => {
        const fn = classifyServiceFunction({ name: r.name, description: r.description, category: r.category });
        return fn.slug === UNCLASSIFIED_FUNCTION.slug;
      }).length,
    [serviceMatrix]
  );

  const statBarItems: StatBarItem[] = useMemo(() => {
    const items: StatBarItem[] = [
      { icon: Layers, value: serviceMatrix.length, label: "Services Mapped" },
      { icon: Radio, value: CHANNELS.length, label: "Channels" },
      { icon: Sparkles, value: fullyDigital, label: "Fully Digital" },
      { icon: Code2, value: apiReady, label: "API-Ready" },
      { icon: CheckCircle2, value: omnichannel, label: "Omnichannel" },
    ];
    if (comparator) items.push({ icon: Globe2, value: 1, label: `vs ${comparator.shortLabel}` });
    return items;
  }, [serviceMatrix.length, fullyDigital, apiReady, omnichannel, comparator]);

  const channelDrillRows = useMemo(() => {
    let list = serviceMatrix;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
    if (!activeChannel) return list;
    const order = { Full: 0, Partial: 1, Planned: 2, None: 3 };
    return [...list].sort(
      (a, b) =>
        order[a.channels[activeChannel] ?? "None"] -
        order[b.channels[activeChannel] ?? "None"]
    );
  }, [serviceMatrix, activeChannel, searchQuery]);

  function pickChannel(slug: ChannelSlug) {
    setActiveChannel((p) => (p === slug ? null : slug));
    setTimeout(() => browseRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }

  if (loading && serviceMatrix.length === 0) {
    return <div className="flex h-full items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-5 py-2 border-b border-white/[0.06]">
        <h1 className="font-playfair text-base font-semibold text-cream shrink-0">Channel Capabilities</h1>
        <div className="h-4 w-px bg-white/10" />
        <nav className="flex items-center gap-1">
          {[
            { id: "overview", label: "1. Channel Mix", ref: overviewRef },
            { id: "browse", label: "2. Coverage", ref: browseRef },
            { id: "benchmark", label: "3. Compare", ref: benchmarkRef },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => tab.ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium text-gray-muted hover:text-cream hover:bg-white/[0.04] transition-colors"
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <MandateBasisChip screenPath="/dashboard/services/channels" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="px-5 py-5 space-y-10 max-w-[1480px] mx-auto">

          {/* Section 1 — Channel Mix at a Glance */}
          <section ref={overviewRef} className="scroll-mt-4">
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gpssa-green/80 mb-1">
                  1 · Channel Mix at a Glance
                </p>
                <h2 className="font-playfair text-2xl text-cream mb-2">
                  How does GPSSA reach its customers today?
                </h2>
                <p className="text-xs text-gray-muted leading-relaxed max-w-3xl">
                  Six canonical channels — <span className="text-cream">Portal, Mobile, Service Centers, Call,
                  Partner and API</span> — assessed across every service. Each tile shows the average maturity
                  (0–100) and the Full / Partial / Planned mix.
                </p>
              </div>
              <div className="text-[10px] uppercase tracking-wider text-gold/80 hidden md:flex items-center gap-1.5 shrink-0">
                <Scale size={10} />
                RFI 2.B-2 · Customer &amp; service performance
              </div>
            </div>

            {/* KPI strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {[
                { label: "Services mapped", value: serviceMatrix.length, icon: Layers },
                { label: "Fully digital", value: fullyDigital, icon: Sparkles },
                { label: "API-ready", value: apiReady, icon: Code2 },
                { label: "Omnichannel (≥4)", value: omnichannel, icon: CheckCircle2 },
              ].map((kpi) => {
                const Icon = kpi.icon;
                return (
                  <div key={kpi.label} className="rounded-xl bg-white/[0.025] border border-white/[0.06] p-4">
                    <div className="flex items-center gap-2 mb-2 text-gray-muted">
                      <Icon size={12} />
                      <span className="text-[10px] uppercase tracking-wider">{kpi.label}</span>
                    </div>
                    <p className="text-3xl font-bold text-cream tabular-nums leading-none">{kpi.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {CHANNELS.map((ch, i) => (
                <ChannelTile
                  key={ch.slug}
                  channel={ch}
                  rows={serviceMatrix}
                  index={i}
                  active={activeChannel === ch.slug}
                  onClick={() => pickChannel(ch.slug as ChannelSlug)}
                />
              ))}
            </div>

            {unclassifiedCount > 0 && (
              <p className="mt-4 text-[10px] text-amber-300/80">
                {unclassifiedCount} services have free-text categories not yet mapped to an ILO branch — they still appear in the coverage matrix as &quot;Other&quot;.
              </p>
            )}

            <div className="mt-4 flex items-center justify-center">
              <button
                onClick={() => browseRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="flex items-center gap-1.5 text-[11px] text-gray-muted hover:text-cream transition-colors"
              >
                See the service-by-channel coverage matrix <ArrowDown size={11} />
              </button>
            </div>
          </section>

          {/* Section 2 — Coverage matrix + drill */}
          <section ref={browseRef} className="scroll-mt-4">
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gpssa-green/80 mb-1">
                  2 · Service-by-Channel Coverage
                </p>
                <h2 className="font-playfair text-2xl text-cream mb-2">
                  Which services route through which channels?
                </h2>
                <p className="text-xs text-gray-muted leading-relaxed max-w-3xl">
                  Every row is one of the twelve ILO branches; every cell is the average maturity across all services in
                  that branch for the chosen channel — brighter = stronger.
                </p>
              </div>
              <div className="text-[10px] uppercase tracking-wider text-gold/80 hidden md:flex items-center gap-1.5 shrink-0">
                <Scale size={10} />
                RFI 2.E-3 · Process optimisation
              </div>
            </div>

            <CoverageMatrix rows={serviceMatrix} />

            {/* Channel drill-in */}
            {activeChannel && (
              <div className="mt-5 rounded-xl bg-white/[0.025] border border-white/[0.06] p-4">
                {(() => {
                  const ch = CHANNELS.find((c) => c.slug === activeChannel)!;
                  return (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className="inline-flex items-center justify-center w-7 h-7 rounded-lg"
                          style={{ backgroundColor: `${ch.color}25` }}
                        >
                          <Radio size={12} style={{ color: ch.color }} />
                        </span>
                        <div>
                          <h3 className="text-sm font-semibold text-cream">{ch.label}</h3>
                          <p className="text-[10px] text-gray-muted">{channelDrillRows.length} services</p>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          <div className="relative">
                            <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-muted" />
                            <input
                              type="text"
                              placeholder="Filter services…"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-44 pl-7 pr-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] text-cream placeholder:text-gray-muted focus:outline-none focus:border-gpssa-green/30"
                            />
                          </div>
                          {(searchQuery || activeChannel) && (
                            <button
                              onClick={() => { setActiveChannel(null); setSearchQuery(""); }}
                              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-gray-muted hover:text-cream hover:bg-white/[0.05] transition-colors"
                            >
                              <RotateCcw size={10} />
                              Reset
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                        {channelDrillRows.slice(0, 120).map((svc) => {
                          const lvl = svc.channels[activeChannel] ?? "None";
                          return (
                            <button
                              key={svc.id}
                              onClick={() => setDetailModal(svc)}
                              className="text-left rounded-lg bg-white/[0.025] border border-white/[0.06] p-2.5 hover:bg-white/[0.05] hover:border-white/[0.14] transition-colors"
                            >
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p className="text-[11px] font-medium text-cream leading-snug truncate">{svc.name}</p>
                                <Badge
                                  variant={lvl === "Full" ? "green" : lvl === "Partial" ? "gold" : lvl === "Planned" ? "blue" : "gray"}
                                  size="sm"
                                >
                                  {lvl}
                                </Badge>
                              </div>
                              <p className="text-[9px] text-gray-muted">{svc.category}</p>
                            </button>
                          );
                        })}
                      </div>
                      {channelDrillRows.length > 120 && (
                        <p className="mt-3 text-[10px] text-gray-muted text-center">
                          Showing first 120 — refine the search to see more.
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            {!activeChannel && (
              <p className="mt-3 text-[11px] text-gray-muted text-center">
                <Filter size={10} className="inline mr-1" />
                Click any channel tile above to drill into the services for that channel.
              </p>
            )}

            <div className="mt-5 flex items-center justify-center">
              <button
                onClick={() => benchmarkRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="flex items-center gap-1.5 text-[11px] text-gray-muted hover:text-cream transition-colors"
              >
                See how our channels compare globally <ArrowDown size={11} />
              </button>
            </div>
          </section>

          {/* Section 3 — Cockpit */}
          <section ref={benchmarkRef} className="scroll-mt-4 pb-6">
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gpssa-green/80 mb-1">
                  3 · How Our Channels Compare
                </p>
                <h2 className="font-playfair text-2xl text-cream mb-2">
                  {comparator ? `Channels — GPSSA vs ${comparator.label}` : "Benchmark our channels against the world."}
                </h2>
                <p className="text-xs text-gray-muted leading-relaxed max-w-3xl">
                  Hold GPSSA&apos;s six-channel mix up against an OSI standard, a regional best-practice or a single peer
                  country. Each channel is scored 0–100 so gaps are directly comparable.
                </p>
              </div>
              <div className="text-[10px] uppercase tracking-wider text-gold/80 hidden md:flex items-center gap-1.5 shrink-0">
                <Scale size={10} />
                RFI 2.E-5 · Reduce fulfilment timelines
              </div>
            </div>

            <ChannelCockpit
              rows={serviceMatrix}
              comparator={comparator}
              setComparator={setComparator}
              comparatorOptions={allOptions}
              comparatorLoading={comparatorLoading}
              intl={intlServices}
            />
          </section>
        </div>
      </div>

      <StatBar items={statBarItems} />

      {/* Service detail modal */}
      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title={detailModal?.name} description={detailModal?.category} size="lg">
        {detailModal && (
          <div className="space-y-4">
            <p className="text-xs text-gray-muted">Channel coverage across the six canonical channels.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CHANNELS.map((ch) => {
                const lvl = detailModal.channels[ch.slug as ChannelSlug] ?? "None";
                return (
                  <div
                    key={ch.slug}
                    className="rounded-lg p-3 border border-white/[0.06] bg-white/[0.025]"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-semibold text-cream">{ch.shortLabel}</span>
                      <Badge variant={lvl === "Full" ? "green" : lvl === "Partial" ? "gold" : lvl === "Planned" ? "blue" : "gray"} size="sm">
                        {lvl}
                      </Badge>
                    </div>
                    <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: ch.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${CHANNEL_LEVEL_SCORES[lvl]}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                    <p className="text-[9px] text-gray-muted mt-1">{ch.osiPillar}</p>
                  </div>
                );
              })}
            </div>
            {detailModal.notes && (
              <div>
                <span className="text-xs font-medium text-cream block mb-1">Notes</span>
                <p className="text-xs text-gray-muted glass rounded-lg p-3">{detailModal.notes}</p>
              </div>
            )}
            <div className="flex justify-end pt-2 border-t border-white/[0.05]">
              <button
                onClick={() => {
                  setDetailModal(null);
                  setTimeout(() => benchmarkRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gpssa-green/15 border border-gpssa-green/25 text-gpssa-green text-xs font-medium hover:bg-gpssa-green/25 transition-colors"
              >
                Benchmark this service
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
