"use client";

/**
 * Mandate — Scope.
 *
 * Visual answer to: "Who, where, against which contingencies?". Aggregates
 * StandardRequirement.pillar data into ILO C102 branches and overlays
 * coverage classes (UAE nationals, GCC nationals, civil/military sectors).
 */

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Globe2,
  Heart,
  HeartHandshake,
  HeartPulse,
  Loader2,
  Network as NetworkIcon,
  ShieldCheck,
  Sparkles,
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
    accent: "#00A86B",
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
    ilo: "FL 57/2023, Articles on coverage",
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
  { id: "uae-civil", label: "Emirati nationals — civil sector", note: "Federal & local government, semi-public, private sector employers" },
  { id: "uae-military", label: "Emirati nationals — military sector", note: "Specialised handling under sectoral regulations" },
  { id: "gcc-nationals", label: "GCC nationals", note: "Insurance extension across the GCC unified law" },
  { id: "voluntary", label: "Voluntary insurance", note: "Self-employed, sabbatical and overseas workers under specific articles" },
];

export default function MandateScopePage() {
  const [standards, setStandards] = useState<StandardSummary[]>([]);
  const [details, setDetails] = useState<Record<string, StandardDetail>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/mandate/standards")
      .then((r) => (r.ok ? r.json() : []))
      .then(async (list) => {
        if (cancelled || !Array.isArray(list)) return;
        setStandards(list);
        // pull details to count requirements per pillar
        const detailEntries = await Promise.all(
          list.slice(0, 12).map(async (s: StandardSummary) => {
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
    <div className="relative mx-auto max-w-7xl px-8 py-10">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
        className="mb-10 max-w-3xl"
      >
        <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-[#00A86B]">
          <ShieldCheck size={11} /> Mandate · Scope
        </div>
        <h1 className="mt-1 font-playfair text-3xl font-semibold text-cream">
          Who is covered, where, by which contingency
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-white/60">
          The GPSSA mandate covers six branches of social protection across
          four coverage classes. Each branch is anchored to specific articles
          in Federal Law No. 57 of 2023 and the GCC unified insurance extension
          framework.
        </p>
      </motion.header>

      <section>
        <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/55">
          <NetworkIcon size={11} /> Six branches
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BRANCHES.map((b, i) => {
            const Icon = b.Icon;
            const count = branchCounts[b.pillar] ?? 0;
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.05 }}
                className="glass-panel relative overflow-hidden rounded-2xl border border-white/[0.04] p-5"
                style={{
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 12px 32px rgba(0,0,0,0.28), 0 0 36px ${b.accent}10`,
                }}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-50"
                  style={{ background: `radial-gradient(circle, ${b.accent}26 0%, transparent 70%)` }}
                />
                <div className="relative z-10 flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: `linear-gradient(135deg, ${b.accent}28, ${b.accent}08)`,
                    }}
                  >
                    <Icon size={16} style={{ color: b.accent }} strokeWidth={1.7} />
                  </div>
                  <div>
                    <h3 className="font-playfair text-lg font-semibold text-cream">{b.label}</h3>
                    <div className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-white/45">
                      {b.ilo}
                    </div>
                  </div>
                </div>
                <p className="relative z-10 mt-3 text-[13px] leading-relaxed text-white/65">
                  {b.description}
                </p>
                <div className="relative z-10 mt-4 flex items-center justify-between text-[11px] text-white/45">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full" style={{ background: b.accent }} />
                    {loading
                      ? "Counting…"
                      : count > 0
                      ? `${count} indexed articles`
                      : "Awaiting agent indexing"}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/55">
          <Users size={11} /> Coverage classes
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {COVERAGE_CLASSES.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.1 + i * 0.05 }}
              className="glass-panel rounded-2xl border border-white/[0.04] p-5"
            >
              <div className="text-[11px] uppercase tracking-[0.22em] text-[#7DB9A4]">
                Coverage class
              </div>
              <h4 className="mt-1 font-playfair text-lg font-semibold text-cream">{c.label}</h4>
              <p className="mt-2 text-[13px] leading-relaxed text-white/60">{c.note}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {loading && (
        <div className="mt-10 flex items-center gap-2 text-[12px] text-white/45">
          <Loader2 size={12} className="animate-spin" /> Hydrating live counts from indexed
          articles…
        </div>
      )}
      {!loading && Object.keys(details).length === 0 && standards.length === 0 && (
        <div className="mt-10 rounded-2xl border border-white/[0.05] bg-white/[0.015] p-6 text-[13px] text-white/55">
          <Sparkles size={14} className="mb-2 inline text-[#00A86B]" />
          <p>
            No statutory data yet. Run the GPSSA Mandate Corpus agent to populate Standards,
            requirements and per-pillar coverage counts.
          </p>
        </div>
      )}
    </div>
  );
}
