"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Building2,
  Zap,
  Shield,
  TrendingUp,
  Users,
  Lightbulb,
  AlertTriangle,
  GitCompareArrows,
  ArrowRight,
  Clock,
  RefreshCw,
  Award,
  BarChart3,
  Landmark,
  Calculator,
  PiggyBank,
  Scale,
  Sparkles,
  CheckCircle2,
  Circle,
} from "lucide-react";
import {
  type CountryProfile,
  type ContributionRates,
  type RetirementAge,
  type InternationalRankings,
  type DataSourceRef,
  COUNTRIES,
  GPSSA_REF,
  maturityBadgeColor,
  parseJsonArr,
  parseJsonObj,
  computeDerivedMetrics,
} from "@/lib/countries/country-data";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { CountryInsightModal, type InsightCategory } from "@/components/country/CountryInsightModal";
import { useResearchUpdates } from "@/lib/hooks/useResearchUpdates";

const EASE = [0.16, 1, 0.3, 1] as const;

interface DbCountry {
  iso3: string;
  name: string;
  flag?: string | null;
  region: string;
  institution?: string | null;
  systemType?: string | null;
  yearEstablished?: number | null;
  maturityScore?: number | null;
  maturityLabel?: string | null;
  coverageRate?: number | null;
  replacementRate?: number | null;
  sustainability?: number | null;
  digitalLevel?: string | null;
  keyFeatures?: string | null;
  challenges?: string | null;
  insights?: string | null;
  legislativeFramework?: string | null;
  contributionRates?: string | null;
  retirementAge?: string | null;
  benefitTypes?: string | null;
  fundManagement?: string | null;
  recentReforms?: string | null;
  internationalRankings?: string | null;
  iloConventionsRatified?: string | null;
  populationCovered?: string | null;
  dataSources?: string | null;
  socialProtectionExpenditure?: string | null;
  dependencyRatio?: string | null;
  pensionFundAssets?: string | null;
  benefitCalculation?: string | null;
  indexationMechanism?: string | null;
  vestingPeriod?: string | null;
  governanceQuality?: string | null;
  researchStatus?: string;
  systemStatus?: string;
  performanceStatus?: string;
  insightsStatus?: string;
  researchedAt?: string | null;
  institutions?: Array<{
    id: string;
    name: string;
    shortName?: string | null;
    description?: string | null;
    digitalMaturity?: string | null;
    keyInnovations?: string | null;
    websiteUrl?: string | null;
  }>;
}

function dbToProfile(c: DbCountry): CountryProfile {
  const derived = computeDerivedMetrics({
    coverageRate: c.coverageRate ?? 0,
    replacementRate: c.replacementRate ?? 0,
    digitalLevel: c.digitalLevel ?? "Unknown",
  });
  return {
    iso3: c.iso3,
    name: c.name,
    flag: c.flag ?? "",
    region: c.region,
    institution: c.institution ?? "Unknown",
    maturityScore: c.maturityScore ?? 0,
    maturityLabel: (c.maturityLabel ?? "Emerging") as CountryProfile["maturityLabel"],
    coverageRate: c.coverageRate ?? 0,
    replacementRate: c.replacementRate ?? 0,
    sustainability: c.sustainability ?? 0,
    serviceBreadth: derived.serviceBreadth,
    productCoverage: derived.productCoverage,
    channelStrategy: derived.channelStrategy,
    systemType: c.systemType ?? "Unknown",
    yearEstablished: c.yearEstablished ?? 0,
    digitalLevel: c.digitalLevel ?? "Unknown",
    keyFeatures: parseJsonArr(c.keyFeatures),
    challenges: parseJsonArr(c.challenges),
    insights: parseJsonArr(c.insights),
    legislativeFramework: c.legislativeFramework ?? undefined,
    contributionRates: parseJsonObj<ContributionRates>(c.contributionRates),
    retirementAge: parseJsonObj<RetirementAge>(c.retirementAge),
    benefitTypes: parseJsonArr(c.benefitTypes),
    fundManagement: c.fundManagement ?? undefined,
    recentReforms: parseJsonArr(c.recentReforms),
    internationalRankings: parseJsonObj<InternationalRankings>(c.internationalRankings),
    iloConventionsRatified: c.iloConventionsRatified ?? undefined,
    populationCovered: c.populationCovered ?? undefined,
    socialProtectionExpenditure: c.socialProtectionExpenditure ?? undefined,
    dependencyRatio: c.dependencyRatio ?? undefined,
    pensionFundAssets: c.pensionFundAssets ?? undefined,
    benefitCalculation: c.benefitCalculation ?? undefined,
    indexationMechanism: c.indexationMechanism ?? undefined,
    vestingPeriod: c.vestingPeriod ?? undefined,
    governanceQuality: c.governanceQuality ?? undefined,
    dataSources: parseJsonObj<DataSourceRef[]>(c.dataSources) ?? undefined,
  };
}

