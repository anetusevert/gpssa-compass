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
  Search,
  Briefcase,
  Shield,
  UserCheck,
  Users,
  Sword,
  FileText,
  Sparkles,
  AlertTriangle,
  ArrowLeftRight,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { CountrySelector } from "@/components/comparison/CountrySelector";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { StatBar, type StatBarItem } from "@/components/ui/StatBar";
import { COUNTRIES } from "@/lib/countries/catalog";

/* ═══════════════════════════════════════════════════════════════════════════
   Types & Constants
   ═══════════════════════════════════════════════════════════════════════════ */

const CHANNELS = [
  { id: "portal", label: "Digital Portal", short: "Portal", icon: LayoutGrid },
  { id: "mobile", label: "Mobile App", short: "App", icon: Smartphone },
  { id: "centers", label: "Service Centers", short: "Centers", icon: Building2 },
  { id: "call", label: "Call Center", short: "Call", icon: Headphones },
  { id: "partner", label: "Partner Channels", short: "Partner", icon: Link2 },
  { id: "api", label: "API / Integration", short: "API", icon: Code2 },
] as const;

type ChannelId = (typeof CHANNELS)[number]["id"];
type Capability = "Full" | "Partial" | "Planned" | "None";

const CATEGORIES = [
  "Employer", "Insured", "Beneficiary", "Agent/Guardian", "GCC", "Military", "General",
  "Registration", "Contributions", "Pensions", "Benefits", "Digital", "Complaints", "Certificates",
] as const;
type Category = (typeof CATEGORIES)[number];

const categoryConfig: Record<string, { icon: typeof Layers; color: "green" | "blue" | "gold" | "gray" | "red"; accent: string; bg: string }> = {
  Employer:         { icon: Briefcase,     color: "blue",  accent: "border-adl-blue/40",   bg: "bg-adl-blue/[0.08]" },
  Insured:          { icon: Shield,        color: "green", accent: "border-gpssa-green/40", bg: "bg-gpssa-green/[0.08]" },
  Beneficiary:      { icon: UserCheck,     color: "gold",  accent: "border-gold/40",        bg: "bg-gold/[0.08]" },
  "Agent/Guardian":  { icon: Users,        color: "gray",  accent: "border-gray-muted/40",  bg: "bg-gray-muted/[0.08]" },
  GCC:              { icon: Globe2,        color: "blue",  accent: "border-adl-blue/40",    bg: "bg-adl-blue/[0.08]" },
  Military:         { icon: Sword,         color: "red",   accent: "border-red-400/40",     bg: "bg-red-400/[0.08]" },
  General:          { icon: FileText,      color: "green", accent: "border-gpssa-green/40", bg: "bg-gpssa-green/[0.08]" },
  Registration:     { icon: Users,         color: "blue",  accent: "border-adl-blue/40",    bg: "bg-adl-blue/[0.08]" },
  Contributions:    { icon: Briefcase,     color: "gold",  accent: "border-gold/40",        bg: "bg-gold/[0.08]" },
  Pensions:         { icon: Shield,        color: "green", accent: "border-gpssa-green/40", bg: "bg-gpssa-green/[0.08]" },
  Benefits:         { icon: UserCheck,     color: "gold",  accent: "border-gold/40",        bg: "bg-gold/[0.08]" },
  Digital:          { icon: Sparkles,      color: "blue",  accent: "border-adl-blue/40",    bg: "bg-adl-blue/[0.08]" },
  Complaints:       { icon: AlertTriangle, color: "red",   accent: "border-red-400/40",     bg: "bg-red-400/[0.08]" },
  Certificates:     { icon: FileText,      color: "green", accent: "border-gpssa-green/40", bg: "bg-gpssa-green/[0.08]" },
};

const CAT_GLOW: Record<string, string> = {
  Employer:         "shadow-adl-blue/20",
  Insured:          "shadow-gpssa-green/20",
  Beneficiary:      "shadow-gold/20",
  "Agent/Guardian":  "shadow-gray-muted/20",
  GCC:              "shadow-adl-blue/20",
  Military:         "shadow-red-400/20",
  General:          "shadow-gpssa-green/20",
};

