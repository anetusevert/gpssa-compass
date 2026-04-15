"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X, Sparkles, AlertTriangle, Building2, GitCompareArrows, Lightbulb,
  BarChart3, RefreshCw, Scale, Award, ExternalLink, Users, Shield,
  TrendingUp, Calculator, PiggyBank, Landmark, CheckCircle,
} from "lucide-react";
import type { CountryProfile } from "@/lib/countries/country-data";
import { maturityBadgeColor, GPSSA_REF } from "@/lib/countries/country-data";
import { CountryFlag } from "@/components/ui/CountryFlag";

export type InsightCategory =
  | "system"
  | "metrics"
  | "insights"
  | "challenges"
  | "institutions"
  | "comparison"
  | "reforms"
  | "features"
  | "fiscal"
  | "benefit"
  | "fund"
  | "rankings";

interface Institution {
  id: string;
  name: string;
  shortName?: string | null;
  description?: string | null;
  digitalMaturity?: string | null;
  keyInnovations?: string | null;
  websiteUrl?: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  category: InsightCategory | null;
  profile: CountryProfile;
  institutions?: Institution[];
}

const EASE = [0.16, 1, 0.3, 1] as const;

/* ─── Scoring helpers ─── */

function scoreColor(value: number, max: number): string {
  const pct = value / max;
  if (pct >= 0.85) return "#00C896";
  if (pct >= 0.6) return "#4A9EFF";
  return "#C5A572";
}

function maturityTier(score: number): { tier: string; description: string; percentile: string } {
  if (score >= 3.5) return { tier: "Leader", description: "Fully digitised, comprehensive coverage, actuarially sound", percentile: "Top 15% globally" };
  if (score >= 2.5) return { tier: "Advanced", description: "Robust framework with above-median performance across pillars", percentile: "Top 40% globally" };
  if (score >= 1.5) return { tier: "Developing", description: "Active reform trajectory, foundational systems in place", percentile: "Middle quintile" };
  return { tier: "Emerging", description: "Early-stage social security infrastructure; high reform potential", percentile: "Bottom quartile" };
}

function coverageContext(rate: number): string {
  if (rate >= 90) return "Near-universal effective coverage — exceeds ILO Social Protection Floor standard";
  if (rate >= 70) return "Broad coverage — above ILO minimum but gaps remain in informal sectors";
  if (rate >= 40) return "Partial coverage — significant informal workforce exclusion";
  return "Limited coverage — majority of working population unprotected";
}

function replacementContext(rate: number): string {
  if (rate >= 75) return "Exceeds ILO Convention 102 minimum (40%); comfortable post-retirement income";
  if (rate >= 55) return "Adequate replacement — meets OECD median; moderate income continuity";
  if (rate >= 40) return "Meets ILO minimum standard but below OECD median; supplementary savings needed";
  return "Below ILO C102 minimum — high risk of old-age poverty without private savings";
}

function sustainabilityContext(score: number): string {
  if (score >= 3.5) return "Strong actuarial outlook — funded ratio and demographic headroom adequate for 30+ years";
  if (score >= 2.5) return "Manageable pressure — parametric adjustments can maintain solvency through 2050";
  if (score >= 1.5) return "Moderate risk — rising dependency ratio requires structural reform within a decade";
  return "High risk — immediate fiscal pressure from demographics and underfunding";
}

/* ─── Shared sub-components ─── */

function CompareBar({ label, gpssaVal, otherVal, maxVal, unit }: {
  label: string; gpssaVal: number; otherVal: number; maxVal: number; unit: string;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-white/70">{label}</span>
        <div className="flex items-center gap-4">
          <span className="font-mono text-gpssa-green text-sm">GPSSA: {unit === "%" ? `${gpssaVal}%` : gpssaVal.toFixed(1)}</span>
          <span className="font-mono text-cream text-sm">This: {unit === "%" ? `${otherVal}%` : otherVal.toFixed(1)}</span>
        </div>
      </div>
      <div className="relative h-2 rounded-full bg-white/5">
        <div className="absolute inset-y-0 left-0 rounded-full bg-gpssa-green/60" style={{ width: `${Math.min((gpssaVal / maxVal) * 100, 100)}%` }} />
        <div className="absolute inset-y-0 left-0 rounded-full border border-white/20" style={{ width: `${Math.min((otherVal / maxVal) * 100, 100)}%`, background: "rgba(255,255,255,0.15)" }} />
      </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl p-3 border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
      <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">{label}</p>
      <p className="text-sm text-cream font-medium">{value}</p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">{children}</p>;
}

function DataCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4 border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
      <p className="text-[10px] uppercase tracking-wider text-white/30 mb-2">{label}</p>
      <div className="text-sm text-white/70 leading-relaxed">{children}</div>
    </div>
  );
}

