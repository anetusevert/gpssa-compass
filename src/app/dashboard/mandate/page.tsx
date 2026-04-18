"use client";

/**
 * Mandate — Overview (Act I)
 *
 * The cinematic landing for the Mandate pillar. It opens with a hero panel
 * (orbital glow, animated headline, count tiles, key milestones), invites the
 * analyst into 4 sub-acts (Legal Foundation, Scope, Obligations, History) and
 * offers a quick-access strip back to RFI Alignment.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Gavel,
  Landmark,
  ListChecks,
  History,
  Network,
  ShieldCheck,
  Sparkles,
  Loader2,
} from "lucide-react";
import { MandateHero } from "@/components/mandate/MandateHero";
import { LawCard } from "@/components/mandate/LawCard";

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
  featuredStandards: {
    id: string;
    slug: string;
    code: string | null;
    title: string;
    category: string;
    description: string | null;
    url: string | null;
    publishedAt: string | null;
    requirementCount: number;
  }[];
  latestMilestones: {
    id: string;
    year: number;
    date: string | null;
    title: string;
    description: string;
    kind: string;
    sourceUrl: string | null;
  }[];
}

const ACTS = [
  {
    href: "/dashboard/mandate/legal",
    icon: Gavel,
    title: "Legal Foundation",
    desc: "Federal laws, executive regulations and circulars decoded into plain English.",
    accent: "#00A86B",
  },
  {
    href: "/dashboard/mandate/scope",
    icon: ShieldCheck,
    title: "Scope",
    desc: "Who is covered, where, by which contingency — sectors, nationalities, branches.",
    accent: "#7DB9A4",
  },
  {
    href: "/dashboard/mandate/obligations",
    icon: ListChecks,
    title: "Obligations",
    desc: "Statutory duties tied to the GPSSA services, products and channels that deliver them.",
    accent: "#4899FF",
  },
  {
    href: "/dashboard/mandate/governance",
    icon: Landmark,
    title: "Governance",
    desc: "Board composition, supervision, oversight — how the mandate is steered and audited.",
    accent: "#C5A572",
  },
  {
    href: "/dashboard/mandate/history",
    icon: History,
    title: "History",
    desc: "Three decades of GPSSA milestones, reforms, agreements and recognitions.",
    accent: "#E7B02E",
  },
  {
    href: "/dashboard/mandate/rfi-alignment",
    icon: Network,
    title: "RFI Alignment",
    desc: "Cinematic three-column board: legal articles ↔ RFI 02-2026 ↔ app pillars.",
    accent: "#CA63D5",
  },
] as const;

export default function MandateOverviewPage() {
  const [data, setData] = useState<OverviewPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/mandate/overview")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        setData(d);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
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

  return (
    <div className="relative h-full overflow-y-auto">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 18% 14%, rgba(0,168,107,0.08) 0%, transparent 55%), radial-gradient(circle at 85% 88%, rgba(45,74,140,0.07) 0%, transparent 60%)",
        }}
      />

      <MandateHero counts={counts} />

      <section className="relative mx-auto max-w-7xl px-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-10 flex items-end justify-between gap-6"
        >
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-[#00A86B]">
              The mandate, six ways in
            </div>
            <h2 className="mt-1 font-playfair text-3xl font-semibold text-cream">
              Pick your lens
            </h2>
            <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-white/60">
              Each lens is a self-contained reading of the GPSSA mandate —
              built from publicly available primary sources and aligned to RFI
              02-2026.
            </p>
          </div>
        </motion.div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {ACTS.map((act, i) => {
            const Icon = act.icon;
            return (
              <motion.div
                key={act.href}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.05 * i }}
                whileHover={{ y: -4 }}
              >
                <Link
                  href={act.href}
                  className="group glass-panel relative flex h-full flex-col justify-between gap-4 overflow-hidden rounded-2xl border border-white/[0.04] p-5 transition-colors hover:border-white/[0.1]"
                  style={{
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 18px 38px rgba(0,0,0,0.32)",
                  }}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full opacity-50 transition-opacity duration-500 group-hover:opacity-90"
                    style={{ background: `radial-gradient(circle, ${act.accent}28 0%, transparent 70%)` }}
                  />
                  <div className="relative z-10 flex items-start gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        background: `linear-gradient(135deg, ${act.accent}26, ${act.accent}06)`,
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                      }}
                    >
                      <Icon size={16} style={{ color: act.accent }} strokeWidth={1.7} />
                    </div>
                    <div>
                      <h3 className="font-playfair text-lg font-semibold text-cream">
                        {act.title}
                      </h3>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-white/60">
                        {act.desc}
                      </p>
                    </div>
                  </div>
                  <div className="relative z-10 flex items-center justify-between text-[11px] text-white/45">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full" style={{ background: act.accent }} />
                      Open lens
                    </span>
                    <ArrowRight
                      size={14}
                      className="text-white/35 transition-transform group-hover:translate-x-1 group-hover:text-cream"
                    />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
          className="mt-16"
        >
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-[#00A86B]">
                Cornerstones
              </div>
              <h2 className="mt-1 font-playfair text-2xl font-semibold text-cream">
                Featured statutory instruments
              </h2>
            </div>
            <Link
              href="/dashboard/mandate/legal"
              className="inline-flex items-center gap-1 text-[12px] text-white/55 hover:text-cream"
            >
              See all <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div className="flex items-center gap-2 rounded-2xl border border-white/[0.05] bg-white/[0.015] p-8 text-[13px] text-white/45">
              <Loader2 size={14} className="animate-spin" /> Loading mandate corpus…
            </div>
          ) : data && data.featuredStandards.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {data.featuredStandards.map((s, i) => (
                <LawCard
                  key={s.id}
                  slug={s.slug}
                  title={s.title}
                  code={s.code}
                  category={s.category}
                  description={s.description}
                  url={s.url}
                  publishedAt={s.publishedAt}
                  requirementCount={s.requirementCount}
                  index={i}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/[0.05] bg-white/[0.015] p-8 text-[13px] text-white/55">
              <Sparkles size={14} className="mb-2 inline text-[#00A86B]" />
              <p>
                No statutory instruments indexed yet. Run the{" "}
                <Link href="/dashboard/admin/agents" className="text-cream underline">
                  GPSSA Mandate Corpus agent
                </Link>{" "}
                to scrape{" "}
                <a
                  href="https://gpssa.gov.ae/pages/en/laws-and-regulations"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-cream underline"
                >
                  gpssa.gov.ae/laws-and-regulations
                </a>{" "}
                and structure it into the Standard / StandardRequirement model.
              </p>
            </div>
          )}
        </motion.div>
      </section>
    </div>
  );
}
