"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Building2,
  Layers,
  BookOpen,
  ScrollText,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SlideLayout } from "./SlideLayout";
import { Counter } from "../charts/Counter";
import { personas } from "@/data/personas";
import type { BriefingSnapshot, PeerInstitutionRow } from "@/lib/briefing/types";

const EASE = [0.16, 1, 0.3, 1] as const;

interface Props {
  snapshot: BriefingSnapshot;
}

interface Stat {
  id: string;
  label: string;
  sub: string;
  value: number;
  icon: LucideIcon;
  color: string;
}

const REGION_ACCENT: Record<string, string> = {
  GCC: "#33C490",
  MENA: "#1B7A4A",
  Europe: "#4899FF",
  "Asia Pacific": "#2DD4BF",
  "Asia-Pacific": "#2DD4BF",
  Americas: "#C5A572",
  Africa: "#AA9CFF",
};

function regionColor(region: string): string {
  return REGION_ACCENT[region] ?? "#9696AA";
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
      id: "instruments",
      label: "Statutory instruments",
      sub: `${snapshot.mandate.articles} articles indexed`,
      value: snapshot.mandate.statutoryInstruments,
      icon: ScrollText,
      color: "rgba(255,200,120,0.85)",
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
      id: "personas",
      label: "Personas mapped",
      sub: "with full GPSSA journeys",
      value: personas.length,
      icon: Users,
      color: "rgba(125,185,164,0.85)",
    },
    {
      id: "sources",
      label: "Sources cited",
      sub: `${snapshot.sources.publishers} publishers`,
      value: snapshot.sources.count,
      icon: BookOpen,
      color: "rgba(197,165,114,0.85)",
    },
  ];

  // Top peer institutions to showcase. Prefer scored peers, push GPSSA itself
  // to the front if present so the audience sees "us first".
  const allPeers = snapshot.benchmarks.allPeers;
  const peerCount = allPeers.length;

  const featuredPeers: PeerInstitutionRow[] = useMemo(() => {
    const gpssa = allPeers.find((p) => p.isGpssa);
    const others = allPeers
      .filter((p) => !p.isGpssa)
      .sort((a, b) => {
        // Prefer scored peers, then by score desc.
        const aScored = a.averageScore != null ? 1 : 0;
        const bScored = b.averageScore != null ? 1 : 0;
        if (aScored !== bScored) return bScored - aScored;
        return (b.averageScore ?? 0) - (a.averageScore ?? 0);
      });
    const lineup: PeerInstitutionRow[] = [];
    if (gpssa) lineup.push(gpssa);
    lineup.push(...others);
    return lineup.slice(0, 12);
  }, [allPeers]);

  const regionsCovered = useMemo(() => {
    const set = new Set<string>();
    for (const p of allPeers) if (p.region) set.add(p.region);
    return set.size;
  }, [allPeers]);

  return (
    <SlideLayout
      eyebrow="Foundation · Evidence base"
      title="Every chart on this deck has a citation behind it."
      subtitle="No opinion, no guesswork — structured research scored against canonical standards, every claim traceable to source."
    >
      <div className="grid h-full max-w-6xl mx-auto grid-cols-12 gap-3">
        {/* Counter wall — 5 tiles in a 5-col strip across all 12 cols */}
        <div className="col-span-12 grid grid-cols-5 gap-3">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 18, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.25 + i * 0.07,
                  ease: EASE,
                }}
                className="relative overflow-hidden rounded-2xl px-4 py-3 ring-1 ring-white/[0.05]"
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

                <div className="relative flex h-full flex-col">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{
                      background: `linear-gradient(135deg, color-mix(in srgb, ${s.color} 22%, transparent), color-mix(in srgb, ${s.color} 6%, transparent))`,
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
                    }}
                  >
                    <Icon size={14} className="text-cream" strokeWidth={1.6} />
                  </div>

                  <div className="mt-3">
                    <Counter
                      value={s.value}
                      duration={1.8}
                      className="font-playfair text-3xl font-bold text-cream tabular-nums leading-none"
                    />
                    <div className="mt-1.5 text-[11.5px] font-medium text-cream/85">
                      {s.label}
                    </div>
                    <div className="text-[9.5px] uppercase tracking-[0.16em] text-white/40">
                      {s.sub}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Peer institutions showcase strip */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.7, ease: EASE }}
          className="col-span-12 relative overflow-hidden rounded-2xl ring-1 ring-white/[0.06]"
          style={{
            background:
              "linear-gradient(160deg, rgba(17,34,64,0.55), rgba(7,17,34,0.92))",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.05), 0 18px 50px rgba(0,0,0,0.22)",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-40"
            style={{
              background:
                "radial-gradient(circle, rgba(45,74,140,0.32) 0%, transparent 70%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -bottom-20 h-60 w-60 rounded-full opacity-40"
            style={{
              background:
                "radial-gradient(circle, rgba(0,168,107,0.22) 0%, transparent 70%)",
            }}
          />

          <div className="relative flex h-full flex-col gap-3 p-4">
            {/* Header */}
            <div className="flex items-end justify-between gap-3">
              <div className="flex items-baseline gap-3">
                <Building2 size={16} className="self-center text-[#33C490]" strokeWidth={1.7} />
                <Counter
                  value={peerCount}
                  className="font-playfair text-3xl font-bold tabular-nums leading-none text-cream"
                />
                <div>
                  <div className="text-[12px] font-medium text-cream/85">
                    Peer institutions in the benchmark library
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                    {regionsCovered} regions · {snapshot.benchmarks.dimensions} scoring dimensions
                  </div>
                </div>
              </div>
              <div className="hidden text-right text-[10px] uppercase tracking-[0.2em] text-white/40 lg:block">
                Showing top {featuredPeers.length}
              </div>
            </div>

            {/* Logo / tile row */}
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {featuredPeers.map((p, i) => {
                const accent = p.isGpssa ? "#33C490" : regionColor(p.region);
                const score = p.averageScore != null ? Math.round(p.averageScore) : null;
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.45,
                      delay: 0.95 + i * 0.05,
                      ease: EASE,
                    }}
                    className="relative overflow-hidden rounded-xl border px-2.5 py-2"
                    style={{
                      borderColor: p.isGpssa
                        ? "rgba(51,196,144,0.45)"
                        : "rgba(255,255,255,0.07)",
                      background: p.isGpssa
                        ? "linear-gradient(160deg, rgba(51,196,144,0.16), rgba(7,17,34,0.65))"
                        : "linear-gradient(160deg, rgba(255,255,255,0.04), rgba(7,17,34,0.55))",
                      boxShadow: p.isGpssa
                        ? "0 0 22px rgba(51,196,144,0.18)"
                        : undefined,
                    }}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className="text-[8.5px] font-semibold uppercase tracking-[0.16em]"
                        style={{ color: accent }}
                      >
                        {p.countryCode || p.region}
                      </span>
                      {score != null && (
                        <span className="font-playfair text-[12px] font-semibold tabular-nums text-cream/90">
                          {score}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 truncate text-[12px] font-semibold text-cream">
                      {p.shortName ?? p.name}
                    </div>
                    <div className="truncate text-[9.5px] uppercase tracking-[0.14em] text-white/40">
                      {p.country}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="text-center text-[9.5px] uppercase tracking-[0.2em] text-white/35">
              Scored on the same {snapshot.benchmarks.dimensions} dimensions as GPSSA — apples-to-apples comparison
            </div>
          </div>
        </motion.section>
      </div>
    </SlideLayout>
  );
}
