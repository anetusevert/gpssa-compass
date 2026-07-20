"use client";

/**
 * Data & Sources — RAG Library hub.
 * Slim header (search + counts) with the entity constellation,
 * standards strip and knowledge graph inside a tile scroll.
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
  Search,
  Scale,
  Sigma,
  Network,
  Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ImportOpportunitiesPanel } from "@/components/engagement/ImportOpportunitiesPanel";
import { PageFrame, TileScroll } from "@/components/ui/PageFrame";
import { EASE, staggerChildren, tileItem } from "@/lib/motion";

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
  return <>{display.toLocaleString("en-US")}</>;
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

function StatChip({ label, value, loading }: { label: string; value: number; loading: boolean }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
      <p className="text-[9px] uppercase tracking-[0.16em] text-white/40">{label}</p>
      <p className="text-sm font-semibold text-cream tabular-nums">
        {loading ? "…" : <AnimatedNumber value={value} />}
      </p>
    </div>
  );
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
    <PageFrame
      header={
        <div className="flex items-center gap-3 border-b border-white/[0.06] pb-3">
          <div className="shrink-0 rounded-lg border border-gpssa-green/20 bg-gpssa-green/10 p-1.5">
            <Search size={14} className="text-gpssa-green" />
          </div>
          <div className="min-w-0">
            <h1 className="font-playfair text-sm font-bold leading-tight text-cream sm:text-base">Data &amp; Sources</h1>
            <p className="hidden truncate text-[10px] text-gray-muted sm:block">One searchable, traceable corpus</p>
          </div>
          <button
            onClick={() => { setSearchOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
            className="ml-2 hidden items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-xs text-gray-muted transition-all hover:border-white/[0.18] hover:bg-white/[0.06] hover:text-cream md:inline-flex"
          >
            <Search size={12} className="text-gpssa-green" />
            <span>Search corpus…</span>
            <span className="rounded border border-white/10 bg-black/20 px-1.5 py-0.5 font-mono text-[10px]">⌘K</span>
          </button>
          {isAdmin && (
            <Button onClick={handleExport} loading={exporting} variant="secondary" size="sm" className="hidden lg:inline-flex">
              <Download size={14} /> Export
            </Button>
          )}
          <div className="ml-auto flex items-center gap-2">
            <StatChip label="Records" value={totalRecords} loading={loading} />
            <StatChip label="Standards" value={counts.standards} loading={loading} />
            <StatChip label="Refs" value={counts.computed} loading={loading} />
            <StatChip label="Sources" value={counts.sources} loading={loading} />
          </div>
        </div>
      }
    >
      <TileScroll className="relative pt-4">
        {/* ── Ambient glow ── */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div style={{ position: "absolute", width: 720, height: 720, top: -180, right: -200, background: "radial-gradient(circle,rgba(14,165,233,0.10) 0%,transparent 65%)" }} />
          <div style={{ position: "absolute", width: 560, height: 560, bottom: -180, left: -180, background: "radial-gradient(circle,rgba(168,85,247,0.10) 0%,transparent 65%)" }} />
        </div>

        <div className="mb-6">
          <ImportOpportunitiesPanel />
        </div>

        {/* ═══ STANDARDS BROWSER FEATURED STRIP ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
          className="group mb-6 cursor-pointer overflow-hidden rounded-2xl border border-cyan-400/15 p-4"
          style={{ background: "linear-gradient(120deg, rgba(14,165,233,0.10), rgba(168,85,247,0.06) 60%, rgba(34,211,238,0.08))" }}
          onClick={() => router.push("/dashboard/data/standards")}
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-2.5">
              <Scale size={18} className="text-cyan-400" />
            </div>
            <div className="min-w-[240px] flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-playfair text-base font-bold text-cream">Standards Browser</h2>
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-cyan-400">New</span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {standards.slice(0, 10).map((s) => (
                  <span
                    key={s.slug}
                    className="rounded-md border border-cyan-400/20 bg-cyan-400/5 px-1.5 py-0.5 text-[10px] font-medium text-cyan-300"
                  >
                    {s.code ?? s.bodyShort ?? s.title}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-cyan-400 transition-transform group-hover:translate-x-1">
              Open browser <ArrowRight size={14} />
            </div>
          </div>
        </motion.div>

        {/* ═══ ENTITY CONSTELLATION ═══ */}
        <motion.div
          variants={staggerChildren}
          initial="hidden"
          animate="show"
          className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {TILES.map((tile) => {
            const Icon = tile.icon;
            const count = counts[tile.countKey];
            return (
              <motion.button
                key={tile.id}
                variants={tileItem}
                onClick={() => router.push(tile.href)}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.06] p-4 text-left transition-all duration-300 hover:border-white/[0.18] hover:bg-white/[0.03]"
                style={{ background: `linear-gradient(135deg, ${tile.color}06, transparent 60%), rgba(8,18,38,0.5)` }}
              >
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: `radial-gradient(ellipse at top left, ${tile.color}15, transparent 60%)` }}
                />
                <div className="relative z-10">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="rounded-lg p-2" style={{ background: `${tile.color}1a`, border: `1px solid ${tile.color}33` }}>
                      <Icon size={16} style={{ color: tile.color }} />
                    </div>
                    <p className="font-playfair text-2xl font-bold tabular-nums text-cream">
                      {loading ? "…" : <AnimatedNumber value={count} />}
                    </p>
                  </div>
                  <h3 className="text-sm font-semibold text-cream">{tile.label}</h3>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-gray-muted">
                    {tile.description}
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-[11px] font-medium opacity-70 transition-opacity group-hover:opacity-100" style={{ color: tile.color }}>
                    Open <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* ═══ KNOWLEDGE GRAPH HINT (links between entities) ═══ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="rounded-2xl border border-white/[0.06] bg-black/20 p-5"
        >
          <div className="flex items-start gap-3">
            <Network size={20} className="mt-1 text-purple-400" />
            <div className="flex-1">
              <h3 className="font-playfair text-base font-bold text-cream">Knowledge Graph</h3>
              <p className="mt-1 text-xs leading-relaxed text-gray-muted">
                Every entity is linked — traverse any citation chain back to its publisher.
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
      </TileScroll>

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
    </PageFrame>
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