function mergeProfiles(db: CountryProfile, fallback: CountryProfile): CountryProfile {
  return {
    iso3: db.iso3,
    name: db.name,
    flag: db.flag || fallback.flag,
    region: db.region || fallback.region,
    institution: db.institution !== "Unknown" ? db.institution : fallback.institution,
    maturityScore: db.maturityScore > 0 ? db.maturityScore : fallback.maturityScore,
    maturityLabel: db.maturityScore > 0 ? db.maturityLabel : fallback.maturityLabel,
    coverageRate: db.coverageRate > 0 ? db.coverageRate : fallback.coverageRate,
    replacementRate: db.replacementRate > 0 ? db.replacementRate : fallback.replacementRate,
    sustainability: db.sustainability > 0 ? db.sustainability : fallback.sustainability,
    serviceBreadth: db.serviceBreadth > 0 ? db.serviceBreadth : fallback.serviceBreadth,
    productCoverage: db.productCoverage > 0 ? db.productCoverage : fallback.productCoverage,
    channelStrategy: db.channelStrategy > 0 ? db.channelStrategy : fallback.channelStrategy,
    systemType: db.systemType !== "Unknown" ? db.systemType : fallback.systemType,
    yearEstablished: db.yearEstablished > 0 ? db.yearEstablished : fallback.yearEstablished,
    digitalLevel: db.digitalLevel !== "Unknown" ? db.digitalLevel : fallback.digitalLevel,
    keyFeatures: db.keyFeatures.length > 0 ? db.keyFeatures : fallback.keyFeatures,
    challenges: db.challenges.length > 0 ? db.challenges : fallback.challenges,
    insights: db.insights.length > 0 ? db.insights : fallback.insights,
    legislativeFramework: db.legislativeFramework ?? fallback.legislativeFramework,
    contributionRates: db.contributionRates ?? fallback.contributionRates,
    retirementAge: db.retirementAge ?? fallback.retirementAge,
    benefitTypes: (db.benefitTypes?.length ?? 0) > 0 ? db.benefitTypes : fallback.benefitTypes,
    fundManagement: db.fundManagement ?? fallback.fundManagement,
    recentReforms: (db.recentReforms?.length ?? 0) > 0 ? db.recentReforms : fallback.recentReforms,
    internationalRankings: db.internationalRankings ?? fallback.internationalRankings,
    iloConventionsRatified: db.iloConventionsRatified ?? fallback.iloConventionsRatified,
    populationCovered: db.populationCovered ?? fallback.populationCovered,
    socialProtectionExpenditure: db.socialProtectionExpenditure ?? fallback.socialProtectionExpenditure,
    dependencyRatio: db.dependencyRatio ?? fallback.dependencyRatio,
    pensionFundAssets: db.pensionFundAssets ?? fallback.pensionFundAssets,
    benefitCalculation: db.benefitCalculation ?? fallback.benefitCalculation,
    indexationMechanism: db.indexationMechanism ?? fallback.indexationMechanism,
    vestingPeriod: db.vestingPeriod ?? fallback.vestingPeriod,
    governanceQuality: db.governanceQuality ?? fallback.governanceQuality,
    dataSources: db.dataSources ?? fallback.dataSources,
  };
}

