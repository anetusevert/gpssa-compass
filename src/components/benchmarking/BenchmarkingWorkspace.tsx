"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Database,
  Filter,
  Layers,
  Maximize2,
  Radar,
  Search,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
  ZAxis,
} from "recharts";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { countryCodeToFlag } from "@/lib/benchmarking/catalog";
import type {
  BenchmarkDimensionPayload,
  BenchmarkInstitutionPayload,
  BenchmarkKpiPayload,
  BenchmarkSourceReference,
  BenchmarkWorkspacePayload,
} from "@/lib/benchmarking/workspace";

type ViewMode = "radar" | "bars" | "heatmap" | "quadrant";
type PeerLens = "all" | "regional" | "international" | "leaders";

type EvidenceTarget =
  | { type: "kpi"; payload: BenchmarkKpiPayload }
  | { type: "dimension"; payload: BenchmarkDimensionPayload };

const VIEW_META: Record<
  ViewMode,
  {
    label: string;
    shortLabel: string;
    icon: typeof Radar;
    summary: string;
  }
> = {
  radar: {
    label: "Comparative Shape",
    shortLabel: "Spider",
    icon: Radar,
    summary: "The shape of relative maturity across the selected peer set.",
  },
  bars: {
    label: "Peer Ranking",
    shortLabel: "Bars",
    icon: BarChart3,
    summary: "Average comparative standing across all benchmark dimensions.",
  },
  heatmap: {
    label: "Intensity Matrix",
    shortLabel: "Heatmap",
    icon: Layers,
    summary: "A dense read of strength and weakness by institution and dimension.",
  },
  quadrant: {
    label: "Gap Pressure Map",
    shortLabel: "Quadrant",
    icon: Activity,
    summary: "Where GPSSA faces the greatest maturity pressure versus its active peers.",
  },
};

const CHART_COLORS = ["#2DD4BF", "#F59E0B", "#60A5FA", "#C084FC"];
const EASE = [0.16, 1, 0.3, 1] as const;

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
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
                {[source.publisher, source.region, source.sourceType]
                  .filter(Boolean)
                  .join(" · ")}
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

function BenchmarkEvidenceModal({
  isOpen,
  onClose,
  target,
  workspace,
  selectedInstitutions,
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
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={target.payload.name}
        description={target.payload.description ?? "Source-backed benchmark indicator"}
        size="xl"
      >
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {target.payload.values.map((value) => (
              <div
                key={`${target.payload.slug}-${value.comparator}`}
                className="rounded-[22px] bg-white/[0.04] p-4"
              >
                <p className="text-[11px] uppercase tracking-[0.18em] text-gray-muted">
                  {value.label}
                </p>
                <p className="mt-2 font-playfair text-3xl text-cream">
                  {formatValue(value.value, target.payload.unit)}
                </p>
                {value.note && (
                  <p className="mt-2 text-xs leading-relaxed text-gray-muted">{value.note}</p>
                )}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-cream">
              Sources
            </h4>
            <EvidenceList sources={target.payload.values.flatMap((value) => value.sources)} />
          </div>
        </div>
      </Modal>
    );
  }

  const institutions = [workspace.targetInstitution, ...selectedInstitutions];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${target.payload.name} Evidence`}
      description={target.payload.description ?? "Dimension-level score evidence"}
      size="xl"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {institutions.map((institution) => (
          <div key={`${institution.id}-${target.payload.slug}`} className="rounded-[22px] bg-white/[0.04] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-cream">
                  {countryCodeToFlag(institution.countryCode)} {institution.shortName}
                </p>
                <p className="text-xs text-gray-muted">{institution.country}</p>
              </div>
              <p className={`font-playfair text-3xl ${scoreTone(institution.scores[target.payload.slug] ?? 0)}`}>
                {Math.round(institution.scores[target.payload.slug] ?? 0)}
              </p>
            </div>
            <div className="mt-4">
              <EvidenceList sources={institution.scoreEvidence[target.payload.slug] ?? []} />
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function CompactToggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-all ${
        active
          ? "bg-white/14 text-cream shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
          : "bg-white/[0.05] text-gray-muted hover:bg-white/[0.08] hover:text-cream"
      }`}
    >
      {children}
    </button>
  );
}

