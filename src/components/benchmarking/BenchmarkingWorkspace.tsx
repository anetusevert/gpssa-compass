"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  ChevronDown,
  Database,
  Globe,
  Layers,
  Loader2,
  Maximize2,
  Radar,
  Search,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  Radar as RechartsRadar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Modal } from "@/components/ui/Modal";
import { CountryFlag } from "@/components/ui/CountryFlag";
import type {
  BenchmarkDimensionPayload,
  BenchmarkInstitutionPayload,
  BenchmarkKpiPayload,
  BenchmarkSourceReference,
  BenchmarkWorkspacePayload,
} from "@/lib/benchmarking/workspace";

type ViewMode = "radar" | "bars" | "heatmap" | "quadrant";

type EvidenceTarget =
  | { type: "kpi"; payload: BenchmarkKpiPayload }
  | { type: "dimension"; payload: BenchmarkDimensionPayload };

const VIEW_META: Record<ViewMode, { shortLabel: string; icon: typeof Radar }> = {
  radar:    { shortLabel: "Spider",   icon: Radar },
  bars:     { shortLabel: "Bars",     icon: BarChart3 },
  heatmap:  { shortLabel: "Heatmap",  icon: Layers },
  quadrant: { shortLabel: "Quadrant", icon: Activity },
};

const CHART_COLORS = ["#2DD4BF", "#F59E0B", "#60A5FA", "#C084FC", "#F472B6", "#A78BFA", "#34D399", "#FB923C"];
const EASE = [0.16, 1, 0.3, 1] as const;

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function formatValue(value: number, unit?: string | null) {
  if (unit === "%") return `${Math.round(value)}%`;
  return `${Math.round(value)}`;
}

function scoreTone(score: number) {
  if (score >= 85) return "text-gpssa-green";
  if (score >= 70) return "text-adl-blue";
  if (score >= 55) return "text-gold";
  return "text-orange-400";
}

function scoreSurface(score: number) {
  if (score >= 85) return "bg-gpssa-green/12";
  if (score >= 70) return "bg-adl-blue/12";
  if (score >= 55) return "bg-gold/12";
  return "bg-orange-400/12";
}

/* ─── Evidence list ─── */

function EvidenceList({ sources }: { sources: BenchmarkSourceReference[] }) {
  return (
    <div className="space-y-3">
      {sources.map((source) => (
        <a
          key={`${source.id}-${source.url}`}
          href={source.url}
          target="_blank"
          rel="noreferrer"
          className="block rounded-[22px] bg-white/[0.04] p-4 transition-all duration-300 hover:bg-white/[0.06] hover:shadow-[0_16px_40px_rgba(0,0,0,0.22)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-cream">{source.title}</p>
              <p className="mt-1 text-xs text-gray-muted">
                {[source.publisher, source.region, source.sourceType].filter(Boolean).join(" · ")}
              </p>
            </div>
            <Maximize2 size={14} className="mt-1 shrink-0 text-gray-muted" />
          </div>
          {(source.citation || source.evidenceNote || source.description) && (
            <p className="mt-3 text-xs leading-relaxed text-gray-muted">
              {source.evidenceNote || source.citation || source.description}
            </p>
          )}
        </a>
      ))}
    </div>
  );
}

/* ─── Evidence modal ─── */

