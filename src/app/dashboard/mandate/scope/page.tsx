"use client";

/**
 * Mandate — Scope (single-viewport).
 *
 * Side-by-side grid: Six branches (3x2) on the left, Coverage classes (2x2)
 * on the right. Header is a compact band so everything fits without scroll.
 */

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Globe2,
  Heart,
  HeartHandshake,
  HeartPulse,
  Network as NetworkIcon,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

interface StandardSummary {
  id: string;
  slug: string;
  title: string;
  category: string;
  requirementCount: number;
}

interface StandardDetail {
  slug: string;
  title: string;
  scope: string | null;
  requirements: { id: string; pillar: string | null; title: string }[];
}

interface BranchInfo {
  id: string;
  label: string;
  pillar: string;
  ilo: string;
  description: string;
  Icon: LucideIcon;
  accent: string;
}

const BRANCHES: BranchInfo[] = [
  {
    id: "old-age",
    label: "Old-age pension",
    pillar: "pension",
    ilo: "ILO C102 · Part V",
    description: "Lifetime income for insured Emiratis on reaching the legal pension age.",
    Icon: HeartPulse,
    accent: "#1B7A4A",
  },
  {
    id: "end-of-service",
    label: "End-of-service",
    pillar: "end-of-service",
    ilo: "GCC Unified Insurance Extension Law",
    description: "Lump-sum / pension on separation for civil and military insured persons.",
    Icon: ShieldCheck,
    accent: "#E7B02E",
  },
  {
    id: "injury",
    label: "Workplace injury",
    pillar: "injury",
    ilo: "ILO C102 · Part VI",
    description: "Medical care, temporary incapacity, permanent disability and rehabilitation.",
    Icon: HeartHandshake,
    accent: "#E76363",
  },
  {
    id: "death",
    label: "Survivor benefits",
    pillar: "death",
    ilo: "ILO C102 · Part X",
    description: "Pensions and lump-sums for the family of a deceased insured person.",
    Icon: Heart,
    accent: "#9696AA",
  },
  {
    id: "registration",
    label: "Registration & contributions",
    pillar: "registration",
    ilo: "FL 57/2023 — coverage articles",
    description: "Mandatory enrolment of employers and insured persons; monthly contributions.",
    Icon: Briefcase,
    accent: "#4899FF",
  },
  {
    id: "gcc",
    label: "GCC mobility",
    pillar: "gcc",
    ilo: "GCC Unified Insurance Extension",
    description: "Cross-border continuity of insurance for GCC nationals working in the UAE.",
    Icon: Globe2,
    accent: "#CA63D5",
  },
];

const COVERAGE_CLASSES = [
  { id: "uae-civil", label: "Emirati nationals — civil sector", note: "Federal & local government, semi-public, private sector employers", accent: "#1B7A4A" },
  { id: "uae-military", label: "Emirati nationals — military sector", note: "Specialised handling under sectoral regulations", accent: "#E7B02E" },
  { id: "gcc-nationals", label: "GCC nationals", note: "Insurance extension across the GCC unified law", accent: "#CA63D5" },
  { id: "voluntary", label: "Voluntary insurance", note: "Self-employed, sabbatical and overseas workers under specific articles", accent: "#7DB9A4" },
];

