"use client";

import { motion } from "framer-motion";
import { SlideLayout } from "./SlideLayout";
import { SlidePlaceholder } from "../SlidePlaceholder";
import type {
  BriefingSnapshot,
  StandardComparisonRow,
} from "@/lib/briefing/types";

const EASE = [0.16, 1, 0.3, 1] as const;

interface Props {
  snapshot: BriefingSnapshot;
}

/** Plain-English explainer keyed by short label / detected dimension. */
interface StandardMeta {
  code: string;
  title: string;
  description: string;
  metricKey?: string;
}

const STANDARD_EXPLAINER: Record<string, StandardMeta> = {
  Coverage: {
    code: "ILO C102",
    title: "Coverage of the workforce",
    description:
      "Share of working-age people enrolled in mandatory pension protection. The ILO C102 minimum-standards convention defines the floor.",
    metricKey: "coverageRate",
  },
  Adequacy: {
    code: "ILO C128",
    title: "Adequacy of pensions",
    description:
      "Replacement rate — pension as a share of pre-retirement earnings. ILO C128 sets minimum benefit levels for old-age, disability and survivors' pensions.",
    metricKey: "replacementRate",
  },
  Sustainability: {
    code: "OECD PaaG",
    title: "Long-run financial sustainability",
    description:
      "Assets, contributions and investment returns vs projected liabilities. Benchmarked against OECD Pensions at a Glance.",
    metricKey: "sustainability",
  },
  Digital: {
    code: "ISSA ICT",
    title: "Digital service maturity",
    description:
      "Self-service, automation and data analytics maturity, scored against the ISSA Guidelines on ICT and the WB GovTech Maturity Index.",
    metricKey: "digitalReadiness",
  },
  Governance: {
    code: "ISSA Gov",
    title: "Governance & oversight",
    description:
      "Independent board oversight, disclosure, audit and risk management — measured against ISSA Good Governance Guidelines.",
    metricKey: "maturityScore",
  },
  Equity: {
    code: "ILO R202",
    title: "Equity & inclusion",
    description:
      "Inclusion of women, informal workers and low-income earners under the social-protection-floors framework (ILO R202).",
    metricKey: "maturityScore",
  },
  Portability: {
    code: "GCC Reg.",
    title: "Portability across borders",
    description:
      "Ability to carry pension rights across employers and across the GCC unified insurance extension.",
    metricKey: "maturityScore",
  },
  Innovation: {
    code: "Mercer GPI",
    title: "Product & design innovation",
    description:
      "Modern design — auto-enrol, lifecycle defaults, parametric features. Tracked through the Mercer CFA Global Pension Index.",
    metricKey: "maturityScore",
  },
};

function clamp(v: number) {
  return Math.max(0, Math.min(100, v));
}

function quartileLabel(score: number, leader: number, average: number, laggard: number): string {
  if (score >= leader - 2) return "Leader cohort";
  if (score >= average) return "Above the global average";
  if (score >= laggard) return "Below the average";
  return "Bottom of the cohort";
}