function NumberedList({ items }: { items: string[] }) {
  return (
    <ol className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-cream mt-0.5" style={{ background: "rgba(255,255,255,0.08)" }}>{i + 1}</span>
          <p className="text-sm text-white/70 leading-relaxed">{item}</p>
        </li>
      ))}
    </ol>
  );
}

function BulletItem({ text, color = "#4A9EFF" }: { text: string; color?: string }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-white/70 leading-relaxed">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
      {text}
    </li>
  );
}

/* ─── Category config ─── */

const CATEGORY_CONFIG: Record<InsightCategory, { title: string; icon: typeof Sparkles; color: string }> = {
  system:       { title: "System Overview",           icon: Building2,        color: "#4A9EFF" },
  metrics:      { title: "Performance Metrics",       icon: BarChart3,        color: "#00C896" },
  insights:     { title: "Insights & Innovations",    icon: Sparkles,         color: "#C5A572" },
  challenges:   { title: "Challenges & Risks",        icon: AlertTriangle,    color: "#EF4444" },
  reforms:      { title: "Latest Reforms",            icon: RefreshCw,        color: "#4A9EFF" },
  institutions: { title: "Institutions",              icon: Building2,        color: "#8B5CF6" },
  comparison:   { title: "vs. GPSSA (UAE)",            icon: GitCompareArrows, color: "#00C896" },
  features:     { title: "Key Features",              icon: Lightbulb,        color: "#C5A572" },
  fiscal:       { title: "Fiscal & Demographics",     icon: BarChart3,        color: "#14B8A6" },
  benefit:      { title: "Benefit Design",            icon: Calculator,       color: "#8B5CF6" },
  fund:         { title: "Fund Management",           icon: PiggyBank,        color: "#10B981" },
  rankings:     { title: "International Rankings",    icon: Award,            color: "#C5A572" },
};

/* ─── Modal ─── */