export default function MandateScopePage() {
  const [, setStandards] = useState<StandardSummary[]>([]);
  const [details, setDetails] = useState<Record<string, StandardDetail>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/mandate/standards")
      .then((r) => (r.ok ? r.json() : []))
      .then(async (list) => {
        if (cancelled || !Array.isArray(list)) return;
        setStandards(list);
        const detailEntries = await Promise.all(
          list.slice(0, 8).map(async (s: StandardSummary) => {
            try {
              const r = await fetch(`/api/mandate/standards/${encodeURIComponent(s.slug)}`);
              if (!r.ok) return [s.slug, null] as const;
              const d = await r.json();
              return [s.slug, d as StandardDetail] as const;
            } catch {
              return [s.slug, null] as const;
            }
          })
        );
        if (cancelled) return;
        const map: Record<string, StandardDetail> = {};
        for (const [slug, d] of detailEntries) {
          if (d) map[slug] = d;
        }
        setDetails(map);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const branchCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const d of Object.values(details)) {
      for (const r of d.requirements) {
        if (!r.pillar) continue;
        counts[r.pillar] = (counts[r.pillar] ?? 0) + 1;
      }
    }
    return counts;
  }, [details]);

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      {/* Compact header band */}
      <header className="shrink-0 px-4 pt-3 pb-2 md:px-6 md:pt-4">
        <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-[#1B7A4A]">
          <ShieldCheck size={11} /> Mandate · Scope
        </div>
        <h1 className="mt-0.5 truncate font-playfair text-xl font-semibold text-cream md:text-2xl">
          Who is covered, where, by which contingency
        </h1>
      </header>

      {/* Side-by-side grid: 3fr + 2fr */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 px-4 pb-4 md:px-6 md:pb-6 lg:grid-cols-[3fr_2fr]">
        {/* LEFT: Six branches 3x2 */}
        <section className="flex min-h-0 flex-col">
          <div className="mb-1.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/55">
            <NetworkIcon size={10} /> Six branches
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-3 gap-2 lg:grid-cols-3 lg:grid-rows-2">
            {BRANCHES.map((b, i) => {
              const Icon = b.Icon;
              const count = branchCounts[b.pillar] ?? 0;
              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE, delay: i * 0.04 }}
                  className="glass-panel relative flex min-h-0 flex-col overflow-hidden rounded-xl border border-white/[0.05] p-3"
                  style={{
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.28), 0 0 24px ${b.accent}10`,
                  }}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full opacity-50"
                    style={{ background: `radial-gradient(circle, ${b.accent}28 0%, transparent 70%)` }}
                  />
                  <div className="relative z-10 flex items-start gap-2">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: `linear-gradient(135deg, ${b.accent}28, ${b.accent}08)` }}
                    >
                      <Icon size={14} style={{ color: b.accent }} strokeWidth={1.7} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-playfair text-[14px] font-semibold leading-tight text-cream">{b.label}</h3>
                      <div className="mt-0.5 truncate text-[9px] uppercase tracking-[0.18em] text-white/45">
                        {b.ilo}
                      </div>
                    </div>
                  </div>
                  <p className="relative z-10 mt-1.5 line-clamp-2 text-[11.5px] leading-snug text-white/65">
                    {b.description}
                  </p>
                  <div className="relative z-10 mt-auto pt-1.5 text-[10px] text-white/45">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full" style={{ background: b.accent }} />
                      {loading
                        ? "Counting…"
                        : count > 0
                        ? `${count} indexed articles`
                        : "Awaiting indexing"}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* RIGHT: Coverage classes 2x2 */}
        <section className="flex min-h-0 flex-col">
          <div className="mb-1.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/55">
            <Users size={10} /> Coverage classes
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-2">
            {COVERAGE_CLASSES.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE, delay: 0.1 + i * 0.05 }}
                className="glass-panel relative flex min-h-0 flex-col overflow-hidden rounded-xl border border-white/[0.05] p-3"
                style={{
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.28), 0 0 24px ${c.accent}10`,
                }}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -left-10 -bottom-10 h-24 w-24 rounded-full opacity-40"
                  style={{ background: `radial-gradient(circle, ${c.accent}28 0%, transparent 70%)` }}
                />
                <div className="relative z-10 text-[9px] uppercase tracking-[0.22em]" style={{ color: c.accent }}>
                  Coverage class
                </div>
                <h4 className="relative z-10 mt-0.5 font-playfair text-[14px] font-semibold leading-tight text-cream">
                  {c.label}
                </h4>
                <p className="relative z-10 mt-1 line-clamp-3 text-[11.5px] leading-snug text-white/60">
                  {c.note}
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
