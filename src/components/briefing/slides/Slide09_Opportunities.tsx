"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  Globe,
  ScrollText,
  Building2,
  Lightbulb,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { SlideLayout } from "./SlideLayout";
import type { BriefingSnapshot } from "@/lib/briefing/types";

interface Props {
  snapshot: BriefingSnapshot;
}

const EASE = [0.16, 1, 0.3, 1] as const;
const STAGE_DURATION_MS = 600;
const CYCLE_DURATION_MS = 9000;

interface StageDef {
  key: "question" | "atlas" | "standards" | "peers" | "opportunity";
  label: string;
  icon: LucideIcon;
  color: string;
}

const STAGES: StageDef[] = [
  { key: "question", label: "Question", icon: HelpCircle, color: "#C5A572" },
  { key: "atlas", label: "Atlas", icon: Globe, color: "#2DD4BF" },
  { key: "standards", label: "Standards", icon: ScrollText, color: "#AA9CFF" },
  { key: "peers", label: "Peers", icon: Building2, color: "#3b82f6" },
  { key: "opportunity", label: "Opportunity", icon: Lightbulb, color: "#00A86B" },
];

interface ScriptedExample {
  question: string;
  atlas: (s: BriefingSnapshot) => string;
  standards: (s: BriefingSnapshot) => string;
  peers: (s: BriefingSnapshot) => string;
  opportunity: { headline: string; cta: string };
}

const EXAMPLES: ScriptedExample[] = [
  {
    question: "Should GPSSA lead on parametric retirement income?",
    atlas: (s) =>
      `${s.atlas.countryCount} nations scanned · 11 already operate parametric retirement mechanisms.`,
    standards: () =>
      `ILO C102 + ISSA Guidelines support parametric design as a sustainability lever.`,
    peers: (s) => {
      const top = s.benchmarks.peers.find((p) => p.averageScore != null);
      const name = top?.shortName ?? top?.name ?? "Singapore CPF";
      return `Frontier peer ${name} reports +${
        top?.averageScore ? Math.round(top.averageScore - 50) : 18
      } pts above average on adequacy.`;
    },
    opportunity: {
      headline:
        "Pilot a parametric annuity tier for high-income members within 18 months.",
      cta: "Open the Opportunities workbench",
    },
  },
  {
    question: "How can GPSSA close the digital service gap with Singapore CPF?",
    atlas: (s) =>
      `${s.services.count} services mapped across ${s.delivery.channels.length || 7} channels — gaps geo-tagged.`,
    standards: (s) =>
      `Digital benchmarks score GPSSA at ${
        Math.round(s.standards.gpssaMetrics?.digitalReadiness ?? 65) || 65
      }/100; leader frontier sits at 92.`,
    peers: () =>
      `CPF Singapore delivers 89% of services fully on mobile vs. ~62% at GPSSA today.`,
    opportunity: {
      headline:
        "Re-platform 8 high-traffic services to mobile-first within the next budget cycle.",
      cta: "Open the Service x Channel matrix",
    },
  },
];

export function Slide09_Opportunities({ snapshot }: Props) {
  const [exampleIdx, setExampleIdx] = useState(0);
  const [stage, setStage] = useState(0); // 0..STAGES.length

  // Drive stage progression within a cycle.
  useEffect(() => {
    setStage(0);
    const stageTimer = setInterval(() => {
      setStage((s) => (s < STAGES.length ? s + 1 : s));
    }, STAGE_DURATION_MS);
    return () => clearInterval(stageTimer);
  }, [exampleIdx]);

  // Cycle to the next example after CYCLE_DURATION_MS.
  useEffect(() => {
    const cycleTimer = setTimeout(() => {
      setExampleIdx((i) => (i + 1) % EXAMPLES.length);
    }, CYCLE_DURATION_MS);
    return () => clearTimeout(cycleTimer);
  }, [exampleIdx]);

  const example = EXAMPLES[exampleIdx];

  const stageContent = useMemo(
    () => ({
      question: example.question,
      atlas: example.atlas(snapshot),
      standards: example.standards(snapshot),
      peers: example.peers(snapshot),
      opportunity: example.opportunity,
    }),
    [example, snapshot]
  );

  return (
    <SlideLayout
      eyebrow="From question to decision"
      title="From question to decision in four moves."
      subtitle="This is how Compass turns a strategic question into a sourced, scored recommendation."
    >
      <div className="flex h-full flex-col items-stretch justify-center gap-7 max-w-6xl mx-auto">
        {/* Example dots */}
        <div className="flex items-center justify-center gap-2">
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setExampleIdx(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === exampleIdx
                  ? "w-10 bg-[#33C490]"
                  : "w-2 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Show example ${i + 1}`}
            />
          ))}
        </div>

        {/* Pipeline */}
        <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr] items-stretch gap-2">
          {STAGES.map((s, i) => (
            <PipelineNode
              key={`${exampleIdx}-${s.key}`}
              stage={s}
              active={stage > i}
              isOpportunity={s.key === "opportunity"}
            >
              <StageBody
                stageKey={s.key}
                content={stageContent}
                visible={stage > i}
              />
            </PipelineNode>
          )).flatMap((node, i) => {
            if (i === STAGES.length - 1) return [node];
            return [
              node,
              <Arrow key={`arrow-${i}-${exampleIdx}`} active={stage > i + 1} />,
            ];
          })}
        </div>
      </div>
    </SlideLayout>
  );
}

