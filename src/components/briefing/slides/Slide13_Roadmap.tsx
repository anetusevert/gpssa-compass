"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { CalendarRange, Sparkles } from "lucide-react";
import { SlideLayout } from "./SlideLayout";
import type { BriefingSnapshot, OpportunityRow } from "@/lib/briefing/types";

const EASE = [0.16, 1, 0.3, 1] as const;

interface Props {
  snapshot: BriefingSnapshot;
}

type Quarter = "Q1" | "Q2" | "Q3" | "Q4";

const QUARTERS: { id: Quarter; title: string; theme: string; accent: string }[] = [
  {
    id: "Q1",
    title: "Q1 · Quick wins",
    theme: "Low effort, high impact — book momentum.",
    accent: "#33C490",
  },
  {
    id: "Q2",
    title: "Q2 · Build",
    theme: "Stretch the platform; lock in the next compounding gains.",
    accent: "#4899FF",
  },
  {
    id: "Q3",
    title: "Q3 · Sustain",
    theme: "Deepen rollout; convert pilots into operating standard.",
    accent: "#E7B02E",
  },
  {
    id: "Q4",
    title: "Q4 · Stretch",
    theme: "Heavy lifts that need the year to land.",
    accent: "#CA63D5",
  },
];

function classifyQuarter(o: OpportunityRow): Quarter {
  const eff = (o.effort ?? "").toLowerCase();
  const imp = (o.impact ?? "").toLowerCase();
  // Plan rule:
  // Q1: effort=low  AND impact in {high, medium}
  // Q2: effort=low  OR  (effort=medium AND impact=high)
  // Q3: effort=medium AND impact in {medium, low}
  // Q4: effort=high
  if (eff === "high") return "Q4";
  if (eff === "low" && (imp === "high" || imp === "medium")) return "Q1";
  if (eff === "low" || (eff === "medium" && imp === "high")) return "Q2";
  if (eff === "medium" && (imp === "medium" || imp === "low")) return "Q3";
  return "Q3";
}

function impactColor(impact: string): string {
  const i = (impact ?? "").toLowerCase();
  if (i === "high") return "#33C490";
  if (i === "medium") return "#E7B02E";
  return "#9696AA";
}

function effortColor(effort: string): string {
  const e = (effort ?? "").toLowerCase();
  if (e === "low") return "#33C490";
  if (e === "medium") return "#E7B02E";
  return "#E76363";
}

