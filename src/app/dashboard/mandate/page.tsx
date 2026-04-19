"use client";

/**
 * Mandate — Legal & Governance Hub
 *
 * The single-viewport landing for the Mandate pillar. A compact header sits on
 * top of a slim count strip; below it, four cinematic tiles route to the four
 * lenses (Legal Foundation, Scope, Governance, History). No document scroll.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Gavel,
  Landmark,
  History as HistoryIcon,
  ShieldCheck,
  Scale,
} from "lucide-react";
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
  icon: typeof Gavel;
  title: string;
  desc: string;
  accent: string;
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
      desc: "Federal laws, executive regulations and circulars decoded into plain English.",
      accent: "#1B7A4A",
      countLabel: `${counts.standards} instruments · ${counts.requirements} articles`,
    },
    {
      href: "/dashboard/mandate/scope",
      icon: ShieldCheck,
      title: "Scope",
      desc: "Who is covered, where, by which contingency — sectors, nationalities, branches.",
      accent: "#7DB9A4",
      countLabel: "Six branches · four coverage classes",
    },
    {
      href: "/dashboard/mandate/governance",
      icon: Landmark,
      title: "Governance",
      desc: "Board composition, supervision, oversight — how the mandate is steered and audited.",
      accent: "#C5A572",
      countLabel: `${counts.obligationLinks} obligation links`,
    },
    {
      href: "/dashboard/mandate/history",
      icon: HistoryIcon,
      title: "History",
      desc: "Three decades of GPSSA milestones, reforms, agreements and recognitions.",
      accent: "#E7B02E",
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
              Mandate · Legal &amp; Governance
            </div>
            <h1 className="mt-0.5 truncate font-playfair text-xl font-semibold text-cream md:text-2xl">
              <Scale size={18} className="-mt-0.5 mr-2 inline text-[#1B7A4A]" strokeWidth={2} />
              The mandate that anchors every service, product and channel.
            </h1>
          </div>
          <Link
            href="/dashboard/mandate/rfi-alignment"
            className="hidden shrink-0 items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-[11px] text-white/70 transition-colors hover:border-white/[0.16] hover:text-cream md:inline-flex"
          >
            RFI Alignment
            <ArrowRight size={12} />
          </Link>
        </div>
      </header>

      {/* Slim count strip */}
      <div className="shrink-0 px-4 md:px-6">
        <MandateHero counts={counts} />
      </div>

      {/* 2x2 cinematic tile grid */}
      <div className="min-h-0 flex-1 px-4 pb-4 pt-3 md:px-6 md:pb-6">
        <div className="grid h-full grid-cols-1 grid-rows-4 gap-3 md:grid-cols-2 md:grid-rows-2">
          {tiles.map((tile, i) => (
            <Tile key={tile.href} tile={tile} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Tile({ tile, index }: { tile: TileDef; index: number }) {
  const Icon = tile.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: EASE, delay: 0.08 * index }}
      whileHover={{ y: -3 }}
      className="min-h-0"
    >
      <Link
        href={tile.href}
        className="group glass-panel relative flex h-full flex-col justify-between gap-3 overflow-hidden rounded-2xl border border-white/[0.05] p-5 transition-colors hover:border-white/[0.14]"
        style={{
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 22px 48px rgba(0,0,0,0.36)",
        }}
      >
        {/* Ambient orb */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-50 transition-all duration-500 group-hover:scale-110 group-hover:opacity-90"
          style={{ background: `radial-gradient(circle, ${tile.accent}30 0%, transparent 70%)` }}
        />
        {/* Bottom accent line */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
          style={{ background: `linear-gradient(90deg, transparent, ${tile.accent}, transparent)` }}
        />

        <div className="relative z-10 flex items-start gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{
              background: `linear-gradient(135deg, ${tile.accent}26, ${tile.accent}06)`,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            <Icon size={18} style={{ color: tile.accent }} strokeWidth={1.7} />
          </div>
          <div className="min-w-0">
            <h3 className="font-playfair text-xl font-semibold leading-tight text-cream md:text-2xl">
              {tile.title}
            </h3>
            <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-white/60">
              {tile.desc}
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-[11px]">
          <span className="inline-flex items-center gap-1.5 text-white/55">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: tile.accent }} />
            {tile.countLabel}
          </span>
          <span className="inline-flex items-center gap-1 text-white/45 transition-colors group-hover:text-cream">
            Open
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
