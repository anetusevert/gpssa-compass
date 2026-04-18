"use client";

/**
 * Channel Capabilities — 3-Act Cinematic Redesign
 *
 *   ACT I  — Cockpit          : six channel "tiles" lit by current maturity,
 *            animated in like a heads-up display.
 *
 *   ACT II — Service-flow Sankey : visualize how every GPSSA service routes
 *            through the six channels at Full / Partial / Planned / None.
 *
 *   ACT III— Benchmark        : compare GPSSA's channel matrix against a
 *            Standard (UN EGDI, ISSA SQ), a Computed Reference (Global Avg,
 *            GCC Best), or a single Country.
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Globe2,
  Layers,
  Radio,
  Sparkles,
  Code2,
  ArrowLeft,
  ArrowRight,
  Scale,
  CheckCircle2,
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
  resolveCategory,
  SERVICE_FUNCTIONS,
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

type Act = "cockpit" | "flow" | "benchmark";

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
   ACT I — Cockpit
   ═══════════════════════════════════════════════════════════════════════════ */

function ChannelCockpitTile({
  channel,
  rows,
  index,
  onClick,
  active,
}: {
  channel: Channel;
  rows: ServiceChannelRow[];
  index: number;
  onClick: () => void;
  active: boolean;
}) {
  const score = channelMaturity(rows, channel.slug as ChannelSlug);
  const dist = channelDistribution(rows, channel.slug as ChannelSlug);
  const band = maturityBand(score);

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.18 } }}
      whileTap={{ scale: 0.98 }}
      className={`group relative text-left rounded-2xl p-4 overflow-hidden transition-all ${
        active ? "ring-2 ring-cream/30" : ""
      }`}
      style={{
        background: `linear-gradient(135deg, ${channel.color}1c 0%, rgba(11,18,32,0.6) 60%)`,
        border: `1px solid ${channel.color}40`,
      }}
    >
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-25 group-hover:opacity-50 transition-opacity"
        style={{ background: `radial-gradient(circle, ${channel.color}cc, transparent 70%)` }}
      />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ backgroundColor: `${channel.color}25` }}
          >
            <Radio size={14} style={{ color: channel.color }} />
          </span>
          <span className="text-[9px] uppercase tracking-wider text-gray-muted">{channel.osiPillar}</span>
        </div>
        <h3 className="text-sm font-semibold text-cream mb-0.5">{channel.label}</h3>
        <p className="text-[10px] text-gray-muted/90 line-clamp-2 mb-3 leading-snug">{channel.description}</p>

        <div className="flex items-baseline justify-between mb-2">
          <span className="text-2xl font-bold text-cream tabular-nums">{score}</span>
          <span
            className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
            style={{ backgroundColor: `${channel.color}22`, color: channel.color }}
          >
            {band}
          </span>
        </div>

        {/* Stacked distribution bar */}
        <div className="h-1.5 rounded-full overflow-hidden flex bg-white/[0.04]">
          {(CHANNEL_LEVELS as readonly ChannelLevel[]).map((lvl) => {
            const w = rows.length === 0 ? 0 : (dist[lvl] / rows.length) * 100;
            if (w === 0) return null;
            return (
              <motion.div
                key={lvl}
                initial={{ width: 0 }}
                animate={{ width: `${w}%` }}
                transition={{ duration: 0.6, delay: 0.15 + index * 0.04 }}
                style={{ backgroundColor: CHANNEL_LEVEL_COLORS[lvl] }}
                className="h-full"
                title={`${lvl}: ${dist[lvl]}`}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-1 text-[9px] text-gray-muted">
          <span><span className="text-cream font-semibold">{dist.Full}</span> Full</span>
          <span><span className="text-cream/80">{dist.Partial}</span> Partial</span>
          <span>{dist.Planned} Planned</span>
        </div>
      </div>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ACT II — Service-flow (mini-Sankey)
   ═══════════════════════════════════════════════════════════════════════════ */

function ServiceFlow({ rows }: { rows: ServiceChannelRow[] }) {
  // For each (function, channel) pair compute weighted maturity 0-100
  const cells = useMemo(() => {
    const grid = new Map<string, Map<ChannelSlug, number>>();
    for (const fn of SERVICE_FUNCTIONS) grid.set(fn.slug, new Map());
    for (const r of rows) {
      const cat = resolveCategory(r.category);
      if (cat?.kind !== "function") continue;
      const fnGrid = grid.get(cat.entry.slug)!;
      for (const ch of CHANNELS) {
        const lvl = r.channels[ch.slug as ChannelSlug] ?? "None";
        const cur = fnGrid.get(ch.slug as ChannelSlug) ?? 0;
        fnGrid.set(ch.slug as ChannelSlug, cur + CHANNEL_LEVEL_SCORES[lvl]);
      }
    }
    // Normalize to averages per (fn, ch)
    const counts = new Map<string, number>();
    for (const r of rows) {
      const cat = resolveCategory(r.category);
      if (cat?.kind !== "function") continue;
      counts.set(cat.entry.slug, (counts.get(cat.entry.slug) ?? 0) + 1);
    }
    const result: { fnSlug: string; fnLabel: string; fnColor: string; values: { ch: Channel; v: number }[]; n: number }[] = [];
    for (const fn of SERVICE_FUNCTIONS) {
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
  }, [rows]);

  if (cells.length === 0) {
    return <div className="text-center text-xs text-gray-muted py-12">No services to flow.</div>;
  }

  return (
    <div className="rounded-xl bg-white/[0.025] border border-white/[0.06] overflow-hidden">
      {/* Header row */}
      <div className="grid items-end" style={{ gridTemplateColumns: `200px repeat(${CHANNELS.length}, 1fr)` }}>
        <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-gray-muted">Function</div>
        {CHANNELS.map((ch) => (
          <div key={ch.slug} className="px-2 py-2 text-center">
            <div
              className="inline-flex items-center justify-center w-7 h-7 rounded-md mb-1"
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
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: rowIdx * 0.03 }}
          className="grid border-t border-white/[0.05] hover:bg-white/[0.02] transition-colors"
          style={{ gridTemplateColumns: `200px repeat(${CHANNELS.length}, 1fr)` }}
        >
          <div className="flex items-center gap-2 px-3 py-2.5">
            <span className="w-1.5 h-7 rounded-full" style={{ backgroundColor: row.fnColor }} />
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
                  transition={{ duration: 0.6, delay: rowIdx * 0.03 + 0.1 }}
                  className="h-full rounded-md"
                  style={{
                    background: `linear-gradient(90deg, ${ch.color}77, ${ch.color}cc)`,
                    boxShadow: v > 70 ? `0 0 8px ${ch.color}77` : "none",
                  }}
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
   ACT III — Benchmark
   ═══════════════════════════════════════════════════════════════════════════ */

function ChannelBenchmark({
  rows,
  comparator,
  intl,
}: {
  rows: ServiceChannelRow[];
  comparator: ComparatorOption | null;
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
          // standard: derive expected channel maturity from standardSlugs membership
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

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-6 h-full overflow-y-auto pr-1">
      <div className="space-y-4">
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-4">
          <p className="text-[10px] uppercase tracking-wider text-gray-muted mb-3">Composite</p>
          <div className="flex justify-center">
            <ComplianceDial
              score={headlineGpssa}
              reference={headlineRef}
              label="Channel Maturity"
              sublabel={comparator ? `vs ${comparator.shortLabel}` : "Pick a comparator →"}
              size="md"
              color="#0EA5E9"
              band={maturityBand(headlineGpssa)}
            />
          </div>
        </div>

        {comparator && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-4"
          >
            <div className="flex items-start gap-2 mb-2">
              <span className="inline-block w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: comparator.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-cream truncate">{comparator.label}</p>
                <p className="text-[9px] uppercase tracking-wider text-gray-muted">{comparator.kind}</p>
                {comparator.description && (
                  <p className="text-[10px] text-gray-muted/90 mt-2 leading-relaxed line-clamp-4">
                    {comparator.description}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/[0.05]">
              {CHANNELS.map((ch) => {
                const gv = channelMaturity(rows, ch.slug as ChannelSlug);
                const rv = refMaturity?.[ch.slug] ?? 0;
                const gap = gv - rv;
                return (
                  <div key={ch.slug} className="text-[9px]">
                    <p className="text-gray-muted truncate">{ch.shortLabel}</p>
                    <p
                      className="font-semibold tabular-nums"
                      style={{ color: gap >= 0 ? "#10B981" : "#F59E0B" }}
                    >
                      {gap >= 0 ? "+" : ""}{Math.round(gap)}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-4 min-h-[420px] flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-cream">Channel maturity radar</h3>
          {refLoading && <span className="text-[9px] text-gray-muted animate-pulse">loading</span>}
        </div>
        <p className="text-[10px] text-gray-muted mb-4">
          GPSSA's six-channel mix overlaid against {comparator ? comparator.shortLabel : "the chosen comparator"}.
        </p>
        <div className="flex-1 flex items-center justify-center">
          <RangeBandRadar
            metrics={metrics}
            referenceColor={comparator?.color ?? "#0EA5E9"}
            referenceLabel={comparator?.shortLabel ?? "—"}
            showBand={false}
          />
        </div>
      </div>
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
  const [act, setAct] = useState<Act>("cockpit");
  const [activeChannel, setActiveChannel] = useState<ChannelSlug | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [comparator, setComparator] = useState<ComparatorOption | null>(null);
  const [detailModal, setDetailModal] = useState<ServiceChannelRow | null>(null);

  const { allOptions, loading: comparatorLoading } = useComparators();

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
    if (!activeChannel) return [];
    let list = serviceMatrix;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
    // Sort by capability for the active channel: Full > Partial > Planned > None
    const order = { Full: 0, Partial: 1, Planned: 2, None: 3 };
    return [...list].sort(
      (a, b) =>
        order[a.channels[activeChannel] ?? "None"] -
        order[b.channels[activeChannel] ?? "None"]
    );
  }, [serviceMatrix, activeChannel, searchQuery]);

  const handleChannelClick = useCallback(
    (slug: ChannelSlug) => {
      setActiveChannel((p) => (p === slug ? null : slug));
    },
    []
  );

  if (loading && serviceMatrix.length === 0) {
    return <div className="flex h-full items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-5 py-2 border-b border-white/[0.06]">
        <h1 className="font-playfair text-base font-semibold text-cream shrink-0">Channel Capabilities</h1>
        <div className="h-4 w-px bg-white/10" />
        <div className="flex items-center gap-1">
          {(
            [
              { id: "cockpit" as Act,   label: "Cockpit",  desc: "Channel HUD" },
              { id: "flow" as Act,      label: "Flow",     desc: "Service ↔ Channel" },
              { id: "benchmark" as Act, label: "Benchmark", desc: "Compare" },
            ]
          ).map((tab, i) => (
            <button
              key={tab.id}
              onClick={() => setAct(tab.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                act === tab.id
                  ? "bg-gpssa-green/15 text-gpssa-green border border-gpssa-green/25"
                  : "text-gray-muted hover:text-cream hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              <span className="text-[9px] tabular-nums text-gray-muted/70">{i + 1}</span>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <MandateBasisChip screenPath="/dashboard/services/channels" />
          {act === "cockpit" && activeChannel && (
            <div className="relative">
              <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-muted" />
              <input
                type="text"
                placeholder="Filter services…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-40 pl-7 pr-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] text-cream placeholder:text-gray-muted focus:outline-none focus:border-gpssa-green/30"
              />
            </div>
          )}
          <ComparatorPicker
            options={allOptions}
            selected={comparator}
            onChange={setComparator}
            loading={comparatorLoading}
            variant="inline"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden p-5">
        <AnimatePresence mode="wait">
          {act === "cockpit" && (
            <motion.div
              key="act-cockpit"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="h-full overflow-y-auto pr-1"
            >
              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-wider text-gpssa-green/80 mb-1">Act I · Cockpit</p>
                <h2 className="font-playfair text-lg text-cream mb-1">Six channels, one heads-up display.</h2>
                <p className="text-xs text-gray-muted max-w-2xl leading-relaxed">
                  Every channel — Portal, Mobile, Centers, Call, Partner, API — lit by current GPSSA maturity.
                  Stacked bars show the Full / Partial / Planned mix across services.
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
                {CHANNELS.map((ch, i) => (
                  <ChannelCockpitTile
                    key={ch.slug}
                    channel={ch}
                    rows={serviceMatrix}
                    index={i}
                    active={activeChannel === ch.slug}
                    onClick={() => handleChannelClick(ch.slug as ChannelSlug)}
                  />
                ))}
              </div>

              <AnimatePresence>
                {activeChannel && (
                  <motion.div
                    key={activeChannel}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-xl bg-white/[0.025] border border-white/[0.06] p-4"
                  >
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
                            <button
                              onClick={() => setActiveChannel(null)}
                              className="ml-auto text-[10px] text-gray-muted hover:text-cream"
                            >
                              ✕ close
                            </button>
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                            {channelDrillRows.map((svc) => {
                              const lvl = svc.channels[activeChannel] ?? "None";
                              return (
                                <button
                                  key={svc.id}
                                  onClick={() => setDetailModal(svc)}
                                  className="text-left rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all"
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
                        </>
                      );
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {act === "flow" && (
            <motion.div
              key="act-flow"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
              className="h-full overflow-y-auto pr-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gpssa-green/80 mb-1">Act II · Flow</p>
                  <h2 className="font-playfair text-lg text-cream mb-1">How services route through channels.</h2>
                  <p className="text-xs text-gray-muted max-w-2xl leading-relaxed">
                    Each row is an ILO C102 service function. Each cell is the average maturity across all
                    services in that function for the chosen channel — brighter = stronger.
                  </p>
                </div>
                <button
                  onClick={() => setAct("benchmark")}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gpssa-green/15 border border-gpssa-green/25 text-gpssa-green text-[11px] font-medium hover:bg-gpssa-green/25 transition-colors shrink-0"
                >
                  Benchmark <ArrowRight size={11} />
                </button>
              </div>
              <ServiceFlow rows={serviceMatrix} />
            </motion.div>
          )}

          {act === "benchmark" && (
            <motion.div
              key="act-benchmark"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35 }}
              className="h-full overflow-hidden flex flex-col"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gpssa-green/80 mb-1">Act III · Benchmark</p>
                  <h2 className="font-playfair text-lg text-cream mb-1">
                    {comparator ? `Channels — GPSSA vs ${comparator.label}` : "Pick a comparator to begin"}
                  </h2>
                  <p className="text-xs text-gray-muted leading-relaxed max-w-2xl">
                    Hold GPSSA's six-channel mix up against an OSI standard, a regional best-practice or a peer.
                  </p>
                </div>
                {!comparator && (
                  <ComparatorPicker
                    options={allOptions}
                    selected={comparator}
                    onChange={setComparator}
                    loading={comparatorLoading}
                  />
                )}
              </div>
              <div className="flex-1 min-h-0">
                <ChannelBenchmark rows={serviceMatrix} comparator={comparator} intl={intlServices} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
                    className="rounded-lg p-3 border"
                    style={{
                      borderColor: `${ch.color}33`,
                      backgroundColor: `${ch.color}0c`,
                    }}
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
                  setAct("benchmark");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gpssa-green/15 border border-gpssa-green/25 text-gpssa-green text-xs font-medium hover:bg-gpssa-green/25 transition-colors"
              >
                Benchmark this service <ArrowRight size={11} />
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* hidden refs to keep imports happy */}
      <span className="hidden">{void CountryFlag}{void ArrowLeft}{void Scale}</span>
    </div>
  );
}