export function Slide13_Roadmap({ snapshot }: Props) {
  const opps = snapshot.opportunities.top;

  const buckets = useMemo(() => {
    const map: Record<Quarter, OpportunityRow[]> = {
      Q1: [],
      Q2: [],
      Q3: [],
      Q4: [],
    };
    const sorted = [...opps].sort((a, b) => {
      const sa = (a.strategicFit ?? 0.5) * (a.feasibility ?? 0.5);
      const sb = (b.strategicFit ?? 0.5) * (b.feasibility ?? 0.5);
      return sb - sa;
    });
    for (const o of sorted) {
      map[classifyQuarter(o)].push(o);
    }
    return map;
  }, [opps]);

  const totalChosen = opps.length;

  return (
    <SlideLayout
      eyebrow="Decide · 12-month roadmap"
      title="Twelve months. Four moves. Sequenced."
      subtitle="Effort and impact decide the lane — strategic fit × feasibility decides the order."
    >
      <div className="flex h-full flex-col gap-3">
        {/* Header strip */}
        <div className="flex shrink-0 items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-baseline gap-1.5">
              <span className="font-playfair text-2xl font-bold tabular-nums text-cream">
                {snapshot.opportunities.count}
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                opportunities considered
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-playfair text-xl font-bold tabular-nums text-[#33C490]">
                {totalChosen}
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                chosen for the next 12 months
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[9.5px] uppercase tracking-[0.18em] text-white/35">
            <CalendarRange size={11} className="text-[#33C490]" />
            Sequenced by effort × impact
          </div>
        </div>

        {opps.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.018] p-6">
            <div className="max-w-md text-center text-white/55">
              <Sparkles
                size={18}
                className="mx-auto mb-2 text-[#33C490]/70"
              />
              <p className="font-playfair text-base text-cream">
                Roadmap loading…
              </p>
              <p className="mt-1 text-[12px]">
                Run the strategic-opportunities pillar to populate the four
                quarters with sequenced moves.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-4">
            {QUARTERS.map((q, qi) => {
              const list = buckets[q.id];
              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.2 + qi * 0.1,
                    ease: EASE,
                  }}
                  className="relative flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/[0.06] p-3"
                  style={{
                    background:
                      "linear-gradient(160deg, rgba(17,34,64,0.55), rgba(7,17,34,0.85))",
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 12px 36px rgba(0,0,0,0.32), 0 0 24px ${q.accent}10`,
                  }}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-50"
                    style={{
                      background: `radial-gradient(circle, ${q.accent}22 0%, transparent 70%)`,
                    }}
                  />
                  <div className="relative z-10 flex shrink-0 items-baseline justify-between gap-2">
                    <h3
                      className="font-playfair text-[14px] font-bold leading-tight"
                      style={{ color: q.accent }}
                    >
                      {q.title}
                    </h3>
                    <span className="rounded-full bg-white/[0.05] px-2 py-[2px] text-[9.5px] tabular-nums text-white/55">
                      {list.length}
                    </span>
                  </div>
                  <div className="relative z-10 mt-1 line-clamp-2 text-[10.5px] leading-snug text-white/55">
                    {q.theme}
                  </div>

                  <div className="relative z-10 mt-2 flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-0.5">
                    {list.length === 0 && (
                      <div className="rounded-lg border border-dashed border-white/[0.06] p-2 text-center text-[10px] italic text-white/30">
                        No moves classified here.
                      </div>
                    )}
                    {list.map((o, i) => {
                      const score =
                        ((o.strategicFit ?? 0.5) * (o.feasibility ?? 0.5)) *
                        100;
                      return (
                        <motion.div
                          key={o.id}
                          initial={{ opacity: 0, y: 16, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{
                            duration: 0.4,
                            delay: 0.4 + qi * 0.1 + i * 0.08,
                            ease: EASE,
                          }}
                          className="rounded-lg border border-white/[0.06] bg-white/[0.025] p-2"
                          style={{
                            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.03), 0 4px 12px rgba(0,0,0,0.18)`,
                          }}
                        >
                          <div className="flex items-baseline justify-between gap-1.5">
                            <span
                              className="text-[8.5px] uppercase tracking-[0.18em]"
                              style={{ color: q.accent }}
                            >
                              {o.category || "Strategic move"}
                            </span>
                            <div className="flex shrink-0 items-center gap-1">
                              <Badge
                                label={o.impact || "?"}
                                color={impactColor(o.impact)}
                                title="Impact"
                              />
                              <Badge
                                label={o.effort || "?"}
                                color={effortColor(o.effort)}
                                title="Effort"
                              />
                            </div>
                          </div>
                          <div className="mt-1 line-clamp-2 font-playfair text-[12px] font-semibold leading-tight text-cream">
                            {o.title}
                          </div>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${Math.min(100, Math.max(0, score))}%`,
                                }}
                                transition={{
                                  duration: 0.7,
                                  delay: 0.6 + qi * 0.1 + i * 0.08,
                                  ease: EASE,
                                }}
                                className="absolute inset-y-0 left-0 rounded-full"
                                style={{ background: q.accent }}
                              />
                            </div>
                            <span className="w-7 text-right text-[9px] tabular-nums text-white/55">
                              {Math.round(score)}
                            </span>
                          </div>
                          {o.sourceSection && (
                            <div className="mt-1 truncate text-[9.5px] uppercase tracking-[0.16em] text-white/35">
                              Why now · {o.sourceSection}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}

            {/* Accumulation arrow */}
            <svg
              aria-hidden
              className="pointer-events-none absolute inset-x-2 -bottom-1 hidden h-3 w-[calc(100%-1rem)] lg:block"
              viewBox="0 0 1000 12"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="roadmap-wave" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#33C490" stopOpacity="0" />
                  <stop offset="20%" stopColor="#33C490" stopOpacity="0.45" />
                  <stop offset="50%" stopColor="#4899FF" stopOpacity="0.45" />
                  <stop offset="80%" stopColor="#E7B02E" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#CA63D5" stopOpacity="0" />
                </linearGradient>
              </defs>
              <motion.path
                d="M0 6 L1000 6"
                stroke="url(#roadmap-wave)"
                strokeWidth="1.6"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.4, delay: 1.0, ease: EASE }}
              />
            </svg>
          </div>
        )}
      </div>
    </SlideLayout>
  );
}

function Badge({
  label,
  color,
  title,
}: {
  label: string;
  color: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className="rounded-full px-1.5 py-[1px] text-[8.5px] uppercase tracking-[0.14em]"
      style={{
        background: `${color}1F`,
        color,
        border: `1px solid ${color}55`,
      }}
    >
      {label}
    </span>
  );
}
