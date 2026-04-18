"use client";

/**
 * Standards Browser
 *
 * Cinematic exploration of the canonical reference library that grounds
 * every benchmark in the application:
 *
 *   - ILO C102 / C128 / R202
 *   - ISSA Service Quality / ICT / Good Governance
 *   - World Bank GovTech Maturity Index
 *   - OECD Pensions at a Glance
 *   - Mercer CFA Global Pension Index
 *   - UN E-Government Survey
 *
 * And every Computed Reference (Global Avg / Best, GCC / MENA aggregates,
 * peer-group cohorts) used as virtual comparators.
 *
 * Three tabs:
 *   1. Standards — list + detail (requirements with weights & pillars + sources)
 *   2. Computed References — list + per-metric snapshot
 *   3. Citations — provenance graph (sources cited by each requirement)
 */

export const dynamic = "force-dynamic";

import { Suspense, useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Search,
  Scale,
  Sigma,
  ExternalLink,
  Globe2,
  ChevronRight,
  BookOpen,
  Layers,
  X,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface StandardRequirement {
  id: string;
  slug: string;
  code: string | null;
  title: string;
  description: string | null;
  weight: number | null;
  pillar: string | null;
  sortOrder: number;
}

interface StandardSource {
  id: string;
  title: string;
  url: string;
  publisher: string | null;
  accessedAt: string | null;
}

interface Standard {
  id: string;
  slug: string;
  code: string | null;
  title: string;
  body: string;
  bodyShort: string | null;
  category: string;
  scope: string;
  region: string | null;
  description: string | null;
  rationale: string | null;
  url: string | null;
  publishedAt: string | null;
  sortOrder: number;
  requirements: StandardRequirement[];
  sources: StandardSource[];
  complianceCount: number;
}

interface ComputedRef {
  slug: string;
  name: string;
  shortName: string | null;
  kind: string;
  scope: string;
  description: string | null;
  formula: string | null;
  cohortSize: number;
  asOfDate: string | null;
  payload: {
    metrics: Record<string, number>;
    serviceMaturity: Record<string, number>;
    channelMaturity: Record<string, number>;
    standardCompliance: Record<string, number>;
  };
}

const EASE = [0.16, 1, 0.3, 1] as const;

/* Body palette */
const BODY_COLOR: Record<string, string> = {
  ILO:        "#0EA5E9",
  ISSA:       "#A855F7",
  "World Bank": "#10B981",
  OECD:       "#F59E0B",
  Mercer:     "#EC4899",
  UN:         "#06B6D4",
};

const KIND_COLOR: Record<string, string> = {
  average:        "#22D3EE",
  "best-practice": "#10B981",
  median:         "#A78BFA",
  "leader-cohort": "#F472B6",
  "peer-group":   "#F59E0B",
};

const METRIC_LABELS: Record<string, string> = {
  maturityScore:     "Maturity Score",
  coverageRate:      "Coverage Rate",
  replacementRate:   "Replacement Rate",
  sustainability:    "Sustainability",
  digitalReadiness:  "Digital Readiness",
};

const TABS = [
  { id: "standards", label: "Standards", icon: Scale, color: "#0EA5E9" },
  { id: "computed",  label: "Computed References", icon: Sigma, color: "#22D3EE" },
  { id: "citations", label: "Citations Graph", icon: BookOpen, color: "#2DD4BF" },
] as const;

export default function StandardsBrowserPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>}>
      <StandardsBrowserView />
    </Suspense>
  );
}

