"use client";

/**
 * Mandate — Hub
 *
 * The single-viewport landing for the Mandate pillar. A compact header sits on
 * top of a slim count strip; below it, four horizontal navigation bars
 * (matching the home dashboard's Mandate/Atlas bar style) route to the four
 * lenses (Legal Foundation, Scope, Governance, History).
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
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

interface BarDef {
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

  const bars: BarDef[] = [
    {
      href: "/dashboard/mandate/legal",
      icon: Gavel,
      title: "Legal Foundation",
      subtitle: "Federal laws, executive regulations and circulars decoded into plain English.",
      accent: "#1B7A4A",
      glow: "rgba(27,122,74,0.22)",
      countLabel: `${counts.standards} instruments · ${counts.requirements} articles`,
    },
    {
      href: "/dashboard/mandate/scope",
      icon: ShieldCheck,
      title: "Scope",
      subtitle: "Who is covered, where, by which contingency — sectors, nationalities, branches.",
      accent: "#7DB9A4",
      glow: "rgba(125,185,164,0.22)",
      countLabel: "Six branches · four coverage classes",
    },
    {
      href: "/dashboard/mandate/governance",
      icon: Landmark,
      title: "Governance",
      subtitle: "Board composition, supervision, oversight — how the mandate is steered and audited.",
      accent: "#C5A572",
      glow: "rgba(197,165,114,0.22)",
      countLabel: `${counts.obligationLinks} obligation links`,
    },
    {
      href: "/dashboard/mandate/history",
      icon: HistoryIcon,
      title: "History",
      subtitle: "Three decades of GPSSA milestones, reforms, agreements and recognitions.",
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
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.28em] text-[#1B7A4A]">
              Mandate
            </div>
            <h1 className="mt-0.5 truncate font-playfair text-xl font-semibold text-cream md:text-2xl">
              <Scale size={18} className="-mt-0.5 mr-2 inline text-[#1B7A4A]" strokeWidth={2} />
              The mandate that anchors every service, product and channel.
            </h1>
          </div>
        </div>
      </header>

      {/* Slim count strip */}
      <div className="shrink-0 px-4 md:px-6">
        <MandateHero counts={counts} />
      </div>

      {/* Stacked horizontal bars (home-page style) */}
      <div className="min-h-0 flex-1 px-4 pb-4 pt-3 md:px-6 md:pb-6">
        <div className="flex h-full flex-col justify-center gap-2.5">
          {bars.map((bar, i) => (
            <NavBar key={bar.href} bar={bar} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function NavBar({ bar, index }: { bar: BarDef; index: number }) {
  const router = useRouter();
  const Icon = bar.icon;

  return (
    <motion.button
      onClick={() => router.push(bar.href)}
      className="shimmer-border glass-bar group relative w-full overflow-hidden rounded-2xl text-left"
      initial={{ opacity: 0, y: -16, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: EASE, delay: 0.05 + index * 0.07 }}
      whileHover={{ scale: 1.008, y: -1 }}
      whileTap={{ scale: 0.997 }}
    >
      {/* Top-right ambient orb (kind-tinted) */}
      <motion.div
        className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-50"
        style={{
          background: `radial-gradient(circle, ${bar.glow} 0%, transparent 70%)`,
        }}
        animate={{ x: [0, -16, 0], y: [0, 6, 0], scale: [1, 1.18, 1] }}
        transition={{ duration: 9 + index, ease: "easeInOut", repeat: Infinity }}
      />
      {/* Bottom-left ambient orb */}
      <motion.div
        className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full opacity-30"
        style={{
          background: `radial-gradient(circle, ${bar.glow} 0%, transparent 70%)`,
        }}
        animate={{ x: [0, 14, 0], y: [0, -6, 0] }}
        transition={{ duration: 11 + index, ease: "easeInOut", repeat: Infinity }}
      />

      <div className="relative z-10 flex items-center gap-4 px-5 py-3.5 md:px-6">
        {/* Icon */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${bar.accent}30, ${bar.accent}08)`,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.15)",
          }}
        >
          <Icon size={18} style={{ color: bar.accent }} strokeWidth={1.6} />
        </div>

        {/* Title + subtitle */}
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="font-playfair text-lg font-bold leading-tight text-cream">
            {bar.title}
          </h3>
          <p className="mt-0.5 line-clamp-1 text-[12px] text-white/55">
            {bar.subtitle}
          </p>
        </div>

        {/* Count chip (hidden on small screens) */}
        <div className="mr-1 hidden items-center md:flex">
          <span
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-2.5 py-1.5 text-[11px] text-white/55 transition-colors duration-200 group-hover:bg-white/[0.08] group-hover:text-white/80"
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: bar.accent }}
            />
            {bar.countLabel}
          </span>
        </div>

        {/* Arrow */}
        <motion.div
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.04] transition-colors duration-200 group-hover:bg-white/[0.08]"
          animate={{ x: [0, 3, 0] }}
          transition={{ duration: 2 + index * 0.2, ease: "easeInOut", repeat: Infinity }}
        >
          <ArrowRight
            size={14}
            className="text-white/50 transition-colors duration-200 group-hover:text-white/85"
          />
        </motion.div>
      </div>
    </motion.button>
  );
}