export function BenchmarkingWorkspace({
  workspace,
}: {
  workspace: BenchmarkWorkspacePayload;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("radar");
  const [peerLens, setPeerLens] = useState<PeerLens>("all");
  const [regionFilter, setRegionFilter] = useState("All Regions");
  const [searchQuery, setSearchQuery] = useState("");
  const [controlsOpen, setControlsOpen] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const [evidenceTarget, setEvidenceTarget] = useState<EvidenceTarget | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    workspace.peerInstitutions.slice(0, 3).map((institution) => institution.id)
  );
  const [selectorTab, setSelectorTab] = useState<"institutions" | "countries">("institutions");
  const [countryPeers, setCountryPeers] = useState<Array<{ iso3: string; name: string; flag: string; region: string; maturityLabel: string | null; maturityScore: number | null }>>([]);
  const [countrySearch, setCountrySearch] = useState("");
  const [addingCountry, setAddingCountry] = useState<string | null>(null);

  const fetchCountryPeers = useCallback(async () => {
    try {
      const res = await fetch("/api/countries?status=completed");
      if (res.ok) {
        const data = await res.json();
        setCountryPeers(data.map((c: Record<string, unknown>) => ({
          iso3: c.iso3 as string,
          name: c.name as string,
          flag: (c.flag as string) ?? "",
          region: (c.region as string) ?? "",
          maturityLabel: c.maturityLabel as string | null,
          maturityScore: c.maturityScore as number | null,
        })));
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (selectorOpen && selectorTab === "countries" && countryPeers.length === 0) {
      fetchCountryPeers();
    }
  }, [selectorOpen, selectorTab, countryPeers.length, fetchCountryPeers]);

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

  const filteredCountryPeers = useMemo(() => {
    if (!countrySearch) return countryPeers;
    const q = countrySearch.toLowerCase();
    return countryPeers.filter((c) => c.name.toLowerCase().includes(q) || c.iso3.toLowerCase().includes(q));
  }, [countryPeers, countrySearch]);

  const regions = useMemo(
    () => [
      "All Regions",
      ...Array.from(new Set(workspace.peerInstitutions.map((item) => item.region))),
    ],
    [workspace.peerInstitutions]
  );

  const filteredPeers = useMemo(() => {
    return workspace.peerInstitutions.filter((institution) => {
      const search = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !search ||
        institution.name.toLowerCase().includes(search) ||
        institution.country.toLowerCase().includes(search) ||
        institution.shortName.toLowerCase().includes(search);

      const matchesRegion =
        regionFilter === "All Regions" || institution.region === regionFilter;

      const matchesLens =
        peerLens === "all"
          ? true
          : peerLens === "regional"
            ? institution.region === "GCC"
            : peerLens === "international"
              ? institution.region !== "GCC"
              : institution.digitalMaturity === "World-class";

      return matchesSearch && matchesRegion && matchesLens;
    });
  }, [peerLens, regionFilter, searchQuery, workspace.peerInstitutions]);

  const selectedInstitutions = useMemo(() => {
    const byId = new Map(workspace.peerInstitutions.map((institution) => [institution.id, institution]));
    const kept = selectedIds
      .map((id) => byId.get(id))
      .filter((value): value is BenchmarkInstitutionPayload => Boolean(value));

    if (kept.length > 0) return kept.slice(0, 3);
    return workspace.peerInstitutions.slice(0, 3);
  }, [selectedIds, workspace.peerInstitutions]);

  const comparisonInstitutions = useMemo(
    () => [workspace.targetInstitution, ...selectedInstitutions],
    [selectedInstitutions, workspace.targetInstitution]
  );

  const dimensionAnalysis = useMemo(() => {
    return workspace.dimensions.map((dimension) => {
      const targetScore = workspace.targetInstitution.scores[dimension.slug] ?? 0;
      const peerScores = selectedInstitutions.map(
        (institution) => institution.scores[dimension.slug] ?? 0
      );
      const peerAverage = average(peerScores);
      const gap = peerAverage - targetScore;

      return {
        ...dimension,
        targetScore,
        peerAverage,
        gap,
      };
    });
  }, [selectedInstitutions, workspace.dimensions, workspace.targetInstitution.scores]);

  const topGap = useMemo(
    () => dimensionAnalysis.slice().sort((left, right) => right.gap - left.gap)[0],
    [dimensionAnalysis]
  );

  const strongestArea = useMemo(
    () =>
      dimensionAnalysis
        .slice()
        .sort((left, right) => right.targetScore - left.targetScore)[0],
    [dimensionAnalysis]
  );

  const activeNarrative = useMemo(() => {
    const lead = strongestArea?.name ?? "service breadth";
    const gap = topGap?.name ?? "data & analytics";
    const gapValue = Math.max(0, Math.round(topGap?.gap ?? 0));

    if (viewMode === "bars") {
      return {
        title: `GPSSA holds credible ground on ${lead}, but the ranking still opens on ${gap}.`,
        subtitle: `The selected peer set shows a ${gapValue}-point maturity spread in the pressure zone that matters most for a world-class response narrative.`,
      };
    }

    if (viewMode === "heatmap") {
      return {
        title: `The matrix makes the story plain: strength is visible, but leadership is still unevenly distributed.`,
        subtitle: `GPSSA performs best on ${lead}, while ${gap} remains the most material separation from the comparison leaders.`,
      };
    }

    if (viewMode === "quadrant") {
      return {
        title: `The transformation pressure clusters around ${gap}.`,
        subtitle: `Peer averages are pulling away fastest where platform intelligence and orchestration need to feel more decisive.`,
      };
    }

    return {
      title: `GPSSA's benchmark shape is strongest on ${lead}, but leaders still create distance on ${gap}.`,
      subtitle: `This is the consultant view of the profile: credible foundations, visible service depth, and a sharper need to elevate the digital intelligence story.`,
    };
  }, [strongestArea, topGap, viewMode]);

  const overallBars = useMemo(() => {
    return comparisonInstitutions
      .map((institution, index) => ({
        name: institution.shortName,
        score: average(
          workspace.dimensions.map((dimension) => institution.scores[dimension.slug] ?? 0)
        ),
        fill: index === 0 ? "#2DD4BF" : CHART_COLORS[index],
      }))
      .sort((left, right) => right.score - left.score);
  }, [comparisonInstitutions, workspace.dimensions]);

  const radarData = useMemo(() => {
    return workspace.dimensions.map((dimension) => {
      const point: Record<string, string | number> = {
        dimension: dimension.name,
        fullMark: 100,
        [workspace.targetInstitution.shortName]:
          workspace.targetInstitution.scores[dimension.slug] ?? 0,
      };

      selectedInstitutions.forEach((institution) => {
        point[institution.shortName] = institution.scores[dimension.slug] ?? 0;
      });

      return point;
    });
  }, [selectedInstitutions, workspace.dimensions, workspace.targetInstitution]);

  const quadrantData = useMemo(() => {
    return dimensionAnalysis.map((dimension) => ({
      name: dimension.name,
      x: Math.round(dimension.peerAverage),
      y: Math.round(dimension.gap),
      z: Math.max(Math.abs(Math.round(dimension.gap)) * 2, 8),
    }));
  }, [dimensionAnalysis]);

  function toggleInstitution(id: string) {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter((value) => value !== id);
      }
      if (current.length >= 3) {
        return [...current.slice(1), id];
      }
      return [...current, id];
    });
  }

  const controlsContent = (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={regionFilter}
        onChange={(event) => setRegionFilter(event.target.value)}
        className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] text-cream outline-none"
      >
        {regions.map((region) => (
          <option key={region} value={region}>
            {region}
          </option>
        ))}
      </select>

      <div className="flex gap-1">
        {[
          { id: "all", label: "All" },
          { id: "regional", label: "GCC" },
          { id: "international", label: "Intl" },
          { id: "leaders", label: "Leaders" },
        ].map((lens) => (
          <CompactToggle
            key={lens.id}
            active={peerLens === lens.id}
            onClick={() => setPeerLens(lens.id as PeerLens)}
          >
            {lens.label}
          </CompactToggle>
        ))}
      </div>

      <button
        onClick={() => setSelectorOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-gpssa-green/14 px-2.5 py-1 text-[11px] font-medium text-gpssa-green transition-all hover:bg-gpssa-green/18"
      >
        <Filter size={11} />
        Peers ({selectedInstitutions.length})
      </button>
    </div>
  );

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
        {/* ── Compact header bar ── */}
        <div className="relative z-20 flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5">
          {/* Narrative headline — single line */}
          <motion.p
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05, duration: 0.3 }}
            className="mr-auto max-w-[44%] truncate font-playfair text-sm text-cream xl:max-w-[36%]"
          >
            {activeNarrative.title}
          </motion.p>

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

          {/* Inline controls on desktop, modal on mobile */}
          <div className="hidden xl:flex xl:items-center xl:gap-2">{controlsContent}</div>
          <button
            onClick={() => setControlsOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] text-gray-muted transition-all hover:bg-white/[0.08] hover:text-cream xl:hidden"
          >
            <Filter size={11} />
            Filters
          </button>

          <button
            onClick={() => setMethodologyOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-2.5 py-1 text-[11px] text-gray-muted transition-all hover:bg-white/[0.08] hover:text-cream"
          >
            <Database size={11} />
            <span className="hidden sm:inline">Methodology</span>
          </button>
        </div>

        {/* ── Thin separator ── */}
        <div className="mx-4 h-px shrink-0 bg-white/[0.06]" />

        {/* ── Chart stage — takes all remaining space ── */}
        <div className="relative min-h-0 flex-1 overflow-hidden">
          {/* Floating institution chips */}
          <div className="absolute left-3 top-2 z-20 flex flex-wrap gap-1.5">
            <Badge variant="blue" size="md">
              {workspace.targetInstitution.shortName}
            </Badge>
            {selectedInstitutions.map((institution) => (
              <span
                key={institution.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1 text-[10px] text-cream backdrop-blur-sm"
              >
                <span>{countryCodeToFlag(institution.countryCode)}</span>
                <span>{institution.shortName}</span>
              </span>
            ))}
          </div>

          {/* Gap focus chip */}
          <button
            onClick={() => setEvidenceTarget({ type: "dimension", payload: topGap ?? workspace.dimensions[0] })}
            className="absolute right-3 top-2 z-20 rounded-full bg-black/30 px-2.5 py-1 text-[10px] text-gray-muted backdrop-blur-sm transition-colors hover:text-cream"
          >
            Gap: {topGap?.name ?? workspace.dimensions[0]?.name}
          </button>

          <div className="flex h-full w-full items-center justify-center p-2">
            {viewMode === "radar" && (
              <div className="h-full w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%" minHeight={1}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fill: "#B8C2CF", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(10,22,40,0.96)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 18,
                        color: "#E8F0F5",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, color: "#8A9BB0" }} />
                    <RechartsRadar
                      name={workspace.targetInstitution.shortName}
                      dataKey={workspace.targetInstitution.shortName}
                      stroke="#2DD4BF"
                      fill="#2DD4BF"
                      fillOpacity={0.18}
                      strokeWidth={2.6}
                    />
                    {selectedInstitutions.map((institution, index) => (
                      <RechartsRadar
                        key={institution.id}
                        name={institution.shortName}
                        dataKey={institution.shortName}
                        stroke={CHART_COLORS[index + 1]}
                        fill={CHART_COLORS[index + 1]}
                        fillOpacity={0.08}
                        strokeWidth={2}
                      />
                    ))}
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            {viewMode === "bars" && (
              <div className="h-full w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%" minHeight={1}>
                  <BarChart data={overallBars} layout="vertical" margin={{ top: 12, right: 20, bottom: 12, left: 16 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: "#8A9BB0", fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: "#E8F0F5", fontSize: 12 }} width={90} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(10,22,40,0.96)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 18,
                        color: "#E8F0F5",
                      }}
                    />
                    <Bar dataKey="score" radius={[0, 10, 10, 0]} barSize={24}>
                      {overallBars.map((item) => (
                        <Cell key={item.name} fill={item.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {viewMode === "quadrant" && (
              <div className="h-full w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%" minHeight={1}>
                  <ScatterChart margin={{ top: 12, right: 20, bottom: 12, left: 18 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" dataKey="x" domain={[40, 100]} tick={{ fill: "#8A9BB0", fontSize: 11 }} />
                    <YAxis type="number" dataKey="y" domain={[-10, 35]} tick={{ fill: "#8A9BB0", fontSize: 11 }} />
                    <ZAxis type="number" dataKey="z" range={[120, 620]} />
                    <Tooltip
                      cursor={{ strokeDasharray: "4 4" }}
                      contentStyle={{
                        backgroundColor: "rgba(10,22,40,0.96)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 18,
                        color: "#E8F0F5",
                      }}
                    />
                    <ReferenceLine x={70} stroke="rgba(255,255,255,0.12)" />
                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.12)" />
                    <Scatter data={quadrantData} fill="#2DD4BF" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            )}

            {viewMode === "heatmap" && (
              <div className="grid h-full w-full min-h-0 auto-rows-min grid-cols-[minmax(110px,1fr)_repeat(4,minmax(0,1fr))] overflow-auto rounded-[22px] bg-black/10">
                <div className="sticky top-0 z-10 bg-navy/80 p-2 text-[10px] uppercase tracking-[0.16em] text-gray-muted backdrop-blur-md">Dimension</div>
                {comparisonInstitutions.map((institution, index) => (
                  <div key={institution.id} className="sticky top-0 z-10 bg-navy/80 p-2 text-center backdrop-blur-md">
                    <p className="text-xs font-semibold text-cream">
                      {countryCodeToFlag(institution.countryCode)} {institution.shortName}
                    </p>
                    <p className="text-[10px] text-gray-muted">{index === 0 ? "Target" : institution.region}</p>
                  </div>
                ))}
                {workspace.dimensions.map((dimension) => (
                  <div key={dimension.slug} className="contents">
                    <button
                      onClick={() => setEvidenceTarget({ type: "dimension", payload: dimension })}
                      className="p-2 text-left transition-colors hover:bg-white/[0.03]"
                    >
                      <p className="text-xs font-medium text-cream">{dimension.name}</p>
                    </button>
                    {comparisonInstitutions.map((institution) => {
                      const value = institution.scores[dimension.slug] ?? 0;
                      return (
                        <button
                          key={`${dimension.slug}-${institution.id}`}
                          onClick={() => setEvidenceTarget({ type: "dimension", payload: dimension })}
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
              const primary = kpi.values.find((item) => item.comparator === "gpssa") ?? kpi.values[0];
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

      <Modal
        isOpen={controlsOpen}
        onClose={() => setControlsOpen(false)}
        title="Benchmark Controls"
        description="Filters and peer selection"
        size="lg"
      >
        <div className="space-y-4">
          {controlsContent}
        </div>
      </Modal>

      <Modal
        isOpen={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        title="Peer Selection"
        description="Choose up to three comparison institutions or countries"
        size="xl"
      >
        <div className="space-y-4">
          {/* Tab switcher */}
          <div className="flex gap-1 rounded-xl bg-white/[0.04] p-1">
            <button
              onClick={() => setSelectorTab("institutions")}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all ${selectorTab === "institutions" ? "bg-white/10 text-cream" : "text-gray-muted hover:text-cream"}`}
            >
              Institutions ({workspace.peerInstitutions.length})
            </button>
            <button
              onClick={() => setSelectorTab("countries")}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all ${selectorTab === "countries" ? "bg-white/10 text-cream" : "text-gray-muted hover:text-cream"}`}
            >
              Countries ({countryPeers.length})
            </button>
          </div>

          {selectorTab === "institutions" && (
            <>
              <div className="relative">
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-muted" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search institutions"
                  className="w-full rounded-2xl bg-white/[0.05] py-3 pl-9 pr-3 text-sm text-cream outline-none"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPeers.map((institution) => {
                  const selected = selectedInstitutions.some((item) => item.id === institution.id);
                  return (
                    <button
                      key={institution.id}
                      onClick={() => toggleInstitution(institution.id)}
                      className={`rounded-[22px] p-4 text-left transition-all ${
                        selected ? "bg-gpssa-green/14 text-cream" : "bg-white/[0.04] text-cream hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">
                            {countryCodeToFlag(institution.countryCode)} {institution.shortName}
                          </p>
                          <p className="mt-1 text-xs text-gray-muted">{institution.country}</p>
                        </div>
                        {selected && <span className="h-2.5 w-2.5 rounded-full bg-gpssa-green" />}
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-gray-muted">
                        <span>{institution.region}</span>
                        <span>•</span>
                        <span>{institution.digitalMaturity}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {selectorTab === "countries" && (
            <>
              <div className="relative">
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-muted" />
                <input
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  placeholder="Search researched countries"
                  className="w-full rounded-2xl bg-white/[0.05] py-3 pl-9 pr-3 text-sm text-cream outline-none"
                />
              </div>
              {countryPeers.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-muted">
                  No researched countries available. Run the Research Agent from Admin to populate country data.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredCountryPeers.map((country) => (
                    <button
                      key={country.iso3}
                      onClick={() => addCountryAsPeer(country.iso3)}
                      disabled={addingCountry === country.iso3}
                      className="rounded-[22px] bg-white/[0.04] p-4 text-left transition-all hover:bg-white/[0.06] disabled:opacity-50"
                    >
                      <p className="text-sm font-semibold text-cream">
                        {country.flag} {country.name}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-gray-muted">
                        <span>{country.region}</span>
                        {country.maturityLabel && (
                          <>
                            <span>•</span>
                            <span>{country.maturityLabel}</span>
                          </>
                        )}
                        {country.maturityScore && (
                          <>
                            <span>•</span>
                            <span>{country.maturityScore.toFixed(1)}</span>
                          </>
                        )}
                      </div>
                      {addingCountry === country.iso3 && (
                        <p className="mt-2 text-[10px] text-gpssa-green animate-pulse">Adding to benchmark...</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={methodologyOpen}
        onClose={() => setMethodologyOpen(false)}
        title={workspace.dataset.name}
        description="Methodology, coverage, and sourcing posture"
        size="xl"
      >
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

