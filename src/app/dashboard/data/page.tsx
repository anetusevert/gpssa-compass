"use client";

/**
 * Data & Sources — Cinematic RAG Library
 *
 * The unified knowledge layer of the application. Every dataset, source,
 * standard and computed reference is exposed here as a searchable,
 * pivotable, evidence-traceable corpus.
 *
 * Layout:
 *   - Hero: animated counters + universal search
 *   - Constellation: pivot tiles for each entity domain (institutions,
 *     services, products, segments, channels, sources, standards,
 *     computed references), each glowing with a count and live preview.
 *   - Standards Browser highlight strip
 *   - Recent activity / freshness widget
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Layers,
  Package,
  BookOpen,
  Users2,
  ArrowRight,
  Download,
  Database,
  Search,
  Scale,
  Sigma,
  Sparkles,
  Network,
  Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DataCounts {
  services: number;
  institutions: number;
  products: number;
  segments: number;
  sources: number;
  standards: number;
  computed: number;
  countries: number;
}

interface SourceLite {
  id: string;
  title: string;
  publisher: string | null;
  region: string | null;
  sourceType: string;
}

interface StandardLite {
  slug: string;
  code: string | null;
  title: string;
  body: string;
  bodyShort: string | null;
  category: string;
  scope: string;
}

interface ComputedLite {
  slug: string;
  name: string;
  shortName: string | null;
  kind: string;
  scope: string;
  cohortSize: number;
}

const EASE = [0.16, 1, 0.3, 1] as const;

const TILES = [
  {
    id: "institutions",
    label: "Institutions",
    description: "Pension authorities and social-security organisations.",
    icon: Building2,
    href: "/dashboard/data/institutions",
    color: "#10B981",
    countKey: "institutions" as const,
  },
  {
    id: "services",
    label: "Services",
    description: "GPSSA service catalog + international service benchmarks.",
    icon: Layers,
    href: "/dashboard/data/services",
    color: "#3B82F6",
    countKey: "services" as const,
  },
  {
    id: "products",
    label: "Products",
    description: "Statutory, supplementary and innovative product portfolio.",
    icon: Package,
    href: "/dashboard/data/products",
    color: "#F59E0B",
    countKey: "products" as const,
  },
  {
    id: "segments",
    label: "Segments",
    description: "Labor-market segments × social protection coverage matrix.",
    icon: Users2,
    href: "/dashboard/data/segments",
    color: "#A855F7",
    countKey: "segments" as const,
  },
  {
    id: "standards",
    label: "Standards",
    description: "ILO, ISSA, World Bank, OECD, Mercer, UN — the canonical reference library.",
    icon: Scale,
    href: "/dashboard/data/standards",
    color: "#0EA5E9",
    countKey: "standards" as const,
  },
  {
    id: "computed",
    label: "Computed References",
    description: "Global / regional / peer-group averages and best-practice cohorts.",
    icon: Sigma,
    href: "/dashboard/data/standards?tab=computed",
    color: "#22D3EE",
    countKey: "computed" as const,
  },
  {
    id: "countries",
    label: "Countries",
    description: "196 country profiles with maturity, coverage and replacement metrics.",
    icon: Globe2,
    href: "/dashboard/atlas",
    color: "#EC4899",
    countKey: "countries" as const,
  },
  {
    id: "sources",
    label: "Sources",
    description: "Citation-traceable provenance for every data point.",
    icon: BookOpen,
    href: "/dashboard/data/sources",
    color: "#2DD4BF",
    countKey: "sources" as const,
  },
];

/* ─── Animated counter ─── */
function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = display;
    const delta = value - start;
    if (delta === 0) return;
    let frame = 0;
    const total = 30;
    const id = setInterval(() => {
      frame++;
      const t = frame / total;
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(start + delta * eased));
      if (frame >= total) {
        setDisplay(value);
        clearInterval(id);
      }
    }, 16);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <>{display.toLocaleString()}</>;
}

/* ─── Universal search result item ─── */
interface SearchHit {
  kind: "source" | "standard" | "computed";
  id: string;
  title: string;
  subtitle: string;
  href: string;
  color: string;
  icon: typeof Scale;
}