function scoreColor(value: number, max: number): string {
  const pct = value / max;
  if (pct >= 0.85) return "#00C896";
  if (pct >= 0.6) return "#4A9EFF";
  return "#C5A572";
}

function maturityContext(score: number): string {
  if (score >= 3.5) return "Leader tier — top-quartile globally";
  if (score >= 2.5) return "Advanced — above-median performance";
  if (score >= 1.5) return "Developing — reform trajectory active";
  return "Emerging — foundational stage";
}

/* ─── Tile wrapper ─── */

function Tile({
  children,
  onClick,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, ease: EASE, duration: 0.45 }}
      onClick={onClick}
      className={`rounded-2xl border border-white/10 bg-[var(--bg-secondary)]/50 backdrop-blur-sm overflow-hidden flex flex-col cursor-pointer hover:border-white/20 transition-colors ${className}`}
    >
      {children}
    </motion.div>
  );
}

function TileHeader({ icon: Icon, label, color = "text-white/50" }: { icon: typeof Building2; label: string; color?: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 shrink-0">
      <div className="flex items-center gap-2">
        <Icon size={13} className={color} />
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/50">{label}</h3>
      </div>
      <ArrowRight size={12} className="text-white/20" />
    </div>
  );
}

function BulletList({ items, max = 3, color = "#4A9EFF" }: { items: string[]; max?: number; color?: string }) {
  return (
    <div>
      <ul className="space-y-1.5">
        {items.slice(0, max).map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-white/60">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
            <span className="line-clamp-2">{item}</span>
          </li>
        ))}
      </ul>
      {items.length > max && (
        <p className="text-[10px] text-white/25 mt-2">+{items.length - max} more — click to view all</p>
      )}
    </div>
  );
}

function SubAgentStatusBanner({
  systemStatus,
  performanceStatus,
  insightsStatus,
}: {
  systemStatus?: string;
  performanceStatus?: string;
  insightsStatus?: string;
}) {
  const items = [
    { label: "System", status: systemStatus ?? "pending" },
    { label: "Performance", status: performanceStatus ?? "pending" },
    { label: "Insights", status: insightsStatus ?? "pending" },
  ];
  const completed = items.filter((i) => i.status === "completed").length;
  if (completed === 3) return null;

  return (
    <div className="px-5 py-2 border-b border-white/5 bg-amber-500/[0.04] flex items-center gap-4 text-xs">
      <span className="text-white/50 uppercase tracking-wider text-[10px] font-semibold">
        Research progress {completed}/3
      </span>
      <div className="flex items-center gap-3">
        {items.map((i) => {
          const ok = i.status === "completed";
          return (
            <span key={i.label} className="flex items-center gap-1.5">
              {ok ? (
                <CheckCircle2 size={11} className="text-gpssa-green" />
              ) : i.status === "failed" ? (
                <AlertCircle size={11} className="text-red-400" />
              ) : (
                <Circle size={11} className="text-white/30" />
              )}
              <span className={ok ? "text-white/70" : "text-white/40"}>{i.label}</span>
            </span>
          );
        })}
      </div>
      {completed < 3 && (
        <span className="text-white/30 ml-auto hidden sm:inline">
          Some tiles will populate as the remaining sub-agents finish researching this country.
        </span>
      )}
    </div>
  );
}

function MetricSnippet({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="rounded-lg p-2.5" style={{ background: "rgba(255,255,255,0.03)" }}>
      <p className="text-[10px] text-white/30 mb-0.5">{label}</p>
      <p className="text-xs text-cream line-clamp-2">{value}</p>
    </div>
  );
}

/* ─── Main page ─── */