function BenchmarkEvidenceModal({
  isOpen, onClose, target, workspace, selectedInstitutions,
}: {
  isOpen: boolean;
  onClose: () => void;
  target: EvidenceTarget | null;
  workspace: BenchmarkWorkspacePayload;
  selectedInstitutions: BenchmarkInstitutionPayload[];
}) {
  if (!target) return null;

  if (target.type === "kpi") {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={target.payload.name} description={target.payload.description ?? "Source-backed benchmark indicator"} size="xl">
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {target.payload.values.map((value) => (
              <div key={`${target.payload.slug}-${value.comparator}`} className="rounded-[22px] bg-white/[0.04] p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-gray-muted">{value.label}</p>
                <p className="mt-2 font-playfair text-3xl text-cream">{formatValue(value.value, target.payload.unit)}</p>
                {value.note && <p className="mt-2 text-xs leading-relaxed text-gray-muted">{value.note}</p>}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-cream">Sources</h4>
            <EvidenceList sources={target.payload.values.flatMap((v) => v.sources)} />
          </div>
        </div>
      </Modal>
    );
  }

  const institutions = [workspace.targetInstitution, ...selectedInstitutions];
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${target.payload.name} Evidence`} description={target.payload.description ?? "Dimension-level score evidence"} size="xl">
      <div className="grid gap-3 sm:grid-cols-2">
        {institutions.map((inst) => (
          <div key={`${inst.id}-${target.payload.slug}`} className="rounded-[22px] bg-white/[0.04] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-cream">
                  <CountryFlag code={inst.countryCode} size="sm" /> {inst.shortName}
                </p>
                <p className="text-xs text-gray-muted">{inst.country}</p>
              </div>
              <p className={`font-playfair text-3xl ${scoreTone(inst.scores[target.payload.slug] ?? 0)}`}>
                {Math.round(inst.scores[target.payload.slug] ?? 0)}
              </p>
            </div>
            <div className="mt-4">
              <EvidenceList sources={inst.scoreEvidence[target.payload.slug] ?? []} />
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ─── Country peer type ─── */

interface CountryPeer {
  iso3: string;
  name: string;
  flag: string;
  region: string;
  maturityLabel: string | null;
  maturityScore: number | null;
}

/* ─── Custom quadrant dot: flag emoji ─── */

function FlagDot(props: Record<string, unknown>) {
  const { cx, cy, payload } = props as { cx: number; cy: number; payload: { countryCode: string; flag: string } };
  if (!cx || !cy) return null;
  return (
    <g>
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={16}>
        {payload.flag || "●"}
      </text>
    </g>
  );
}

/* ─── Quadrant tooltip ─── */

function QuadrantTooltipContent(props: Record<string, unknown>) {
  const { active, payload: entries } = props as {
    active?: boolean;
    payload?: Array<{ payload: { name: string; flag: string; x: number; y: number; xLabel: string; yLabel: string } }>;
  };
  if (!active || !entries?.length) return null;
  const d = entries[0].payload;
  return (
    <div className="rounded-2xl bg-navy/96 border border-white/10 px-4 py-3 text-cream shadow-xl backdrop-blur-xl">
      <p className="text-sm font-semibold">{d.flag} {d.name}</p>
      <p className="mt-1 text-xs text-gray-muted">{d.xLabel}: <span className="text-cream">{d.x}</span></p>
      <p className="text-xs text-gray-muted">{d.yLabel}: <span className="text-cream">{d.y}</span></p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */

export function BenchmarkingWorkspace({ workspace }: { workspace: BenchmarkWorkspacePayload }) {
  const [viewMode, setViewMode] = useState<ViewMode>("radar");
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const [evidenceTarget, setEvidenceTarget] = useState<EvidenceTarget | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    workspace.peerInstitutions.slice(0, 3).map((i) => i.id)
  );

  // Country selector state
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectorSearch, setSelectorSearch] = useState("");
  const [countryPeers, setCountryPeers] = useState<CountryPeer[]>([]);
  const [addingCountry, setAddingCountry] = useState<string | null>(null);
  const selectorRef = useRef<HTMLDivElement>(null);

  // Quadrant axis state
  const [xDimSlug, setXDimSlug] = useState(workspace.dimensions[0]?.slug ?? "");
  const [yDimSlug, setYDimSlug] = useState(workspace.dimensions[1]?.slug ?? "");

  // Fetch all countries on mount
  const fetchCountryPeers = useCallback(async () => {
    try {
      const res = await fetch("/api/countries?status=completed");
      if (res.ok) {
        const data = await res.json();
        setCountryPeers(
          data.map((c: Record<string, unknown>) => ({
            iso3: c.iso3 as string,
            name: c.name as string,
            flag: (c.flag as string) ?? "",
            region: (c.region as string) ?? "",
            maturityLabel: c.maturityLabel as string | null,
            maturityScore: c.maturityScore as number | null,
          }))
        );
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchCountryPeers(); }, [fetchCountryPeers]);

  // Close selector dropdown when clicking outside
  useEffect(() => {
    if (!selectorOpen) return;
    function handleClick(e: MouseEvent) {
      if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) {
        setSelectorOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [selectorOpen]);

  async function addCountryAsPeer(iso3: string) {
    setAddingCountry(iso3);
    try {
      const res = await fetch("/api/research/benchmarking/compute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryIso3: iso3 }),
      });
      if (res.ok) {
        const { institutionId } = await res.json();
        toggleInstitution(institutionId);
        window.location.reload();
      }
    } finally {
      setAddingCountry(null);
    }
  }

  // Combined list: workspace institutions + country peers
  const selectorItems = useMemo(() => {
    const q = selectorSearch.toLowerCase();
    const existingCodes = new Set(workspace.peerInstitutions.map((i) => i.countryCode.toLowerCase()));

    const institutionItems = workspace.peerInstitutions
      .filter((i) => !q || i.name.toLowerCase().includes(q) || i.shortName.toLowerCase().includes(q) || i.country.toLowerCase().includes(q))
      .map((i) => ({
        type: "institution" as const,
        id: i.id,
        name: i.country,
        shortName: i.shortName,
        countryCode: i.countryCode,
        region: i.region,
        label: i.digitalMaturity ?? "",
        selected: selectedIds.includes(i.id),
      }));

    const countryItems = countryPeers
      .filter((c) => !existingCodes.has(c.iso3.substring(0, 2).toLowerCase()))
      .filter((c) => !q || c.name.toLowerCase().includes(q) || c.iso3.toLowerCase().includes(q))
      .map((c) => ({
        type: "country" as const,
        id: c.iso3,
        name: c.name,
        shortName: c.iso3,
        countryCode: c.iso3,
        region: c.region,
        label: c.maturityLabel ?? "",
        selected: false,
      }));

    // Group by region
    const all = [...institutionItems, ...countryItems];
    const grouped = new Map<string, typeof all>();
    for (const item of all) {
      const list = grouped.get(item.region) ?? [];
      list.push(item);
      grouped.set(item.region, list);
    }
    return grouped;
  }, [selectorSearch, workspace.peerInstitutions, countryPeers, selectedIds]);

  const selectedInstitutions = useMemo(() => {
    const byId = new Map(workspace.peerInstitutions.map((i) => [i.id, i]));
    return selectedIds.map((id) => byId.get(id)).filter((v): v is BenchmarkInstitutionPayload => Boolean(v));
  }, [selectedIds, workspace.peerInstitutions]);

  const comparisonInstitutions = useMemo(
    () => [workspace.targetInstitution, ...selectedInstitutions],
    [selectedInstitutions, workspace.targetInstitution]
  );

  const dimensionAnalysis = useMemo(() => {
    return workspace.dimensions.map((dim) => {
      const targetScore = workspace.targetInstitution.scores[dim.slug] ?? 0;
      const peerScores = selectedInstitutions.map((i) => i.scores[dim.slug] ?? 0);
      const peerAverage = average(peerScores);
      return { ...dim, targetScore, peerAverage, gap: peerAverage - targetScore };
    });
  }, [selectedInstitutions, workspace.dimensions, workspace.targetInstitution.scores]);

  const overallBars = useMemo(() => {
    return comparisonInstitutions
      .map((inst, idx) => ({
        name: inst.shortName,
        countryCode: inst.countryCode,
        score: average(workspace.dimensions.map((d) => inst.scores[d.slug] ?? 0)),
        fill: CHART_COLORS[idx % CHART_COLORS.length],
      }))
      .sort((a, b) => b.score - a.score);
  }, [comparisonInstitutions, workspace.dimensions]);

  const radarData = useMemo(() => {
    return workspace.dimensions.map((dim) => {
      const point: Record<string, string | number> = {
        dimension: dim.name,
        fullMark: 100,
        [workspace.targetInstitution.shortName]: workspace.targetInstitution.scores[dim.slug] ?? 0,
      };
      selectedInstitutions.forEach((inst) => {
        point[inst.shortName] = inst.scores[dim.slug] ?? 0;
      });
      return point;
    });
  }, [selectedInstitutions, workspace.dimensions, workspace.targetInstitution]);

  // Quadrant: each dot = one institution, axes = two selectable dimensions
  const xDimName = workspace.dimensions.find((d) => d.slug === xDimSlug)?.name ?? xDimSlug;
  const yDimName = workspace.dimensions.find((d) => d.slug === yDimSlug)?.name ?? yDimSlug;

  const quadrantData = useMemo(() => {
    return comparisonInstitutions.map((inst) => {
      const flag = inst.countryCode.length === 2
        ? String.fromCodePoint(0x1f1e6 + inst.countryCode.toUpperCase().charCodeAt(0) - 65, 0x1f1e6 + inst.countryCode.toUpperCase().charCodeAt(1) - 65)
        : "";
      return {
        name: inst.shortName,
        countryCode: inst.countryCode,
        flag,
        x: Math.round(inst.scores[xDimSlug] ?? 0),
        y: Math.round(inst.scores[yDimSlug] ?? 0),
        xLabel: xDimName,
        yLabel: yDimName,
      };
    });
  }, [comparisonInstitutions, xDimSlug, yDimSlug, xDimName, yDimName]);

  function toggleInstitution(id: string) {
    setSelectedIds((current) => {
      if (current.includes(id)) return current.filter((v) => v !== id);
      return [...current, id];
    });
  }

  function removeInstitution(id: string) {
    setSelectedIds((current) => current.filter((v) => v !== id));
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
        <div className="benchmark-ambient benchmark-ambient-green -left-20 top-6 h-72 w-72" />
        <div className="benchmark-ambient benchmark-ambient-blue right-0 top-12 h-[28rem] w-[28rem]" />
        <div className="benchmark-ambient benchmark-ambient-gold bottom-8 left-1/3 h-64 w-64" />
        <div className="benchmark-grid absolute inset-0 opacity-70" />
      </div>

      <motion.div
        key={viewMode}
        initial={{ opacity: 0, y: 12, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="relative z-10 flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_top,rgba(45,74,140,0.26),transparent_38%),radial-gradient(circle_at_bottom,rgba(0,168,107,0.16),transparent_34%),linear-gradient(180deg,rgba(6,18,38,0.96),rgba(7,20,38,0.84))] shadow-[0_30px_120px_rgba(0,0,0,0.32)] backdrop-blur-2xl"
      >
        {/* ── Header bar ── */}
        <div className="relative z-20 flex shrink-0 items-center gap-x-3 px-4 py-2.5">
          {/* Country selector dropdown */}
          <div ref={selectorRef} className="relative">
            <button
              onClick={() => setSelectorOpen(!selectorOpen)}
              className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1.5 text-[11px] font-medium text-cream transition-all hover:bg-white/[0.1]"
            >
              <Globe size={13} className="text-gpssa-green" />
              <span>Add Country</span>
              <ChevronDown size={12} className={`text-gray-muted transition-transform ${selectorOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {selectorOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-0 top-full z-50 mt-1.5 w-80 rounded-2xl border shadow-2xl overflow-hidden"
                  style={{ background: "rgba(8,18,38,0.98)", borderColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}
                >
                  <div className="p-2.5">
                    <div className="relative">
                      <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-muted" />
                      <input
                        value={selectorSearch}
                        onChange={(e) => setSelectorSearch(e.target.value)}
                        placeholder="Search countries or institutions..."
                        className="w-full rounded-xl bg-white/[0.06] py-2 pl-8 pr-3 text-xs text-cream outline-none placeholder:text-gray-muted/60"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-[340px] overflow-y-auto px-1.5 pb-2" style={{ scrollbarWidth: "thin" }}>
                    {Array.from(selectorItems.entries()).map(([region, items]) => (
                      <div key={region}>
                        <p className="px-2 pb-1 pt-2.5 text-[9px] uppercase tracking-[0.2em] text-gray-muted/60">{region}</p>
                        {items.map((item) => (
                          <button
                            key={item.id}
                            disabled={addingCountry === item.id}
                            onClick={() => {
                              if (item.type === "institution") {
                                toggleInstitution(item.id);
                              } else {
                                addCountryAsPeer(item.id);
                              }
                            }}
                            className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all ${
                              item.selected
                                ? "bg-gpssa-green/12 text-cream"
                                : "text-cream hover:bg-white/[0.06]"
                            } disabled:opacity-50`}
                          >
                            <CountryFlag code={item.countryCode} size="sm" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{item.name}</p>
                              <p className="text-[10px] text-gray-muted truncate">
                                {item.shortName !== item.name ? `${item.shortName} · ` : ""}{item.label}
                              </p>
                            </div>
                            {item.selected && <span className="h-2 w-2 shrink-0 rounded-full bg-gpssa-green" />}
                            {addingCountry === item.id && <Loader2 size={12} className="shrink-0 animate-spin text-gpssa-green" />}
                          </button>
                        ))}
                      </div>
                    ))}
                    {selectorItems.size === 0 && (
                      <p className="px-3 py-6 text-center text-xs text-gray-muted">No results</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* View mode pills */}
          <div className="flex gap-1">
            {(Object.keys(VIEW_META) as ViewMode[]).map((mode) => {
              const Icon = VIEW_META[mode].icon;
              const active = viewMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] transition-all ${
                    active
                      ? "bg-white/14 text-cream shadow-[0_6px_20px_rgba(0,0,0,0.2)]"
                      : "bg-white/[0.04] text-gray-muted hover:bg-white/[0.08] hover:text-cream"
                  }`}
                >
                  <Icon size={12} />
                  <span className="hidden sm:inline">{VIEW_META[mode].shortLabel}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setMethodologyOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-2.5 py-1 text-[11px] text-gray-muted transition-all hover:bg-white/[0.08] hover:text-cream"
          >
            <Database size={11} />
            <span className="hidden sm:inline">Methodology</span>
          </button>
        </div>

        {/* ── Selected peers strip ── */}
        <div className="relative z-20 flex shrink-0 flex-wrap items-center gap-1.5 px-4 pb-2">
          {/* GPSSA — always first, white text, no remove */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] px-2.5 py-1 text-[11px] font-medium text-cream backdrop-blur-sm">
            <CountryFlag code={workspace.targetInstitution.countryCode} size="xs" />
            {workspace.targetInstitution.shortName}
          </span>

          {selectedInstitutions.map((inst) => (
            <span
              key={inst.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] text-cream backdrop-blur-sm"
            >
              <CountryFlag code={inst.countryCode} size="xs" />
              {inst.country}
              <button
                onClick={() => removeInstitution(inst.id)}
                className="ml-0.5 rounded-full p-0.5 text-gray-muted transition-colors hover:bg-white/10 hover:text-cream"
              >
                <X size={10} />
              </button>
            </span>
          ))}

          {selectedInstitutions.length === 0 && (
            <span className="text-[11px] text-gray-muted">Click &ldquo;Add Country&rdquo; to select peers</span>
          )}
        </div>

        {/* ── Thin separator ── */}
        <div className="mx-4 h-px shrink-0 bg-white/[0.06]" />

        {/* ── Chart stage ── */}
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <div className="flex h-full w-full items-center justify-center p-2">

            {/* Radar */}
            {viewMode === "radar" && (
              <div className="h-full w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%" minHeight={1}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fill: "#B8C2CF", fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: "rgba(10,22,40,0.96)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, color: "#E8F0F5" }} />
                    <Legend wrapperStyle={{ fontSize: 11, color: "#8A9BB0" }} />
                    <RechartsRadar
                      name={workspace.targetInstitution.shortName}
                      dataKey={workspace.targetInstitution.shortName}
                      stroke="#2DD4BF"
                      fill="#2DD4BF"
                      fillOpacity={0.18}
                      strokeWidth={2.6}
                    />
                    {selectedInstitutions.map((inst, idx) => (
                      <RechartsRadar
                        key={inst.id}
                        name={inst.shortName}
                        dataKey={inst.shortName}
                        stroke={CHART_COLORS[(idx + 1) % CHART_COLORS.length]}
                        fill={CHART_COLORS[(idx + 1) % CHART_COLORS.length]}
                        fillOpacity={0.08}
                        strokeWidth={2}
                      />
                    ))}
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Bar chart */}
            {viewMode === "bars" && (
              <div className="h-full w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%" minHeight={1}>
                  <BarChart data={overallBars} layout="vertical" margin={{ top: 12, right: 20, bottom: 12, left: 16 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: "#8A9BB0", fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: "#E8F0F5", fontSize: 12 }} width={90} />
                    <Tooltip contentStyle={{ backgroundColor: "rgba(10,22,40,0.96)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, color: "#E8F0F5" }} />
                    <Bar dataKey="score" radius={[0, 10, 10, 0]} barSize={24}>
                      {overallBars.map((item) => (
                        <Cell key={item.name} fill={item.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Quadrant — flexible axis with flag dots */}
            {viewMode === "quadrant" && (
              <div className="flex h-full w-full flex-col min-h-[200px]">
                {/* Axis selectors */}
                <div className="flex items-center gap-4 px-4 py-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-[0.14em] text-gray-muted">X Axis</span>
                    <select
                      value={xDimSlug}
                      onChange={(e) => setXDimSlug(e.target.value)}
                      className="rounded-lg bg-white/[0.06] px-2 py-1 text-[11px] text-cream outline-none"
                    >
                      {workspace.dimensions.map((d) => (
                        <option key={d.slug} value={d.slug}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-[0.14em] text-gray-muted">Y Axis</span>
                    <select
                      value={yDimSlug}
                      onChange={(e) => setYDimSlug(e.target.value)}
                      className="rounded-lg bg-white/[0.06] px-2 py-1 text-[11px] text-cream outline-none"
                    >
                      {workspace.dimensions.map((d) => (
                        <option key={d.slug} value={d.slug}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%" minHeight={1}>
                    <ScatterChart margin={{ top: 16, right: 24, bottom: 40, left: 24 }}>
                      <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                      <XAxis
                        type="number"
                        dataKey="x"
                        domain={[0, 100]}
                        tick={{ fill: "#8A9BB0", fontSize: 11 }}
                        tickCount={6}
                      >
                        <Label value={xDimName} position="bottom" offset={16} style={{ fill: "#B8C2CF", fontSize: 12, fontWeight: 500 }} />
                      </XAxis>
                      <YAxis
                        type="number"
                        dataKey="y"
                        domain={[0, 100]}
                        tick={{ fill: "#8A9BB0", fontSize: 11 }}
                        tickCount={6}
                      >
                        <Label value={yDimName} angle={-90} position="insideLeft" offset={-8} style={{ fill: "#B8C2CF", fontSize: 12, fontWeight: 500 }} />
                      </YAxis>
                      <ReferenceLine x={50} stroke="rgba(255,255,255,0.12)" strokeDasharray="4 4" />
                      <ReferenceLine y={50} stroke="rgba(255,255,255,0.12)" strokeDasharray="4 4" />
                      <Tooltip content={<QuadrantTooltipContent />} cursor={{ strokeDasharray: "4 4", stroke: "rgba(255,255,255,0.15)" }} />
                      <Scatter data={quadrantData} shape={<FlagDot />} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Heatmap */}
            {viewMode === "heatmap" && (
              <div className={`grid h-full w-full min-h-0 auto-rows-min overflow-auto rounded-[22px] bg-black/10`} style={{ gridTemplateColumns: `minmax(110px,1fr) repeat(${comparisonInstitutions.length},minmax(0,1fr))` }}>
                <div className="sticky top-0 z-10 bg-navy/80 p-2 text-[10px] uppercase tracking-[0.16em] text-gray-muted backdrop-blur-md">Dimension</div>
                {comparisonInstitutions.map((inst, idx) => (
                  <div key={inst.id} className="sticky top-0 z-10 bg-navy/80 p-2 text-center backdrop-blur-md">
                    <p className="text-xs font-semibold text-cream">
                      <CountryFlag code={inst.countryCode} size="xs" /> {inst.shortName}
                    </p>
                    <p className="text-[10px] text-gray-muted">{idx === 0 ? "Target" : inst.region}</p>
                  </div>
                ))}
                {workspace.dimensions.map((dim) => (
                  <div key={dim.slug} className="contents">
                    <button
                      onClick={() => setEvidenceTarget({ type: "dimension", payload: dim })}
                      className="p-2 text-left transition-colors hover:bg-white/[0.03]"
                    >
                      <p className="text-xs font-medium text-cream">{dim.name}</p>
                    </button>
                    {comparisonInstitutions.map((inst) => {
                      const value = inst.scores[dim.slug] ?? 0;
                      return (
                        <button
                          key={`${dim.slug}-${inst.id}`}
                          onClick={() => setEvidenceTarget({ type: "dimension", payload: dim })}
                          className={`m-0.5 rounded-xl p-2 text-center transition-transform hover:scale-[1.03] ${scoreSurface(value)}`}
                        >
                          <p className={`font-playfair text-lg ${scoreTone(value)}`}>{value}</p>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Compact KPI ribbon ── */}
        <div className="relative z-20 shrink-0 px-3 pb-2.5 pt-1">
          <div className="flex gap-1.5 overflow-x-auto rounded-full bg-black/20 px-1.5 py-1.5 backdrop-blur-xl">
            {workspace.kpis.map((kpi) => {
              const primary = kpi.values.find((v) => v.comparator === "gpssa") ?? kpi.values[0];
              return (
                <button
                  key={kpi.slug}
                  onClick={() => setEvidenceTarget({ type: "kpi", payload: kpi })}
                  className="group inline-flex min-w-0 flex-1 items-center justify-between gap-2 rounded-full bg-white/[0.04] px-3 py-1.5 text-left transition-all hover:bg-white/[0.08]"
                >
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.16em] text-gray-muted">{kpi.ribbonLabel}</p>
                    <p className="font-playfair text-base text-cream">{formatValue(primary.value, kpi.unit)}</p>
                  </div>
                  <span className="text-[9px] uppercase tracking-[0.14em] text-gpssa-green opacity-0 transition-opacity group-hover:opacity-100">Src</span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Methodology modal */}
      <Modal isOpen={methodologyOpen} onClose={() => setMethodologyOpen(false)} title={workspace.dataset.name} description="Methodology, coverage, and sourcing posture" size="xl">
        <div className="space-y-5">
          <div className="rounded-[22px] bg-white/[0.04] p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gray-muted">Methodology</p>
            <p className="mt-3 text-sm leading-relaxed text-gray-muted">{workspace.dataset.methodology}</p>
          </div>
          <div className="rounded-[22px] bg-white/[0.04] p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gray-muted">Coverage</p>
            <p className="mt-3 text-sm leading-relaxed text-gray-muted">{workspace.dataset.coverageNote}</p>
          </div>
        </div>
      </Modal>

      {/* Evidence modal */}
      <BenchmarkEvidenceModal
        isOpen={!!evidenceTarget}
        onClose={() => setEvidenceTarget(null)}
        target={evidenceTarget}
        workspace={workspace}
        selectedInstitutions={selectedInstitutions}
      />
    </div>
  );
}
