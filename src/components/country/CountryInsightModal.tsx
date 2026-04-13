"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, AlertTriangle, Building2, GitCompareArrows, Lightbulb, BarChart3, RefreshCw, Scale, Award, ExternalLink, Users } from "lucide-react";
import type { CountryProfile } from "@/lib/countries/country-data";
import { maturityBadgeColor, GPSSA_REF } from "@/lib/countries/country-data";

export type InsightCategory = "system" | "metrics" | "insights" | "challenges" | "institutions" | "comparison" | "reforms";

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
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gpssa-green/60"
          style={{ width: `${Math.min((gpssaVal / maxVal) * 100, 100)}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full border border-white/20"
          style={{ width: `${Math.min((otherVal / maxVal) * 100, 100)}%`, background: "rgba(255,255,255,0.15)" }}
        />
      </div>
    </div>
  );
}

const CATEGORY_CONFIG: Record<InsightCategory, { title: string; icon: typeof Sparkles; color: string }> = {
  system:       { title: "System Overview",       icon: Building2,       color: "#4A9EFF" },
  metrics:      { title: "Performance Metrics",   icon: BarChart3,       color: "#00C896" },
  insights:     { title: "Insights & Innovations", icon: Sparkles,       color: "#C5A572" },
  challenges:   { title: "Challenges & Risks",    icon: AlertTriangle,   color: "#EF4444" },
  reforms:      { title: "Reforms & Legislation", icon: RefreshCw,       color: "#4A9EFF" },
  institutions: { title: "Institutions",           icon: Building2,       color: "#8B5CF6" },
  comparison:   { title: "vs. GPSSA (UAE)",        icon: GitCompareArrows, color: "#00C896" },
};

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
              className="pointer-events-auto w-full max-w-2xl max-h-[80vh] rounded-2xl border overflow-hidden flex flex-col"
              style={{ background: "rgba(8,18,38,0.98)", borderColor: "rgba(255,255,255,0.1)" }}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl" style={{ background: `${config.color}15` }}>
                    <Icon size={18} style={{ color: config.color }} />
                  </div>
                  <div>
                    <h2 className="font-playfair text-lg font-bold text-cream">{config.title}</h2>
                    <p className="text-xs text-white/50 mt-0.5">{profile.flag} {profile.name}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-xl p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-cream"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: "thin" }}>
                {category === "system" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <InfoBlock label="Institution" value={profile.institution} />
                      <InfoBlock label="System Type" value={profile.systemType} />
                      <InfoBlock label="Year Established" value={profile.yearEstablished ? String(profile.yearEstablished) : "Unknown"} />
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
                        <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Contribution Structure</p>
                        <div className="grid grid-cols-3 gap-4">
                          <InfoBlock label="Employee" value={profile.contributionRates.employee} />
                          <InfoBlock label="Employer" value={profile.contributionRates.employer} />
                          <InfoBlock label="Government" value={profile.contributionRates.government} />
                        </div>
                      </div>
                    )}

                    {profile.benefitTypes && profile.benefitTypes.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Benefit Types</p>
                        <div className="flex flex-wrap gap-2">
                          {profile.benefitTypes.map((bt, i) => (
                            <span key={i} className="rounded-full px-3 py-1 text-xs text-cream border border-white/10" style={{ background: "rgba(255,255,255,0.04)" }}>
                              {bt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {profile.fundManagement && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Fund Management</p>
                        <div className="rounded-xl p-4 border border-white/5 text-sm text-white/70 leading-relaxed" style={{ background: "rgba(255,255,255,0.03)" }}>
                          {profile.fundManagement}
                        </div>
                      </div>
                    )}

                    {(profile.iloConventionsRatified || profile.populationCovered) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {profile.iloConventionsRatified && (
                          <div className="rounded-xl p-4 border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                            <div className="flex items-center gap-2 mb-2">
                              <Scale size={14} className="text-adl-blue/60" />
                              <p className="text-[10px] uppercase tracking-wider text-white/30">ILO Conventions Ratified</p>
                            </div>
                            <p className="text-sm text-cream font-medium">{profile.iloConventionsRatified}</p>
                          </div>
                        )}
                        {profile.populationCovered && (
                          <div className="rounded-xl p-4 border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                            <div className="flex items-center gap-2 mb-2">
                              <Users size={14} className="text-gpssa-green/60" />
                              <p className="text-[10px] uppercase tracking-wider text-white/30">Population Covered</p>
                            </div>
                            <p className="text-sm text-cream font-medium">{profile.populationCovered}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Key Features</p>
                      <ul className="space-y-2">
                        {profile.keyFeatures.map((f, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-white/70">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: accentColor }} />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {category === "metrics" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: "Digital Maturity", value: profile.maturityScore, max: 4, format: (v: number) => v.toFixed(1), sub: "/ 4.0" },
                        { label: "Coverage Rate", value: profile.coverageRate, max: 100, format: (v: number) => `${v}%`, sub: "of workforce" },
                        { label: "Replacement Rate", value: profile.replacementRate, max: 100, format: (v: number) => `${v}%`, sub: "of salary" },
                        { label: "Sustainability", value: profile.sustainability, max: 4, format: (v: number) => v.toFixed(1), sub: "/ 4.0" },
                      ].map(({ label, value, max, format, sub }) => (
                        <div key={label} className="rounded-xl p-4 border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                          <p className="text-xs text-white/40 mb-1">{label}</p>
                          <p className="font-playfair text-2xl font-bold" style={{ color: accentColor }}>{format(value)}</p>
                          <p className="text-xs text-white/30 mt-0.5">{sub}</p>
                          <div className="mt-3 h-1.5 rounded-full bg-white/5">
                            <div className="h-full rounded-full transition-all" style={{ width: `${(value / max) * 100}%`, backgroundColor: accentColor }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl p-4 border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <p className="text-xs text-white/40 mb-2">Maturity Classification</p>
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: accentColor }} />
                        <span className="text-lg font-semibold" style={{ color: accentColor }}>{profile.maturityLabel}</span>
                        <span className="text-sm text-white/50">({profile.region})</span>
                      </div>
                    </div>
                    {profile.populationCovered && (
                      <div className="rounded-xl p-4 border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                        <div className="flex items-center gap-2 mb-1">
                          <Users size={12} className="text-gpssa-green/60" />
                          <p className="text-xs text-white/40">Population Covered</p>
                        </div>
                        <p className="text-sm text-cream font-medium">{profile.populationCovered}</p>
                      </div>
                    )}
                    {profile.internationalRankings && (
                      <div className="mt-4 pt-4 border-t border-white/5">
                        <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">International Rankings</p>
                        <div className="grid grid-cols-3 gap-3">
                          {profile.internationalRankings.mercerIndex && (
                            <div className="rounded-lg p-3 text-center" style={{ background: "rgba(255,255,255,0.03)" }}>
                              <p className="text-[9px] uppercase tracking-wider text-white/30 mb-1">Mercer</p>
                              <p className="text-xs text-cream font-medium">{profile.internationalRankings.mercerIndex}</p>
                            </div>
                          )}
                          {profile.internationalRankings.oecdAdequacy && (
                            <div className="rounded-lg p-3 text-center" style={{ background: "rgba(255,255,255,0.03)" }}>
                              <p className="text-[9px] uppercase tracking-wider text-white/30 mb-1">OECD</p>
                              <p className="text-xs text-cream font-medium">{profile.internationalRankings.oecdAdequacy}</p>
                            </div>
                          )}
                          {profile.internationalRankings.worldBankCoverage && (
                            <div className="rounded-lg p-3 text-center" style={{ background: "rgba(255,255,255,0.03)" }}>
                              <p className="text-[9px] uppercase tracking-wider text-white/30 mb-1">World Bank</p>
                              <p className="text-xs text-cream font-medium">{profile.internationalRankings.worldBankCoverage}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {category === "insights" && (
                  <div className="space-y-4">
                    {profile.insights.map((ins, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-xl p-4 border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                        <div className="mt-0.5 p-1.5 rounded-lg" style={{ background: `${config.color}15` }}>
                          <Lightbulb size={14} style={{ color: config.color }} />
                        </div>
                        <p className="text-sm text-white/70 leading-relaxed">{ins}</p>
                      </div>
                    ))}
                  </div>
                )}

                {category === "challenges" && (
                  <div className="space-y-4">
                    {profile.challenges.map((ch, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-xl p-4 border border-amber-500/10" style={{ background: "rgba(245,158,11,0.04)" }}>
                        <div className="mt-0.5 p-1.5 rounded-lg bg-amber-500/10">
                          <AlertTriangle size={14} className="text-amber-400" />
                        </div>
                        <p className="text-sm text-white/70 leading-relaxed">{ch}</p>
                      </div>
                    ))}
                  </div>
                )}

                {category === "reforms" && (
                  <div className="space-y-6">
                    {profile.legislativeFramework && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Legislative Framework</p>
                        <div className="rounded-xl p-4 border border-white/5 text-sm text-white/70 leading-relaxed" style={{ background: "rgba(255,255,255,0.03)" }}>
                          <div className="flex items-start gap-3">
                            <Scale size={16} className="mt-0.5 shrink-0 text-adl-blue/60" />
                            <span>{profile.legislativeFramework}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {profile.recentReforms && profile.recentReforms.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Recent Reforms</p>
                        <div className="space-y-3">
                          {profile.recentReforms.map((reform, i) => (
                            <div key={i} className="flex items-start gap-3 rounded-xl p-4 border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                              <div className="mt-0.5 p-1.5 rounded-lg" style={{ background: `${config.color}15` }}>
                                <RefreshCw size={14} style={{ color: config.color }} />
                              </div>
                              <p className="text-sm text-white/70 leading-relaxed">{reform}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {profile.internationalRankings && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">International Rankings</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {profile.internationalRankings.mercerIndex && (
                            <div className="rounded-xl p-4 border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                              <div className="flex items-center gap-2 mb-2">
                                <Award size={14} className="text-gold/60" />
                                <p className="text-[10px] uppercase tracking-wider text-white/30">Mercer Index</p>
                              </div>
                              <p className="text-sm text-cream font-medium">{profile.internationalRankings.mercerIndex}</p>
                            </div>
                          )}
                          {profile.internationalRankings.oecdAdequacy && (
                            <div className="rounded-xl p-4 border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                              <div className="flex items-center gap-2 mb-2">
                                <BarChart3 size={14} className="text-adl-blue/60" />
                                <p className="text-[10px] uppercase tracking-wider text-white/30">OECD</p>
                              </div>
                              <p className="text-sm text-cream font-medium">{profile.internationalRankings.oecdAdequacy}</p>
                            </div>
                          )}
                          {profile.internationalRankings.worldBankCoverage && (
                            <div className="rounded-xl p-4 border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                              <div className="flex items-center gap-2 mb-2">
                                <Building2 size={14} className="text-gpssa-green/60" />
                                <p className="text-[10px] uppercase tracking-wider text-white/30">World Bank</p>
                              </div>
                              <p className="text-sm text-cream font-medium">{profile.internationalRankings.worldBankCoverage}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {profile.dataSources && profile.dataSources.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Data Sources</p>
                        <div className="space-y-2">
                          {profile.dataSources.map((src, i) => (
                            <div key={i} className="flex items-start gap-3 rounded-lg p-3 border border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
                              <ExternalLink size={12} className="mt-0.5 shrink-0 text-white/25" />
                              <div className="min-w-0">
                                <p className="text-xs text-cream font-medium truncate">{src.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] text-white/30">{src.year}</span>
                                  {src.url && src.url !== "N/A" && (
                                    <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-gpssa-green/70 hover:text-gpssa-green truncate">
                                      {src.url}
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!profile.legislativeFramework && (!profile.recentReforms || profile.recentReforms.length === 0) && !profile.internationalRankings && (
                      <div className="text-center py-10">
                        <RefreshCw size={32} className="text-white/20 mx-auto mb-3" />
                        <p className="text-sm text-white/40">Reform and legislative data will be populated by the research agent.</p>
                        <p className="text-xs text-white/25 mt-1">Run the country research job to generate this data.</p>
                      </div>
                    )}
                  </div>
                )}

                {category === "institutions" && (
                  <div className="space-y-4">
                    {institutions.length === 0 ? (
                      <div className="text-center py-10">
                        <Building2 size={32} className="text-white/20 mx-auto mb-3" />
                        <p className="text-sm text-white/40">No linked institution records yet.</p>
                        <p className="text-xs text-white/25 mt-1">Institution data will be populated by research agents.</p>
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
                            <a href={inst.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gpssa-green hover:underline mt-2 inline-block">
                              {inst.websiteUrl}
                            </a>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {category === "comparison" && profile.iso3 !== "ARE" && (
                  <div className="space-y-2">
                    <CompareBar label="Digital Maturity" gpssaVal={GPSSA_REF.maturityScore} otherVal={profile.maturityScore} maxVal={4} unit="" />
                    <CompareBar label="Coverage Rate" gpssaVal={GPSSA_REF.coverageRate} otherVal={profile.coverageRate} maxVal={100} unit="%" />
                    <CompareBar label="Replacement Rate" gpssaVal={GPSSA_REF.replacementRate} otherVal={profile.replacementRate} maxVal={100} unit="%" />
                    <CompareBar label="Sustainability" gpssaVal={GPSSA_REF.sustainability} otherVal={profile.sustainability} maxVal={4} unit="" />
                  </div>
                )}

                {category === "comparison" && profile.iso3 === "ARE" && (
                  <div className="text-center py-10">
                    <p className="text-sm text-white/40">This is the GPSSA reference country.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
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
