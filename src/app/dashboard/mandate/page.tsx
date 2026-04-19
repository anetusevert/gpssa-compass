"use client";

/**
 * Mandate — Hub
 *
 * Single-viewport landing for the Mandate pillar. Compact header + slim count
 * strip, then four centered tiles (Legal Foundation, Scope, Governance,
 * History) styled like the home dashboard's Services / Products / Delivery
 * pillar tiles — icon-on-top, title centered, subtitle, accent count chip.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Gavel,
  Landmark,
  History as HistoryIcon,
  ShieldCheck,
  Scale,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MandateHero } from "@/components/mandate/MandateHero";

const EASE = [0.16, 1, 0.3, 1] as const;

interface OverviewPayload {
  counts: {
    standards: number;
    requirements: number;
    milestones: number;
    sourcePages: number;
    pdfPages: number;
    obligationLinks: number;
  };
  featuredStandards: { id: string }[];
  latestMilestones: { id: string }[];
}

interface TileDef {
  href: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  accent: string;
  glow: string;
  countLabel: string;
}

export default function MandateHubPage() {
  const [data, setData] = useState<OverviewPayload | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/mandate/overview")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        setData(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = data?.counts ?? {
    standards: 0,
    requirements: 0,
    milestones: 0,
    sourcePages: 0,
    pdfPages: 0,
    obligationLinks: 0,
  };

  const tiles: TileDef[] = [
    {
      href: "/dashboard/mandate/legal",
      icon: Gavel,
      title: "Legal Foundation",
      subtitle: "Federal laws, regulations & circulars",
      accent: "#1B7A4A",
      glow: "rgba(27,122,74,0.22)",
      countLabel: `${counts.standards} instruments`,
    },
    {
      href: "/dashboard/mandate/scope",
      icon: ShieldCheck,
      title: "Scope",
      subtitle: "Branches, sectors & coverage classes",
      accent: "#7DB9A4",
      glow: "rgba(125,185,164,0.22)",
      countLabel: "6 branches · 4 classes",
    },
    {
      href: "/dashboard/mandate/governance",
      icon: Landmark,
      title: "Governance",
      subtitle: "Architecture, oversight & control",
      accent: "#C5A572",
      glow: "rgba(197,165,114,0.22)",
      countLabel: `${counts.obligationLinks} obligation links`,
    },
    {
      href: "/dashboard/mandate/history",
      icon: HistoryIcon,
      title: "History",
      subtitle: "Three decades of milestones",
      accent: "#E7B02E",
      glow: "rgba(231,176,46,0.22)",
      countLabel: `${counts.milestones || 18} milestones`,
    },
  ];

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 18% 14%, rgba(27,122,74,0.08) 0%, transparent 55%), radial-gradient(circle at 85% 88%, rgba(45,74,140,0.07) 0%, transparent 60%)",
        }}
      />

      {/* Compact header */}
      <header className="shrink-0 px-4 pt-3 pb-2 md:px-6 md:pt-4">
        <div className="text-[10px] uppercase tracking-[0.28em] text-[#1B7A4A]">
          Mandate
        </div>
        <h1 className="mt-0.5 truncate font-playfair text-xl font-semibold text-cream md:text-2xl">
          <Scale size={18} className="-mt-0.5 mr-2 inline text-[#1B7A4A]" strokeWidth={2} />
          The mandate that anchors every service, product and channel.
        </h1>
      </header>

      {/* Slim count strip */}
      <div className="shrink-0 px-4 md:px-6">
        <MandateHero counts={counts} />
      </div>

      {/* Centered 4-tile grid (home-page PillarTile style) */}
      <div className="min-h-0 flex-1 px-4 pb-4 pt-3 md:px-6 md:pb-6">
        <div className="mx-auto grid h-full max-w-6xl grid-cols-2 items-stretch justify-items-stretch gap-3 sm:grid-cols-4">
          {tiles.map((tile, i) => (
            <PillarTile key={tile.href} tile={tile} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PillarTile({ tile, index }: { tile: TileDef; index: number }) {
  const router = useRouter();
  const Icon = tile.icon;

  return (
    <motion.div
      className="relative h-full"
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: EASE, delay: 0.1 + index * 0.08 }}
    >
      <motion.button
        onClick={() => router.push(tile.href)}
        className="glass-pillar group relative h-full w-full overflow-hidden rounded-[20px] text-left"
        whileHover={{ y: -6, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Top-right ambient orb */}
        <motion.div
          className="pointer-events-none absolute rounded-full"
          style={{
            width: 180,
            height: 180,
            right: -40,
            top: -40,
            background: `radial-gradient(circle, ${tile.glow} 0%, transparent 70%)`,
            opacity: 0.45,
          }}
          animate={{ x: [0, 8, 0], y: [0, -6, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 9 + index, ease: "easeInOut", repeat: Infinity }}
        />
        {/* Bottom-left ambient orb */}
        <motion.div
          className="pointer-events-none absolute rounded-full"
          style={{
            width: 120,
            height: 120,
            left: -30,
            bottom: -30,
            background: `radial-gradient(circle, ${tile.glow} 0%, transparent 70%)`,
            opacity: 0.18,
          }}
          animate={{ x: [0, 10, 0], y: [0, -8, 0] }}
          transition={{ duration: 10 + index, ease: "easeInOut", repeat: Infinity }}
        />

        <div className="relative z-10 flex h-full flex-col items-center justify-between gap-3 px-5 py-7 text-center">
          {/* Icon + title block */}
          <div className="flex flex-col items-center gap-3">
            <motion.div
              className="flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{
                background: `linear-gradient(135deg, ${tile.accent}28, ${tile.accent}08)`,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.2)",
              }}
            >
              <Icon
                size={22}
                style={{ color: tile.accent }}
                strokeWidth={1.4}
              />
            </motion.div>

            <div>
              <h3 className="font-playfair text-lg font-bold text-cream">
                {tile.title}
              </h3>
              <p className="mt-0.5 line-clamp-2 text-[11px] text-white/40">
                {tile.subtitle}
              </p>
            </div>
          </div>

          {/* Count chip at bottom (mirrors home tile sub-pills) */}
          <div className="mt-1 flex flex-wrap items-center justify-center gap-1.5">
            <span
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-2.5 py-1.5 text-[10px] text-white/55 transition-all duration-200 group-hover:bg-white/[0.1] group-hover:text-white/85"
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: tile.accent }}
              />
              {tile.countLabel}
            </span>
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
}