export function CountryInsightModal({ isOpen, onClose, category, profile, institutions = [] }: Props) {
  if (!category) return null;

  const config = CATEGORY_CONFIG[category];
  const Icon = config.icon;
  const accentColor = maturityBadgeColor(profile.maturityLabel);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[90]"
            style={{ background: "rgba(8,18,38,0.75)", backdropFilter: "blur(8px)" }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="fixed inset-0 z-[91] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-2xl max-h-[85vh] rounded-2xl border overflow-hidden flex flex-col"
              style={{ background: "rgba(8,18,38,0.98)", borderColor: "rgba(255,255,255,0.1)" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl" style={{ background: `${config.color}15` }}>
                    <Icon size={18} style={{ color: config.color }} />
                  </div>
                  <div>
                    <h2 className="font-playfair text-lg font-bold text-cream">{config.title}</h2>
                    <p className="text-xs text-white/50 mt-0.5 flex items-center gap-1.5"><CountryFlag code={profile.iso3} size="xs" /> {profile.name}</p>
                  </div>
                </div>
                <button onClick={onClose} className="rounded-xl p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-cream">
                  <X size={16} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: "thin" }}>

                {/* ─── SYSTEM ─── */}
                {category === "system" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <InfoBlock label="Institution" value={profile.institution} />
                      <InfoBlock label="System Type" value={profile.systemType} />
                      <InfoBlock label="Year Established" value={profile.yearEstablished ? String(profile.yearEstablished) : "N/A"} />
                      <InfoBlock label="Digital Level" value={profile.digitalLevel} />
                    </div>
                    {profile.retirementAge && (
                      <div className="grid grid-cols-3 gap-4">
                        <InfoBlock label="Retirement (Male)" value={profile.retirementAge.male} />
                        <InfoBlock label="Retirement (Female)" value={profile.retirementAge.female} />
                        <InfoBlock label="Early Retirement" value={profile.retirementAge.early} />
                      </div>
                    )}
                    {profile.contributionRates && (
                      <div>
                        <SectionLabel>Contribution Structure</SectionLabel>
                        <div className="grid grid-cols-3 gap-4">
                          <InfoBlock label="Employee" value={profile.contributionRates.employee} />
                          <InfoBlock label="Employer" value={profile.contributionRates.employer} />
                          <InfoBlock label="Government" value={profile.contributionRates.government} />
                        </div>
                      </div>
                    )}
                    {profile.benefitTypes && profile.benefitTypes.length > 0 && (
                      <div>
                        <SectionLabel>Benefit Types</SectionLabel>
                        <div className="flex flex-wrap gap-2">
                          {profile.benefitTypes.map((bt, i) => (
                            <span key={i} className="rounded-full px-3 py-1 text-xs text-cream border border-white/10" style={{ background: "rgba(255,255,255,0.04)" }}>{bt}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {(profile.iloConventionsRatified || profile.populationCovered) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {profile.iloConventionsRatified && (
                          <div className="rounded-xl p-4 border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                            <div className="flex items-center gap-2 mb-2"><Scale size={14} className="text-adl-blue/60" /><p className="text-[10px] uppercase tracking-wider text-white/30">ILO Conventions Ratified</p></div>
                            <p className="text-sm text-cream font-medium">{profile.iloConventionsRatified}</p>
                          </div>
                        )}
                        {profile.populationCovered && (
                          <div className="rounded-xl p-4 border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                            <div className="flex items-center gap-2 mb-2"><Users size={14} className="text-gpssa-green/60" /><p className="text-[10px] uppercase tracking-wider text-white/30">Population Covered</p></div>
                            <p className="text-sm text-cream font-medium">{profile.populationCovered}</p>
                          </div>
                        )}
                      </div>
                    )}
                    <div>
                      <SectionLabel>Key Features</SectionLabel>
                      <ul className="space-y-2">
                        {profile.keyFeatures.map((f, i) => <BulletItem key={i} text={f} color={accentColor} />)}
                      </ul>
                    </div>
                  </div>
                )}

                {/* ─── METRICS (enhanced with granular context) ─── */}
                {category === "metrics" && (
                  <div className="space-y-6">
                    {/* Maturity deep-dive */}
                    <div className="rounded-xl p-4 border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <div className="flex items-center gap-2 mb-1"><Shield size={14} className="text-white/40" /><p className="text-xs text-white/40">Digital Maturity</p></div>
                      <p className="font-playfair text-2xl font-bold" style={{ color: scoreColor(profile.maturityScore, 4) }}>{profile.maturityScore.toFixed(1)}<span className="text-sm text-white/30 ml-1">/ 4.0</span></p>
                      <div className="mt-2 h-1.5 rounded-full bg-white/5"><div className="h-full rounded-full" style={{ width: `${(profile.maturityScore / 4) * 100}%`, backgroundColor: scoreColor(profile.maturityScore, 4) }} /></div>
                      {(() => {
                        const ctx = maturityTier(profile.maturityScore);
                        return (
                          <div className="mt-3 space-y-1">
                            <p className="text-xs text-cream font-semibold">{ctx.tier} — {ctx.percentile}</p>
                            <p className="text-xs text-white/50">{ctx.description}</p>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Coverage deep-dive */}
                    <div className="rounded-xl p-4 border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <div className="flex items-center gap-2 mb-1"><Users size={14} className="text-white/40" /><p className="text-xs text-white/40">Coverage Rate</p></div>
                      <p className="font-playfair text-2xl font-bold" style={{ color: scoreColor(profile.coverageRate, 100) }}>{profile.coverageRate}%</p>
                      <div className="mt-2 h-1.5 rounded-full bg-white/5"><div className="h-full rounded-full" style={{ width: `${profile.coverageRate}%`, backgroundColor: scoreColor(profile.coverageRate, 100) }} /></div>
                      <p className="mt-3 text-xs text-white/50">{coverageContext(profile.coverageRate)}</p>
                      {profile.populationCovered && <p className="mt-1 text-xs text-white/40">Population detail: {profile.populationCovered}</p>}
                    </div>

                    {/* Replacement deep-dive */}
                    <div className="rounded-xl p-4 border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <div className="flex items-center gap-2 mb-1"><TrendingUp size={14} className="text-white/40" /><p className="text-xs text-white/40">Replacement Rate</p></div>
                      <p className="font-playfair text-2xl font-bold" style={{ color: scoreColor(profile.replacementRate, 100) }}>{profile.replacementRate}%</p>
                      <div className="mt-2 h-1.5 rounded-full bg-white/5"><div className="h-full rounded-full" style={{ width: `${profile.replacementRate}%`, backgroundColor: scoreColor(profile.replacementRate, 100) }} /></div>
                      <p className="mt-3 text-xs text-white/50">{replacementContext(profile.replacementRate)}</p>
                    </div>

                    {/* Sustainability deep-dive */}
                    <div className="rounded-xl p-4 border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <div className="flex items-center gap-2 mb-1"><Shield size={14} className="text-white/40" /><p className="text-xs text-white/40">Sustainability Index</p></div>
                      <p className="font-playfair text-2xl font-bold" style={{ color: scoreColor(profile.sustainability, 4) }}>{profile.sustainability.toFixed(1)}<span className="text-sm text-white/30 ml-1">/ 4.0</span></p>
                      <div className="mt-2 h-1.5 rounded-full bg-white/5"><div className="h-full rounded-full" style={{ width: `${(profile.sustainability / 4) * 100}%`, backgroundColor: scoreColor(profile.sustainability, 4) }} /></div>
                      <p className="mt-3 text-xs text-white/50">{sustainabilityContext(profile.sustainability)}</p>
                    </div>

                    {/* Governance Quality */}
                    {profile.governanceQuality && (
                      <div>
                        <SectionLabel>Governance Quality</SectionLabel>
                        <DataCard label="Institutional Governance Assessment">{profile.governanceQuality}</DataCard>
                      </div>
                    )}

                    {/* International Rankings inline */}
                    {profile.internationalRankings && (
                      <div>
                        <SectionLabel>International Rankings</SectionLabel>
                        <div className="grid grid-cols-3 gap-3">
                          {profile.internationalRankings.mercerIndex && (
                            <div className="rounded-lg p-3 text-center border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                              <p className="text-[9px] uppercase tracking-wider text-white/30 mb-1">Mercer CFA</p>
                              <p className="text-xs text-cream font-medium">{profile.internationalRankings.mercerIndex}</p>
                            </div>
                          )}
                          {profile.internationalRankings.oecdAdequacy && (
                            <div className="rounded-lg p-3 text-center border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                              <p className="text-[9px] uppercase tracking-wider text-white/30 mb-1">OECD</p>
                              <p className="text-xs text-cream font-medium">{profile.internationalRankings.oecdAdequacy}</p>
                            </div>
                          )}
                          {profile.internationalRankings.worldBankCoverage && (
                            <div className="rounded-lg p-3 text-center border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                              <p className="text-[9px] uppercase tracking-wider text-white/30 mb-1">World Bank</p>
                              <p className="text-xs text-cream font-medium">{profile.internationalRankings.worldBankCoverage}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Maturity badge */}
                    <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}20` }}>
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: accentColor }} />
                        <span className="text-lg font-semibold" style={{ color: accentColor }}>{profile.maturityLabel}</span>
                      </div>
                      <span className="text-sm text-white/50">{profile.region}</span>
                    </div>
                  </div>
                )}

                {/* ─── FEATURES ─── */}
                {category === "features" && (
                  <div className="space-y-4">
                    <NumberedList items={profile.keyFeatures} />
                  </div>
                )}

                {/* ─── INSIGHTS ─── */}
                {category === "insights" && (
                  <div className="space-y-4">
                    {profile.insights.map((ins, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-xl p-4 border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                        <div className="mt-0.5 p-1.5 rounded-lg" style={{ background: `${config.color}15` }}><Lightbulb size={14} style={{ color: config.color }} /></div>
                        <p className="text-sm text-white/70 leading-relaxed">{ins}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* ─── CHALLENGES ─── */}
                {category === "challenges" && (
                  <div className="space-y-4">
                    {profile.challenges.map((ch, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-xl p-4 border border-amber-500/10" style={{ background: "rgba(245,158,11,0.04)" }}>
                        <div className="mt-0.5 p-1.5 rounded-lg bg-amber-500/10"><AlertTriangle size={14} className="text-amber-400" /></div>
                        <p className="text-sm text-white/70 leading-relaxed">{ch}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* ─── REFORMS ─── */}
                {category === "reforms" && (
                  <div className="space-y-6">
                    {profile.legislativeFramework && (
                      <div>
                        <SectionLabel>Legislative Framework</SectionLabel>
                        <DataCard label="Governing Legislation">
                          <div className="flex items-start gap-3">
                            <Scale size={16} className="mt-0.5 shrink-0 text-adl-blue/60" />
                            <span>{profile.legislativeFramework}</span>
                          </div>
                        </DataCard>
                      </div>
                    )}
                    {profile.recentReforms && profile.recentReforms.length > 0 && (
                      <div>
                        <SectionLabel>Latest Reforms</SectionLabel>
                        <NumberedList items={profile.recentReforms} />
                      </div>
                    )}
                    {profile.dataSources && profile.dataSources.length > 0 && (
                      <div>
                        <SectionLabel>Data Sources</SectionLabel>
                        <div className="space-y-2">
                          {profile.dataSources.map((src, i) => (
                            <div key={i} className="flex items-start gap-3 rounded-lg p-3 border border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
                              <ExternalLink size={12} className="mt-0.5 shrink-0 text-white/25" />
                              <div className="min-w-0">
                                <p className="text-xs text-cream font-medium truncate">{src.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] text-white/30">{src.year}</span>
                                  {src.url && src.url !== "N/A" && (
                                    <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-gpssa-green/70 hover:text-gpssa-green truncate">{src.url}</a>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {!profile.legislativeFramework && (!profile.recentReforms || profile.recentReforms.length === 0) && (
                      <div className="text-center py-10">
                        <RefreshCw size={32} className="text-white/20 mx-auto mb-3" />
                        <p className="text-sm text-white/40">Reform and legislative data will be populated by the research agent.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── FISCAL & DEMOGRAPHICS ─── */}
                {category === "fiscal" && (
                  <div className="space-y-4">
                    <DataCard label="Social Protection Expenditure">{profile.socialProtectionExpenditure || "Data pending research"}</DataCard>
                    <DataCard label="Old-Age Dependency Ratio">{profile.dependencyRatio || "Data pending research"}</DataCard>
                    <DataCard label="Pension Fund Assets">{profile.pensionFundAssets || "Data pending research"}</DataCard>
                    <DataCard label="Governance Quality">{profile.governanceQuality || "Data pending research"}</DataCard>
                  </div>
                )}

                {/* ─── BENEFIT DESIGN ─── */}
                {category === "benefit" && (
                  <div className="space-y-6">
                    {profile.benefitTypes && profile.benefitTypes.length > 0 && (
                      <div>
                        <SectionLabel>Benefit Types</SectionLabel>
                        <div className="flex flex-wrap gap-2">
                          {profile.benefitTypes.map((bt, i) => (
                            <span key={i} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-cream border border-white/10" style={{ background: "rgba(255,255,255,0.04)" }}>
                              <CheckCircle size={10} className="text-gpssa-green/60" />{bt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <DataCard label="Benefit Calculation Formula">{profile.benefitCalculation || "Data pending research"}</DataCard>
                    <DataCard label="Vesting & Eligibility Requirements">{profile.vestingPeriod || "Data pending research"}</DataCard>
                    <DataCard label="Indexation & Adjustment Mechanism">{profile.indexationMechanism || "Data pending research"}</DataCard>
                  </div>
                )}

                {/* ─── FUND MANAGEMENT ─── */}
                {category === "fund" && (
                  <div className="space-y-4">
                    <DataCard label="Fund Governance & Investment Strategy">{profile.fundManagement || "Data pending research"}</DataCard>
                    {profile.pensionFundAssets && (
                      <DataCard label="Pension Fund Assets (cross-reference)">{profile.pensionFundAssets}</DataCard>
                    )}
                  </div>
                )}

                {/* ─── INTERNATIONAL RANKINGS ─── */}
                {category === "rankings" && (
                  <div className="space-y-4">
                    {profile.internationalRankings ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {profile.internationalRankings.mercerIndex && (
                          <div className="rounded-xl p-4 border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                            <div className="flex items-center gap-2 mb-2"><Award size={14} className="text-gold/60" /><p className="text-[10px] uppercase tracking-wider text-white/30">Mercer CFA Index</p></div>
                            <p className="text-sm text-cream font-medium">{profile.internationalRankings.mercerIndex}</p>
                          </div>
                        )}
                        {profile.internationalRankings.oecdAdequacy && (
                          <div className="rounded-xl p-4 border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                            <div className="flex items-center gap-2 mb-2"><BarChart3 size={14} className="text-adl-blue/60" /><p className="text-[10px] uppercase tracking-wider text-white/30">OECD Adequacy</p></div>
                            <p className="text-sm text-cream font-medium">{profile.internationalRankings.oecdAdequacy}</p>
                          </div>
                        )}
                        {profile.internationalRankings.worldBankCoverage && (
                          <div className="rounded-xl p-4 border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                            <div className="flex items-center gap-2 mb-2"><Building2 size={14} className="text-gpssa-green/60" /><p className="text-[10px] uppercase tracking-wider text-white/30">World Bank Coverage</p></div>
                            <p className="text-sm text-cream font-medium">{profile.internationalRankings.worldBankCoverage}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <Award size={32} className="text-white/20 mx-auto mb-3" />
                        <p className="text-sm text-white/40">International rankings data will be populated by the research agent.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── INSTITUTIONS ─── */}
                {category === "institutions" && (
                  <div className="space-y-4">
                    {institutions.length === 0 ? (
                      <div className="text-center py-10">
                        <Building2 size={32} className="text-white/20 mx-auto mb-3" />
                        <p className="text-sm text-white/40">No linked institution records yet.</p>
                      </div>
                    ) : (
                      institutions.map((inst) => (
                        <div key={inst.id} className="rounded-xl p-4 border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-cream">{inst.name}</h4>
                            {inst.shortName && <span className="text-xs text-white/40 font-mono">{inst.shortName}</span>}
                          </div>
                          {inst.description && <p className="text-xs text-white/50 mb-2">{inst.description}</p>}
                          {inst.digitalMaturity && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-white/30">Digital Maturity:</span>
                              <span className="text-white/60">{inst.digitalMaturity}</span>
                            </div>
                          )}
                          {inst.websiteUrl && (
                            <a href={inst.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gpssa-green hover:underline mt-2 inline-block">{inst.websiteUrl}</a>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* ─── COMPARISON ─── */}
                {category === "comparison" && profile.iso3 !== "ARE" && (
                  <div className="space-y-2">
                    <CompareBar label="Digital Maturity" gpssaVal={GPSSA_REF.maturityScore} otherVal={profile.maturityScore} maxVal={4} unit="" />
                    <CompareBar label="Coverage Rate" gpssaVal={GPSSA_REF.coverageRate} otherVal={profile.coverageRate} maxVal={100} unit="%" />
                    <CompareBar label="Replacement Rate" gpssaVal={GPSSA_REF.replacementRate} otherVal={profile.replacementRate} maxVal={100} unit="%" />
                    <CompareBar label="Sustainability" gpssaVal={GPSSA_REF.sustainability} otherVal={profile.sustainability} maxVal={4} unit="" />
                  </div>
                )}
                {category === "comparison" && profile.iso3 === "ARE" && (
                  <div className="text-center py-10"><p className="text-sm text-white/40">This is the GPSSA reference country.</p></div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
