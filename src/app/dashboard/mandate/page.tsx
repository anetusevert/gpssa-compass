"use client";

/**
 * Mandate — Hub
 *
 * Single-viewport landing for the Mandate pillar. Compact header + slim count
 * strip, then four centered tiles (Legal Foundation, Scope, Governance,
 * History) styled like the home dashboard's Services / Products / Delivery
 * pillar tiles — icon-on-top, title centered, subtitle, accent count chip.
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  Gavel,
  Landmark,
  History as HistoryIcon,
  ShieldCheck,
  Scale,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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

interface StandardLite {
  id: string;
  slug?: string | null;
  code?: string | null;
  title?: string | null;
  category?: string | null;
}

interface TilePreview {
  headline: string;
  bullets: string[];
}

interface TileDef {
  href: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  accent: string;
  glow: string;
  countLabel: string;
  preview: TilePreview;
}

const GOVERNANCE_RE = /governance|transparen|regulation|circular|policy/i;

export default function MandateHubPage() {
  const [data, setData] = useState<OverviewPayload | null>(null);
  const [standards, setStandards] = useState<StandardLite[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/mandate/overview")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        setData(d);
      })
      .catch(() => {});
    fetch("/api/mandate/standards")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: unknown) => {
        if (cancelled) return;
        if (Array.isArray(d)) setStandards(d as StandardLite[]);
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

  const governanceCount = useMemo(() => {
    if (!standards) return 0;
    return standards.filter((s) => {
      const haystack = `${s.title ?? ""} ${s.code ?? ""} ${s.category ?? ""}`;
      return GOVERNANCE_RE.test(haystack);
    }).length;
  }, [standards]);

  const tiles: TileDef[] = [
    {
      href: "/dashboard/mandate/legal",
      icon: Gavel,
      title: "Legal Foundation",
      subtitle: "Federal laws, regulations & circulars",
      accent: "#1B7A4A",
      glow: "rgba(27,122,74,0.22)",
      countLabel: `${counts.standards} instruments`,
      preview: {
        headline: "Read the law, article by article.",
        bullets: [
          "Browse all federal laws, regulations and circulars",
          `Search across ${counts.requirements || 189}+ articles with full text and source PDFs`,
          "See how each obligation links to services, products and channels",
          "Filter by category — laws, circulars or policies",
        ],
      },
    },
    {
      href: "/dashboard/mandate/scope",
      icon: ShieldCheck,
      title: "Scope",
      subtitle: "Branches, sectors & coverage classes",
      accent: "#7DB9A4",
      glow: "rgba(125,185,164,0.22)",
      countLabel: "6 branches · 4 classes",
      preview: {
        headline: "Who is covered, where, by which contingency.",
        bullets: [
          "6 contingency branches: old-age, end-of-service, injury, survivor, registration, GCC mobility",
          "ILO and federal-law references for every branch",
          "4 coverage classes: Emirati civil, military, GCC nationals, voluntary",
          "Per-branch count of indexed articles in the corpus",
        ],
      },
    },
    {
      href: "/dashboard/mandate/governance",
      icon: Landmark,
      title: "Governance",
      subtitle: "Architecture, oversight & control",
      accent: "#C5A572",
      glow: "rgba(197,165,114,0.22)",
      countLabel:
        governanceCount > 0
          ? `${governanceCount} governance instruments`
          : "View architecture",
      preview: {
        headline: "How the mandate is steered, supervised and audited.",
        bullets: [
          "Institutional architecture: Council of Ministers, ministry, GPSSA board, DG",
          "Three control pillars — transparency, audit, complaints & redress",
          "Key governance instruments with article counts",
          "Deep links into the underlying statutory text",
        ],
      },
    },
    {
      href: "/dashboard/mandate/history",
      icon: HistoryIcon,
      title: "History",
      subtitle: "Three decades of milestones",
      accent: "#E7B02E",
      glow: "rgba(231,176,46,0.22)",
      countLabel: `${counts.milestones || 18} milestones`,
      preview: {
        headline: "Three decades of milestones, told as a story.",
        bullets: [
          "Full-screen story mode with autoplay and keyboard navigation",
          "Milestones tagged by kind — reform, agreement, recognition, announcement",
          "Year scrubber to jump across decades",
          "Each scene links back to its original source",
        ],
      },
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

      {/* Header — entry hero */}
      <header className="shrink-0 px-4 pt-5 pb-3 md:px-6 md:pt-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="text-[10px] uppercase tracking-[0.32em] text-[#1B7A4A]"
        >
          Mandate
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.05 }}
          className="mt-1.5 font-playfair text-2xl font-semibold leading-tight text-cream md:text-3xl"
        >
          <Scale
            size={22}
            className="-mt-1 mr-2 inline text-[#1B7A4A]"
            strokeWidth={2}
          />
          The mandate that anchors every service, product and channel.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE, delay: 0.12 }}
          className="mt-2 max-w-2xl text-[13px] leading-relaxed text-white/55"
        >
          Every law, branch, governance role and milestone behind GPSSA — explore each pillar.
        </motion.p>
      </header>

      {/* Centered 4-tile grid (home-page PillarTile style) */}
      <div className="flex min-h-0 flex-1 items-center justify-center px-4 pb-4 pt-2 md:px-6 md:pb-6">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
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
  const reduceMotion = useReducedMotion();
  const Icon = tile.icon;
  const [hovered, setHovered] = useState(false);

  const overlayDuration = reduceMotion ? 0 : 0.32;
  const bulletStagger = reduceMotion ? 0 : 0.04;

  return (
    <motion.div
      className="relative aspect-[3/4] w-full"
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: EASE, delay: 0.1 + index * 0.08 }}
    >
      <motion.button
        type="button"
        onClick={() => router.push(tile.href)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        aria-label={`${tile.title} — ${tile.preview.headline}`}
        className="glass-pillar group absolute inset-0 overflow-hidden rounded-[20px] text-left"
        whileHover={reduceMotion ? undefined : { y: -6, scale: 1.02 }}
        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
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
          animate={
            reduceMotion
              ? undefined
              : { x: [0, 8, 0], y: [0, -6, 0], scale: [1, 1.08, 1] }
          }
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
          animate={reduceMotion ? undefined : { x: [0, 10, 0], y: [0, -8, 0] }}
          transition={{ duration: 10 + index, ease: "easeInOut", repeat: Infinity }}
        />

        {/* Resting content — dims when hovered so the overlay reads cleanly */}
        <motion.div
          className="relative z-10 flex h-full flex-col items-center justify-between gap-2 px-4 py-5 text-center"
          animate={{ opacity: hovered ? 0.18 : 1 }}
          transition={{ duration: overlayDuration, ease: EASE }}
        >
          {/* Icon + title block */}
          <div className="flex flex-col items-center gap-2.5">
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
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-2.5 py-1.5 text-[10px] text-white/55">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: tile.accent }}
              />
              {tile.countLabel}
            </span>
          </div>
        </motion.div>

        {/* Hover overlay — "What you'll find" preview */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              key="overlay"
              className="pointer-events-none absolute inset-0 z-20 flex flex-col rounded-[20px] px-5 py-6"
              style={{
                background:
                  "linear-gradient(180deg, rgba(12,20,24,0.88) 0%, rgba(12,20,24,0.94) 100%)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                borderTop: `1px solid ${tile.accent}55`,
                boxShadow: `inset 0 1px 0 ${tile.accent}25, 0 18px 48px rgba(0,0,0,0.4)`,
              }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: overlayDuration, ease: EASE }}
            >
              <div
                className="text-[10px] font-semibold uppercase tracking-[0.28em]"
                style={{ color: tile.accent }}
              >
                What you&rsquo;ll find
              </div>

              <div className="mt-2 font-playfair text-[15px] font-semibold leading-snug text-cream">
                {tile.preview.headline}
              </div>

              <ul className="mt-3 flex flex-1 flex-col gap-2">
                {tile.preview.bullets.map((b, i) => (
                  <motion.li
                    key={b}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: overlayDuration,
                      ease: EASE,
                      delay: 0.08 + i * bulletStagger,
                    }}
                    className="flex items-start gap-2 text-[12.5px] leading-snug text-white/85"
                  >
                    <ChevronRight
                      size={13}
                      strokeWidth={2.2}
                      className="mt-[2px] shrink-0"
                      style={{ color: tile.accent }}
                    />
                    <span>{b}</span>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.06] px-2.5 py-1.5 text-[10px] text-white/70">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: tile.accent }}
                  />
                  {tile.countLabel}
                </span>
                <span
                  className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
                  style={{ color: tile.accent }}
                >
                  Open
                  <ArrowRight size={12} strokeWidth={2.2} />
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}