function PipelineNode({
  stage,
  active,
  isOpportunity,
  children,
}: {
  stage: StageDef;
  active: boolean;
  isOpportunity?: boolean;
  children: React.ReactNode;
}) {
  const Icon = stage.icon;
  return (
    <motion.div
      className={`relative flex flex-col rounded-2xl ring-1 ring-white/[0.06] transition-all`}
      style={{
        background: active
          ? `linear-gradient(160deg, color-mix(in srgb, ${stage.color} 14%, rgba(7,17,34,0.92)), rgba(7,17,34,0.96))`
          : "linear-gradient(160deg, rgba(19,34,64,0.45), rgba(7,17,34,0.85))",
        boxShadow: active
          ? `0 0 32px color-mix(in srgb, ${stage.color} 22%, transparent), inset 0 1px 0 rgba(255,255,255,0.05)`
          : "inset 0 1px 0 rgba(255,255,255,0.03)",
        minHeight: 240,
      }}
      initial={{ opacity: 0.5, scale: 0.96 }}
      animate={{ opacity: active ? 1 : 0.45, scale: active ? 1 : 0.96 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      <div className="flex items-center gap-2 px-4 pt-4">
        <motion.div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{
            background: `linear-gradient(135deg, color-mix(in srgb, ${stage.color} 35%, transparent), color-mix(in srgb, ${stage.color} 8%, transparent))`,
          }}
          animate={
            active
              ? {
                  boxShadow: [
                    `0 0 0px ${stage.color}00`,
                    `0 0 12px color-mix(in srgb, ${stage.color} 55%, transparent)`,
                    `0 0 0px ${stage.color}00`,
                  ],
                }
              : {}
          }
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon size={13} className="text-cream" strokeWidth={1.7} />
        </motion.div>
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: active ? stage.color : "rgba(255,255,255,0.4)" }}
        >
          {stage.label}
        </span>
      </div>
      <div className={`flex-1 px-4 pb-4 pt-2 ${isOpportunity ? "" : ""}`}>
        {children}
      </div>
    </motion.div>
  );
}

function StageBody({
  stageKey,
  content,
  visible,
}: {
  stageKey: StageDef["key"];
  content: {
    question: string;
    atlas: string;
    standards: string;
    peers: string;
    opportunity: { headline: string; cta: string };
  };
  visible: boolean;
}) {
  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          key="body"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="flex h-full flex-col"
        >
          {stageKey === "question" && (
            <p className="font-playfair text-[15px] font-semibold leading-snug text-cream">
              “{content.question}”
            </p>
          )}
          {stageKey === "atlas" && (
            <p className="text-[12px] leading-relaxed text-white/75">
              {content.atlas}
            </p>
          )}
          {stageKey === "standards" && (
            <p className="text-[12px] leading-relaxed text-white/75">
              {content.standards}
            </p>
          )}
          {stageKey === "peers" && (
            <p className="text-[12px] leading-relaxed text-white/75">
              {content.peers}
            </p>
          )}
          {stageKey === "opportunity" && (
            <div className="flex h-full flex-col">
              <p className="font-playfair text-[15px] font-semibold leading-snug text-cream">
                {content.opportunity.headline}
              </p>
              <div className="mt-auto pt-3">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#00A86B]/15 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-[#33C490] ring-1 ring-[#00A86B]/30">
                  <Lightbulb size={11} />
                  Recommended action
                </div>
                <div className="mt-2 text-[11px] leading-relaxed text-white/65">
                  {content.opportunity.cta}.
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Arrow({ active }: { active: boolean }) {
  return (
    <div className="flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0.2, scale: 0.85 }}
        animate={{
          opacity: active ? 1 : 0.2,
          scale: active ? 1 : 0.85,
        }}
        transition={{ duration: 0.45, ease: EASE }}
        className="relative"
      >
        <ArrowRight
          size={18}
          className={active ? "text-[#33C490]" : "text-white/25"}
          strokeWidth={2}
        />
        {active && (
          <motion.div
            className="absolute inset-0 -z-10 rounded-full"
            animate={{
              boxShadow: [
                "0 0 0 rgba(45,212,191,0)",
                "0 0 14px rgba(45,212,191,0.55)",
                "0 0 0 rgba(45,212,191,0)",
              ],
            }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </motion.div>
    </div>
  );
}
