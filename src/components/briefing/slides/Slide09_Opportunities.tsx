"use client";

import { motion } from "framer-motion";
import { Lightbulb, Target, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SlideLayout } from "./SlideLayout";
import { SlidePlaceholder } from "../SlidePlaceholder";
import type { BriefingSnapshot, OpportunityRow } from "@/lib/briefing/types";

interface Props {
  snapshot: BriefingSnapshot;
}

const EASE = [0.16, 1, 0.3, 1] as const;

const ICON_BY_INDEX: LucideIcon[] = [Target, Zap, Lightbulb];
const COLOR_BY_INDEX = [
  "rgba(0,168,107,0.85)",
  "rgba(45,74,140,0.85)",
  "rgba(197,165,114,0.85)",
];

const ROTATIONS = [-7, 0, 7];

function impactScore(o: OpportunityRow): number {
  const fit = o.strategicFit ?? 0.5;
  const feas = o.feasibility ?? 0.5;
  return Math.round(fit * feas * 100);
}

function impactLabel(impact: string): string {
  switch (impact) {
    case "high":
      return "High";
    case "low":
      return "Low";
    default:
      return "Medium";
  }
}

export function Slide09_Opportunities({ snapshot }: Props) {
  const top = snapshot.opportunities.top.slice(0, 3);

  if (top.length === 0) {
    return (
      <SlidePlaceholder
        pillar="Strategic Opportunities"
        done={0}
        total={Math.max(snapshot.opportunities.count, 5)}
        message="The Compass surfaces ranked opportunities once the gap-analysis agents have synthesised findings from Atlas, Services, and Standards."
      />
    );
  }

  // Pad to three so the fan layout stays balanced
  const padded: (OpportunityRow | null)[] = [...top];
  while (padded.length < 3) padded.push(null);

  const totalImpact = top.reduce((s, o) => s + impactScore(o), 0);
  const headline =
    top.length >= 3
      ? `Three moves drive ${totalImpact}% of the upside.`
      : `${top.length} priority move${top.length === 1 ? "" : "s"} surfaced.`;

  return (
    <SlideLayout
      eyebrow="Top Opportunities"
      title={headline}
      subtitle={`Ranked by strategic fit x feasibility, drawn from ${snapshot.opportunities.count} opportunities synthesised across the platform.`}
    >
      <div className="flex h-full items-center justify-center">
        <div className="relative flex items-center justify-center gap-4 max-w-5xl">
          {padded.map((opp, i) => {
            if (!opp) {
              return (
                <div key={`empty-${i}`} className="w-[300px] h-[380px] opacity-0" />
              );
            }
            const Icon = ICON_BY_INDEX[i] ?? Lightbulb;
            const color = COLOR_BY_INDEX[i] ?? "rgba(255,255,255,0.6)";
            const rotation = ROTATIONS[i] ?? 0;
            const score = impactScore(opp);

            return (
              <motion.div
                key={opp.id}
                initial={{
                  opacity: 0,
                  y: 60,
                  rotate: 0,
                  scale: 0.85,
                }}
                animate={{
                  opacity: 1,
                  y: i === 1 ? -10 : 0,
                  rotate: rotation,
                  scale: 1,
                }}
                transition={{
                  duration: 0.85,
                  delay: 0.4 + i * 0.18,
                  ease: EASE,
                }}
                whileHover={{
                  rotate: 0,
                  y: -16,
                  scale: 1.04,
                  transition: { duration: 0.25, ease: EASE },
                }}
                className="relative w-[300px] rounded-3xl overflow-hidden ring-1 ring-white/[0.06]"
                style={{
                  background:
                    "linear-gradient(160deg, rgba(19,34,64,0.9), rgba(7,17,34,0.96))",
                  boxShadow: `0 24px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04), 0 0 80px color-mix(in srgb, ${color} 14%, transparent)`,
                }}
              >
                <motion.div
                  className="pointer-events-none absolute -right-12 -top-10 h-40 w-40 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                    opacity: 0.15,
                  }}
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.4,
                  }}
                />

                <div className="relative flex flex-col h-[380px] p-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{
                        background: `linear-gradient(135deg, color-mix(in srgb, ${color} 30%, transparent), color-mix(in srgb, ${color} 8%, transparent))`,
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
                      }}
                    >
                      <Icon size={18} className="text-cream" strokeWidth={1.6} />
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                      #{i + 1} · {opp.category}
                    </div>
                  </div>

                  <h3 className="mt-4 font-playfair text-2xl font-bold text-cream leading-tight">
                    {opp.title}
                  </h3>

                  {opp.description && (
                    <p className="mt-3 text-[12px] leading-relaxed text-white/60 line-clamp-4">
                      {opp.description}
                    </p>
                  )}

                  <div className="mt-auto pt-4">
                    {/* Impact x Feasibility quadrant marker */}
                    <div className="text-[10px] uppercase tracking-[0.16em] text-white/40 mb-2">
                      Impact x Feasibility
                    </div>
                    <div className="relative h-16 rounded-lg bg-white/[0.03] ring-1 ring-white/[0.04]">
                      {/* Quadrant grid */}
                      <div className="absolute inset-0">
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/[0.06]" />
                        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/[0.06]" />
                      </div>
                      {/* Marker */}
                      <motion.div
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                        style={{
                          left: `${(opp.feasibility ?? 0.5) * 100}%`,
                          top: `${(1 - (opp.strategicFit ?? 0.5)) * 100}%`,
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          duration: 0.5,
                          delay: 0.7 + i * 0.18,
                          ease: EASE,
                        }}
                      >
                        <motion.div
                          className="h-3 w-3 rounded-full"
                          style={{
                            background: color,
                            boxShadow: `0 0 12px color-mix(in srgb, ${color} 60%, transparent)`,
                          }}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      </motion.div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 text-white/55">
                        <span className="text-white/35">Impact</span>
                        <span className="text-cream font-medium">
                          {impactLabel(opp.impact)}
                        </span>
                      </div>
                      <div
                        className="font-playfair text-2xl font-bold tabular-nums"
                        style={{ color: "rgba(232,240,245,0.95)" }}
                      >
                        {score}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </SlideLayout>
  );
}