function StandardsBrowserView() {
  const router = useRouter();
  const params = useSearchParams();
  const initialTab = (params.get("tab") as "standards" | "computed" | "citations") || "standards";
  const initialSlug = params.get("slug");

  const [tab, setTab] = useState<"standards" | "computed" | "citations">(initialTab);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [computed, setComputed] = useState<ComputedRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [bodyFilter, setBodyFilter] = useState<string>("all");
  const [selectedStandard, setSelectedStandard] = useState<Standard | null>(null);
  const [selectedRef, setSelectedRef] = useState<ComputedRef | null>(null);

  const load = useCallback(async () => {
    try {
      const [s, c] = await Promise.all([
        fetch("/api/standards").then((r) => (r.ok ? r.json() : [])),
        fetch("/api/references/computed").then((r) => (r.ok ? r.json() : [])),
      ]);
      setStandards(Array.isArray(s) ? s : []);
      setComputed(Array.isArray(c) ? c : []);
      if (initialSlug) {
        const std = (s as Standard[]).find((x) => x.slug === initialSlug);
        if (std) setSelectedStandard(std);
        const cmp = (c as ComputedRef[]).find((x) => x.slug === initialSlug);
        if (cmp) setSelectedRef(cmp);
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [initialSlug]);

  useEffect(() => { load(); }, [load]);

  /* ── Filters ── */
  const bodies = useMemo(() => {
    const set = new Set<string>();
    standards.forEach((s) => set.add(s.body));
    return Array.from(set).sort();
  }, [standards]);

  const filteredStandards = useMemo(() => {
    const q = query.trim().toLowerCase();
    return standards
      .filter((s) => bodyFilter === "all" || s.body === bodyFilter)
      .filter((s) => {
        if (!q) return true;
        return (
          s.title.toLowerCase().includes(q) ||
          (s.code ?? "").toLowerCase().includes(q) ||
          s.body.toLowerCase().includes(q) ||
          (s.description ?? "").toLowerCase().includes(q) ||
          s.requirements.some((r) => r.title.toLowerCase().includes(q))
        );
      });
  }, [standards, query, bodyFilter]);

  const filteredComputed = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return computed;
    return computed.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.scope.toLowerCase().includes(q) ||
      c.kind.toLowerCase().includes(q) ||
      (c.description ?? "").toLowerCase().includes(q)
    );
  }, [computed, query]);

  return (
    <div className="relative">
      {/* ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div style={{ position: "absolute", width: 600, height: 600, top: -180, right: -180, background: "radial-gradient(circle,rgba(14,165,233,0.10) 0%,transparent 65%)" }} />
        <div style={{ position: "absolute", width: 540, height: 540, bottom: -200, left: -180, background: "radial-gradient(circle,rgba(34,211,238,0.08) 0%,transparent 60%)" }} />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <button
            onClick={() => router.push("/dashboard/data")}
            className="text-xs text-gray-muted hover:text-cream inline-flex items-center gap-1.5 mb-2"
          >
            <ArrowLeft size={12} /> Back to Data Library
          </button>
          <h1 className="font-playfair text-2xl md:text-3xl font-bold text-cream">Standards Browser</h1>
          <p className="text-sm text-gray-muted mt-1 max-w-2xl">
            Every requirement of every globally accepted reference framework, plus the
            computed cohorts that benchmark institutions against their peers. The
            grounding layer for every comparator in the application.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Stat label="Standards" value={standards.length} color="#0EA5E9" />
          <Stat label="Requirements" value={standards.reduce((a, s) => a + s.requirements.length, 0)} color="#A855F7" />
          <Stat label="Computed Refs" value={computed.length} color="#22D3EE" />
        </div>
      </div>

      {/* Tabs + search */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="inline-flex items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  active ? "text-cream" : "text-gray-muted hover:text-cream"
                }`}
                style={active ? { background: `${t.color}1a`, border: `1px solid ${t.color}40` } : {}}
              >
                <Icon size={12} style={{ color: active ? t.color : undefined }} />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 flex-1 sm:flex-none">
          <div className="relative flex-1 sm:w-72">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] pl-8 pr-3 py-1.5 text-xs text-cream placeholder:text-gray-muted/60 focus:outline-none focus:border-white/20"
            />
          </div>
          {tab === "standards" && (
            <select
              value={bodyFilter}
              onChange={(e) => setBodyFilter(e.target.value)}
              className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1.5 text-xs text-cream focus:outline-none"
            >
              <option value="all">All bodies</option>
              {bodies.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : (
        <AnimatePresence mode="wait">
          {tab === "standards" && (
            <motion.div
              key="standards"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-3"
            >
              {filteredStandards.map((s, i) => (
                <StandardCard key={s.slug} std={s} delay={i * 0.03} onClick={() => setSelectedStandard(s)} />
              ))}
              {filteredStandards.length === 0 && (
                <div className="col-span-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-10 text-center">
                  <p className="text-sm text-gray-muted">No standards match your filter.</p>
                </div>
              )}
            </motion.div>
          )}

          {tab === "computed" && (
            <motion.div
              key="computed"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-3"
            >
              {filteredComputed.map((c, i) => (
                <ComputedCard key={c.slug} ref_={c} delay={i * 0.03} onClick={() => setSelectedRef(c)} />
              ))}
              {filteredComputed.length === 0 && (
                <div className="col-span-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-10 text-center">
                  <p className="text-sm text-gray-muted">No computed references found.</p>
                </div>
              )}
            </motion.div>
          )}

          {tab === "citations" && (
            <motion.div
              key="citations"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
            >
              <CitationsGraph standards={filteredStandards} />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Standard detail drawer */}
      <AnimatePresence>
        {selectedStandard && (
          <DetailDrawer onClose={() => setSelectedStandard(null)}>
            <StandardDetail std={selectedStandard} />
          </DetailDrawer>
        )}
        {selectedRef && (
          <DetailDrawer onClose={() => setSelectedRef(null)}>
            <ComputedDetail ref_={selectedRef} />
          </DetailDrawer>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Stat micro-card ─── */
function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 min-w-[88px]">
      <p className="text-[9px] uppercase tracking-[0.18em] text-gray-muted">{label}</p>
      <p className="font-playfair text-xl font-bold tabular-nums" style={{ color }}>{value}</p>
    </div>
  );
}

/* ─── Standard list card ─── */
function StandardCard({ std, delay, onClick }: { std: Standard; delay: number; onClick: () => void }) {
  const color = BODY_COLOR[std.body] ?? "#94A3B8";
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE, delay }}
      onClick={onClick}
      className="group relative rounded-xl border border-white/[0.06] p-4 text-left transition-all hover:border-white/[0.18] hover:bg-white/[0.03] overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${color}06, transparent 60%), rgba(8,18,38,0.4)` }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
              style={{ background: `${color}1c`, border: `1px solid ${color}40`, color }}
            >
              {std.body}
            </span>
            {std.code && (
              <span className="text-[10px] text-gray-muted/80 font-mono">{std.code}</span>
            )}
            <span className="text-[10px] text-gray-muted/60">· {std.scope}</span>
          </div>
          <h3 className="text-sm font-semibold text-cream leading-snug truncate">{std.title}</h3>
        </div>
        <ChevronRight size={14} className="text-gray-muted shrink-0 group-hover:text-cream group-hover:translate-x-0.5 transition-all" />
      </div>
      {std.description && (
        <p className="text-[11px] text-gray-muted leading-relaxed line-clamp-2 mb-3">{std.description}</p>
      )}
      <div className="flex items-center justify-between text-[10px] text-gray-muted">
        <span className="inline-flex items-center gap-1"><Layers size={10} /> {std.requirements.length} requirement{std.requirements.length !== 1 ? "s" : ""}</span>
        <span className="inline-flex items-center gap-1"><BookOpen size={10} /> {std.sources.length} source{std.sources.length !== 1 ? "s" : ""}</span>
      </div>
    </motion.button>
  );
}

