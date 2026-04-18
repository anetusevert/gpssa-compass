"use client";

/**
 * Service Catalog — 3-Act Cinematic Redesign
 *
 *   ACT I  — Constellation : a visually striking entry screen showing every
 *            ILO-aligned service function as a glowing tile, animated in.
 *            User picks a function (or audience) to drill into.
 *
 *   ACT II — Spine          : the chosen function's GPSSA services rendered
 *            as a vertical "spine" with rich detail cards. Click a card →
 *            full modal with the existing analysis library.
 *
 *   ACT III— Benchmark      : overlay a Comparator (Standard / Computed
 *            Reference / Country) and watch the radar + dial morph in.
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Layers,
  Globe2,
  Scale,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
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
  SERVICE_AUDIENCES,
  resolveCategory,
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

type Act = "constellation" | "spine" | "benchmark";

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
   ACT I — Constellation
   ═══════════════════════════════════════════════════════════════════════════ */

interface FunctionStats {
  fn: ServiceFunction;
  count: number;
  avgScore: number;
  pains: number;
  opps: number;
}

function ConstellationCard({ stat, onPick, index }: { stat: FunctionStats; onPick: () => void; index: number }) {
  const score = stat.avgScore;
  return (
    <motion.button
      onClick={onPick}
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      className="group relative text-left rounded-2xl p-4 overflow-hidden transition-shadow"
      style={{
        background: `linear-gradient(135deg, ${stat.fn.color}1c 0%, rgba(11,18,32,0.6) 60%)`,
        border: `1px solid ${stat.fn.color}33`,
        boxShadow: `0 0 0 0 ${stat.fn.color}00`,
      }}
    >
      {/* glow halo */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-25 group-hover:opacity-50 transition-opacity"
        style={{ background: `radial-gradient(circle, ${stat.fn.color}cc, transparent 70%)` }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ backgroundColor: `${stat.fn.color}25` }}
          >
            <Layers size={14} style={{ color: stat.fn.color }} />
          </span>
          <span className="text-[10px] tabular-nums font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${stat.fn.color}22`, color: stat.fn.color }}>
            {stat.count}
          </span>
        </div>
        <h3 className="text-sm font-semibold text-cream mb-0.5 leading-tight">{stat.fn.shortLabel}</h3>
        <p className="text-[10px] text-gray-muted/90 leading-snug line-clamp-2 mb-3">{stat.fn.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-12 h-1 rounded-full overflow-hidden bg-white/[0.06]">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: stat.fn.color }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(2, score)}%` }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.04 }}
              />
            </div>
            <span className="text-[10px] tabular-nums text-cream/80">{Math.round(score)}</span>
          </div>
          <ArrowRight size={12} className="text-gray-muted group-hover:text-cream group-hover:translate-x-1 transition-transform" />
        </div>

        {stat.fn.iloReference && (
          <div className="mt-2 pt-2 border-t border-white/[0.05] flex items-center gap-1">
            <Scale size={9} className="text-gold/80" />
            <span className="text-[9px] text-gold/80 truncate">{stat.fn.iloReference}</span>
          </div>
        )}
      </div>
    </motion.button>
  );
}

function AudienceChip({ aud, count, active, onClick }: { aud: ServiceAudience; count: number; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-medium transition-all ${
        active
          ? "bg-gpssa-green/15 border-gpssa-green/40 text-cream"
          : "bg-white/[0.03] border-white/[0.08] text-cream/80 hover:bg-white/[0.07] hover:text-cream"
      }`}
    >
      {aud.shortLabel}
      <span className="text-[9px] text-gray-muted tabular-nums">{count}</span>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ACT II — Spine card
   ═══════════════════════════════════════════════════════════════════════════ */

function SpineCard({ svc, color, index, onOpen }: { svc: GPSSAService; color: string; index: number; onOpen: () => void }) {
  const score = svcScore(svc);
  return (
    <motion.button
      onClick={onOpen}
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.03 }}
      whileHover={{ x: 4 }}
      className="w-full text-left rounded-xl bg-white/[0.03] border border-white/[0.07] p-3.5 hover:bg-white/[0.06] hover:border-white/[0.14] transition-all group relative overflow-hidden"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ backgroundColor: color }} />
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="text-xs font-semibold text-cream leading-snug pr-2">{svc.name}</h3>
        <span className="text-[9px] tabular-nums font-semibold px-1.5 py-0.5 rounded shrink-0" style={{ backgroundColor: `${color}22`, color }}>
          {Math.round(score)}
        </span>
      </div>
      {svc.description && <p className="text-[10px] text-gray-muted leading-relaxed mb-2 line-clamp-2">{svc.description}</p>}
      <div className="flex flex-wrap gap-1">
        {(svc.painPoints ?? []).slice(0, 2).map((p, i) => (
          <Badge key={`p-${i}`} variant="red" size="sm">{p}</Badge>
        ))}
        {(svc.opportunities ?? []).slice(0, 2).map((o, i) => (
          <Badge key={`o-${i}`} variant="green" size="sm">{o}</Badge>
        ))}
      </div>
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight size={11} className="text-cream" />
      </div>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ACT III — Benchmark
   ═══════════════════════════════════════════════════════════════════════════ */

interface ReferenceMetricsBundle {
  /** All metrics keyed by serviceFunction.slug */
  byFunction: Map<string, { reference: number; min?: number; max?: number; label?: string }>;
  /** Composite/headline score 0–100. */
  headline: number;
  /** Source label e.g. "ILO C102", "GCC Avg", "Singapore". */
  label: string;
  /** Color of the reference series. */
  color: string;
}

function buildGpssaFunctionMetrics(services: GPSSAService[]): Map<string, { score: number; n: number }> {
  const out = new Map<string, { score: number; n: number }>();
  for (const fn of SERVICE_FUNCTIONS) out.set(fn.slug, { score: 0, n: 0 });
  for (const svc of services) {
    const cat = resolveCategory(svc.category);
    if (cat?.kind !== "function") continue;
    const cur = out.get(cat.entry.slug)!;
    cur.score += svcScore(svc);
    cur.n += 1;
  }
  return out;
}

function gpssaHeadline(services: GPSSAService[]): number {
  const scores = services.map(svcScore).filter((s) => s > 0);
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
}

interface BenchmarkPanelProps {
  services: GPSSAService[];
  intl: IntlService[];
  comparator: ComparatorOption | null;
  loading: boolean;
}

function BenchmarkPanel({ services, intl, comparator, loading }: BenchmarkPanelProps) {
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
              const cat = resolveCategory(s.category);
              return cat?.kind === "function" && cat.entry.slug === fn.slug;
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
          // standard
          const res = await fetch(`/api/standards/${comparator.id}`);
          if (!res.ok) throw new Error("std");
          const std = await res.json();
          const byFn = new Map<string, { reference: number; label?: string }>();
          // For each canonical function, decide whether this standard covers it
          // (any requirement.pillar containing the function or any function.standardSlugs containing this standard slug).
          for (const fn of SERVICE_FUNCTIONS) {
            const isCovered = fn.standardSlugs.includes(comparator.id);
            const reference = isCovered ? 80 : 30; // Standard expectation: covered → high bar (80); not addressed → low bar (30)
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

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-6 h-full overflow-y-auto pr-1">
      <div className="space-y-4">
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-4">
          <p className="text-[10px] uppercase tracking-wider text-gray-muted mb-3">Composite</p>
          <div className="flex justify-center">
            <ComplianceDial
              score={gpssaScore}
              reference={comparator ? bundle?.headline ?? 0 : undefined}
              label="GPSSA Service Maturity"
              sublabel={comparator ? `vs ${comparator.shortLabel}` : "Pick a comparator →"}
              size="md"
              color="#22C55E"
              band={bandFor(gpssaScore)}
            />
          </div>
        </div>

        {comparator && bundle && (
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
              {SERVICE_FUNCTIONS.slice(0, 6).map((fn) => {
                const g = gpssaByFn.get(fn.slug);
                const gv = g && g.n > 0 ? g.score / g.n : 0;
                const rv = bundle.byFunction.get(fn.slug)?.reference ?? 0;
                const gap = gv - rv;
                return (
                  <div key={fn.slug} className="text-[9px]">
                    <p className="text-gray-muted truncate">{fn.shortLabel}</p>
                    <p className="font-semibold tabular-nums" style={{ color: gap >= 0 ? "#10B981" : "#F59E0B" }}>
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
          <h3 className="text-xs font-semibold text-cream">Service-function radar</h3>
          {(loading || bundleLoading) && <span className="text-[9px] text-gray-muted animate-pulse">loading</span>}
        </div>
        <p className="text-[10px] text-gray-muted mb-4">
          GPSSA's measured maturity across ILO C102 service branches, overlaid against the chosen comparator.
        </p>
        <div className="flex-1 flex items-center justify-center">
          <RangeBandRadar
            metrics={metrics}
            referenceColor={comparator?.color ?? "#0EA5E9"}
            referenceLabel={comparator?.shortLabel ?? "—"}
            showBand={comparator?.kind === "country"}
          />
        </div>
      </div>
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

  const [act, setAct] = useState<Act>("constellation");
  const [activeFn, setActiveFn] = useState<ServiceFunction | null>(null);
  const [activeAud, setActiveAud] = useState<ServiceAudience | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [comparator, setComparator] = useState<ComparatorOption | null>(null);

  const [detailModal, setDetailModal] = useState<GPSSAService | null>(null);
  const [detailAnalyses, setDetailAnalyses] = useState<ServiceAnalysisRecord[]>([]);
  const [analysesLoading, setAnalysesLoading] = useState(false);

  const { allOptions, loading: comparatorLoading } = useComparators();

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
          // Append any API services that aren't in the static seed
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

  /* ── Comparator-driven international load (countries + computed-ref aggregates use intl too for context) ── */
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
        // for non-country comparators we don't need country-level intl data
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
  const fnStats: FunctionStats[] = useMemo(() => {
    return SERVICE_FUNCTIONS.map((fn) => {
      const matched = services.filter((s) => {
        const r = resolveCategory(s.category);
        return r?.kind === "function" && r.entry.slug === fn.slug;
      });
      const scores = matched.map(svcScore).filter((v) => v > 0);
      const avg = scores.length > 0 ? scores.reduce((s, v) => s + v, 0) / scores.length : 0;
      return {
        fn,
        count: matched.length,
        avgScore: Math.round(avg),
        pains: matched.reduce((acc, s) => acc + (s.painPoints?.length ?? 0), 0),
        opps: matched.reduce((acc, s) => acc + (s.opportunities?.length ?? 0), 0),
      };
    }).sort((a, b) => b.count - a.count);
  }, [services]);

  const audStats = useMemo(() => {
    return SERVICE_AUDIENCES.map((aud) => {
      const matched = services.filter((s) => {
        const r = resolveCategory(s.category);
        return r?.kind === "audience" && r.entry.slug === aud.slug;
      });
      return { aud, count: matched.length };
    });
  }, [services]);

  const spineServices = useMemo(() => {
    let list = services;
    if (activeFn) {
      list = list.filter((s) => {
        const r = resolveCategory(s.category);
        return r?.kind === "function" && r.entry.slug === activeFn.slug;
      });
    }
    if (activeAud) {
      list = list.filter((s) => {
        const r = resolveCategory(s.category);
        return r?.kind === "audience" && r.entry.slug === activeAud.slug;
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || (s.description?.toLowerCase().includes(q) ?? false));
    }
    return list;
  }, [services, activeFn, activeAud, searchQuery]);

  /* ── Stat bar ── */
  const statBarItems: StatBarItem[] = useMemo(() => {
    const totalPains = services.reduce((a, s) => a + (s.painPoints?.length ?? 0), 0);
    const totalOpps = services.reduce((a, s) => a + (s.opportunities?.length ?? 0), 0);
    const avgScore = gpssaHeadline(services);
    const items: StatBarItem[] = [
      { icon: Layers, value: services.length, label: "Services" },
      { icon: Sparkles, value: avgScore, label: "Avg. Maturity" },
      { icon: AlertTriangle, value: totalPains, label: "Pain Points" },
      { icon: Lightbulb, value: totalOpps, label: "Opportunities" },
    ];
    if (comparator) items.push({ icon: Globe2, value: 1, label: `vs ${comparator.shortLabel}` });
    return items;
  }, [services, comparator]);

  /* ── Act controls ── */
  function gotoSpine(fn: ServiceFunction) {
    setActiveFn(fn);
    setActiveAud(null);
    setAct("spine");
  }
  function gotoConstellation() {
    setActiveFn(null);
    setActiveAud(null);
    setSearchQuery("");
    setAct("constellation");
  }
  function gotoBenchmark() {
    setAct("benchmark");
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

        {/* Act tabs */}
        <div className="flex items-center gap-1">
          {(
            [
              { id: "constellation" as Act, label: "Overview", desc: "Constellation" },
              { id: "spine" as Act,         label: "Explore",  desc: "Spine" },
              { id: "benchmark" as Act,     label: "Benchmark", desc: "Compare" },
            ]
          ).map((tab, i) => (
            <button
              key={tab.id}
              onClick={() => setAct(tab.id)}
              className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
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
          <MandateBasisChip
            screenPath="/dashboard/services/catalog"
            entityIds={services.map((s) => s.id)}
          />
          {act === "spine" && (
            <div className="relative">
              <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-muted" />
              <input
                type="text"
                placeholder="Filter…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-36 pl-7 pr-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] text-cream placeholder:text-gray-muted focus:outline-none focus:border-gpssa-green/30 transition-colors"
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

      {/* ─── Content ─── */}
      <div className="flex-1 min-h-0 overflow-hidden p-5">
        <AnimatePresence mode="wait">
          {act === "constellation" && (
            <motion.div
              key="act-constellation"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="h-full overflow-y-auto pr-1"
            >
              <div className="mb-5">
                <p className="text-[10px] uppercase tracking-wider text-gpssa-green/80 mb-1">Act I · Constellation</p>
                <h2 className="font-playfair text-lg text-cream mb-1">Every GPSSA service, mapped to ILO branches.</h2>
                <p className="text-xs text-gray-muted max-w-2xl leading-relaxed">
                  Twelve canonical service functions — nine ILO C102 branches plus three administrative & digital functions —
                  each glowing tile sized by service count and lit by current maturity. Pick any to explore.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-6">
                {fnStats.map((stat, i) => (
                  <ConstellationCard key={stat.fn.slug} stat={stat} index={i} onPick={() => gotoSpine(stat.fn)} />
                ))}
              </div>

              <div className="rounded-xl bg-white/[0.025] border border-white/[0.06] p-4">
                <p className="text-[10px] uppercase tracking-wider text-gray-muted mb-2">Or filter by audience</p>
                <div className="flex flex-wrap gap-2">
                  {audStats.map(({ aud, count }) => (
                    <AudienceChip
                      key={aud.slug}
                      aud={aud}
                      count={count}
                      active={activeAud?.slug === aud.slug}
                      onClick={() => {
                        setActiveAud((prev) => (prev?.slug === aud.slug ? null : aud));
                        setActiveFn(null);
                        setAct("spine");
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {act === "spine" && (
            <motion.div
              key="act-spine"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
              className="h-full grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 overflow-hidden"
            >
              <aside className="overflow-y-auto pr-1">
                <button onClick={gotoConstellation} className="flex items-center gap-1 text-[10px] text-gray-muted hover:text-cream mb-3 transition-colors">
                  <ArrowLeft size={11} />
                  Back to constellation
                </button>
                <p className="text-[10px] uppercase tracking-wider text-gpssa-green/80 mb-1">Act II · Spine</p>
                {activeFn && (
                  <div className="rounded-xl p-3 mb-3" style={{ backgroundColor: `${activeFn.color}15`, border: `1px solid ${activeFn.color}30` }}>
                    <h3 className="text-sm font-semibold text-cream mb-1">{activeFn.label}</h3>
                    <p className="text-[10px] text-gray-muted leading-relaxed">{activeFn.description}</p>
                    {activeFn.iloReference && (
                      <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center gap-1.5">
                        <Scale size={10} className="text-gold" />
                        <span className="text-[10px] text-gold">{activeFn.iloReference}</span>
                      </div>
                    )}
                  </div>
                )}
                {activeAud && (
                  <div className="rounded-xl p-3 mb-3 bg-white/[0.04] border border-white/[0.08]">
                    <h3 className="text-sm font-semibold text-cream mb-1">{activeAud.label}</h3>
                    <p className="text-[10px] text-gray-muted leading-relaxed">{activeAud.description}</p>
                  </div>
                )}
                <p className="text-[9px] uppercase tracking-wider text-gray-muted mb-1.5 mt-4">Other functions</p>
                <div className="space-y-1">
                  {fnStats.filter((s) => s.fn.slug !== activeFn?.slug).map((s) => (
                    <button
                      key={s.fn.slug}
                      onClick={() => setActiveFn(s.fn)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left hover:bg-white/[0.04] transition-colors group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.fn.color }} />
                      <span className="text-[11px] text-cream/80 group-hover:text-cream flex-1 truncate">{s.fn.shortLabel}</span>
                      <span className="text-[9px] tabular-nums text-gray-muted">{s.count}</span>
                    </button>
                  ))}
                </div>
              </aside>

              <main className="overflow-y-auto pr-1">
                {spineServices.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <Search size={20} className="text-gray-muted mb-2" />
                    <p className="text-xs text-gray-muted">No services found in this view.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs text-cream font-medium">{spineServices.length} services</p>
                        <p className="text-[10px] text-gray-muted">Click any service for analyst briefing</p>
                      </div>
                      <button
                        onClick={gotoBenchmark}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gpssa-green/15 border border-gpssa-green/25 text-gpssa-green text-[11px] font-medium hover:bg-gpssa-green/25 transition-colors"
                      >
                        Benchmark
                        <ArrowRight size={11} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
                      {spineServices.map((svc, i) => (
                        <SpineCard
                          key={svc.id}
                          svc={svc}
                          color={activeFn?.color ?? "#22C55E"}
                          index={i}
                          onOpen={() => setDetailModal(svc)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </main>
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
                    {comparator ? `GPSSA vs ${comparator.label}` : "Pick a comparator to begin"}
                  </h2>
                  <p className="text-xs text-gray-muted leading-relaxed max-w-2xl">
                    Hold GPSSA up against a global standard, a regional best-practice, or a single peer country —
                    one comparator at a time, every dimension audited.
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
                <BenchmarkPanel services={services} intl={intlServices} comparator={comparator} loading={loading} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
                <span className="text-xs font-medium text-cream block mb-2 flex items-center gap-1.5"><CheckCircle2 size={11} className="text-gpssa-green" />Strengths</span>
                <div className="flex flex-wrap gap-1.5">
                  {detailModal.strengths.map((s, i) => <Badge key={i} variant="green" size="sm">{s}</Badge>)}
                </div>
              </div>
            )}
            {detailModal.painPoints && detailModal.painPoints.length > 0 && (
              <div>
                <span className="text-xs font-medium text-cream block mb-2 flex items-center gap-1.5"><XCircle size={11} className="text-red-400" />Pain Points</span>
                <div className="flex flex-wrap gap-1.5">
                  {detailModal.painPoints.map((pp, i) => <Badge key={i} variant="red" size="sm">{pp}</Badge>)}
                </div>
              </div>
            )}
            {detailModal.opportunities && detailModal.opportunities.length > 0 && (
              <div>
                <span className="text-xs font-medium text-cream block mb-2 flex items-center gap-1.5"><Lightbulb size={11} className="text-gpssa-green" />Opportunities</span>
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
                  if (!comparator) {
                    setAct("benchmark");
                  }
                  setDetailModal(null);
                  setAct("benchmark");
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

/** Avoid unused-import warning on `CountryFlag` (kept for potential future use). */
void CountryFlag;
