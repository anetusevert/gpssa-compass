"use client";

import { motion } from "framer-motion";
import {
  Globe,
  Building2,
  Layers,
  BookOpen,
  Cpu,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SlideLayout } from "./SlideLayout";
import { Counter } from "../charts/Counter";
import type { BriefingSnapshot } from "@/lib/briefing/types";

const EASE = [0.16, 1, 0.3, 1] as const;

interface Props {
  snapshot: BriefingSnapshot;
}

interface Stat {
  id: string;
  label: string;
  sub: string;
  value: number;
  format?: (n: number) => string;
  icon: LucideIcon;
  color: string;
}

function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return Math.round(n).toLocaleString("en-US");
}

export function Slide04_Evidence({ snapshot }: Props) {
  const stats: Stat[] = [
    {
      id: "countries",
      label: "Nations researched",
      sub: `of ${snapshot.atlas.countryCount} tracked`,
      value: snapshot.atlas.researchedCount,
      icon: Globe,
      color: "rgba(0,168,107,0.85)",
    },
    {
      id: "institutions",
      label: "Peer institutions",
      sub: "benchmark targets",
      value: snapshot.benchmarks.peers.length,
      icon: Building2,
      color: "rgba(45,74,140,0.85)",
    },
    {
      id: "services",
      label: "Services analyzed",
      sub: `${snapshot.standards.evaluatedCount} compliance scores`,
      value: snapshot.services.count,
      icon: Layers,
      color: "rgba(45,212,191,0.85)",
    },
    {
      id: "sources",
      label: "Sources cited",
      sub: `${snapshot.sources.publishers} publishers`,
      value: snapshot.sources.count,
      icon: BookOpen,
      color: "rgba(197,165,114,0.85)",
    },
    {
      id: "agents",
      label: "Agent executions",
      sub: `${snapshot.meta.orchestratorRunsCompleted} orchestrator runs`,
      value: snapshot.meta.agentExecutions,
      icon: Cpu,
      color: "rgba(170,156,255,0.85)",
    },
    {
      id: "tokens",
      label: "Tokens consumed",
      sub: "across all models",
      value: snapshot.meta.totalTokens,
      format: compact,
      icon: Sparkles,
      color: "rgba(255,156,170,0.85)",
    },
  ];

  return (
    <SlideLayout
      eyebrow="The Evidence Base"
      title="Built on a thousand verified data points."
      subtitle="The Compass is not opinion. It's an aggregation of structured research, scored against canonical standards, every claim traceable to source."
    >
      <div className="grid h-full max-w-5xl mx-auto grid-cols-3 grid-rows-2 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.6,
                delay: 0.3 + i * 0.08,
                ease: EASE,
              }}
              className="relative overflow-hidden rounded-2xl px-6 py-5 ring-1 ring-white/[0.05]"
              style={{
                background:
                  "linear-gradient(160deg, rgba(17,34,64,0.55), rgba(7,17,34,0.85))",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.05), 0 14px 40px rgba(0,0,0,0.18)",
              }}
            >
              <motion.div
                className="pointer-events-none absolute -right-12 -top-10 h-32 w-32 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${s.color} 0%, transparent 70%)`,
                  opacity: 0.12,
                }}
                animate={{ scale: [1, 1.12, 1] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3,
                }}
              />

              <div className="relative flex flex-col h-full">
                <div className="flex items-center justify-between">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{
                      background: `linear-gradient(135deg, color-mix(in srgb, ${s.color} 22%, transparent), color-mix(in srgb, ${s.color} 6%, transparent))`,
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
                    }}
                  >
                    <Icon size={16} className="text-cream" strokeWidth={1.6} />
                  </div>
                </div>

                <div className="mt-auto">
                  <Counter
                    value={s.value}
                    format={s.format}
                    duration={1.8}
                    className="font-playfair text-5xl font-bold text-cream tabular-nums leading-none"
                  />
                  <div className="mt-2 text-[12px] font-medium text-cream/85">
                    {s.label}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">
                    {s.sub}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </SlideLayout>
  );
}