export default function CountryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const iso3 = (params.iso3 as string)?.toUpperCase();

  const [loading, setLoading] = useState(true);
  const [dbData, setDbData] = useState<DbCountry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<InsightCategory | null>(null);

  const loadCountry = useCallback(async (silent = false) => {
    if (!iso3) return;
    if (!silent) setLoading(true);

    try {
      const res = await fetch(`/api/countries/${iso3}`, { cache: "no-store" });
      if (!res.ok) throw new Error("not found");
      let data: DbCountry = await res.json();

      const needsRewrite =
        data.maturityScore == null &&
        (data.systemStatus !== "completed" ||
          data.performanceStatus !== "completed" ||
          data.insightsStatus !== "completed");
      if (needsRewrite) {
        const jobsRes = await fetch("/api/research/screen-jobs?latest=true");
        if (jobsRes.ok) {
          const jobs: Array<{ id: string; type: string; status: string; completedItems: number }> =
            await jobsRes.json();
          const candidates = jobs.filter(
            (j) =>
              (j.type === "atlas-system" ||
                j.type === "atlas-performance" ||
                j.type === "atlas-insights" ||
                j.type === "atlas-worldmap") &&
              j.status === "completed" &&
              j.completedItems > 0
          );
          for (const job of candidates) {
            await fetch(`/api/research/screen-jobs/${job.id}/rewrite`, { method: "POST" });
          }
          if (candidates.length > 0) {
            const refreshed = await fetch(`/api/countries/${iso3}`, { cache: "no-store" });
            if (refreshed.ok) data = await refreshed.json();
          }
        }
      }

      setDbData(data);
      setError(null);
    } catch {
      setError("not found");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [iso3]);

  useEffect(() => {
    loadCountry();
  }, [loadCountry]);

  useResearchUpdates({
    targetScreens: [
      "atlas-system",
      "atlas-performance",
      "atlas-insights",
      "atlas-worldmap",
    ],
    onComplete: () => loadCountry(true),
  });

  const profile: CountryProfile | null = useMemo(() => {
    const staticProfile = COUNTRIES[iso3] ?? null;
    if (!dbData) return staticProfile;
    const dbProfile = dbToProfile(dbData);
    if (staticProfile) return mergeProfiles(dbProfile, staticProfile);
    return dbProfile;
  }, [dbData, iso3]);

  const institutions = dbData?.institutions ?? [];
  const accentColor = profile ? maturityBadgeColor(profile.maturityLabel) : "#4A9EFF";
  const isGPSSA = iso3 === "ARE";

  const handleBack = useCallback(() => {
    router.push("/dashboard/atlas");
  }, [router]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <Loader2 className="w-12 h-12 text-gpssa-green animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading country intelligence...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-cream mb-2">Country Not Found</h2>
          <p className="text-white/60 mb-4">Could not find pension data for this country.</p>
          <button onClick={handleBack} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-cream transition-colors">
            Return to Atlas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-white/10 bg-[var(--bg-primary)]/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors group" title="Back to Global Atlas">
            <ArrowLeft className="w-4 h-4 text-white/60 group-hover:text-cream transition-colors" />
          </button>
          <div className="flex items-center gap-3">
            <CountryFlag code={profile.iso3} size="xl" />
            <div>
              <h1 className="font-playfair text-lg font-bold text-cream leading-tight">{profile.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-white/50">{profile.region}</span>
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
                <span className="text-xs font-semibold" style={{ color: accentColor }}>{profile.maturityLabel}</span>
                {isGPSSA && <span className="rounded-full bg-gpssa-green/15 px-2 py-0.5 text-[10px] font-bold text-gpssa-green">GPSSA</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3">
          {[
            { label: "Maturity", value: profile.maturityScore.toFixed(1), sub: "/4", color: maturityBadgeColor(profile.maturityLabel) },
            { label: "Coverage", value: `${profile.coverageRate}%`, sub: "", color: scoreColor(profile.coverageRate, 100) },
            { label: "Replacement", value: `${profile.replacementRate}%`, sub: "", color: scoreColor(profile.replacementRate, 100) },
            { label: "Sustainability", value: profile.sustainability.toFixed(1), sub: "/4", color: scoreColor(profile.sustainability, 4) },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="flex items-center gap-2 rounded-lg px-3 py-1.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-[10px] uppercase tracking-wider text-white/40">{label}</span>
              <span className="font-mono text-sm font-bold" style={{ color }}>{value}<span className="text-white/30 text-[10px]">{sub}</span></span>
            </div>
          ))}
        </div>
      </header>

      <SubAgentStatusBanner
        systemStatus={dbData?.systemStatus}
        performanceStatus={dbData?.performanceStatus}
        insightsStatus={dbData?.insightsStatus}
      />

      {/* Main content — 3 rows */}
      <main className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 min-h-0">

        {/* ── ROW 1: System Overview + Performance Metrics ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[260px]">

          {/* System Overview */}
          <Tile onClick={() => setSelectedCategory("system")} delay={0.1}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Building2 size={14} className="text-adl-blue" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-white/50">System Overview</h2>
              </div>
              <span className="text-[10px] text-white/30">Click to explore</span>
            </div>
            <div className="flex-1 p-5 overflow-y-auto space-y-3" style={{ scrollbarWidth: "thin" }}>
              <div>
                <p className="text-sm font-semibold text-cream">{profile.institution}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-white/50">Est. {profile.yearEstablished || "N/A"}</span>
                  <span className="text-xs text-white/30">&middot;</span>
                  <span className="text-xs text-white/50">{profile.systemType}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 rounded-lg p-2" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <Zap size={11} style={{ color: accentColor }} />
                  <span className="text-xs text-cream">{profile.digitalLevel}</span>
                </div>
                {profile.retirementAge && (
                  <div className="flex items-center gap-2 rounded-lg p-2" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <Clock size={11} className="text-white/40" />
                    <span className="text-xs text-white/60">Ret: {profile.retirementAge.male}/{profile.retirementAge.female}</span>
                  </div>
                )}
              </div>
              {profile.contributionRates && (
                <div className="rounded-lg p-2.5" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1">Contributions</p>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div><span className="text-white/40">Employee</span><p className="text-cream font-medium mt-0.5">{profile.contributionRates.employee}</p></div>
                    <div><span className="text-white/40">Employer</span><p className="text-cream font-medium mt-0.5">{profile.contributionRates.employer}</p></div>
                    <div><span className="text-white/40">Govt</span><p className="text-cream font-medium mt-0.5">{profile.contributionRates.government}</p></div>
                  </div>
                </div>
              )}
              <BulletList items={profile.keyFeatures} max={4} color={accentColor} />
            </div>
          </Tile>

          {/* Performance Metrics */}
          <Tile onClick={() => setSelectedCategory("metrics")} delay={0.15}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-gpssa-green" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-white/50">Performance Metrics</h2>
              </div>
              <span className="text-[10px] text-white/30">Click for detail</span>
            </div>
            <div className="flex-1 p-5 overflow-y-auto space-y-3" style={{ scrollbarWidth: "thin" }}>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Digital Maturity", value: profile.maturityScore, max: 4, fmt: (v: number) => v.toFixed(1), sub: maturityContext(profile.maturityScore), icon: Shield },
                  { label: "Coverage Rate", value: profile.coverageRate, max: 100, fmt: (v: number) => `${v}%`, sub: "ILO effective coverage", icon: Users },
                  { label: "Replacement Rate", value: profile.replacementRate, max: 100, fmt: (v: number) => `${v}%`, sub: "OECD net, median earner", icon: TrendingUp },
                  { label: "Sustainability", value: profile.sustainability, max: 4, fmt: (v: number) => v.toFixed(1), sub: "ILO actuarial balance", icon: Shield },
                ].map(({ label, value, max, fmt, sub, icon: MetricIcon }) => (
                  <div key={label} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <MetricIcon size={10} className="text-white/30" />
                      <p className="text-[10px] text-white/40">{label}</p>
                    </div>
                    <p className="font-playfair text-xl font-bold" style={{ color: scoreColor(value, max) }}>{fmt(value)}</p>
                    <p className="text-[10px] text-white/25 mt-0.5 leading-tight">{sub}</p>
                    <div className="mt-2 h-1 rounded-full bg-white/5">
                      <div className="h-full rounded-full" style={{ width: `${(value / max) * 100}%`, backgroundColor: scoreColor(value, max) }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl p-3 flex items-center justify-between" style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}20` }}>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
                  <span className="text-sm font-semibold" style={{ color: accentColor }}>{profile.maturityLabel}</span>
                </div>
                <span className="text-xs text-white/40">{profile.region}</span>
              </div>
            </div>
          </Tile>
        </div>

        {/* ── ROW 2: Key Features, Strategic Insights, Latest Reforms, Challenges, Fiscal ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 min-h-[180px]">

          {/* Key Features */}
          <Tile onClick={() => setSelectedCategory("features")} delay={0.2}>
            <TileHeader icon={Lightbulb} label="Key Features" color="text-gold" />
            <div className="flex-1 p-4 overflow-hidden">
              <BulletList items={profile.keyFeatures} max={3} color="#C5A572" />
            </div>
          </Tile>

          {/* Strategic Insights (atlas-insights output) */}
          <Tile onClick={() => setSelectedCategory("insights")} delay={0.225}>
            <TileHeader icon={Sparkles} label="Strategic Insights" color="text-purple-400/70" />
            <div className="flex-1 p-4 overflow-hidden">
              {profile.insights.length > 0 ? (
                <BulletList items={profile.insights} max={3} color="#8B5CF6" />
              ) : dbData?.insightsStatus === "completed" ? (
                <p className="text-xs text-white/25 italic">No distinctive insights captured yet.</p>
              ) : (
                <p className="text-xs text-white/25 italic">Insights agent has not run for this country yet.</p>
              )}
            </div>
          </Tile>

          {/* Latest Reforms */}
          <Tile onClick={() => setSelectedCategory("reforms")} delay={0.25}>
            <TileHeader icon={RefreshCw} label="Latest Reforms" color="text-adl-blue/70" />
            <div className="flex-1 p-4 overflow-hidden">
              {profile.legislativeFramework && (
                <p className="text-[10px] text-white/30 mb-2 line-clamp-1">{profile.legislativeFramework}</p>
              )}
              <BulletList items={profile.recentReforms ?? []} max={3} color="#4A9EFF" />
            </div>
          </Tile>

          {/* Challenges & Risks */}
          <Tile onClick={() => setSelectedCategory("challenges")} delay={0.3}>
            <TileHeader icon={AlertTriangle} label="Challenges & Risks" color="text-amber-400/70" />
            <div className="flex-1 p-4 overflow-hidden">
              <BulletList items={profile.challenges} max={3} color="#F59E0B" />
            </div>
          </Tile>

          {/* Fiscal & Demographics */}
          <Tile onClick={() => setSelectedCategory("fiscal")} delay={0.35}>
            <TileHeader icon={BarChart3} label="Fiscal & Demographics" color="text-teal-400/70" />
            <div className="flex-1 p-4 overflow-hidden space-y-2">
              <MetricSnippet label="Social Protection Expenditure" value={profile.socialProtectionExpenditure} />
              <MetricSnippet label="Dependency Ratio" value={profile.dependencyRatio} />
              <MetricSnippet label="Pension Fund Assets" value={profile.pensionFundAssets} />
            </div>
          </Tile>
        </div>

        {/* ── ROW 3: Benefit Design, Fund Management, Rankings, Compare ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-h-[180px]">

          {/* Benefit Design */}
          <Tile onClick={() => setSelectedCategory("benefit")} delay={0.4}>
            <TileHeader icon={Calculator} label="Benefit Design" color="text-purple-400/70" />
            <div className="flex-1 p-4 overflow-hidden space-y-2">
              <MetricSnippet label="Benefit Formula" value={profile.benefitCalculation} />
              <MetricSnippet label="Vesting Period" value={profile.vestingPeriod} />
              <MetricSnippet label="Indexation" value={profile.indexationMechanism} />
            </div>
          </Tile>

          {/* Fund Management */}
          <Tile onClick={() => setSelectedCategory("fund")} delay={0.45}>
            <TileHeader icon={PiggyBank} label="Fund Management" color="text-emerald-400/70" />
            <div className="flex-1 p-4 overflow-hidden">
              {profile.fundManagement ? (
                <p className="text-xs text-white/55 line-clamp-6 leading-relaxed">{profile.fundManagement}</p>
              ) : (
                <p className="text-xs text-white/25 italic">Fund management data pending</p>
              )}
            </div>
          </Tile>

          {/* International Rankings */}
          <Tile onClick={() => setSelectedCategory("rankings")} delay={0.5}>
            <TileHeader icon={Award} label="International Rankings" color="text-gold/70" />
            <div className="flex-1 p-4 overflow-hidden space-y-2">
              {profile.internationalRankings ? (
                <>
                  {profile.internationalRankings.mercerIndex && (
                    <div className="rounded-lg p-2" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <p className="text-[10px] text-white/30">Mercer CFA</p>
                      <p className="text-xs text-cream line-clamp-1">{profile.internationalRankings.mercerIndex}</p>
                    </div>
                  )}
                  {profile.internationalRankings.oecdAdequacy && (
                    <div className="rounded-lg p-2" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <p className="text-[10px] text-white/30">OECD</p>
                      <p className="text-xs text-cream line-clamp-1">{profile.internationalRankings.oecdAdequacy}</p>
                    </div>
                  )}
                  {profile.internationalRankings.worldBankCoverage && (
                    <div className="rounded-lg p-2" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <p className="text-[10px] text-white/30">World Bank</p>
                      <p className="text-xs text-cream line-clamp-1">{profile.internationalRankings.worldBankCoverage}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-white/25 italic">Rankings data pending</p>
              )}
            </div>
          </Tile>

          {/* vs. GPSSA / Institutions */}
          <Tile onClick={() => setSelectedCategory(isGPSSA ? "institutions" : "comparison")} delay={0.55}>
            <TileHeader
              icon={isGPSSA ? Building2 : GitCompareArrows}
              label={isGPSSA ? "Institutions" : "vs. GPSSA (UAE)"}
              color={isGPSSA ? "text-purple-400/70" : "text-gpssa-green/70"}
            />
            <div className="flex-1 p-4 overflow-hidden">
              {isGPSSA ? (
                <div className="space-y-2">
                  {institutions.length > 0 ? institutions.slice(0, 2).map((inst) => (
                    <div key={inst.id} className="rounded-lg p-2.5" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <p className="text-xs font-medium text-cream truncate">{inst.name}</p>
                      {inst.shortName && <p className="text-[10px] text-white/30">{inst.shortName}</p>}
                      {inst.description && (
                        <p className="text-[10px] text-white/45 mt-1 line-clamp-2 leading-snug">{inst.description}</p>
                      )}
                      {inst.keyInnovations && (
                        <p className="text-[10px] text-purple-300/70 mt-1 line-clamp-2 leading-snug">
                          <span className="text-white/30">Innovations: </span>{inst.keyInnovations}
                        </p>
                      )}
                    </div>
                  )) : (
                    <p className="text-xs text-white/25 italic">Institution data loading...</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {[
                    { label: "Maturity", gpssa: GPSSA_REF.maturityScore, val: profile.maturityScore, max: 4 },
                    { label: "Coverage", gpssa: GPSSA_REF.coverageRate, val: profile.coverageRate, max: 100 },
                    { label: "Replacement", gpssa: GPSSA_REF.replacementRate, val: profile.replacementRate, max: 100 },
                  ].map(({ label, gpssa, val, max }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="text-white/40">{label}</span>
                        <div className="flex gap-2">
                          <span className="text-gpssa-green font-mono">{max > 10 ? `${gpssa}%` : gpssa.toFixed(1)}</span>
                          <span className="text-cream font-mono">{max > 10 ? `${val}%` : val.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="relative h-1 rounded-full bg-white/5">
                        <div className="absolute inset-y-0 left-0 rounded-full bg-gpssa-green/50" style={{ width: `${(gpssa / max) * 100}%` }} />
                        <div className="absolute inset-y-0 left-0 rounded-full border border-white/20" style={{ width: `${(val / max) * 100}%`, background: "rgba(255,255,255,0.1)" }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Tile>
        </div>
      </main>

      <CountryInsightModal
        isOpen={selectedCategory !== null}
        onClose={() => setSelectedCategory(null)}
        category={selectedCategory}
        profile={profile}
        institutions={institutions}
      />
    </div>
  );
}