export default function DataHubPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";

  const [counts, setCounts] = useState<DataCounts>({
    services: 0, institutions: 0, products: 0, segments: 0,
    sources: 0, standards: 0, computed: 0, countries: 0,
  });
  const [sources, setSources] = useState<SourceLite[]>([]);
  const [standards, setStandards] = useState<StandardLite[]>([]);
  const [computed, setComputed] = useState<ComputedLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  /* ── Universal RAG search ── */
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    try {
      const [svc, inst, prod, seg, src, std, cmp, ctry] = await Promise.all([
        fetch("/api/services").then((r) => (r.ok ? r.json() : [])),
        fetch("/api/research/institutions").then((r) => (r.ok ? r.json() : [])),
        fetch("/api/products").then((r) => (r.ok ? r.json() : [])),
        fetch("/api/products/segments").then((r) => (r.ok ? r.json() : [])),
        fetch("/api/admin/data/sources").then((r) => (r.ok ? r.json() : [])),
        fetch("/api/standards").then((r) => (r.ok ? r.json() : [])),
        fetch("/api/references/computed").then((r) => (r.ok ? r.json() : [])),
        fetch("/api/countries").then((r) => (r.ok ? r.json() : [])),
      ]);
      setCounts({
        services: Array.isArray(svc) ? svc.length : 0,
        institutions: Array.isArray(inst) ? inst.length : 0,
        products: Array.isArray(prod) ? prod.length : 0,
        segments: Array.isArray(seg) ? seg.length : 0,
        sources: Array.isArray(src) ? src.length : 0,
        standards: Array.isArray(std) ? std.length : 0,
        computed: Array.isArray(cmp) ? cmp.length : 0,
        countries: Array.isArray(ctry) ? ctry.length : 0,
      });
      setSources(Array.isArray(src) ? src.slice(0, 200) : []);
      setStandards(Array.isArray(std) ? std : []);
      setComputed(Array.isArray(cmp) ? cmp : []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  /* ── Search keyboard shortcut ── */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") setSearchOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ── Aggregate searchable corpus ── */
  const corpus = useMemo<SearchHit[]>(() => {
    const items: SearchHit[] = [];
    for (const s of sources) {
      items.push({
        kind: "source", id: s.id, title: s.title,
        subtitle: [s.publisher, s.region, s.sourceType].filter(Boolean).join(" · "),
        href: `/dashboard/data/sources?id=${s.id}`,
        color: "#2DD4BF", icon: BookOpen,
      });
    }
    for (const s of standards) {
      items.push({
        kind: "standard", id: s.slug, title: `${s.code ? s.code + " — " : ""}${s.title}`,
        subtitle: `${s.body} · ${s.category} · ${s.scope}`,
        href: `/dashboard/data/standards?slug=${s.slug}`,
        color: "#0EA5E9", icon: Scale,
      });
    }
    for (const c of computed) {
      items.push({
        kind: "computed", id: c.slug, title: c.name,
        subtitle: `${c.kind} · ${c.scope} · cohort of ${c.cohortSize}`,
        href: `/dashboard/data/standards?tab=computed&slug=${c.slug}`,
        color: "#22D3EE", icon: Sigma,
      });
    }
    return items;
  }, [sources, standards, computed]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return corpus.slice(0, 18);
    return corpus.filter((h) =>
      h.title.toLowerCase().includes(q) || h.subtitle.toLowerCase().includes(q)
    ).slice(0, 30);
  }, [corpus, query]);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/admin/data/export");
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `gpssa-data-export-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch { /* ignore */ } finally {
      setExporting(false);
    }
  }

  const totalRecords =
    counts.services + counts.institutions + counts.products + counts.segments +
    counts.sources + counts.standards + counts.computed + counts.countries;

  return (
    <div className="relative">
      {/* ── Ambient glow ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div style={{ position: "absolute", width: 720, height: 720, top: -180, right: -200, background: "radial-gradient(circle,rgba(14,165,233,0.10) 0%,transparent 65%)" }} />
        <div style={{ position: "absolute", width: 560, height: 560, bottom: -180, left: -180, background: "radial-gradient(circle,rgba(168,85,247,0.10) 0%,transparent 65%)" }} />
        <div style={{ position: "absolute", width: 480, height: 480, top: 240, left: "30%", background: "radial-gradient(circle,rgba(34,211,238,0.07) 0%,transparent 60%)" }} />
      </div>

      {/* ═══ HERO ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative rounded-3xl border border-white/[0.06] p-8 md:p-10 mb-8 overflow-hidden"
        style={{ background: "radial-gradient(ellipse at top left, rgba(14,165,233,0.10), transparent 50%), radial-gradient(ellipse at bottom right, rgba(168,85,247,0.08), transparent 55%), rgba(8,18,38,0.6)" }}
      >
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex-1 min-w-[280px]">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gpssa-green/10 border border-gpssa-green/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gpssa-green">
                <Sparkles size={10} /> RAG Library
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-gray-muted">v2 · standards-grounded</span>
            </div>
            <h1 className="font-playfair text-3xl md:text-4xl font-bold text-cream leading-tight">
              The single source of truth.
            </h1>
            <p className="mt-2 text-sm text-gray-muted leading-relaxed max-w-xl">
              Every datapoint, every standard, every reference, every citation — all
              searchable and traceable in one corpus. The data layer that powers
              every dashboard, every agent and every benchmark in this platform.
            </p>

            {/* ── Universal search trigger ── */}
            <button
              onClick={() => { setSearchOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
              className="mt-5 inline-flex items-center gap-3 rounded-2xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-sm text-gray-muted hover:text-cream hover:bg-white/[0.06] hover:border-white/[0.18] transition-all w-full max-w-md text-left"
            >
              <Search size={14} className="text-gpssa-green" />
              <span className="flex-1">Search the entire knowledge corpus…</span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded border border-white/10 bg-black/20 px-1.5 py-0.5 text-[10px] font-mono">
                ⌘ K
              </span>
            </button>
          </div>

          {/* ── Live count panel ── */}
          <div className="grid grid-cols-2 gap-3 min-w-[260px]">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-muted">Total Records</p>
              <p className="font-playfair text-3xl font-bold text-cream mt-1">
                {loading ? "…" : <AnimatedNumber value={totalRecords} />}
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-gpssa-green/80">Standards</p>
              <p className="font-playfair text-3xl font-bold text-cream mt-1">
                {loading ? "…" : <AnimatedNumber value={counts.standards} />}
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-400/80">Computed Refs</p>
              <p className="font-playfair text-3xl font-bold text-cream mt-1">
                {loading ? "…" : <AnimatedNumber value={counts.computed} />}
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-teal-400/80">Sources</p>
              <p className="font-playfair text-3xl font-bold text-cream mt-1">
                {loading ? "…" : <AnimatedNumber value={counts.sources} />}
              </p>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="mt-6 flex items-center gap-2">
            <Button onClick={handleExport} loading={exporting} variant="secondary" size="sm">
              <Download size={14} /> Export entire corpus
            </Button>
            <span className="text-[10px] text-gray-muted">JSON · all entities · all citations</span>
          </div>
        )}
      </motion.div>

      {/* ═══ STANDARDS BROWSER FEATURED STRIP ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
        className="mb-8 rounded-2xl border border-cyan-400/15 p-5 overflow-hidden cursor-pointer group"
        style={{ background: "linear-gradient(120deg, rgba(14,165,233,0.10), rgba(168,85,247,0.06) 60%, rgba(34,211,238,0.08))" }}
        onClick={() => router.push("/dashboard/data/standards")}
      >
        <div className="flex items-center gap-4 flex-wrap">
          <div className="p-3 rounded-xl bg-cyan-400/10 border border-cyan-400/20">
            <Scale size={22} className="text-cyan-400" />
          </div>
          <div className="flex-1 min-w-[260px]">
            <div className="flex items-center gap-2">
              <h2 className="font-playfair text-lg font-bold text-cream">Standards Browser</h2>
              <span className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-400/10 border border-cyan-400/20">New</span>
            </div>
            <p className="text-xs text-gray-muted mt-0.5">
              Browse every requirement of every globally accepted reference framework — ILO C102 / C128 / R202, ISSA SQ / ICT / Gov, World Bank GTMI, OECD PaaG, Mercer GPI, UN E-Gov.
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {standards.slice(0, 10).map((s) => (
                <span
                  key={s.slug}
                  className="rounded-md px-1.5 py-0.5 text-[10px] font-medium border border-cyan-400/20 text-cyan-300 bg-cyan-400/5"
                >
                  {s.code ?? s.bodyShort ?? s.title}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
            Open browser <ArrowRight size={14} />
          </div>
        </div>
      </motion.div>

      {/* ═══ ENTITY CONSTELLATION ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {TILES.map((tile, i) => {
          const Icon = tile.icon;
          const count = counts[tile.countKey];
          return (
            <motion.button
              key={tile.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: EASE, delay: 0.05 + i * 0.04 }}
              onClick={() => router.push(tile.href)}
              className="group relative rounded-2xl border border-white/[0.06] p-4 text-left transition-all duration-300 hover:border-white/[0.18] hover:bg-white/[0.03] overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${tile.color}06, transparent 60%), rgba(8,18,38,0.5)` }}
            >
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at top left, ${tile.color}15, transparent 60%)` }}
              />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg" style={{ background: `${tile.color}1a`, border: `1px solid ${tile.color}33` }}>
                    <Icon size={16} style={{ color: tile.color }} />
                  </div>
                  <p className="font-playfair text-2xl font-bold text-cream tabular-nums">
                    {loading ? "…" : <AnimatedNumber value={count} />}
                  </p>
                </div>
                <h3 className="text-sm font-semibold text-cream">{tile.label}</h3>
                <p className="text-[11px] text-gray-muted leading-snug mt-1 line-clamp-2">
                  {tile.description}
                </p>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-medium opacity-70 group-hover:opacity-100 transition-opacity" style={{ color: tile.color }}>
                  Open <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* ═══ KNOWLEDGE GRAPH HINT (links between entities) ═══ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="rounded-2xl border border-white/[0.06] bg-black/20 p-5"
      >
        <div className="flex items-start gap-3">
          <Network size={20} className="text-purple-400 mt-1" />
          <div className="flex-1">
            <h3 className="font-playfair text-base font-bold text-cream">Knowledge Graph</h3>
            <p className="text-xs text-gray-muted mt-1 leading-relaxed">
              Every entity in this corpus is linked. Services cite Standards. Standards cite Sources.
              Countries inherit Computed References. Products map to Segments. Click any record to
              traverse the citation chain backwards to the original publisher.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
              <Badge color="#10B981" label="Institutions" count={counts.institutions} />
              <ArrowRight size={10} className="text-gray-muted" />
              <Badge color="#3B82F6" label="Services" count={counts.services} />
              <ArrowRight size={10} className="text-gray-muted" />
              <Badge color="#0EA5E9" label="Standards" count={counts.standards} />
              <ArrowRight size={10} className="text-gray-muted" />
              <Badge color="#2DD4BF" label="Sources" count={counts.sources} />
              <span className="ml-auto text-gray-muted/60">
                ≈ {Math.round(totalRecords * 1.6).toLocaleString()} edges
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══ UNIVERSAL SEARCH MODAL ═══ */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-[90]"
              style={{ background: "rgba(8,18,38,0.78)", backdropFilter: "blur(8px)" }}
              onClick={() => setSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              transition={{ duration: 0.22, ease: EASE }}
              className="fixed inset-x-0 top-[12vh] z-[91] mx-auto max-w-2xl px-4"
            >
              <div className="rounded-2xl border border-white/[0.1] shadow-2xl overflow-hidden" style={{ background: "rgba(8,18,38,0.98)", backdropFilter: "blur(24px)" }}>
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
                  <Search size={16} className="text-gpssa-green" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search standards, sources, computed references…"
                    className="flex-1 bg-transparent text-sm text-cream placeholder:text-gray-muted/60 outline-none"
                  />
                  <span className="rounded border border-white/10 bg-black/30 px-1.5 py-0.5 text-[10px] font-mono text-gray-muted">esc</span>
                </div>
                <div className="max-h-[60vh] overflow-y-auto p-2">
                  {searchResults.length === 0 && (
                    <p className="px-3 py-8 text-center text-xs text-gray-muted">No results.</p>
                  )}
                  {searchResults.map((r) => {
                    const Icon = r.icon;
                    return (
                      <button
                        key={`${r.kind}-${r.id}`}
                        onClick={() => { setSearchOpen(false); router.push(r.href); }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-cream hover:bg-white/[0.05] transition-colors"
                      >
                        <div className="p-1.5 rounded-lg shrink-0" style={{ background: `${r.color}15`, border: `1px solid ${r.color}33` }}>
                          <Icon size={13} style={{ color: r.color }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">{r.title}</p>
                          <p className="text-[10px] text-gray-muted truncate">{r.subtitle}</p>
                        </div>
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold shrink-0" style={{ background: `${r.color}1a`, color: r.color }}>
                          {r.kind}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="px-4 py-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-gray-muted">
                  <span>{searchResults.length} result{searchResults.length !== 1 ? "s" : ""}</span>
                  <span>Searching {corpus.length.toLocaleString()} records · {counts.standards} standards · {counts.computed} refs · {counts.sources} sources</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Badge({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium"
      style={{ background: `${color}14`, border: `1px solid ${color}33`, color }}
    >
      {label} <span className="opacity-70">{count}</span>
    </span>
  );
}