/* ─── Computed reference card ─── */
function ComputedCard({ ref_, delay, onClick }: { ref_: ComputedRef; delay: number; onClick: () => void }) {
  const color = KIND_COLOR[ref_.kind] ?? "#94A3B8";
  const metrics = ref_.payload?.metrics ?? {};
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE, delay }}
      onClick={onClick}
      className="group relative rounded-xl border border-white/[0.06] p-4 text-left transition-all hover:border-white/[0.18] hover:bg-white/[0.03] overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${color}06, transparent 60%), rgba(8,18,38,0.4)` }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
              style={{ background: `${color}1c`, border: `1px solid ${color}40`, color }}
            >
              {ref_.kind}
            </span>
            <span className="text-[10px] text-gray-muted">{ref_.scope}</span>
            <span className="text-[10px] text-gray-muted/60">· n={ref_.cohortSize}</span>
          </div>
          <h3 className="text-sm font-semibold text-cream leading-snug truncate">{ref_.name}</h3>
        </div>
        <ChevronRight size={14} className="text-gray-muted shrink-0 group-hover:text-cream group-hover:translate-x-0.5 transition-all" />
      </div>
      {ref_.description && (
        <p className="text-[11px] text-gray-muted leading-relaxed line-clamp-2 mb-3">{ref_.description}</p>
      )}
      {/* Inline mini metric bars */}
      <div className="grid grid-cols-5 gap-1.5">
        {Object.entries(metrics).slice(0, 5).map(([k, v]) => (
          <div key={k} className="flex flex-col gap-1">
            <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, v))}%`, background: color }} />
            </div>
            <span className="text-[8px] text-gray-muted truncate" title={METRIC_LABELS[k] ?? k}>
              {(METRIC_LABELS[k] ?? k).split(" ")[0]}
            </span>
          </div>
        ))}
      </div>
    </motion.button>
  );
}

/* ─── Citations graph (simple grouped view) ─── */
function CitationsGraph({ standards }: { standards: Standard[] }) {
  const sourceMap = useMemo(() => {
    const m = new Map<string, { source: StandardSource; standards: Standard[] }>();
    standards.forEach((s) => {
      s.sources.forEach((src) => {
        const cur = m.get(src.id);
        if (cur) cur.standards.push(s);
        else m.set(src.id, { source: src, standards: [s] });
      });
    });
    return Array.from(m.values()).sort((a, b) => b.standards.length - a.standards.length);
  }, [standards]);

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-muted mb-3">
        {sourceMap.length} unique source publications cited across {standards.length} standards.
        Each row shows a primary source and the standards that depend on it.
      </p>
      {sourceMap.map((entry, i) => (
        <motion.div
          key={entry.source.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: EASE, delay: i * 0.02 }}
          className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <BookOpen size={14} className="text-teal-400 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-cream truncate">{entry.source.title}</p>
                  {entry.source.url && (
                    <a
                      href={entry.source.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-gray-muted hover:text-cream"
                    >
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
                <p className="text-[10px] text-gray-muted">
                  {entry.source.publisher ?? "—"}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-teal-400/10 border border-teal-400/20 px-2 py-0.5 text-[10px] font-medium text-teal-400 shrink-0">
              {entry.standards.length} cite
            </span>
          </div>
          <div className="mt-2 pl-6 flex flex-wrap gap-1">
            {entry.standards.map((s) => {
              const c = BODY_COLOR[s.body] ?? "#94A3B8";
              return (
                <span
                  key={s.slug}
                  className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                  style={{ background: `${c}10`, border: `1px solid ${c}33`, color: c }}
                >
                  {s.code ?? s.title}
                </span>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Slide-in detail drawer ─── */
function DetailDrawer({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-[80]"
        style={{ background: "rgba(4,12,28,0.7)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      />
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.32, ease: EASE }}
        className="fixed right-0 top-0 bottom-0 z-[81] w-full max-w-2xl overflow-y-auto border-l border-white/[0.08]"
        style={{ background: "rgba(8,18,38,0.98)", backdropFilter: "blur(24px)" }}
      >
        <button
          onClick={onClose}
          className="sticky top-3 right-3 ml-auto mr-3 mt-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] text-gray-muted hover:text-cream hover:bg-white/[0.08] transition-all"
        >
          <X size={14} />
        </button>
        <div className="px-6 pb-10 -mt-8">{children}</div>
      </motion.aside>
    </>
  );
}

/* ─── Standard detail body ─── */
function StandardDetail({ std }: { std: Standard }) {
  const color = BODY_COLOR[std.body] ?? "#94A3B8";
  const totalWeight = std.requirements.reduce((a, r) => a + (r.weight ?? 0), 0);
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span
          className="rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider"
          style={{ background: `${color}1c`, border: `1px solid ${color}55`, color }}
        >
          {std.body}
        </span>
        {std.code && <span className="text-xs text-gray-muted font-mono">{std.code}</span>}
        <span className="text-xs text-gray-muted">· {std.scope}</span>
      </div>
      <h2 className="font-playfair text-2xl font-bold text-cream leading-tight">{std.title}</h2>
      {std.description && (
        <p className="text-sm text-gray-muted leading-relaxed mt-2">{std.description}</p>
      )}
      {std.rationale && (
        <div className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-gpssa-green/80 mb-1">Why this standard</p>
          <p className="text-xs text-cream/90 leading-relaxed">{std.rationale}</p>
        </div>
      )}

      {/* Requirements */}
      <div className="mt-6">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-sm font-semibold text-cream uppercase tracking-wider">
            Requirements <span className="text-gray-muted font-normal normal-case">({std.requirements.length})</span>
          </h3>
          {totalWeight > 0 && (
            <span className="text-[10px] text-gray-muted">total weight {totalWeight.toFixed(0)}</span>
          )}
        </div>
        <div className="space-y-2">
          {std.requirements.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.02 }}
              className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3"
            >
              <div className="flex items-start justify-between gap-3 mb-1">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    {r.code && <span className="text-[10px] font-mono text-gray-muted">{r.code}</span>}
                    {r.pillar && (
                      <span className="rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-medium" style={{ background: `${color}10`, color }}>
                        {r.pillar}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-cream">{r.title}</p>
                </div>
                {r.weight != null && (
                  <span className="text-[10px] text-gray-muted shrink-0">w {r.weight}</span>
                )}
              </div>
              {r.description && (
                <p className="text-[11px] text-gray-muted leading-relaxed mt-1">{r.description}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sources */}
      {std.sources.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-cream uppercase tracking-wider mb-3">
            Primary Sources <span className="text-gray-muted font-normal normal-case">({std.sources.length})</span>
          </h3>
          <div className="space-y-1.5">
            {std.sources.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 hover:border-white/[0.18] hover:bg-white/[0.04] transition-all"
              >
                <div className="flex items-center gap-2">
                  <ExternalLink size={11} className="text-teal-400 shrink-0" />
                  <p className="text-xs font-medium text-cream truncate">{s.title}</p>
                </div>
                {s.publisher && <p className="text-[10px] text-gray-muted ml-5 mt-0.5">{s.publisher}</p>}
              </a>
            ))}
          </div>
        </div>
      )}

      {std.url && (
        <a
          href={std.url}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300"
        >
          <Globe2 size={12} /> Open standard publication <ExternalLink size={10} />
        </a>
      )}
    </div>
  );
}

/* ─── Computed reference detail body ─── */
function ComputedDetail({ ref_ }: { ref_: ComputedRef }) {
  const color = KIND_COLOR[ref_.kind] ?? "#94A3B8";
  const metrics = ref_.payload?.metrics ?? {};
  const services = ref_.payload?.serviceMaturity ?? {};
  const channels = ref_.payload?.channelMaturity ?? {};

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span
          className="rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider"
          style={{ background: `${color}1c`, border: `1px solid ${color}55`, color }}
        >
          {ref_.kind}
        </span>
        <span className="text-xs text-gray-muted">{ref_.scope} · cohort n={ref_.cohortSize}</span>
      </div>
      <h2 className="font-playfair text-2xl font-bold text-cream leading-tight">{ref_.name}</h2>
      {ref_.description && (
        <p className="text-sm text-gray-muted leading-relaxed mt-2">{ref_.description}</p>
      )}
      {ref_.formula && (
        <div className="mt-3 rounded-lg border border-white/[0.06] bg-black/30 p-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-gray-muted mb-1">Formula</p>
          <code className="text-xs font-mono text-cyan-300">{ref_.formula}</code>
        </div>
      )}

      <SectionMetrics title="Headline Metrics" entries={metrics} color={color} labels={METRIC_LABELS} />
      {Object.keys(services).length > 0 && (
        <SectionMetrics title="Service Maturity by Category" entries={services} color={color} />
      )}
      {Object.keys(channels).length > 0 && (
        <SectionMetrics title="Channel Maturity by Type" entries={channels} color={color} />
      )}

      {ref_.asOfDate && (
        <p className="mt-6 text-[10px] text-gray-muted">
          As of {new Date(ref_.asOfDate).toLocaleString()}
        </p>
      )}
    </div>
  );
}

function SectionMetrics({
  title, entries, color, labels,
}: {
  title: string;
  entries: Record<string, number>;
  color: string;
  labels?: Record<string, string>;
}) {
  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-cream uppercase tracking-wider mb-3">{title}</h3>
      <div className="space-y-2">
        {Object.entries(entries).map(([k, v]) => (
          <div key={k} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-cream/90">{labels?.[k] ?? k}</span>
              <span className="font-mono tabular-nums" style={{ color }}>{v.toFixed(1)}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, Math.min(100, v))}%` }}
                transition={{ duration: 0.6, ease: EASE }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${color}88, ${color})` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
