"use client";

/**
 * Service Catalog — guided three-section narrative
 *
 *   1. The Catalog at a Glance — headline KPIs + 12 ILO branch tiles.
 *   2. Browse Every Service     — full filterable list with audience + branch chips.
 *   3. How GPSSA Compares       — full-width benchmark cockpit with comparator rail,
 *                                 dial, radar and a per-branch gap table.
 *
 * This replaces the previous 3-tab "Act I/II/III" pattern. Every service in the
 * database is classified via `classifyServiceFunction()` so the long tail of
 * un-mapped categories doesn't disappear.
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  Search,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Layers,
  Globe2,
  Scale,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  XCircle,
  Filter,
  RotateCcw,
  Telescope,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { StatBar, type StatBarItem } from "@/components/ui/StatBar";
import { useResearchUpdates } from "@/lib/hooks/useResearchUpdates";
import { MandateBasisChip } from "@/components/mandate/MandateBasisChip";

import {
  SERVICE_FUNCTIONS,
  SERVICE_FUNCTIONS_WITH_OTHER,
  SERVICE_AUDIENCES,
  UNCLASSIFIED_FUNCTION,
  classifyServiceFunction,
  classifyServiceAudience,
  type ServiceFunction,
  type ServiceAudience,
} from "@/lib/taxonomy";

import { ComparatorPicker } from "@/components/comparator/ComparatorPicker";
import { ComplianceDial } from "@/components/comparator/ComplianceDial";
import { RangeBandRadar } from "@/components/comparator/RangeBandRadar";
import { useComparators } from "@/lib/comparator/hooks";
import type { ComparatorOption, ComparatorMetric } from "@/lib/comparator/types";

/* ═══════════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════════ */

interface GPSSAService {
  id: string;
  name: string;
  category: string;
  description: string | null;
  userTypes: string[] | null;
  currentState: string | null;
  painPoints: string[] | null;
  opportunities: string[] | null;
  digitalReadiness: number | null;
  maturityLevel: string | null;
  bestPracticeComparison: string | null;
  strengths: string[] | null;
  iloAlignment: string | null;
}

interface ServiceAnalysisRecord {
  id: string;
  analysis: string;
  model: string | null;
  createdAt: string;
}

