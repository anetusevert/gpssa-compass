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
} from "@/lib/countries/country-data";
import { CountryInsightModal, type InsightCategory } from "@/components/country/CountryInsightModal";

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

export default function CountryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const iso3 = (params.iso3 as string)?.toUpperCase();

  const [loading, setLoading] = useState(true);
  const [dbData, setDbData] = useState<DbCountry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<InsightCategory | null>(null);

  useEffect(() => {
    if (!iso3) return;
    setLoading(true);

    async function load() {
      try {
        const res = await fetch(`/api/countries/${iso3}`);
        if (!res.ok) throw new Error("not found");
        let data: DbCountry = await res.json();

        if (data.maturityScore == null && data.researchStatus !== "completed") {
          const jobsRes = await fetch("/api/research/screen-jobs?latest=true");
          if (jobsRes.ok) {
            const jobs: Array<{ id: string; type: string; status: string; completedItems: number }> =
              await jobsRes.json();
            const atlasJob = jobs.find(
              (j) => j.type === "atlas-worldmap" && j.status === "completed" && j.completedItems > 0
            );
            if (atlasJob) {
              await fetch(`/api/research/screen-jobs/${atlasJob.id}/rewrite`, { method: "POST" });
              const refreshed = await fetch(`/api/countries/${iso3}`);
              if (refreshed.ok) data = await refreshed.json();
            }
          }
        }

        setDbData(data);
        setError(null);
      } catch {
        setError("not found");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [iso3]);

  const profile: CountryProfile | null = useMemo(() => {
    if (dbData && dbData.researchStatus === "completed") return dbToProfile(dbData);
    if (COUNTRIES[iso3]) return COUNTRIES[iso3];
    if (dbData) return dbToProfile(dbData);
    return null;
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
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-cream transition-colors"
          >
            Return to Atlas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)]">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-white/10 bg-[var(--bg-primary)]/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors group"
            title="Back to Global Atlas"
          >
            <ArrowLeft className="w-4 h-4 text-white/60 group-hover:text-cream transition-colors" />
          </button>

          <div className="flex items-center gap-3">
            <span className="text-3xl leading-none">{profile.flag}</span>
            <div>
              <h1 className="font-playfair text-lg font-bold text-cream leading-tight">{profile.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-white/50">{profile.region}</span>
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
                <span className="text-xs font-semibold" style={{ color: accentColor }}>{profile.maturityLabel}</span>
                {isGPSSA && (
                  <span className="rounded-full bg-gpssa-green/15 px-2 py-0.5 text-[10px] font-bold text-gpssa-green">GPSSA</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Header metric pills */}
        <div className="hidden md:flex items-center gap-3">
          {[
            { label: "Maturity", value: profile.maturityScore.toFixed(1), sub: "/4", color: maturityBadgeColor(profile.maturityLabel) },
            { label: "Coverage", value: `${profile.coverageRate}%`, sub: "", color: profile.coverageRate >= 85 ? "#00C896" : profile.coverageRate >= 60 ? "#4A9EFF" : "#C5A572" },
            { label: "Replacement", value: `${profile.replacementRate}%`, sub: "", color: profile.replacementRate >= 75 ? "#00C896" : profile.replacementRate >= 55 ? "#4A9EFF" : "#C5A572" },
            { label: "Sustainability", value: profile.sustainability.toFixed(1), sub: "/4", color: profile.sustainability >= 3.5 ? "#00C896" : profile.sustainability >= 2.5 ? "#4A9EFF" : "#C5A572" },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="flex items-center gap-2 rounded-lg px-3 py-1.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-[10px] uppercase tracking-wider text-white/40">{label}</span>
              <span className="font-mono text-sm font-bold" style={{ color }}>{value}<span className="text-white/30 text-[10px]">{sub}</span></span>
            </div>
          ))}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 min-h-0">
        {/* Top Row: 2 Quadrants */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[280px]">
          {/* Left: System Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ease: EASE }}
            className="rounded-2xl border border-white/10 bg-[var(--bg-secondary)]/50 backdrop-blur-sm overflow-hidden flex flex-col cursor-pointer hover:border-white/20 transition-colors"
            onClick={() => setSelectedCategory("system")}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Building2 size={14} className="text-adl-blue" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-white/50">System Overview</h2>
              </div>
              <span className="text-[10px] text-white/30">Click to explore</span>
            </div>
            <div className="flex-1 p-5 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
              <div className="mb-4">
                <p className="text-sm font-semibold text-cream">{profile.institution}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-white/50">Est. {profile.yearEstablished || "N/A"}</span>
                  <span className="text-xs text-white/30">&middot;</span>
                  <span className="text-xs text-white/50">{profile.systemType}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="flex items-center gap-2 rounded-lg p-2.5" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <Zap size={12} style={{ color: accentColor }} />
                  <span className="text-xs text-cream">{profile.digitalLevel}</span>
                </div>
                {profile.retirementAge && (
                  <div className="flex items-center gap-2 rounded-lg p-2.5" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <Clock size={12} className="text-white/40" />
                    <span className="text-xs text-white/60">Ret: {profile.retirementAge.male}/{profile.retirementAge.female}</span>
                  </div>
                )}
              </div>
              {profile.contributionRates && (
                <div className="mb-4 rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1.5">Contributions</p>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div><span className="text-white/40">Employee</span><p className="text-cream font-medium mt-0.5">{profile.contributionRates.employee}</p></div>
                    <div><span className="text-white/40">Employer</span><p className="text-cream font-medium mt-0.5">{profile.contributionRates.employer}</p></div>
                    <div><span className="text-white/40">Govt</span><p className="text-cream font-medium mt-0.5">{profile.contributionRates.government}</p></div>
                  </div>
                </div>
              )}
              {(profile.iloConventionsRatified || profile.populationCovered) && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {profile.iloConventionsRatified && (
                    <div className="rounded-lg p-2.5" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <p className="text-[10px] text-white/30 mb-0.5">ILO Conventions</p>
                      <p className="text-xs text-cream line-clamp-2">{profile.iloConventionsRatified}</p>
                    </div>
                  )}
                  {profile.populationCovered && (
                    <div className="rounded-lg p-2.5" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <p className="text-[10px] text-white/30 mb-0.5">Population Covered</p>
                      <p className="text-xs text-cream line-clamp-2">{profile.populationCovered}</p>
                    </div>
                  )}
                </div>
              )}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2">Key Features</p>
                <ul className="space-y-1.5">
                  {profile.keyFeatures.slice(0, 5).map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-white/60">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: accentColor }} />
                      {f}
                    </li>
                  ))}
                  {profile.keyFeatures.length > 5 && (
                    <li className="text-[10px] text-white/25">+{profile.keyFeatures.length - 5} more</li>
                  )}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Right: Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ease: EASE }}
            className="rounded-2xl border border-white/10 bg-[var(--bg-secondary)]/50 backdrop-blur-sm overflow-hidden flex flex-col cursor-pointer hover:border-white/20 transition-colors"
            onClick={() => setSelectedCategory("metrics")}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-gpssa-green" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-white/50">Performance Metrics</h2>
              </div>
              <span className="text-[10px] text-white/30">Click to explore</span>
            </div>
            <div className="flex-1 p-5 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Digital Maturity", value: profile.maturityScore.toFixed(1), max: 4, sub: "/ 4.0", icon: Shield },
                  { label: "Coverage Rate", value: `${profile.coverageRate}%`, max: 100, sub: "of workforce", icon: Users },
                  { label: "Replacement Rate", value: `${profile.replacementRate}%`, max: 100, sub: "of salary", icon: TrendingUp },
                  { label: "Sustainability", value: profile.sustainability.toFixed(1), max: 4, sub: "/ 4.0", icon: Shield },
                ].map(({ label, value, max, sub, icon: MetricIcon }) => {
                  const numVal = parseFloat(value);
                  return (
                    <div key={label} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <MetricIcon size={10} className="text-white/30" />
                        <p className="text-[10px] text-white/40">{label}</p>
                      </div>
                      <p className="font-playfair text-xl font-bold" style={{ color: accentColor }}>{value}</p>
                      <p className="text-[10px] text-white/30 mb-2">{sub}</p>
                      <div className="h-1 rounded-full bg-white/5">
                        <div className="h-full rounded-full transition-all" style={{ width: `${(numVal / max) * 100}%`, backgroundColor: accentColor }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Maturity badge */}
              <div className="mt-4 rounded-xl p-3 flex items-center justify-between" style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}20` }}>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
                  <span className="text-sm font-semibold" style={{ color: accentColor }}>{profile.maturityLabel}</span>
                </div>
                <span className="text-xs text-white/40">{profile.region}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Row: 4 tiles */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-h-[200px]">
          {/* Insights tile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, ease: EASE }}
            className="rounded-2xl border border-white/10 bg-[var(--bg-secondary)]/50 backdrop-blur-sm overflow-hidden flex flex-col cursor-pointer hover:border-white/20 transition-colors"
            onClick={() => setSelectedCategory("insights")}
          >
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Lightbulb size={13} className="text-gold" />
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/50">Insights & Innovations</h3>
              </div>
              <ArrowRight size={12} className="text-white/20" />
            </div>
            <div className="flex-1 p-4 overflow-hidden">
              <ul className="space-y-1.5">
                {profile.insights.slice(0, 3).map((ins, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-white/55">
                    <Lightbulb size={10} className="mt-0.5 shrink-0 text-gold/60" />
                    <span className="line-clamp-2">{ins}</span>
                  </li>
                ))}
              </ul>
              {profile.insights.length > 3 && (
                <p className="text-[10px] text-white/25 mt-2">+{profile.insights.length - 3} more</p>
              )}
            </div>
          </motion.div>

          {/* Challenges tile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, ease: EASE }}
            className="rounded-2xl border border-white/10 bg-[var(--bg-secondary)]/50 backdrop-blur-sm overflow-hidden flex flex-col cursor-pointer hover:border-white/20 transition-colors"
            onClick={() => setSelectedCategory("challenges")}
          >
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
              <div className="flex items-center gap-2">
                <AlertTriangle size={13} className="text-amber-400/70" />
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/50">Challenges & Risks</h3>
              </div>
              <ArrowRight size={12} className="text-white/20" />
            </div>
            <div className="flex-1 p-4 overflow-hidden">
              <ul className="space-y-1.5">
                {profile.challenges.slice(0, 3).map((ch, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-white/55">
                    <AlertTriangle size={10} className="mt-0.5 shrink-0 text-amber-400/40" />
                    <span className="line-clamp-2">{ch}</span>
                  </li>
                ))}
              </ul>
              {profile.challenges.length > 3 && (
                <p className="text-[10px] text-white/25 mt-2">+{profile.challenges.length - 3} more</p>
              )}
            </div>
          </motion.div>

          {/* Recent Reforms tile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, ease: EASE }}
            className="rounded-2xl border border-white/10 bg-[var(--bg-secondary)]/50 backdrop-blur-sm overflow-hidden flex flex-col cursor-pointer hover:border-white/20 transition-colors"
            onClick={() => setSelectedCategory("reforms")}
          >
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
              <div className="flex items-center gap-2">
                <RefreshCw size={13} className="text-adl-blue/70" />
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/50">Recent Reforms</h3>
              </div>
              <ArrowRight size={12} className="text-white/20" />
            </div>
            <div className="flex-1 p-4 overflow-hidden">
              {(profile.recentReforms?.length ?? 0) > 0 ? (
                <ul className="space-y-1.5">
                  {profile.recentReforms!.slice(0, 3).map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-white/55">
                      <RefreshCw size={10} className="mt-0.5 shrink-0 text-adl-blue/40" />
                      <span className="line-clamp-2">{r}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <RefreshCw size={20} className="text-white/15 mb-2" />
                  <p className="text-xs text-white/30">Reform data pending research</p>
                </div>
              )}
              {(profile.recentReforms?.length ?? 0) > 3 && (
                <p className="text-[10px] text-white/25 mt-2">+{profile.recentReforms!.length - 3} more</p>
              )}
            </div>
          </motion.div>

          {/* Institutions / Compare tile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, ease: EASE }}
            className="rounded-2xl border border-white/10 bg-[var(--bg-secondary)]/50 backdrop-blur-sm overflow-hidden flex flex-col cursor-pointer hover:border-white/20 transition-colors"
            onClick={() => setSelectedCategory(isGPSSA ? "institutions" : "comparison")}
          >
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
              <div className="flex items-center gap-2">
                {isGPSSA ? (
                  <>
                    <Building2 size={13} className="text-purple-400/70" />
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/50">Institutions</h3>
                  </>
                ) : (
                  <>
                    <GitCompareArrows size={13} className="text-gpssa-green/70" />
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/50">vs. GPSSA (UAE)</h3>
                  </>
                )}
              </div>
              <ArrowRight size={12} className="text-white/20" />
            </div>
            <div className="flex-1 p-4 overflow-hidden">
              {isGPSSA ? (
                <div className="space-y-2">
                  {institutions.length > 0 ? (
                    institutions.slice(0, 3).map((inst) => (
                      <div key={inst.id} className="rounded-lg p-2.5" style={{ background: "rgba(255,255,255,0.03)" }}>
                        <p className="text-xs font-medium text-cream truncate">{inst.name}</p>
                        {inst.shortName && <p className="text-[10px] text-white/30">{inst.shortName}</p>}
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Building2 size={20} className="text-white/15 mb-2" />
                      <p className="text-xs text-white/30">Institution data loading...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    { label: "Maturity", gpssa: GPSSA_REF.maturityScore, this_: profile.maturityScore, max: 4 },
                    { label: "Coverage", gpssa: GPSSA_REF.coverageRate, this_: profile.coverageRate, max: 100 },
                    { label: "Replacement", gpssa: GPSSA_REF.replacementRate, this_: profile.replacementRate, max: 100 },
                  ].map(({ label, gpssa, this_, max }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="text-white/40">{label}</span>
                        <div className="flex gap-2">
                          <span className="text-gpssa-green font-mono">{max > 10 ? `${gpssa}%` : gpssa.toFixed(1)}</span>
                          <span className="text-cream font-mono">{max > 10 ? `${this_}%` : this_.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="relative h-1 rounded-full bg-white/5">
                        <div className="absolute inset-y-0 left-0 rounded-full bg-gpssa-green/50" style={{ width: `${(gpssa / max) * 100}%` }} />
                        <div className="absolute inset-y-0 left-0 rounded-full border border-white/20" style={{ width: `${(this_ / max) * 100}%`, background: "rgba(255,255,255,0.1)" }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Drill-down modal */}
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
