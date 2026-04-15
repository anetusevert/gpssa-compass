"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  Radio,
  Smartphone,
  Building2,
  Headphones,
  Link2,
  Code2,
  Gauge,
  Layers,
  Globe2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { CountrySelector } from "@/components/comparison/CountrySelector";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { StatBar, type StatBarItem } from "@/components/ui/StatBar";
import { COUNTRIES } from "@/lib/countries/catalog";

/* ───── Types & Constants ───── */
const CHANNELS = [
  { id: "portal", label: "Digital Portal", short: "Portal", icon: LayoutGrid },
  { id: "mobile", label: "Mobile App", short: "App", icon: Smartphone },
  { id: "centers", label: "Service Centers", short: "Centers", icon: Building2 },
  { id: "call", label: "Call Center", short: "Call", icon: Headphones },
  { id: "partner", label: "Partner Channels", short: "Partner", icon: Link2 },
  { id: "api", label: "API / Integration", short: "API", icon: Code2 },
] as const;

const CATEGORIES = ["Employer", "Insured", "Beneficiary", "Agent/Guardian", "GCC", "Military", "General"] as const;
type Category = (typeof CATEGORIES)[number];
type ChannelId = (typeof CHANNELS)[number]["id"];
type Capability = "Full" | "Partial" | "Planned" | "None";

interface ServiceChannelRow {
  id: string;
  name: string;
  category: Category;
  channels: Record<ChannelId, Capability>;
}

interface IntlChannelRow {
  countryIso3: string;
  countryName: string;
  id: string;
  name: string;
  category: string;
  channels: Record<ChannelId, Capability>;
}

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

const capabilityScore: Record<Capability, number> = { Full: 4, Partial: 2, Planned: 1, None: 0 };

const CELL_COLORS: Record<Capability, string> = {
  Full: "bg-gpssa-green/70",
  Partial: "bg-gold/60",
  Planned: "bg-adl-blue/50",
  None: "bg-white/[0.04]",
};

const CELL_HOVER: Record<Capability, string> = {
  Full: "hover:bg-gpssa-green/90",
  Partial: "hover:bg-gold/80",
  Planned: "hover:bg-adl-blue/70",
  None: "hover:bg-white/[0.08]",
};

function computeMaturity(rows: ServiceChannelRow[] | IntlChannelRow[]) {
  return CHANNELS.map((ch) => {
    if (rows.length === 0) return { ...ch, score: 0, maturityTier: "—" as const };
    const sum = rows.reduce((acc, r) => acc + capabilityScore[r.channels[ch.id] ?? "None"], 0);
    const max = rows.length * 4;
    const pct = Math.round((sum / max) * 100);
    let maturityTier: "Mature" | "Progressing" | "Foundational" | "Emerging" = "Emerging";
    if (pct >= 75) maturityTier = "Mature";
    else if (pct >= 50) maturityTier = "Progressing";
    else if (pct >= 30) maturityTier = "Foundational";
    return { ...ch, score: pct, maturityTier };
  });
}

const tierVariant: Record<string, "green" | "blue" | "gold" | "gray"> = {
  Mature: "green",
  Progressing: "blue",
  Foundational: "gold",
  Emerging: "gray",
  "—": "gray",
};