interface IntlService {
  id: string;
  countryIso3: string;
  name: string;
  category: string;
  description: string | null;
  userTypes: string | null;
  digitalReadiness: number | null;
  maturityLevel: string | null;
  strengths: string | null;
  painPoints: string | null;
  iloAlignment: string | null;
  channelCapabilities: string | null;
  institution: { id: string; name: string; shortName: string | null; country: string } | null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════════════ */

function parseJsonField<T>(val: unknown): T | null {
  if (val == null) return null;
  if (Array.isArray(val)) return val as T;
  if (typeof val === "string") { try { return JSON.parse(val) as T; } catch { return null; } }
  return val as T;
}

const MATURITY_TO_SCORE: Record<string, number> = {
  Leader: 90,
  Advanced: 80,
  "AI-Integrated": 95,
  "Digital-First": 85,
  Established: 70,
  "Digital-Enabled": 65,
  Developing: 55,
  Partial: 50,
  "Partially Digital": 50,
  "Basic Digital": 40,
  Transitioning: 35,
  Emerging: 30,
  Traditional: 25,
  Manual: 15,
};

function maturityToScore(level: string | null | undefined): number {
  if (!level) return 0;
  return MATURITY_TO_SCORE[level] ?? 50;
}

function svcScore(svc: GPSSAService): number {
  if (svc.digitalReadiness != null) return svc.digitalReadiness;
  return maturityToScore(svc.maturityLevel);
}

function intlSvcScore(svc: IntlService): number {
  if (svc.digitalReadiness != null) return svc.digitalReadiness;
  return maturityToScore(svc.maturityLevel);
}

function bandFor(score: number): string {
  if (score >= 85) return "World-class";
  if (score >= 70) return "Above floor";
  if (score >= 55) return "At floor";
  if (score >= 40) return "Approaching";
  return "Below floor";
}

/* ═══════════════════════════════════════════════════════════════════════════
   Static seed (first paint before /api/services lands)
   ═══════════════════════════════════════════════════════════════════════════ */

const STATIC_EXTRA: Pick<GPSSAService, "digitalReadiness" | "maturityLevel" | "bestPracticeComparison" | "strengths" | "iloAlignment"> = {
  digitalReadiness: null, maturityLevel: null, bestPracticeComparison: null, strengths: null, iloAlignment: null,
};

const STATIC_SERVICES: GPSSAService[] = [
  { id: "s-01", name: "Registration of an Insured", category: "Employer", description: "Register new insured individuals under an employer's account with GPSSA.", userTypes: ["Employer", "HR"], currentState: "Semi-digital with paper-based document submission.", painPoints: ["Manual document verification", "Long processing times"], opportunities: ["Digital onboarding portal", "AI document verification"], ...STATIC_EXTRA },
  { id: "s-02", name: "Employers Registration", category: "Employer", description: "Register new employers with GPSSA for pension and social security contributions.", userTypes: ["Employer"], currentState: "Partially online with in-person verification required.", painPoints: ["Complex registration forms", "Multiple visits required"], opportunities: ["End-to-end digital registration", "eKYC integration"], ...STATIC_EXTRA },
  { id: "s-03", name: "Apply for End Of Service - Civil", category: "Employer", description: "Process end-of-service benefits for civil sector employees.", userTypes: ["Employer", "HR"], currentState: "Manual calculation with multi-step approval workflow.", painPoints: ["Complex benefit calculations", "Delayed payments"], opportunities: ["Automated benefit calculator", "Digital approval workflow"], ...STATIC_EXTRA },
  { id: "s-09", name: "Workplace Injury Compensation", category: "Employer", description: "Process compensation claims for workplace injuries.", userTypes: ["Employer", "Insured"], currentState: "Paper-based claims with manual medical review.", painPoints: ["Slow claims processing", "Fragmented medical records"], opportunities: ["Digital claims portal", "Integrated medical records"], ...STATIC_EXTRA },
  { id: "s-13", name: "Pension Advisory Service", category: "Insured", description: "Provide personalized pension planning advice to insured individuals.", userTypes: ["Insured"], currentState: "Limited in-person advisory with long wait times.", painPoints: ["Limited advisor availability", "Generic advice"], opportunities: ["AI-powered pension simulator", "Digital advisory platform"], ...STATIC_EXTRA },
  { id: "s-17", name: "Beneficiary Registration", category: "Beneficiary", description: "Register beneficiaries to receive pension benefits.", userTypes: ["Beneficiary", "Family"], currentState: "Paper-based registration with extensive documentation.", painPoints: ["Emotional process burden", "Extensive documentation"], opportunities: ["Compassionate digital process", "Pre-registration options"], ...STATIC_EXTRA },
  { id: "s-19", name: "Report a Death", category: "Beneficiary", description: "Report the death of an insured person or beneficiary.", userTypes: ["Beneficiary", "Family"], currentState: "In-person reporting with death certificate submission.", painPoints: ["Sensitive timing", "Multiple office visits"], opportunities: ["Digital reporting with gov integration", "Automated benefit activation"], ...STATIC_EXTRA },
  { id: "s-23", name: "Registration of GCC Nationals", category: "GCC", description: "Register GCC nationals working in the UAE for pension benefits.", userTypes: ["Employer", "GCC National"], currentState: "Inter-country coordination with manual data exchange.", painPoints: ["Cross-border data exchange", "Inconsistent processes"], opportunities: ["GCC-wide digital identity", "API-based data exchange"], ...STATIC_EXTRA },
  { id: "s-27", name: "Apply for End Of Service - Military", category: "Military", description: "Process end-of-service benefits for military sector personnel.", userTypes: ["Military Personnel", "MOD"], currentState: "Classified process with specialized handling.", painPoints: ["Security clearance requirements", "Specialized calculations"], opportunities: ["Secure digital processing", "Role-based access controls"], ...STATIC_EXTRA },
  { id: "s-29", name: "Generate Certificates", category: "General", description: "Generate various certificates including service, pension, and salary.", userTypes: ["Insured", "Employer", "Beneficiary"], currentState: "Semi-digital with manual approval steps.", painPoints: ["Approval bottlenecks", "Format inconsistencies"], opportunities: ["Instant digital certificate generation", "QR code verification"], ...STATIC_EXTRA },
  { id: "s-30", name: "Submit Complaint", category: "General", description: "Submit and track complaints about GPSSA services.", userTypes: ["Insured", "Employer", "Beneficiary"], currentState: "Multi-channel submission with manual routing.", painPoints: ["Inconsistent routing", "Slow resolution"], opportunities: ["AI-powered routing", "Sentiment analysis"], ...STATIC_EXTRA },
];

/* ═══════════════════════════════════════════════════════════════════════════
   Aggregations
   ═══════════════════════════════════════════════════════════════════════════ */

interface FunctionStats {
  fn: ServiceFunction;
  count: number;
  avgScore: number;
  pains: number;
  opps: number;
  topPain?: string;
}

function buildFunctionStats(services: GPSSAService[]): FunctionStats[] {
  const groups = new Map<string, GPSSAService[]>();
  for (const fn of SERVICE_FUNCTIONS_WITH_OTHER) groups.set(fn.slug, []);
  for (const svc of services) {
    const fn = classifyServiceFunction({
      name: svc.name,
      description: svc.description,
      category: svc.category,
    });
    groups.get(fn.slug)?.push(svc);
  }
  return SERVICE_FUNCTIONS_WITH_OTHER.map((fn) => {
    const matched = groups.get(fn.slug) ?? [];
    const scores = matched.map(svcScore).filter((v) => v > 0);
    const avg = scores.length > 0 ? scores.reduce((s, v) => s + v, 0) / scores.length : 0;
    const pains = matched.reduce((acc, s) => acc + (s.painPoints?.length ?? 0), 0);
    const opps = matched.reduce((acc, s) => acc + (s.opportunities?.length ?? 0), 0);
    const topPain = matched.flatMap((s) => s.painPoints ?? []).find(Boolean);
    return { fn, count: matched.length, avgScore: Math.round(avg), pains, opps, topPain };
  });
}

function gpssaHeadline(services: GPSSAService[]): number {
  const scores = services.map(svcScore).filter((s) => s > 0);
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
}

/* ═══════════════════════════════════════════════════════════════════════════
   Section 1 — At-a-glance ILO branch tile (flat, single accent bar)
   ═══════════════════════════════════════════════════════════════════════════ */

function BranchTile({
  stat,
  index,
  active,
  onPick,
}: {
  stat: FunctionStats;
  index: number;
  active: boolean;
  onPick: () => void;
}) {
  const score = stat.avgScore;
  return (
    <motion.button
      onClick={onPick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.025, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className={`group relative text-left rounded-xl bg-white/[0.025] border p-4 overflow-hidden transition-colors ${
        active
          ? "border-cream/30 bg-white/[0.05]"
          : "border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.04]"
      }`}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ backgroundColor: stat.fn.color }}
      />
      <div className="pl-2">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-cream leading-tight truncate">{stat.fn.shortLabel}</h3>
            {stat.fn.iloReference ? (
              <span className="inline-flex items-center gap-1 mt-1 text-[9px] uppercase tracking-wider text-gray-muted">
                <Scale size={9} className="text-gold/70" />
                {stat.fn.iloReference}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 mt-1 text-[9px] uppercase tracking-wider text-gray-muted">
                {stat.fn.slug === UNCLASSIFIED_FUNCTION.slug ? "Long-tail" : "Administrative"}
              </span>
            )}
          </div>
          <span className="text-[10px] tabular-nums font-semibold text-cream bg-white/[0.06] rounded px-1.5 py-0.5 shrink-0">
            {stat.count}
          </span>
        </div>

        <p className="text-[10px] text-gray-muted leading-snug line-clamp-2 mb-3 min-h-[28px]">
          {stat.fn.description}
        </p>

        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-1 rounded-full overflow-hidden bg-white/[0.06]">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: stat.fn.color }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(2, score)}%` }}
              transition={{ duration: 0.7, delay: 0.15 + index * 0.02 }}
            />
          </div>
          <span className="text-[10px] tabular-nums text-cream/80 w-7 text-right">{score}</span>
        </div>

        {stat.topPain ? (
          <p className="text-[9px] text-gray-muted/90 line-clamp-1 italic">
            <AlertTriangle size={8} className="inline mr-1 text-red-400/70" />
            {stat.topPain}
          </p>
        ) : (
          <p className="text-[9px] text-gray-muted/60 italic">No pain points logged yet</p>
        )}
      </div>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Section 2 — Service card (flat, accent bar, no glow)
   ═══════════════════════════════════════════════════════════════════════════ */

function ServiceCard({
  svc,
  fn,
  aud,
  index,
  onOpen,
}: {
  svc: GPSSAService;
  fn: ServiceFunction;
  aud: ServiceAudience | null;
  index: number;
  onOpen: () => void;
}) {
  const score = svcScore(svc);
  const topPain = svc.painPoints?.[0];
  const topOpp = svc.opportunities?.[0];
  return (
    <motion.button
      onClick={onOpen}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index, 12) * 0.02 }}
      whileHover={{ y: -2 }}
      className="relative w-full text-left rounded-xl bg-white/[0.025] border border-white/[0.06] p-3.5 hover:bg-white/[0.05] hover:border-white/[0.14] transition-colors overflow-hidden"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ backgroundColor: fn.color }} />
      <div className="pl-2">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-xs font-semibold text-cream leading-snug pr-2">{svc.name}</h3>
          <span className="text-[10px] tabular-nums font-semibold text-cream bg-white/[0.06] rounded px-1.5 py-0.5 shrink-0">
            {Math.round(score)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider text-gray-muted">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: fn.color }} />
            {fn.shortLabel}
          </span>
          {aud && (
            <span className="text-[9px] uppercase tracking-wider text-gray-muted">· {aud.shortLabel}</span>
          )}
        </div>

        {svc.description && (
          <p className="text-[10px] text-gray-muted leading-relaxed mb-2 line-clamp-2">{svc.description}</p>
        )}

        <div className="space-y-1">
          {topPain && (
            <p className="text-[10px] text-red-300/80 line-clamp-1">
              <XCircle size={9} className="inline mr-1" />
              {topPain}
            </p>
          )}
          {topOpp && (
            <p className="text-[10px] text-emerald-300/80 line-clamp-1">
              <Lightbulb size={9} className="inline mr-1" />
              {topOpp}
            </p>
          )}
        </div>
      </div>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Section 3 — Benchmark cockpit
   ═══════════════════════════════════════════════════════════════════════════ */

interface ReferenceMetricsBundle {
  byFunction: Map<string, { reference: number; min?: number; max?: number; label?: string }>;
  headline: number;
  label: string;
  color: string;
}

function buildGpssaFunctionMetrics(services: GPSSAService[]): Map<string, { score: number; n: number }> {
  const out = new Map<string, { score: number; n: number }>();
  for (const fn of SERVICE_FUNCTIONS) out.set(fn.slug, { score: 0, n: 0 });
  for (const svc of services) {
    const fn = classifyServiceFunction({
      name: svc.name,
      description: svc.description,
      category: svc.category,
    });
    if (fn.slug === UNCLASSIFIED_FUNCTION.slug) continue;
    const cur = out.get(fn.slug);
    if (!cur) continue;
    cur.score += svcScore(svc);
    cur.n += 1;
  }
  return out;
}

function BenchmarkCockpit({
  services,
  intl,
  comparator,
  setComparator,
  comparatorOptions,
  comparatorLoading,
  loading,
}: {
  services: GPSSAService[];
  intl: IntlService[];
  comparator: ComparatorOption | null;
  setComparator: (c: ComparatorOption | null) => void;
  comparatorOptions: ComparatorOption[];
  comparatorLoading: boolean;
  loading: boolean;
}) {
  const [bundle, setBundle] = useState<ReferenceMetricsBundle | null>(null);
  const [bundleLoading, setBundleLoading] = useState(false);

  const gpssaByFn = useMemo(() => buildGpssaFunctionMetrics(services), [services]);
  const gpssaScore = useMemo(() => gpssaHeadline(services), [services]);

  useEffect(() => {
    if (!comparator) {
      setBundle(null);
      return;
    }
    let cancelled = false;
    async function load() {
      if (!comparator) return;
      setBundleLoading(true);
      try {
        if (comparator.kind === "computed") {
          const res = await fetch(`/api/references/computed/${comparator.id}`);
          if (!res.ok) throw new Error("ref");
          const data = await res.json();
          const byFn = new Map<string, { reference: number; label?: string }>();
          for (const fn of SERVICE_FUNCTIONS) {
            const value = data.payload?.serviceMaturity?.[fn.label] ?? data.payload?.serviceMaturity?.[fn.shortLabel] ?? 0;
            byFn.set(fn.slug, { reference: Number(value) || 0, label: comparator.shortLabel });
          }
          if (cancelled) return;
          setBundle({
            byFunction: byFn,
            headline: data.payload?.metrics?.maturityScore ?? 0,
            label: comparator.shortLabel,
            color: comparator.color,
          });
        } else if (comparator.kind === "country") {
          const intlForCountry = intl.filter((s) => s.countryIso3 === comparator.id);
          const byFn = new Map<string, { reference: number; min?: number; max?: number; label?: string }>();
          for (const fn of SERVICE_FUNCTIONS) {
            const matches = intlForCountry.filter((s) => {
              const c = classifyServiceFunction({ name: s.name, description: s.description, category: s.category });
              return c.slug === fn.slug;
            });
            const scores = matches.map(intlSvcScore).filter((v) => v > 0);
            const ref = scores.length > 0 ? scores.reduce((s, v) => s + v, 0) / scores.length : 0;
            byFn.set(fn.slug, {
              reference: ref,
              min: scores.length > 0 ? Math.min(...scores) : undefined,
              max: scores.length > 0 ? Math.max(...scores) : undefined,
              label: comparator.shortLabel,
            });
          }
          const head = Array.from(byFn.values()).map((v) => v.reference).filter((v) => v > 0);
          if (cancelled) return;
          setBundle({
            byFunction: byFn,
            headline: head.length === 0 ? 0 : Math.round(head.reduce((s, v) => s + v, 0) / head.length),
            label: comparator.shortLabel,
            color: comparator.color,
          });
        } else {
          const res = await fetch(`/api/standards/${comparator.id}`);
          if (!res.ok) throw new Error("std");
          await res.json();
          const byFn = new Map<string, { reference: number; label?: string }>();
          for (const fn of SERVICE_FUNCTIONS) {
            const isCovered = fn.standardSlugs.includes(comparator.id);
            const reference = isCovered ? 80 : 30;
            byFn.set(fn.slug, { reference, label: comparator.shortLabel });
          }
          if (cancelled) return;
          setBundle({
            byFunction: byFn,
            headline: 80,
            label: comparator.shortLabel,
            color: comparator.color,
          });
        }
      } finally {
        if (!cancelled) setBundleLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [comparator, intl]);

  const metrics: ComparatorMetric[] = useMemo(() => {
    return SERVICE_FUNCTIONS.map((fn) => {
      const g = gpssaByFn.get(fn.slug);
      const r = bundle?.byFunction.get(fn.slug);
      const gAvg = g && g.n > 0 ? g.score / g.n : 0;
      return {
        label: fn.shortLabel,
        key: fn.slug,
        gpssa: Number(gAvg.toFixed(1)),
        reference: Number((r?.reference ?? 0).toFixed(1)),
        band: r?.min != null && r?.max != null ? { min: r.min, max: r.max } : undefined,
        pillar: fn.iloReference,
      };
    });
  }, [gpssaByFn, bundle]);

  const refHeadline = comparator ? bundle?.headline ?? 0 : undefined;
  const headlineGap = comparator ? gpssaScore - (refHeadline ?? 0) : 0;

  // Quick-pick presets surfaced when nothing is selected
  const presets = useMemo(() => {
    const findOpt = (kind: ComparatorOption["kind"], id: string) =>
      comparatorOptions.find((o) => o.kind === kind && o.id === id);
    return [
      findOpt("standard", "ilo-c102"),
      findOpt("computed", "gcc-average"),
      findOpt("country", "SGP"),
    ].filter(Boolean) as ComparatorOption[];
  }, [comparatorOptions]);

  return (
    <div className="space-y-4">
      {/* Comparator rail */}
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
            We&apos;ll overlay GPSSA&apos;s twelve service branches against your chosen reference and surface
            every gap, branch by branch.
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
          {/* Cockpit grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            {/* Left rail — composite dial(s) */}
            <div className="xl:col-span-4 space-y-3">
              <div className="rounded-xl bg-white/[0.025] border border-white/[0.06] p-5">
                <p className="text-[10px] uppercase tracking-wider text-gray-muted mb-4 text-center">
                  Composite maturity
                </p>
                <div className="flex justify-center">
                  <ComplianceDial
                    score={gpssaScore}
                    reference={refHeadline}
                    label="GPSSA Service Maturity"
                    sublabel={`vs ${comparator.shortLabel}`}
                    size="lg"
                    color="#22C55E"
                    band={bandFor(gpssaScore)}
                  />
                </div>
                <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-around text-center">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-gray-muted">GPSSA</p>
                    <p className="text-xl font-bold tabular-nums text-cream">{gpssaScore}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-gray-muted">{comparator.shortLabel}</p>
                    <p className="text-xl font-bold tabular-nums text-cream">{refHeadline ?? 0}</p>
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

            {/* Right pane — large radar */}
            <div className="xl:col-span-8 rounded-xl bg-white/[0.025] border border-white/[0.06] p-5 min-h-[520px] flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-cream">Service-function radar</h3>
                {(loading || bundleLoading) && (
                  <span className="text-[10px] text-gray-muted animate-pulse">loading</span>
                )}
              </div>
              <p className="text-[11px] text-gray-muted mb-3">
                GPSSA&apos;s measured maturity across the twelve service branches, overlaid against{" "}
                <span className="text-cream">{comparator.label}</span>.
              </p>
              <div className="flex-1 flex items-center justify-center">
                <RangeBandRadar
                  metrics={metrics}
                  preset="xl"
                  referenceColor={comparator.color}
                  referenceLabel={comparator.shortLabel}
                  showBand={comparator.kind === "country"}
                />
              </div>
            </div>
          </div>

          {/* Per-branch gap table */}
          <div className="rounded-xl bg-white/[0.025] border border-white/[0.06] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-cream">Branch-by-branch gap</h3>
              <span className="text-[10px] uppercase tracking-wider text-gray-muted">
                GPSSA · {comparator.shortLabel} · Δ
              </span>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {SERVICE_FUNCTIONS.map((fn) => {
                const g = gpssaByFn.get(fn.slug);
                const gv = g && g.n > 0 ? g.score / g.n : 0;
                const rv = bundle?.byFunction.get(fn.slug)?.reference ?? 0;
                const gap = Math.round(gv - rv);
                return (
                  <div key={fn.slug} className="grid grid-cols-12 items-center px-4 py-2.5 text-[11px] hover:bg-white/[0.02]">
                    <div className="col-span-4 flex items-center gap-2 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: fn.color }} />
                      <span className="text-cream truncate">{fn.shortLabel}</span>
                      {fn.iloReference && (
                        <span className="text-[9px] text-gray-muted truncate hidden md:inline">· {fn.iloReference}</span>
                      )}
                    </div>
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden relative">
                        <motion.div
                          className="absolute left-0 top-0 h-full rounded-full"
                          style={{ backgroundColor: "#22C55E" }}
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
                      <span className="text-cream w-7 text-right">{Math.round(gv)}</span>
                      <span className="text-gray-muted w-7 text-right">{Math.round(rv)}</span>
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

export default function ServiceCatalogPage() {
  const [services, setServices] = useState<GPSSAService[]>(STATIC_SERVICES);
  const [intlServices, setIntlServices] = useState<IntlService[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeFn, setActiveFn] = useState<ServiceFunction | null>(null);
  const [activeAud, setActiveAud] = useState<ServiceAudience | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [comparator, setComparator] = useState<ComparatorOption | null>(null);

  const [detailModal, setDetailModal] = useState<GPSSAService | null>(null);
  const [detailAnalyses, setDetailAnalyses] = useState<ServiceAnalysisRecord[]>([]);
  const [analysesLoading, setAnalysesLoading] = useState(false);

  const { allOptions, loading: comparatorLoading } = useComparators();

  const browseRef = useRef<HTMLDivElement>(null);
  const benchmarkRef = useRef<HTMLDivElement>(null);
  const overviewRef = useRef<HTMLDivElement>(null);

  /* ── Data loading ── */
  const loadServices = useCallback(async () => {
    try {
      const res = await fetch("/api/services", { cache: "no-store" });
      if (res.ok) {
        const data: Record<string, unknown>[] = await res.json();
        if (data.length > 0) {
          const enriched = STATIC_SERVICES.map((staticSvc) => {
            const apiMatch = data.find((d) => d.id === staticSvc.id || (d.name as string)?.toLowerCase() === staticSvc.name.toLowerCase());
            if (!apiMatch) return staticSvc;
            const parsed = {
              userTypes: parseJsonField<string[]>(apiMatch.userTypes),
              painPoints: parseJsonField<string[]>(apiMatch.painPoints),
              opportunities: parseJsonField<string[]>(apiMatch.opportunities),
              strengths: parseJsonField<string[]>(apiMatch.strengths),
            };
            return {
              ...staticSvc,
              painPoints: parsed.painPoints?.length ? parsed.painPoints : staticSvc.painPoints,
              opportunities: parsed.opportunities?.length ? parsed.opportunities : staticSvc.opportunities,
              userTypes: parsed.userTypes?.length ? parsed.userTypes : staticSvc.userTypes,
              description: (apiMatch.description as string) || staticSvc.description,
              currentState: (apiMatch.currentState as string) || staticSvc.currentState,
              digitalReadiness: typeof apiMatch.digitalReadiness === "number" ? apiMatch.digitalReadiness : null,
              maturityLevel: apiMatch.maturityLevel ? String(apiMatch.maturityLevel) : null,
              bestPracticeComparison: apiMatch.bestPracticeComparison ? String(apiMatch.bestPracticeComparison) : null,
              strengths: parsed.strengths?.length ? parsed.strengths : null,
              iloAlignment: apiMatch.iloAlignment ? String(apiMatch.iloAlignment) : null,
            };
          });
          const staticNames = new Set(STATIC_SERVICES.map((s) => s.name.toLowerCase()));
          for (const apiRow of data) {
            const name = String(apiRow.name ?? "");
            if (!name || staticNames.has(name.toLowerCase())) continue;
            enriched.push({
              id: String(apiRow.id ?? name),
              name,
              category: String(apiRow.category ?? "General"),
              description: (apiRow.description as string) || null,
              userTypes: parseJsonField<string[]>(apiRow.userTypes),
              currentState: (apiRow.currentState as string) || null,
              painPoints: parseJsonField<string[]>(apiRow.painPoints),
              opportunities: parseJsonField<string[]>(apiRow.opportunities),
              digitalReadiness: typeof apiRow.digitalReadiness === "number" ? apiRow.digitalReadiness : null,
              maturityLevel: apiRow.maturityLevel ? String(apiRow.maturityLevel) : null,
              bestPracticeComparison: apiRow.bestPracticeComparison ? String(apiRow.bestPracticeComparison) : null,
              strengths: parseJsonField<string[]>(apiRow.strengths),
              iloAlignment: apiRow.iloAlignment ? String(apiRow.iloAlignment) : null,
            });
          }
          setServices(enriched);
        }
      }
    } catch {
      /* keep static seed */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  useResearchUpdates({
    targetScreens: ["services-catalog", "services-channels", "intl-services-catalog", "intl-services-channels"],
    onComplete: () => loadServices(),
  });

  /* ── Comparator-driven international load ── */
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!comparator) {
        setIntlServices([]);
        return;
      }
      let countries: string[] | null = null;
      if (comparator.kind === "country") countries = [comparator.id];
      if (countries) {
        const params = new URLSearchParams({ countries: countries.join(",") });
        const res = await fetch(`/api/international/services?${params}`);
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (Array.isArray(data)) setIntlServices(data);
      } else {
        setIntlServices([]);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [comparator]);

  /* ── Detail modal analyses ── */
  useEffect(() => {
    if (!detailModal) {
      setDetailAnalyses([]);
      return;
    }
    let cancelled = false;
    setAnalysesLoading(true);
    fetch(`/api/services/${detailModal.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        const analyses = Array.isArray(data.analyses) ? (data.analyses as ServiceAnalysisRecord[]) : [];
        setDetailAnalyses(analyses);
      })
      .catch(() => {
        if (!cancelled) setDetailAnalyses([]);
      })
      .finally(() => {
        if (!cancelled) setAnalysesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [detailModal]);

  /* ── Derived ── */
  const fnStats = useMemo(() => buildFunctionStats(services), [services]);
  const fnStatsBySlug = useMemo(() => new Map(fnStats.map((s) => [s.fn.slug, s])), [fnStats]);

  const audStats = useMemo(() => {
    return SERVICE_AUDIENCES.map((aud) => {
      const matched = services.filter((s) => {
        const r = classifyServiceAudience({
          name: s.name,
          description: s.description,
          category: s.category,
          userTypes: s.userTypes,
        });
        return r?.slug === aud.slug;
      });
      return { aud, count: matched.length };
    });
  }, [services]);

  const filteredServices = useMemo(() => {
    let list = services;
    if (activeFn) {
      list = list.filter((s) => {
        const fn = classifyServiceFunction({ name: s.name, description: s.description, category: s.category });
        return fn.slug === activeFn.slug;
      });
    }
    if (activeAud) {
      list = list.filter((s) => {
        const aud = classifyServiceAudience({
          name: s.name,
          description: s.description,
          category: s.category,
          userTypes: s.userTypes,
        });
        return aud?.slug === activeAud.slug;
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || (s.description?.toLowerCase().includes(q) ?? false));
    }
    return list;
  }, [services, activeFn, activeAud, searchQuery]);

  /* ── KPIs ── */
  const totalPains = useMemo(() => services.reduce((a, s) => a + (s.painPoints?.length ?? 0), 0), [services]);
  const totalOpps = useMemo(() => services.reduce((a, s) => a + (s.opportunities?.length ?? 0), 0), [services]);
  const headline = useMemo(() => gpssaHeadline(services), [services]);
  const unclassifiedCount = useMemo(() => fnStatsBySlug.get(UNCLASSIFIED_FUNCTION.slug)?.count ?? 0, [fnStatsBySlug]);

  const statBarItems: StatBarItem[] = useMemo(() => {
    const items: StatBarItem[] = [
      { icon: Layers, value: services.length, label: "Services" },
      { icon: Sparkles, value: headline, label: "Avg. Maturity" },
      { icon: AlertTriangle, value: totalPains, label: "Pain Points" },
      { icon: Lightbulb, value: totalOpps, label: "Opportunities" },
    ];
    if (comparator) items.push({ icon: Globe2, value: 1, label: `vs ${comparator.shortLabel}` });
    return items;
  }, [services.length, headline, totalPains, totalOpps, comparator]);

  /* ── Navigation ── */
  function pickBranch(fn: ServiceFunction) {
    setActiveFn((prev) => (prev?.slug === fn.slug ? null : fn));
    setActiveAud(null);
    setTimeout(() => browseRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }
  function resetFilters() {
    setActiveFn(null);
    setActiveAud(null);
    setSearchQuery("");
  }

  if (loading && services.length === 0) {
    return <div className="flex h-full items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ─── Header ─── */}
      <div className="shrink-0 flex items-center gap-3 px-5 py-2 border-b border-white/[0.06]">
        <h1 className="font-playfair text-base font-semibold text-cream shrink-0">Service Catalog</h1>
        <div className="h-4 w-px bg-white/10" />

        {/* Section navigation chips */}
        <nav className="flex items-center gap-1">
          {[
            { id: "overview", label: "1. At a Glance", ref: overviewRef },
            { id: "browse", label: "2. Browse Services", ref: browseRef },
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
          <MandateBasisChip
            screenPath="/dashboard/services/catalog"
            entityIds={services.map((s) => s.id)}
          />
        </div>
      </div>

      {/* ─── Content (single scroll) ─── */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="px-5 py-5 space-y-10 max-w-[1480px] mx-auto">

          {/* ╔════ Section 1 — At a Glance ════╗ */}
          <section
            ref={overviewRef}
            className="scroll-mt-4"
            data-tour="compass-catalog-glance"
          >
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gpssa-green/80 mb-1">
                  1 · The Catalog at a Glance
                </p>
                <h2 className="font-playfair text-2xl text-cream mb-2">
                  What does GPSSA actually deliver today?
                </h2>
                <p className="text-xs text-gray-muted leading-relaxed max-w-3xl">
                  Every service we run, mapped to the twelve canonical social-security branches —
                  nine from <span className="text-cream">ILO Convention 102</span> plus three administrative
                  &amp; digital functions. Counts are sized by how many GPSSA services live in each branch,
                  bars by current digital maturity. Click a branch to drill in.
                </p>
              </div>
              <div className="text-[10px] uppercase tracking-wider text-gold/80 hidden md:flex items-center gap-1.5 shrink-0">
                <Scale size={10} />
                RFI 2.B-1 · Assess current portfolio
              </div>
            </div>

            {/* Headline KPI strip — flat numbers */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {[
                { label: "Total services", value: services.length, icon: Layers },
                { label: "Avg. maturity", value: headline, icon: Sparkles, suffix: "/100" },
                { label: "Pain points logged", value: totalPains, icon: AlertTriangle },
                { label: "Opportunities surfaced", value: totalOpps, icon: Lightbulb },
              ].map((kpi) => {
                const Icon = kpi.icon;
                return (
                  <div key={kpi.label} className="rounded-xl bg-white/[0.025] border border-white/[0.06] p-4">
                    <div className="flex items-center gap-2 mb-2 text-gray-muted">
                      <Icon size={12} />
                      <span className="text-[10px] uppercase tracking-wider">{kpi.label}</span>
                    </div>
                    <p className="text-3xl font-bold text-cream tabular-nums leading-none">
                      {kpi.value}
                      {kpi.suffix && <span className="text-base text-gray-muted ml-1">{kpi.suffix}</span>}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* 12 ILO branch tiles + Other */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {fnStats.map((stat, i) => (
                <BranchTile
                  key={stat.fn.slug}
                  stat={stat}
                  index={i}
                  active={activeFn?.slug === stat.fn.slug}
                  onPick={() => pickBranch(stat.fn)}
                />
              ))}
            </div>

            <p className="mt-4 text-[10px] text-gray-muted/80 leading-relaxed max-w-3xl">
              <span className="text-cream/80">What is an ILO branch?</span> The International Labour Organization&apos;s
              Convention 102 defines the nine recognised branches of social security every modern scheme should cover.
              GPSSA&apos;s services are mapped onto these branches plus three operational categories (Registration, Contributions
              and Digital) so they can be measured against any global standard or peer.
              {unclassifiedCount > 0 && (
                <span className="block mt-1 text-amber-300/80">
                  {unclassifiedCount} services have free-text categories not yet mapped to a branch — visible in the &quot;Other&quot; tile and on the Browse list.
                </span>
              )}
            </p>

            {/* Jump CTA */}
            <div className="mt-4 flex items-center justify-center">
              <button
                onClick={() => browseRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="flex items-center gap-1.5 text-[11px] text-gray-muted hover:text-cream transition-colors"
              >
                Browse every service <ArrowDown size={11} />
              </button>
            </div>
          </section>

          {/* ╔════ Section 2 — Browse ════╗ */}
          <section ref={browseRef} className="scroll-mt-4">
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gpssa-green/80 mb-1">
                  2 · Browse Every Service
                </p>
                <h2 className="font-playfair text-2xl text-cream mb-2">
                  Filter, search and inspect any service.
                </h2>
                <p className="text-xs text-gray-muted leading-relaxed max-w-3xl">
                  Combine an ILO branch with an audience to scope the list. Click any card for the full analyst briefing —
                  current state, pain points, opportunities and prior senior-analyst notes.
                </p>
              </div>
              <div className="text-[10px] uppercase tracking-wider text-gold/80 hidden md:flex items-center gap-1.5 shrink-0">
                <Scale size={10} />
                RFI 2.C-1 · Current-state diagnostic
              </div>
            </div>

            {/* Sticky filter rail */}
            <div className="sticky top-0 z-10 -mx-5 px-5 py-3 mb-4 bg-navy/90 backdrop-blur-md border-y border-white/[0.06]">
              <div className="flex flex-wrap items-center gap-2">
                <Filter size={11} className="text-gray-muted" />
                <span className="text-[10px] uppercase tracking-wider text-gray-muted mr-1">Branch</span>
                {fnStats.map((stat) => (
                  <button
                    key={stat.fn.slug}
                    onClick={() => setActiveFn((prev) => (prev?.slug === stat.fn.slug ? null : stat.fn))}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-medium transition-colors ${
                      activeFn?.slug === stat.fn.slug
                        ? "bg-cream/10 border-cream/30 text-cream"
                        : "bg-white/[0.03] border-white/[0.08] text-cream/80 hover:bg-white/[0.06]"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stat.fn.color }} />
                    {stat.fn.shortLabel}
                    <span className="text-[9px] text-gray-muted tabular-nums">{stat.count}</span>
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-[10px] uppercase tracking-wider text-gray-muted ml-4 mr-1">Audience</span>
                {audStats.map(({ aud, count }) => (
                  <button
                    key={aud.slug}
                    onClick={() => setActiveAud((prev) => (prev?.slug === aud.slug ? null : aud))}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-medium transition-colors ${
                      activeAud?.slug === aud.slug
                        ? "bg-cream/10 border-cream/30 text-cream"
                        : "bg-white/[0.03] border-white/[0.08] text-cream/80 hover:bg-white/[0.06]"
                    }`}
                  >
                    {aud.shortLabel}
                    <span className="text-[9px] text-gray-muted tabular-nums">{count}</span>
                  </button>
                ))}
                <div className="ml-auto flex items-center gap-2">
                  <div className="relative">
                    <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-muted" />
                    <input
                      type="text"
                      placeholder="Search services…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-44 pl-7 pr-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] text-cream placeholder:text-gray-muted focus:outline-none focus:border-gpssa-green/30"
                    />
                  </div>
                  {(activeFn || activeAud || searchQuery) && (
                    <button
                      onClick={resetFilters}
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-gray-muted hover:text-cream hover:bg-white/[0.05] transition-colors"
                    >
                      <RotateCcw size={10} />
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] text-gray-muted">
                Showing <span className="text-cream font-semibold tabular-nums">{filteredServices.length}</span> of{" "}
                <span className="text-cream tabular-nums">{services.length}</span> services
                {activeFn && <span> · branch <span className="text-cream">{activeFn.shortLabel}</span></span>}
                {activeAud && <span> · audience <span className="text-cream">{activeAud.shortLabel}</span></span>}
              </p>
            </div>

            {filteredServices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search size={20} className="text-gray-muted mb-2" />
                <p className="text-xs text-gray-muted">No services match these filters.</p>
                <button
                  onClick={resetFilters}
                  className="mt-3 text-[11px] text-gpssa-green hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredServices.slice(0, 240).map((svc, i) => {
                  const fn = classifyServiceFunction({ name: svc.name, description: svc.description, category: svc.category });
                  const aud = classifyServiceAudience({
                    name: svc.name,
                    description: svc.description,
                    category: svc.category,
                    userTypes: svc.userTypes,
                  });
                  return (
                    <ServiceCard
                      key={svc.id}
                      svc={svc}
                      fn={fn}
                      aud={aud}
                      index={i}
                      onOpen={() => setDetailModal(svc)}
                    />
                  );
                })}
              </div>
            )}

            {filteredServices.length > 240 && (
              <p className="mt-3 text-[10px] text-gray-muted text-center">
                Showing the first 240 results — narrow the filters to see more.
              </p>
            )}

            <div className="mt-5 flex items-center justify-center">
              <button
                onClick={() => benchmarkRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="flex items-center gap-1.5 text-[11px] text-gray-muted hover:text-cream transition-colors"
              >
                See how GPSSA compares globally <ArrowDown size={11} />
              </button>
            </div>
          </section>

          {/* ╔════ Section 3 — Benchmark cockpit ════╗ */}
          <section ref={benchmarkRef} className="scroll-mt-4 pb-6">
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gpssa-green/80 mb-1">
                  3 · How GPSSA Compares
                </p>
                <h2 className="font-playfair text-2xl text-cream mb-2">
                  {comparator ? `GPSSA vs ${comparator.label}` : "Benchmark GPSSA against the world."}
                </h2>
                <p className="text-xs text-gray-muted leading-relaxed max-w-3xl">
                  Hold the catalog up against a global standard (ILO, ISSA, World Bank), a computed reference (GCC average,
                  global best-practice) or a single peer country. Every branch is scored on the same 0–100 scale, so gaps
                  are directly comparable.
                </p>
              </div>
              <div className="text-[10px] uppercase tracking-wider text-gold/80 hidden md:flex items-center gap-1.5 shrink-0">
                <Scale size={10} />
                RFI 2.E-6 · TDRA-aligned measures
              </div>
            </div>

            <BenchmarkCockpit
              services={services}
              intl={intlServices}
              comparator={comparator}
              setComparator={setComparator}
              comparatorOptions={allOptions}
              comparatorLoading={comparatorLoading}
              loading={loading}
            />
          </section>
        </div>
      </div>

      {/* ─── Stat Bar ─── */}
      <StatBar items={statBarItems} />

      {/* ─── Detail Modal ─── */}
      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title={detailModal?.name} description={detailModal?.category} size="xl">
        {detailModal && (
          <div className="space-y-4">
            {detailModal.description && <p className="text-sm text-gray-muted">{detailModal.description}</p>}

            {(detailModal.digitalReadiness != null || detailModal.maturityLevel) && (
              <div className="flex items-center gap-4 glass rounded-lg p-3">
                {detailModal.digitalReadiness != null && (
                  <div className="flex items-center gap-2 flex-1">
                    <Sparkles size={12} className="text-gpssa-green shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-gray-muted">Digital Readiness</span>
                        <span className="text-gpssa-green font-semibold">{detailModal.digitalReadiness}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div className="h-full rounded-full bg-gpssa-green/70" initial={{ width: 0 }} animate={{ width: `${detailModal.digitalReadiness}%` }} transition={{ duration: 0.6 }} />
                      </div>
                    </div>
                  </div>
                )}
                {detailModal.maturityLevel && <Badge variant="blue" size="sm">{detailModal.maturityLevel}</Badge>}
              </div>
            )}

            {detailModal.currentState && (
              <div>
                <span className="text-xs font-medium text-cream block mb-1">Current State</span>
                <p className="text-xs text-gray-muted glass rounded-lg p-3">{detailModal.currentState}</p>
              </div>
            )}
            {detailModal.userTypes && detailModal.userTypes.length > 0 && (
              <div>
                <span className="text-xs font-medium text-cream block mb-2">User Types</span>
                <div className="flex flex-wrap gap-1.5">
                  {detailModal.userTypes.map((ut) => <Badge key={ut} variant="blue" size="sm">{ut}</Badge>)}
                </div>
              </div>
            )}
            {detailModal.strengths && detailModal.strengths.length > 0 && (
              <div>
                <span className="text-xs font-medium text-cream mb-2 flex items-center gap-1.5"><CheckCircle2 size={11} className="text-gpssa-green" />Strengths</span>
                <div className="flex flex-wrap gap-1.5">
                  {detailModal.strengths.map((s, i) => <Badge key={i} variant="green" size="sm">{s}</Badge>)}
                </div>
              </div>
            )}
            {detailModal.painPoints && detailModal.painPoints.length > 0 && (
              <div>
                <span className="text-xs font-medium text-cream mb-2 flex items-center gap-1.5"><XCircle size={11} className="text-red-400" />Pain Points</span>
                <div className="flex flex-wrap gap-1.5">
                  {detailModal.painPoints.map((pp, i) => <Badge key={i} variant="red" size="sm">{pp}</Badge>)}
                </div>
              </div>
            )}
            {detailModal.opportunities && detailModal.opportunities.length > 0 && (
              <div>
                <span className="text-xs font-medium text-cream mb-2 flex items-center gap-1.5"><Lightbulb size={11} className="text-gpssa-green" />Opportunities</span>
                <div className="flex flex-wrap gap-1.5">
                  {detailModal.opportunities.map((opp, i) => <Badge key={i} variant="green" size="sm">{opp}</Badge>)}
                </div>
              </div>
            )}
            {detailModal.bestPracticeComparison && (
              <div>
                <span className="text-xs font-medium text-cream block mb-1">Best Practice Comparison</span>
                <p className="text-xs text-gray-muted glass rounded-lg p-3">{detailModal.bestPracticeComparison}</p>
              </div>
            )}
            {detailModal.iloAlignment && (
              <div className="flex items-center gap-2 glass rounded-lg p-3">
                <Scale size={12} className="text-gold shrink-0" />
                <div>
                  <span className="text-[10px] font-medium text-cream block">ILO/ISSA Alignment</span>
                  <p className="text-[10px] text-gray-muted">{detailModal.iloAlignment}</p>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-cream">Senior-Analyst Briefings</span>
                {analysesLoading && <span className="text-[10px] text-gray-muted">Loading…</span>}
              </div>
              {detailAnalyses.length === 0 && !analysesLoading ? (
                <p className="text-[11px] text-gray-muted/70 italic glass rounded-lg p-3">
                  No analyses generated yet. Run the services research agent to populate consultant-grade briefings.
                </p>
              ) : (
                <div className="space-y-2">
                  {detailAnalyses.slice(0, 3).map((a) => (
                    <div key={a.id} className="glass rounded-lg p-3 border border-white/[0.05]">
                      <div className="flex items-center justify-between text-[10px] text-gray-muted mb-1.5">
                        <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                        {a.model && <span className="font-mono">{a.model}</span>}
                      </div>
                      <p className="text-[11px] text-cream/85 leading-relaxed whitespace-pre-wrap">
                        {a.analysis}
                      </p>
                    </div>
                  ))}
                  {detailAnalyses.length > 3 && (
                    <p className="text-[10px] text-gray-muted text-center">+{detailAnalyses.length - 3} earlier analyses</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-white/[0.05]">
              <button
                onClick={() => {
                  setDetailModal(null);
                  setTimeout(() => benchmarkRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gpssa-green/15 border border-gpssa-green/25 text-gpssa-green text-xs font-medium hover:bg-gpssa-green/25 transition-colors"
              >
                Benchmark this category
                <ArrowRight size={11} />
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