interface ServiceChannelRow {
  id: string;
  name: string;
  category: string;
  channels: Record<ChannelId, Capability>;
  notes?: string;
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

const DOT_COLORS: Record<Capability, string> = {
  Full: "bg-gpssa-green",
  Partial: "bg-gold",
  Planned: "bg-adl-blue",
  None: "bg-white/[0.12]",
};

const COUNTRY_COLORS = ["#22C55E", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];

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

function getCfg(cat: string) {
  return categoryConfig[cat] ?? { icon: Layers, color: "gray" as const, accent: "border-white/10", bg: "bg-white/[0.04]" };
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════════════════════════ */

function CategoryTile({ cat, count, isActive, onClick }: { cat: string; count: number; isActive: boolean; onClick: () => void }) {
  const cfg = getCfg(cat);
  const Icon = cfg.icon;
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`relative flex flex-col items-start p-3.5 rounded-xl border backdrop-blur-sm transition-all text-left ${
        isActive
          ? `${cfg.bg} ${cfg.accent} border-2 shadow-lg ${CAT_GLOW[cat] ?? ""}`
          : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.14]"
      }`}
    >
      <div className={`p-2 rounded-lg mb-2 ${isActive ? cfg.bg : "bg-white/[0.05]"}`}>
        <Icon size={16} className={isActive ? "text-cream" : "text-gray-muted"} />
      </div>
      <span className={`text-xs font-semibold leading-tight ${isActive ? "text-cream" : "text-cream/80"}`}>{cat}</span>
      <span className="text-[10px] text-gray-muted mt-0.5">{count} service{count !== 1 ? "s" : ""}</span>
      {isActive && (
        <motion.div
          layoutId="channelCatIndicator"
          className={`absolute -right-px top-3 bottom-3 w-[3px] rounded-full ${cfg.bg.replace("/[0.08]", "")}`}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      )}
    </motion.button>
  );
}