export function Slide08_GlobalBenchmarks({ snapshot }: Props) {
  const evaluated = snapshot.standards.rows.filter(
    (r) =>
      r.gpssaScore != null ||
      r.globalAverage != null ||
      r.topQuartile != null ||
      r.bottomQuartile != null
  );

  if (evaluated.length === 0) {
    return (
      <SlidePlaceholder
        pillar="Standards & Compliance"
        done={snapshot.standards.evaluatedCount}
        total={snapshot.standards.count}
        message="ILO C102, ISSA Guidelines and OECD framework benchmarks render here once the first compliance scoring pass is complete."
      />
    );
  }

  // Prefer rows where UAE has a score; fill out to 6 rows with highest-signal others.
  const withGpssa = evaluated.filter((r) => r.gpssaScore != null);
  const withoutGpssa = evaluated
    .filter((r) => r.gpssaScore == null)
    .sort((a, b) => {
      const aSig =
        (a.globalAverage != null ? 1 : 0) +
        (a.topQuartile != null ? 1 : 0) +
        (a.bottomQuartile != null ? 1 : 0);
      const bSig =
        (b.globalAverage != null ? 1 : 0) +
        (b.topQuartile != null ? 1 : 0) +
        (b.bottomQuartile != null ? 1 : 0);
      return bSig - aSig;
    });

  const TARGET = 6;
  const ranked = [
    ...withGpssa.slice(0, TARGET),
    ...withoutGpssa.slice(0, Math.max(0, TARGET - withGpssa.length)),
  ].slice(0, TARGET);

  // Resolve a guaranteed UAE position per row — use compliance score, then atlas
  // metric fallback, then the closest available marker on the row.
  function resolveUaeScore(r: StandardComparisonRow): { value: number; derived: boolean } | null {
    if (r.gpssaScore != null) return { value: r.gpssaScore, derived: false };
    const meta = STANDARD_EXPLAINER[r.shortLabel];
    if (meta?.metricKey && snapshot.standards.gpssaMetrics) {
      const v = snapshot.standards.gpssaMetrics[meta.metricKey];
      if (typeof v === "number" && v > 0) return { value: v, derived: true };
    }
    return null;
  }

  return (
    <SlideLayout
      eyebrow="vs. Global Benchmarks"
      title="Where the UAE leads, lags, and has runway."
      subtitle="Each dimension scored 0–100 against the international standard that defines it. UAE position vs. the global laggard floor, the global average and the leader frontier."
    >
      <div className="grid h-full max-w-6xl mx-auto grid-cols-1 gap-2.5">
        {ranked.map((r, i) => {
          const meta = STANDARD_EXPLAINER[r.shortLabel];
          const uae = resolveUaeScore(r);
          const top = r.topQuartile;
          const avg = r.globalAverage;
          const bot = r.bottomQuartile;
          const floor = r.floor;

          const verdict =
            uae && top != null && avg != null && bot != null
              ? quartileLabel(uae.value, top, avg, bot)
              : "Score in progress";

          return (
            <motion.div
              key={r.slug}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18 + i * 0.07, ease: EASE }}
              className="grid grid-cols-12 items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2"
            >
              {/* Standard badge + descriptor */}
              <div className="col-span-4 flex items-start gap-2.5">
                <div
                  className="flex shrink-0 flex-col items-center justify-center rounded-md border border-white/10 px-2.5 py-1.5"
                  style={{
                    background:
                      "linear-gradient(160deg, rgba(170,156,255,0.15), rgba(45,74,140,0.18))",
                    minWidth: 78,
                  }}
                >
                  <div className="text-[8.5px] uppercase tracking-[0.16em] text-white/55">
                    Standard
                  </div>
                  <div className="font-playfair text-[12px] font-semibold leading-tight text-cream">
                    {meta?.code ?? r.shortLabel}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="font-playfair text-[13px] font-semibold leading-tight text-cream">
                    {meta?.title ?? r.shortLabel}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[10.5px] leading-snug text-white/55">
                    {meta?.description ?? r.oneLiner}
                  </p>
                </div>
              </div>

              {/* Scale */}
              <div className="col-span-6 relative h-10">
                {/* Track gradient */}
                <div
                  className="absolute inset-y-[18px] left-0 right-0 h-1 rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(231,99,99,0.30) 0%, rgba(255,255,255,0.10) 50%, rgba(45,212,191,0.32) 100%)",
                  }}
                />
                {[0, 25, 50, 75, 100].map((t) => (
                  <div
                    key={t}
                    className="absolute top-1/2 h-2 w-px -translate-y-1/2 bg-white/10"
                    style={{ left: `${t}%` }}
                  />
                ))}

                {/* Floor (ILO etc.) */}
                {floor != null && (
                  <div
                    className="absolute top-0 bottom-0 flex flex-col items-center"
                    style={{ left: `${clamp(floor)}%` }}
                  >
                    <div className="h-full w-px bg-[#C5A572]/45" />
                    <div className="absolute -bottom-0.5 -translate-x-1/2 text-[8px] uppercase tracking-[0.14em] text-[#C5A572]/70 whitespace-nowrap">
                      Floor
                    </div>
                  </div>
                )}

                {/* Laggard */}
                {bot != null && (
                  <Marker left={bot} color="#E76363" label="Laggard" delay={0.4 + i * 0.07} />
                )}
                {/* Average */}
                {avg != null && (
                  <Marker left={avg} color="rgba(255,255,255,0.7)" label="Average" delay={0.55 + i * 0.07} />
                )}
                {/* Leader */}
                {top != null && (
                  <Marker left={top} color="#33C490" label="Leader" delay={0.7 + i * 0.07} />
                )}

                {/* UAE marker — guaranteed */}
                {uae && (
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2"
                    initial={{ left: "0%", opacity: 0, scale: 0 }}
                    animate={{
                      left: `${clamp(uae.value)}%`,
                      opacity: 1,
                      scale: 1,
                    }}
                    transition={{
                      duration: 1.1,
                      delay: 0.95 + i * 0.07,
                      ease: EASE,
                    }}
                  >
                    <div className="-translate-x-1/2 flex flex-col items-center">
                      <motion.div
                        className="h-4 w-4 rounded-full border-2 border-cream"
                        style={{
                          background: "#00A86B",
                          boxShadow: "0 0 18px rgba(0,168,107,0.65)",
                        }}
                        animate={{
                          boxShadow: [
                            "0 0 14px rgba(0,168,107,0.4)",
                            "0 0 26px rgba(0,168,107,0.7)",
                            "0 0 14px rgba(0,168,107,0.4)",
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      <div className="mt-0.5 text-[10px] font-semibold tabular-nums text-[#33C490] whitespace-nowrap">
                        UAE · {Math.round(uae.value)}
                        {uae.derived && (
                          <span className="ml-1 text-[8px] uppercase tracking-[0.14em] text-white/40">
                            (atlas)
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Verdict */}
              <div className="col-span-2 text-right">
                <div className="text-[8.5px] uppercase tracking-[0.18em] text-white/45">
                  UAE position
                </div>
                <div
                  className="font-playfair text-[12.5px] font-semibold leading-tight"
                  style={{
                    color:
                      uae && avg != null
                        ? uae.value >= avg
                          ? "#33C490"
                          : "#E7B02E"
                        : "#9696AA",
                  }}
                >
                  {verdict}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </SlideLayout>
  );
}

function Marker({
  left,
  color,
  label,
  delay,
}: {
  left: number;
  color: string;
  label: string;
  delay: number;
}) {
  return (
    <motion.div
      className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${clamp(left)}%` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
    >
      <div className="flex flex-col items-center">
        <div
          className="h-2 w-2 rounded-full"
          style={{
            background: color,
            boxShadow: `0 0 6px ${color}`,
          }}
        />
        <div className="absolute -bottom-3 -translate-x-1/2 text-[8px] uppercase tracking-[0.14em] text-white/45 whitespace-nowrap">
          {label}
        </div>
      </div>
    </motion.div>
  );
}