/* ───── Page Component ───── */
export default function ChannelCapabilitiesPage() {
  const [serviceMatrix, setServiceMatrix] = useState<ServiceChannelRow[]>(STATIC_SERVICE_MATRIX);
  const [category, setCategory] = useState<string>("All");
  const [comparisonCountries, setComparisonCountries] = useState<string[]>([]);
  const [intlServices, setIntlServices] = useState<IntlChannelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState<{ row: string; ch: string } | null>(null);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [channelDetailModal, setChannelDetailModal] = useState<string | null>(null);
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/services/channels")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const rowMap = new Map<string, ServiceChannelRow>();
        for (const item of data) {
          const svc = item.service;
          if (!svc) continue;
          const serviceId = String(svc.id);
          if (!rowMap.has(serviceId)) {
            rowMap.set(serviceId, { id: serviceId, name: String(svc.name ?? ""), category: String(svc.category ?? "General") as Category, channels: { portal: "None", mobile: "None", centers: "None", call: "None", partner: "None", api: "None" } });
          }
          const row = rowMap.get(serviceId)!;
          const chName = String(item.channelName ?? "") as ChannelId;
          if (chName in row.channels) row.channels[chName] = String(item.capabilityLevel ?? "None") as Capability;
        }
        if (rowMap.size > 0) setServiceMatrix(Array.from(rowMap.values()));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    if (comparisonCountries.length === 0) { setIntlServices([]); return; }
    const params = new URLSearchParams({ countries: comparisonCountries.join(",") });
    fetch(`/api/international/services?${params}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data: Record<string, unknown>[]) => {
        if (!Array.isArray(data)) return;
        const rows: IntlChannelRow[] = data
          .filter((s) => s.channelCapabilities)
          .map((s) => {
            const channels: Record<ChannelId, Capability> = { portal: "None", mobile: "None", centers: "None", call: "None", partner: "None", api: "None" };
            try {
              const parsed = typeof s.channelCapabilities === "string" ? JSON.parse(s.channelCapabilities as string) : s.channelCapabilities;
              for (const [k, v] of Object.entries(parsed as Record<string, string>)) {
                if (k in channels) channels[k as ChannelId] = (v as Capability) ?? "None";
              }
            } catch { /* keep defaults */ }
            const country = COUNTRIES.find((c) => c.iso3 === s.countryIso3);
            return { countryIso3: s.countryIso3 as string, countryName: country?.name ?? (s.countryIso3 as string), id: s.id as string, name: s.name as string, category: s.category as string, channels };
          });
        setIntlServices(rows);
      })
      .catch(() => setIntlServices([]));
  }, [comparisonCountries]);

  const filtered = useMemo(() => {
    if (category === "All") return serviceMatrix;
    return serviceMatrix.filter((r) => r.category === category);
  }, [category, serviceMatrix]);

  const grouped = useMemo(() => {
    const map = new Map<Category, ServiceChannelRow[]>();
    for (const cat of CATEGORIES) map.set(cat, []);
    for (const row of filtered) {
      const list = map.get(row.category);
      if (list) list.push(row);
    }
    return CATEGORIES.map((c) => ({ category: c, rows: map.get(c)! })).filter((g) => g.rows.length > 0);
  }, [filtered]);

  const stats = useMemo(() => {
    const rows = serviceMatrix;
    const fullyDigital = rows.filter((r) => r.channels.portal === "Full" && r.channels.mobile === "Full").length;
    const omniStrong = rows.filter((r) => r.channels.centers === "Full" || r.channels.call === "Full").length;
    const apiReady = rows.filter((r) => r.channels.api === "Full" || r.channels.api === "Partial").length;
    return { mapped: rows.length, channelCount: CHANNELS.length, fullyDigital, omniStrong, apiReady };
  }, [serviceMatrix]);

  const gpssaMaturity = useMemo(() => computeMaturity(filtered), [filtered]);

  const intlByCountry = useMemo(() => {
    const map = new Map<string, IntlChannelRow[]>();
    for (const s of intlServices) {
      const list = map.get(s.countryIso3) ?? [];
      list.push(s);
      map.set(s.countryIso3, list);
    }
    return map;
  }, [intlServices]);

  const intlMaturityByCountry = useMemo(() => {
    const result = new Map<string, ReturnType<typeof computeMaturity>>();
    for (const [iso3, rows] of Array.from(intlByCountry.entries())) {
      result.set(iso3, computeMaturity(rows));
    }
    return result;
  }, [intlByCountry]);

  const toggleCat = useCallback((cat: string) => {
    setCollapsedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  }, []);

  const statBarItems: StatBarItem[] = useMemo(() => [
    { icon: Layers, value: stats.mapped, label: "Services Mapped" },
    { icon: Radio, value: stats.channelCount, label: "Channels" },
    {
      icon: Smartphone, value: stats.fullyDigital, label: "Fully Digital",
      detail: (
        <div className="space-y-1.5">
          <p className="text-xs text-gray-muted mb-2">Services with Full capability on both Portal and Mobile</p>
          {serviceMatrix.filter((r) => r.channels.portal === "Full" && r.channels.mobile === "Full").map((r) => (
            <div key={r.id} className="flex items-center gap-2">
              <Badge variant="green" size="sm">Full</Badge>
              <span className="text-xs text-cream">{r.name}</span>
            </div>
          ))}
          {stats.fullyDigital === 0 && <p className="text-xs text-gray-muted">No services are fully digital yet.</p>}
        </div>
      ),
    },
    { icon: Gauge, value: stats.omniStrong, label: "Assisted Strong" },
    ...(comparisonCountries.length > 0
      ? [{ icon: Globe2, value: intlServices.length, label: `Intl (${comparisonCountries.length})` } as StatBarItem]
      : []),
  ], [stats, serviceMatrix, comparisonCountries.length, intlServices.length]);

  if (loading) {
    return <div className="flex h-full items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ─── Header ─── */}
      <div className="shrink-0 flex items-center gap-3 px-5 py-2.5 border-b border-white/[0.06]">
        <h1 className="font-playfair text-base font-semibold text-cream shrink-0">Channel Capabilities</h1>
        <div className="h-4 w-px bg-white/10" />
        <CountrySelector
          selected={comparisonCountries}
          onChange={setComparisonCountries}
          pillar="services"
          variant="inline"
        />
      </div>

      {/* ─── Category pills ─── */}
      <div className="shrink-0 flex items-center gap-1 px-5 py-2 border-b border-white/[0.04] overflow-x-auto scrollbar-none">
        {["All", ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
              category === cat
                ? "bg-gpssa-green/20 text-gpssa-green border border-gpssa-green/30"
                : "text-gray-muted hover:text-cream hover:bg-white/5 border border-transparent"
            }`}
          >
            {cat}
          </button>
        ))}
        {/* Legend */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          {(["Full", "Partial", "Planned", "None"] as Capability[]).map((lvl) => (
            <span key={lvl} className="inline-flex items-center gap-1 text-[9px] text-gray-muted">
              <span className={`w-2.5 h-2.5 rounded-[3px] ${CELL_COLORS[lvl]}`} />
              {lvl}
            </span>
          ))}
        </div>
      </div>

      {/* ─── Main Split ─── */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Left: Heatmap matrix */}
        <div className="w-[55%] border-r border-white/[0.06] overflow-y-auto scrollbar-thin">
          {/* Column headers */}
          <div className="sticky top-0 z-20 flex items-center bg-navy/95 backdrop-blur-sm border-b border-white/[0.06]">
            <div className="w-[180px] shrink-0 px-3 py-2">
              <span className="text-[9px] text-gray-muted uppercase tracking-wider">Service</span>
            </div>
            {CHANNELS.map((ch) => {
              const Icon = ch.icon;
              return (
                <div key={ch.id} className="flex-1 flex flex-col items-center py-2 min-w-[52px]">
                  <Icon size={13} className="text-teal-400/80 mb-0.5" />
                  <span className="text-[8px] text-gray-muted uppercase tracking-wide">{ch.short}</span>
                </div>
              );
            })}
          </div>

          {/* Rows grouped by category */}
          {grouped.map(({ category: cat, rows }) => {
            const isCollapsed = collapsedCats.has(cat);
            return (
              <div key={cat}>
                <button
                  onClick={() => toggleCat(cat)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 bg-white/[0.02] border-b border-white/[0.04] hover:bg-white/[0.04] transition-colors"
                >
                  <motion.span
                    animate={{ rotate: isCollapsed ? -90 : 0 }}
                    className="text-gray-muted text-[9px]"
                  >▼</motion.span>
                  <span className="text-[9px] font-semibold text-cream uppercase tracking-wider">{cat}</span>
                  <span className="text-[9px] text-gray-muted">({rows.length})</span>
                </button>
                <AnimatePresence initial={false}>
                  {!isCollapsed && rows.map((row) => (
                    <motion.div
                      key={row.id}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <div
                        className={`flex items-center border-b border-white/[0.03] transition-colors cursor-pointer ${
                          selectedRow === row.id ? "bg-gpssa-green/[0.06]" : "hover:bg-white/[0.02]"
                        }`}
                        onClick={() => setSelectedRow(selectedRow === row.id ? null : row.id)}
                      >
                        <div className="w-[180px] shrink-0 px-3 py-2">
                          <p className="text-[10px] text-cream font-medium truncate leading-snug">{row.name}</p>
                        </div>
                        {CHANNELS.map((ch) => {
                          const level = row.channels[ch.id];
                          const isHovered = hoveredCell?.row === row.id && hoveredCell?.ch === ch.id;
                          return (
                            <div
                              key={ch.id}
                              className="flex-1 flex justify-center py-2 min-w-[52px]"
                              onMouseEnter={() => setHoveredCell({ row: row.id, ch: ch.id })}
                              onMouseLeave={() => setHoveredCell(null)}
                            >
                              <div className="relative">
                                <div className={`w-7 h-7 rounded-md ${CELL_COLORS[level]} ${CELL_HOVER[level]} transition-colors`} />
                                {isHovered && (
                                  <div className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded bg-navy border border-white/10 shadow-xl whitespace-nowrap">
                                    <p className="text-[9px] text-cream font-medium">{row.name}</p>
                                    <p className="text-[8px] text-gray-muted">{ch.label}: <span className="text-cream">{level}</span></p>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Right: Channel Maturity Dashboard */}
        <div className="w-[45%] overflow-y-auto scrollbar-thin p-4">
          <div className="flex items-center gap-2 mb-3">
            <Gauge size={13} className="text-teal-400" />
            <h2 className="text-[11px] font-semibold text-cream uppercase tracking-wider">Channel Maturity</h2>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {gpssaMaturity.map((ch) => {
              const Icon = ch.icon;
              const intlForChannel = Array.from(intlMaturityByCountry.entries()).map(([iso3, mat]) => {
                const m = mat.find((x) => x.id === ch.id);
                const country = COUNTRIES.find((c) => c.iso3 === iso3);
                return m ? { iso3, name: country?.name ?? iso3, score: m.score, tier: m.maturityTier } : null;
              }).filter(Boolean) as { iso3: string; name: string; score: number; tier: string }[];

              return (
                <button
                  key={ch.id}
                  onClick={() => setChannelDetailModal(ch.id)}
                  className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-left hover:bg-white/[0.05] transition-colors group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 rounded-lg bg-white/[0.04]">
                      <Icon size={14} className="text-teal-400" />
                    </div>
                    <Badge variant={tierVariant[ch.maturityTier] ?? "gray"} size="sm">{ch.maturityTier}</Badge>
                  </div>
                  <p className="text-[11px] font-medium text-cream mb-2">{ch.label}</p>

                  {/* Arc gauge */}
                  <div className="relative w-full h-10 flex items-end justify-center mb-1">
                    <svg viewBox="0 0 100 50" className="w-full h-full">
                      <path d="M 10 45 A 40 40 0 0 1 90 45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" strokeLinecap="round" />
                      <motion.path
                        d="M 10 45 A 40 40 0 0 1 90 45"
                        fill="none"
                        stroke="url(#gaugeGrad)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray="126"
                        initial={{ strokeDashoffset: 126 }}
                        animate={{ strokeDashoffset: 126 - (126 * ch.score / 100) }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                      <defs>
                        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="100%" stopColor="#22C55E" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="absolute bottom-0 text-sm font-bold text-cream tabular-nums">{ch.score}%</span>
                  </div>

                  {/* Comparison country scores */}
                  {intlForChannel.length > 0 && (
                    <div className="space-y-1 mt-1">
                      {intlForChannel.slice(0, 3).map((intl) => (
                        <div key={intl.iso3} className="flex items-center gap-1.5">
                          <CountryFlag code={intl.iso3} size="xs" />
                          <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-gpssa-green/50"
                              initial={{ width: 0 }}
                              animate={{ width: `${intl.score}%` }}
                              transition={{ duration: 0.5, delay: 0.2 }}
                            />
                          </div>
                          <span className="text-[8px] text-gray-muted tabular-nums w-6 text-right">{intl.score}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {comparisonCountries.length === 0 && (
            <div className="mt-4 rounded-lg bg-white/[0.02] border border-dashed border-white/[0.08] p-3 text-center">
              <Globe2 size={16} className="mx-auto text-gray-muted mb-1.5" />
              <p className="text-[10px] text-gray-muted">Add countries above to compare channel maturity across institutions.</p>
            </div>
          )}

          {comparisonCountries.length > 0 && intlServices.length === 0 && (
            <div className="mt-4 rounded-lg bg-white/[0.02] border border-white/[0.06] p-3 text-center">
              <Globe2 size={16} className="mx-auto text-gray-muted mb-1.5" />
              <p className="text-[10px] text-gray-muted">No international channel data available yet. Run the research agents to populate data.</p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Stat Bar ─── */}
      <StatBar items={statBarItems} />

      {/* ─── Channel Detail Modal ─── */}
      <Modal
        isOpen={!!channelDetailModal}
        onClose={() => setChannelDetailModal(null)}
        title={CHANNELS.find((c) => c.id === channelDetailModal)?.label ?? ""}
        description="Capability breakdown by service"
        size="lg"
      >
        {channelDetailModal && (() => {
          const chId = channelDetailModal as ChannelId;
          const levels: Capability[] = ["Full", "Partial", "Planned", "None"];
          return (
            <div className="space-y-4">
              {levels.map((level) => {
                const matching = serviceMatrix.filter((r) => r.channels[chId] === level);
                if (matching.length === 0) return null;
                return (
                  <div key={level}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`w-2.5 h-2.5 rounded-[3px] ${CELL_COLORS[level]}`} />
                      <span className="text-xs font-medium text-cream">{level}</span>
                      <span className="text-[10px] text-gray-muted">({matching.length})</span>
                    </div>
                    <div className="space-y-1 pl-4">
                      {matching.map((r) => (
                        <p key={r.id} className="text-[11px] text-gray-muted">{r.name} <span className="text-[9px] text-gray-muted/60">— {r.category}</span></p>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Intl comparison for this channel */}
              {Array.from(intlMaturityByCountry.entries()).length > 0 && (
                <div className="pt-3 border-t border-white/[0.06]">
                  <p className="text-xs font-medium text-cream mb-2">International Comparison</p>
                  {Array.from(intlMaturityByCountry.entries()).map(([iso3, mat]) => {
                    const m = mat.find((x) => x.id === chId);
                    if (!m) return null;
                    const country = COUNTRIES.find((c) => c.iso3 === iso3);
                    return (
                      <div key={iso3} className="flex items-center gap-2 mb-1.5">
                        <CountryFlag code={iso3} size="sm" />
                        <span className="text-[11px] text-cream w-20 truncate">{country?.name}</span>
                        <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className="h-full rounded-full bg-gpssa-green/50" style={{ width: `${m.score}%` }} />
                        </div>
                        <span className="text-[10px] text-gray-muted tabular-nums">{m.score}%</span>
                        <Badge variant={tierVariant[m.maturityTier] ?? "gray"} size="sm">{m.maturityTier}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