function ChannelDots({ channels }: { channels: Record<ChannelId, Capability> }) {
  return (
    <div className="flex items-center gap-1">
      {CHANNELS.map((ch) => (
        <div key={ch.id} className="group relative">
          <div className={`w-3 h-3 rounded-full ${DOT_COLORS[channels[ch.id] ?? "None"]} transition-transform group-hover:scale-125`} />
          <div className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 rounded bg-navy border border-white/10 shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
            <p className="text-[8px] text-cream">{ch.short}: {channels[ch.id]}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ServiceChannelCard({ svc, onOpen }: { svc: ServiceChannelRow; onOpen: () => void }) {
  const cfg = getCfg(svc.category);
  const fullCount = CHANNELS.filter((c) => svc.channels[c.id] === "Full").length;
  const totalScore = CHANNELS.reduce((acc, c) => acc + capabilityScore[svc.channels[c.id] ?? "None"], 0);
  const pct = Math.round((totalScore / (CHANNELS.length * 4)) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      onClick={onOpen}
      className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-4 hover:bg-white/[0.05] hover:border-white/[0.12] transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <h3 className="text-xs font-semibold text-cream group-hover:text-white leading-snug">{svc.name}</h3>
        <Badge variant={cfg.color} size="sm">{svc.category}</Badge>
      </div>

      <ChannelDots channels={svc.channels} />

      <div className="flex items-center gap-3 mt-2.5 pt-2 border-t border-white/[0.04]">
        <div className="flex-1">
          <div className="flex justify-between text-[9px] mb-0.5">
            <span className="text-gray-muted">Channel Coverage</span>
            <span className="text-cream font-medium">{pct}%</span>
          </div>
          <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-adl-blue to-gpssa-green"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        <span className="text-[9px] text-gpssa-green font-medium">{fullCount}/{CHANNELS.length} Full</span>
      </div>
    </motion.div>
  );
}

function ComparisonCategoryRow({
  cat, gpssaCount, intlCounts, maxCount, isActive, onClick,
}: {
  cat: string; gpssaCount: number; intlCounts: { iso3: string; count: number; color: string }[];
  maxCount: number; isActive: boolean; onClick: () => void;
}) {
  const cfg = getCfg(cat);
  const Icon = cfg.icon;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-left ${
        isActive
          ? `${cfg.bg} border border-l-2 ${cfg.accent}`
          : "hover:bg-white/[0.04] border border-transparent"
      }`}
    >
      <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? cfg.bg : "bg-white/[0.04]"}`}>
        <Icon size={13} className={isActive ? "text-cream" : "text-gray-muted"} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[11px] font-medium ${isActive ? "text-cream" : "text-cream/70"}`}>{cat}</p>
        <div className="flex items-center gap-1 mt-1 h-2">
          <div className="flex-1 flex gap-px h-full rounded-sm overflow-hidden bg-white/[0.04]">
            <motion.div
              className="h-full bg-gpssa-green/70 rounded-l-sm"
              initial={{ width: 0 }}
              animate={{ width: maxCount > 0 ? `${(gpssaCount / maxCount) * 100}%` : "0%" }}
              transition={{ duration: 0.4 }}
            />
            {intlCounts.map((ic) => (
              <motion.div
                key={ic.iso3}
                className="h-full"
                style={{ backgroundColor: ic.color + "99" }}
                initial={{ width: 0 }}
                animate={{ width: maxCount > 0 ? `${(ic.count / maxCount) * 100}%` : "0%" }}
                transition={{ duration: 0.4, delay: 0.1 }}
              />
            ))}
          </div>
          <span className="text-[9px] text-gray-muted tabular-nums w-4 text-right">{gpssaCount}</span>
        </div>
      </div>
    </button>
  );
}

type VizMode = "heatmap" | "maturity" | "stacked";

/* ═══════════════════════════════════════════════════════════════════════════
   Page Component
   ═══════════════════════════════════════════════════════════════════════════ */
export default function ChannelCapabilitiesPage() {
  const [serviceMatrix, setServiceMatrix] = useState<ServiceChannelRow[]>(STATIC_SERVICE_MATRIX);
  const [intlServices, setIntlServices] = useState<IntlChannelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [comparisonCountries, setComparisonCountries] = useState<string[]>(["SGP", "GBR", "EST", "SAU", "AUS"]);
  const [vizMode, setVizMode] = useState<VizMode>("heatmap");
  const [detailModal, setDetailModal] = useState<ServiceChannelRow | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const isComparing = comparisonCountries.length > 0;

  /* ── Data loading ── */
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
            rowMap.set(serviceId, {
              id: serviceId,
              name: String(svc.name ?? ""),
              category: String(svc.category ?? "General"),
              channels: { portal: "None", mobile: "None", centers: "None", call: "None", partner: "None", api: "None" },
            });
          }
          const row = rowMap.get(serviceId)!;
          const chName = String(item.channelName ?? "") as ChannelId;
          if (chName in row.channels) row.channels[chName] = String(item.capabilityLevel ?? "None") as Capability;
          if (item.notes) row.notes = String(item.notes);
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

  /* ── Derived data ── */
  const activeCats = useMemo(() => {
    const allCats = new Set<string>();
    for (const s of serviceMatrix) allCats.add(s.category);
    for (const s of intlServices) allCats.add(s.category);
    const ordered = CATEGORIES.filter((c) => allCats.has(c));
    Array.from(allCats).forEach((c) => { if (!ordered.includes(c as Category)) ordered.push(c as Category); });
    return ordered;
  }, [serviceMatrix, intlServices]);

  const catCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of serviceMatrix) map.set(s.category, (map.get(s.category) ?? 0) + 1);
    return activeCats.map((cat) => ({ cat, count: map.get(cat) ?? 0 }));
  }, [serviceMatrix, activeCats]);

  const categoryRows = useMemo(() => {
    if (!activeCategory) return [];
    let list = serviceMatrix.filter((s) => s.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
    return list;
  }, [serviceMatrix, activeCategory, searchQuery]);

  const intlByCountry = useMemo(() => {
    const map = new Map<string, IntlChannelRow[]>();
    for (const s of intlServices) {
      const list = map.get(s.countryIso3) ?? [];
      list.push(s);
      map.set(s.countryIso3, list);
    }
    return map;
  }, [intlServices]);

  const comparisonCatData = useMemo(() => {
    return activeCats.map((cat) => {
      const gpssa = serviceMatrix.filter((s) => s.category === cat).length;
      const intl = comparisonCountries.map((iso3, idx) => {
        const count = (intlByCountry.get(iso3) ?? []).filter((s) => s.category === cat).length;
        return { iso3, count, color: COUNTRY_COLORS[idx % COUNTRY_COLORS.length] };
      });
      return { cat, gpssa, intl };
    });
  }, [serviceMatrix, comparisonCountries, intlByCountry, activeCats]);

  const maxCatCount = useMemo(() =>
    Math.max(1, ...comparisonCatData.flatMap((c) => [c.gpssa, ...c.intl.map((i) => i.count)]))
  , [comparisonCatData]);

  const gpssaMaturity = useMemo(() => computeMaturity(
    activeCategory ? serviceMatrix.filter((s) => s.category === activeCategory) : serviceMatrix
  ), [serviceMatrix, activeCategory]);

  const intlMaturityByCountry = useMemo(() => {
    const result = new Map<string, ReturnType<typeof computeMaturity>>();
    for (const [iso3, rows] of Array.from(intlByCountry.entries())) {
      result.set(iso3, computeMaturity(rows));
    }
    return result;
  }, [intlByCountry]);

  const handleCategoryClick = useCallback((cat: string) => {
    setActiveCategory((prev) => (prev === cat ? null : cat));
  }, []);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const rows = serviceMatrix;
    const fullyDigital = rows.filter((r) => r.channels.portal === "Full" && r.channels.mobile === "Full").length;
    const apiReady = rows.filter((r) => r.channels.api === "Full" || r.channels.api === "Partial").length;
    return { mapped: rows.length, fullyDigital, apiReady };
  }, [serviceMatrix]);

  const statBarItems: StatBarItem[] = useMemo(() => {
    const items: StatBarItem[] = [
      { icon: Layers, value: stats.mapped, label: "Services Mapped" },
      { icon: Radio, value: CHANNELS.length, label: "Channels" },
      { icon: Smartphone, value: stats.fullyDigital, label: "Fully Digital" },
      { icon: Code2, value: stats.apiReady, label: "API Ready" },
    ];
    if (isComparing) {
      items.push({ icon: Globe2, value: intlServices.length, label: `Intl (${comparisonCountries.length})` });
    }
    return items;
  }, [stats, intlServices.length, comparisonCountries.length, isComparing]);

  if (loading) {
    return <div className="flex h-full items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ─── Header ─── */}
      <div className="shrink-0 flex items-center gap-3 px-5 py-2 border-b border-white/[0.06]">
        <h1 className="font-playfair text-base font-semibold text-cream shrink-0">Channel Capabilities</h1>
        <div className="h-4 w-px bg-white/10" />
        <CountrySelector selected={comparisonCountries} onChange={setComparisonCountries} pillar="services" variant="inline" />
        {activeCategory && (
          <div className="ml-auto relative">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-muted" />
            <input type="text" placeholder="Filter…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-36 pl-7 pr-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] text-cream placeholder:text-gray-muted focus:outline-none focus:border-gpssa-green/30 transition-colors" />
          </div>
        )}
      </div>

      {/* ─── Comparison stats banner ─── */}
      <AnimatePresence>
        {isComparing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="shrink-0 overflow-hidden"
          >
            <div className="flex items-center gap-4 px-5 py-2 border-b border-white/[0.04] bg-white/[0.015]">
              <div className="flex items-center gap-1.5">
                <CountryFlag code="ARE" size="xs" />
                <span className="text-[10px] font-semibold text-cream">{serviceMatrix.length}</span>
                <span className="text-[9px] text-gray-muted">services</span>
              </div>
              {comparisonCountries.map((iso3) => {
                const count = intlByCountry.get(iso3)?.length ?? 0;
                const country = COUNTRIES.find((c) => c.iso3 === iso3);
                return (
                  <div key={iso3} className="flex items-center gap-1.5">
                    <span className="text-[9px] text-gray-muted">vs</span>
                    <CountryFlag code={iso3} size="xs" />
                    <span className="text-[10px] font-semibold text-cream">{count}</span>
                    <span className="text-[9px] text-gray-muted hidden sm:inline">{country?.name?.split(" ")[0]}</span>
                  </div>
                );
              })}
              {/* Legend */}
              <div className="ml-auto flex items-center gap-2 shrink-0">
                {(["Full", "Partial", "Planned", "None"] as Capability[]).map((lvl) => (
                  <span key={lvl} className="inline-flex items-center gap-1 text-[9px] text-gray-muted">
                    <span className={`w-2.5 h-2.5 rounded-full ${DOT_COLORS[lvl]}`} />
                    {lvl}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Main content ─── */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* ── Left panel ── */}
        <div className={`shrink-0 border-r border-white/[0.06] overflow-y-auto scrollbar-thin ${
          isComparing ? "w-[280px]" : "w-[300px]"
        }`}>
          <AnimatePresence mode="wait">
            {isComparing ? (
              <motion.div key="compare-nav" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-3 space-y-1">
                <p className="text-[9px] text-gray-muted uppercase tracking-wider mb-2 px-1">Categories</p>
                {comparisonCatData.map((d) => (
                  <ComparisonCategoryRow
                    key={d.cat}
                    cat={d.cat}
                    gpssaCount={d.gpssa}
                    intlCounts={d.intl}
                    maxCount={maxCatCount}
                    isActive={activeCategory === d.cat}
                    onClick={() => handleCategoryClick(d.cat)}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div key="tiles" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-3">
                <p className="text-[9px] text-gray-muted uppercase tracking-wider mb-2 px-1">Service Categories</p>
                <div className="grid grid-cols-2 gap-2">
                  {catCounts.map(({ cat, count }) => (
                    <CategoryTile key={cat} cat={cat} count={count} isActive={activeCategory === cat} onClick={() => handleCategoryClick(cat)} />
                  ))}
                </div>

                {/* Channel maturity summary below tiles */}
                <div className="mt-4 pt-3 border-t border-white/[0.05]">
                  <div className="flex items-center gap-1.5 mb-2 px-1">
                    <Gauge size={12} className="text-teal-400" />
                    <span className="text-[10px] font-semibold text-cream">Channel Maturity</span>
                  </div>
                  <div className="space-y-1.5 px-1">
                    {gpssaMaturity.map((ch) => {
                      const Icon = ch.icon;
                      return (
                        <div key={ch.id} className="flex items-center gap-2">
                          <Icon size={11} className="text-teal-400/70 shrink-0" />
                          <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-adl-blue to-gpssa-green"
                              initial={{ width: 0 }}
                              animate={{ width: `${ch.score}%` }}
                              transition={{ duration: 0.6 }}
                            />
                          </div>
                          <span className="text-[9px] text-gray-muted tabular-nums w-7 text-right">{ch.score}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right panel ── */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* Viz toggle (comparison mode only, when category selected) */}
          {isComparing && activeCategory && (
            <div className="shrink-0 flex items-center gap-1 px-4 py-2 border-b border-white/[0.04]">
              {([
                { id: "heatmap" as VizMode, icon: LayoutGrid, label: "Heatmap" },
                { id: "maturity" as VizMode, icon: Gauge, label: "Maturity" },
                { id: "stacked" as VizMode, icon: ArrowLeftRight, label: "Distribution" },
              ]).map((v) => {
                const Icon = v.icon;
                return (
                  <button
                    key={v.id}
                    onClick={() => setVizMode(v.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                      vizMode === v.id
                        ? "bg-gpssa-green/15 text-gpssa-green border border-gpssa-green/25"
                        : "text-gray-muted hover:text-cream hover:bg-white/[0.04] border border-transparent"
                    }`}
                  >
                    <Icon size={11} />{v.label}
                  </button>
                );
              })}
              <span className="ml-auto text-[9px] text-gray-muted">{activeCategory}</span>
            </div>
          )}

          {/* Content area */}
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-4">
            <AnimatePresence mode="wait">
              {activeCategory ? (
                <motion.div key={`cat-${activeCategory}-${isComparing ? vizMode : "browse"}`} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22 }} className="h-full">
                  {isComparing ? (
                    vizMode === "heatmap" ? (
                      <ComparisonHeatmap
                        gpssaRows={categoryRows}
                        intlByCountry={intlByCountry}
                        countries={comparisonCountries}
                        activeCategory={activeCategory}
                      />
                    ) : vizMode === "maturity" ? (
                      <ComparisonMaturityGrid
                        gpssaMaturity={gpssaMaturity}
                        intlMaturityByCountry={intlMaturityByCountry}
                        countries={comparisonCountries}
                      />
                    ) : (
                      <ComparisonStackedBars
                        intlByCountry={intlByCountry}
                        gpssaRows={serviceMatrix}
                        countries={comparisonCountries}
                      />
                    )
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        {(() => { const cfg = getCfg(activeCategory); const Icon = cfg.icon; return <div className={`p-1.5 rounded-lg ${cfg.bg}`}><Icon size={14} className="text-cream" /></div>; })()}
                        <div>
                          <h2 className="text-sm font-semibold text-cream font-playfair">{activeCategory}</h2>
                          <p className="text-[10px] text-gray-muted">{categoryRows.length} service{categoryRows.length !== 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {categoryRows.map((svc) => (
                          <ServiceChannelCard key={svc.id} svc={svc} onOpen={() => setDetailModal(svc)} />
                        ))}
                      </div>
                      {categoryRows.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <Search size={20} className="text-gray-muted mb-2" />
                          <p className="text-xs text-gray-muted">No services match your search.</p>
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              ) : (
                <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                  {/* Channel maturity dashboard as default view */}
                  <div className="flex items-center gap-2 mb-4">
                    <Gauge size={14} className="text-teal-400" />
                    <h2 className="text-sm font-semibold text-cream font-playfair">Channel Maturity Dashboard</h2>
                  </div>
                  <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                    {gpssaMaturity.map((ch) => {
                      const Icon = ch.icon;
                      const intlForChannel = Array.from(intlMaturityByCountry.entries()).map(([iso3, mat]) => {
                        const m = mat.find((x) => x.id === ch.id);
                        const country = COUNTRIES.find((c) => c.iso3 === iso3);
                        return m ? { iso3, name: country?.name ?? iso3, score: m.score, tier: m.maturityTier } : null;
                      }).filter(Boolean) as { iso3: string; name: string; score: number; tier: string }[];

                      return (
                        <div
                          key={ch.id}
                          className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-4 hover:bg-white/[0.05] transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="p-1.5 rounded-lg bg-white/[0.05]">
                              <Icon size={14} className="text-teal-400" />
                            </div>
                            <Badge variant={tierVariant[ch.maturityTier] ?? "gray"} size="sm">{ch.maturityTier}</Badge>
                          </div>
                          <p className="text-[11px] font-medium text-cream mb-2">{ch.label}</p>

                          {/* Arc gauge */}
                          <div className="relative w-full h-12 flex items-end justify-center mb-1">
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

                          {intlForChannel.length > 0 && (
                            <div className="space-y-1 mt-2 pt-2 border-t border-white/[0.04]">
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
                        </div>
                      );
                    })}
                  </div>

                  {!isComparing && (
                    <div className="mt-6 rounded-lg bg-white/[0.02] border border-dashed border-white/[0.08] p-4 text-center">
                      <Globe2 size={20} className="mx-auto text-gray-muted mb-2" />
                      <p className="text-xs text-gray-muted">Select a category to explore service-level channel details, or add countries above to compare.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ─── Stat Bar ─── */}
      <StatBar items={statBarItems} />

      {/* ─── Service Channel Detail Modal ─── */}
      <Modal
        isOpen={!!detailModal}
        onClose={() => setDetailModal(null)}
        title={detailModal?.name ?? ""}
        description="Channel Capability Breakdown"
        size="lg"
      >
        {detailModal && (
          <div className="space-y-4">
            {/* 6-channel status grid */}
            <div className="grid grid-cols-3 gap-2">
              {CHANNELS.map((ch) => {
                const level = detailModal.channels[ch.id];
                const Icon = ch.icon;
                return (
                  <div key={ch.id} className={`rounded-lg border p-3 ${
                    level === "Full" ? "border-gpssa-green/30 bg-gpssa-green/[0.06]" :
                    level === "Partial" ? "border-gold/30 bg-gold/[0.06]" :
                    level === "Planned" ? "border-adl-blue/30 bg-adl-blue/[0.06]" :
                    "border-white/[0.06] bg-white/[0.02]"
                  }`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon size={13} className="text-teal-400" />
                      <span className="text-[10px] font-medium text-cream">{ch.label}</span>
                    </div>
                    <Badge
                      variant={level === "Full" ? "green" : level === "Partial" ? "gold" : level === "Planned" ? "blue" : "gray"}
                      size="sm"
                    >{level}</Badge>
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

            {/* Coverage score */}
            {(() => {
              const totalScore = CHANNELS.reduce((acc, c) => acc + capabilityScore[detailModal.channels[c.id] ?? "None"], 0);
              const pct = Math.round((totalScore / (CHANNELS.length * 4)) * 100);
              const fullCount = CHANNELS.filter((c) => detailModal.channels[c.id] === "Full").length;
              return (
                <div className="glass rounded-lg p-3">
                  <div className="flex justify-between text-[10px] mb-1.5">
                    <span className="text-gray-muted">Overall Channel Coverage</span>
                    <span className="text-cream font-semibold">{pct}% ({fullCount}/{CHANNELS.length} Full)</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-adl-blue to-gpssa-green"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                </div>
              );
            })()}

            {/* International comparison in modal */}
            {isComparing && intlServices.length > 0 && (
              <div className="pt-3 border-t border-white/[0.06]">
                <p className="text-xs font-medium text-cream mb-2">International Channel Comparison</p>
                {comparisonCountries.map((iso3) => {
                  const countryRows = intlByCountry.get(iso3) ?? [];
                  const matchingService = countryRows.find((s) => s.name.toLowerCase() === detailModal.name.toLowerCase());
                  const country = COUNTRIES.find((c) => c.iso3 === iso3);
                  if (!matchingService) return null;
                  return (
                    <div key={iso3} className="mb-2 glass rounded-lg p-2.5">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <CountryFlag code={iso3} size="xs" />
                        <span className="text-[10px] font-medium text-cream">{country?.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {CHANNELS.map((ch) => (
                          <div key={ch.id} className="flex items-center gap-0.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${DOT_COLORS[matchingService.channels[ch.id] ?? "None"]}`} />
                            <span className="text-[7px] text-gray-muted">{ch.short}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Comparison Visualization Components
   ═══════════════════════════════════════════════════════════════════════════ */

function ComparisonHeatmap({
  gpssaRows, intlByCountry, countries, activeCategory,
}: {
  gpssaRows: ServiceChannelRow[];
  intlByCountry: Map<string, IntlChannelRow[]>;
  countries: string[];
  activeCategory: string;
}) {
  const allRows = [
    ...gpssaRows.map((r) => ({ ...r, countryIso3: "ARE", countryName: "GPSSA (UAE)" })),
    ...countries.flatMap((iso3) =>
      (intlByCountry.get(iso3) ?? [])
        .filter((s) => s.category === activeCategory)
        .map((s) => ({ ...s, countryIso3: iso3, countryName: s.countryName }))
    ),
  ];

  const countryGroups = [
    { iso3: "ARE", name: "GPSSA", rows: gpssaRows },
    ...countries.map((iso3) => ({
      iso3,
      name: COUNTRIES.find((c) => c.iso3 === iso3)?.name?.split(" ")[0] ?? iso3,
      rows: (intlByCountry.get(iso3) ?? []).filter((s) => s.category === activeCategory),
    })),
  ];

  if (allRows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Globe2 size={20} className="text-gray-muted mb-2" />
        <p className="text-xs text-gray-muted">No channel data available for this category yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {countryGroups.map((group) => (
        <div key={group.iso3}>
          <div className="flex items-center gap-1.5 mb-2">
            <CountryFlag code={group.iso3} size="xs" />
            <span className="text-[10px] font-semibold text-cream uppercase tracking-wider">{group.name}</span>
            <span className="text-[9px] text-gray-muted">({group.rows.length})</span>
          </div>
          {group.rows.length > 0 ? (
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
              <div className="flex items-center border-b border-white/[0.04]">
                <div className="w-[160px] shrink-0 px-3 py-1.5">
                  <span className="text-[8px] text-gray-muted uppercase tracking-wider">Service</span>
                </div>
                {CHANNELS.map((ch) => {
                  const Icon = ch.icon;
                  return (
                    <div key={ch.id} className="flex-1 flex flex-col items-center py-1.5 min-w-[44px]">
                      <Icon size={10} className="text-teal-400/70" />
                      <span className="text-[7px] text-gray-muted mt-0.5">{ch.short}</span>
                    </div>
                  );
                })}
              </div>
              {group.rows.map((row) => (
                <div key={row.id} className="flex items-center border-b border-white/[0.02] last:border-0 hover:bg-white/[0.02]">
                  <div className="w-[160px] shrink-0 px-3 py-1.5">
                    <p className="text-[9px] text-cream truncate">{row.name}</p>
                  </div>
                  {CHANNELS.map((ch) => {
                    const level = row.channels[ch.id];
                    return (
                      <div key={ch.id} className="flex-1 flex justify-center py-1.5 min-w-[44px]">
                        <div className={`w-5 h-5 rounded ${CELL_COLORS[level]} transition-colors`} />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-gray-muted italic">No data for this category</p>
          )}
        </div>
      ))}
    </div>
  );
}

function ComparisonMaturityGrid({
  gpssaMaturity, intlMaturityByCountry, countries,
}: {
  gpssaMaturity: ReturnType<typeof computeMaturity>;
  intlMaturityByCountry: Map<string, ReturnType<typeof computeMaturity>>;
  countries: string[];
}) {
  const allEntries = [
    { iso3: "ARE", name: "GPSSA", maturity: gpssaMaturity },
    ...countries.map((iso3) => ({
      iso3,
      name: COUNTRIES.find((c) => c.iso3 === iso3)?.name?.split(" ")[0] ?? iso3,
      maturity: intlMaturityByCountry.get(iso3) ?? gpssaMaturity.map((m) => ({ ...m, score: 0, maturityTier: "—" as const })),
    })),
  ];

  return (
    <div className="overflow-x-auto">
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden min-w-[500px]">
        {/* Header */}
        <div className="flex items-center border-b border-white/[0.06] bg-white/[0.01]">
          <div className="w-[120px] shrink-0 px-3 py-2">
            <span className="text-[9px] text-gray-muted uppercase tracking-wider">Country</span>
          </div>
          {CHANNELS.map((ch) => {
            const Icon = ch.icon;
            return (
              <div key={ch.id} className="flex-1 flex flex-col items-center py-2 min-w-[70px]">
                <Icon size={12} className="text-teal-400/80 mb-0.5" />
                <span className="text-[8px] text-gray-muted uppercase">{ch.short}</span>
              </div>
            );
          })}
        </div>
        {/* Rows */}
        {allEntries.map((entry) => (
          <div key={entry.iso3} className="flex items-center border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02]">
            <div className="w-[120px] shrink-0 px-3 py-2 flex items-center gap-1.5">
              <CountryFlag code={entry.iso3} size="xs" />
              <span className="text-[10px] text-cream font-medium truncate">{entry.name}</span>
            </div>
            {CHANNELS.map((ch) => {
              const m = entry.maturity.find((x) => x.id === ch.id);
              const score = m?.score ?? 0;
              const tier = m?.maturityTier ?? "—";
              const bgOpacity = Math.round((score / 100) * 70);
              return (
                <div key={ch.id} className="flex-1 flex flex-col items-center py-2 min-w-[70px]">
                  <div
                    className="w-10 h-6 rounded flex items-center justify-center"
                    style={{ backgroundColor: `rgba(34, 197, 94, ${bgOpacity / 100})` }}
                  >
                    <span className="text-[9px] font-bold text-white">{score}%</span>
                  </div>
                  <Badge variant={tierVariant[tier] ?? "gray"} size="sm" className="mt-0.5 scale-[0.85]">{tier}</Badge>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function ComparisonStackedBars({
  intlByCountry, gpssaRows, countries,
}: {
  intlByCountry: Map<string, IntlChannelRow[]>;
  gpssaRows: ServiceChannelRow[];
  countries: string[];
}) {
  const allEntries = [
    { iso3: "ARE", name: "GPSSA", rows: gpssaRows },
    ...countries.map((iso3) => ({
      iso3,
      name: COUNTRIES.find((c) => c.iso3 === iso3)?.name?.split(" ")[0] ?? iso3,
      rows: intlByCountry.get(iso3) ?? [],
    })),
  ];

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-gray-muted uppercase tracking-wider mb-1">Full / Partial / Planned / None distribution across all channels</p>
      {allEntries.map((entry) => {
        let full = 0, partial = 0, planned = 0, none = 0;
        for (const row of entry.rows) {
          for (const ch of CHANNELS) {
            const lvl = row.channels[ch.id];
            if (lvl === "Full") full++;
            else if (lvl === "Partial") partial++;
            else if (lvl === "Planned") planned++;
            else none++;
          }
        }
        const total = full + partial + planned + none;
        if (total === 0) return null;

        return (
          <div key={entry.iso3}>
            <div className="flex items-center gap-2 mb-1">
              <CountryFlag code={entry.iso3} size="xs" />
              <span className="text-[10px] font-medium text-cream">{entry.name}</span>
              <span className="text-[9px] text-gray-muted ml-auto">{entry.rows.length} services</span>
            </div>
            <div className="flex h-5 rounded-md overflow-hidden">
              {full > 0 && (
                <motion.div
                  className="bg-gpssa-green/70 flex items-center justify-center"
                  initial={{ width: 0 }}
                  animate={{ width: `${(full / total) * 100}%` }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="text-[7px] font-bold text-white">{full}</span>
                </motion.div>
              )}
              {partial > 0 && (
                <motion.div
                  className="bg-gold/60 flex items-center justify-center"
                  initial={{ width: 0 }}
                  animate={{ width: `${(partial / total) * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.05 }}
                >
                  <span className="text-[7px] font-bold text-white">{partial}</span>
                </motion.div>
              )}
              {planned > 0 && (
                <motion.div
                  className="bg-adl-blue/50 flex items-center justify-center"
                  initial={{ width: 0 }}
                  animate={{ width: `${(planned / total) * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <span className="text-[7px] font-bold text-white">{planned}</span>
                </motion.div>
              )}
              {none > 0 && (
                <motion.div
                  className="bg-white/[0.06] flex items-center justify-center"
                  initial={{ width: 0 }}
                  animate={{ width: `${(none / total) * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                >
                  <span className="text-[7px] font-medium text-gray-muted">{none}</span>
                </motion.div>
              )}
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="flex items-center gap-3 pt-2 border-t border-white/[0.04]">
        {(["Full", "Partial", "Planned", "None"] as Capability[]).map((lvl) => (
          <span key={lvl} className="flex items-center gap-1 text-[9px] text-gray-muted">
            <span className={`w-2.5 h-2.5 rounded ${CELL_COLORS[lvl]}`} />
            {lvl}
          </span>
        ))}
      </div>
    </div>
  );
}
