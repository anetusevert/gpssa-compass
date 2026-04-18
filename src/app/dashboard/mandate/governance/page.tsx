"use client";

/**
 * Mandate — Governance.
 *
 * The "how the mandate is steered" lens. Combines:
 *   - a static institutional architecture (Council of Ministers → GPSSA Board
 *     → Director General) sourced from publicly available GPSSA pages;
 *   - any indexed governance/transparency Standards from the corpus;
 *   - the source page index so an analyst can audit provenance.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Building2,
  Eye,
  FileText,
  Landmark,
  Loader2,
  ScrollText,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

interface StandardSummary {
  id: string;
  slug: string;
  title: string;
  code: string | null;
  category: string;
  description: string | null;
  publishedAt: string | null;
  requirementCount: number;
  sources?: { id: string; title: string; url: string }[];
}

const ARCHITECTURE = [
  {
    id: "council-of-ministers",
    label: "UAE Council of Ministers",
    note: "Approves federal pension legislation and regulations.",
    Icon: Landmark,
    accent: "#00A86B",
  },
  {
    id: "moca",
    label: "Ministry overseeing GPSSA",
    note: "Sectoral oversight and policy coordination.",
    Icon: Building2,
    accent: "#7DB9A4",
  },
  {
    id: "board",
    label: "GPSSA Board of Directors",
    note: "Strategic direction, investment policy and approval of regulations.",
    Icon: ShieldCheck,
    accent: "#4899FF",
  },
  {
    id: "dg",
    label: "Director General",
    note: "Day-to-day administration and execution of the mandate.",
    Icon: UserCheck,
    accent: "#C5A572",
  },
] as const;

const CONTROL_PILLARS = [
  {
    id: "transparency",
    label: "Transparency",
    description: "Publication of laws, regulations, circulars and annual reports on gpssa.gov.ae.",
    Icon: Eye,
    accent: "#4899FF",
  },
  {
    id: "audit",
    label: "Audit & supervision",
    description: "Internal audit, statutory external audit and parliamentary oversight.",
    Icon: ShieldCheck,
    accent: "#00A86B",
  },
  {
    id: "redress",
    label: "Complaints & redress",
    description: "Insured complaint pathways and ombudsman-style escalation.",
    Icon: FileText,
    accent: "#E7B02E",
  },
] as const;

export default function MandateGovernancePage() {
  const [standards, setStandards] = useState<StandardSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/mandate/standards")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        if (cancelled) return;
        setStandards(Array.isArray(d) ? d : []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const governanceStandards = useMemo(
    () =>
      standards.filter((s) => {
        const t = (s.title ?? "").toLowerCase();
        const code = (s.code ?? "").toLowerCase();
        return (
          t.includes("governance") ||
          t.includes("transparen") ||
          t.includes("regulation") ||
          t.includes("circular") ||
          t.includes("policy") ||
          code.includes("circular")
        );
      }),
    [standards]
  );

  return (
    <div className="relative mx-auto max-w-7xl px-8 py-10">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
        className="mb-10 max-w-3xl"
      >
        <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-[#00A86B]">
          <Landmark size={11} /> Mandate · Governance
        </div>
        <h1 className="mt-1 font-playfair text-3xl font-semibold text-cream">
          How the mandate is steered, supervised and audited
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-white/60">
          GPSSA operates inside a layered governance architecture: federal
          statutory oversight, ministerial coordination, an independent board,
          executive leadership and three control pillars (transparency, audit,
          redress).
        </p>
      </motion.header>

      <section className="mb-12">
        <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/55">
          Institutional architecture
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.015] p-6">
          <div className="absolute inset-x-6 top-1/2 -z-10 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-[#00A86B]/40 to-transparent" />
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-4">
            {ARCHITECTURE.map((node, i) => {
              const Icon = node.Icon;
              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE, delay: 0.1 + i * 0.08 }}
                  className="flex flex-col items-center text-center"
                >
                  <div
                    className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{
                      background: `linear-gradient(135deg, ${node.accent}28, ${node.accent}06)`,
                      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 0 18px ${node.accent}25`,
                    }}
                  >
                    <Icon size={14} style={{ color: node.accent }} strokeWidth={1.7} />
                  </div>
                  <div className="font-playfair text-[15px] font-semibold text-cream">{node.label}</div>
                  <div className="mt-1 max-w-[200px] text-[11px] leading-snug text-white/55">
                    {node.note}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mb-12">
        <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/55">
          Three control pillars
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {CONTROL_PILLARS.map((p, i) => {
            const Icon = p.Icon;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.05 * i }}
                className="glass-panel relative overflow-hidden rounded-2xl border border-white/[0.04] p-5"
                style={{
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 12px 32px rgba(0,0,0,0.28), 0 0 36px ${p.accent}10`,
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{ background: `linear-gradient(135deg, ${p.accent}28, ${p.accent}08)` }}
                  >
                    <Icon size={14} style={{ color: p.accent }} strokeWidth={1.7} />
                  </div>
                  <div>
                    <h3 className="font-playfair text-lg font-semibold text-cream">{p.label}</h3>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-white/60">{p.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/55">
            <ScrollText size={11} /> Governance instruments in the corpus
          </div>
          <Link
            href="/dashboard/mandate/legal"
            className="inline-flex items-center gap-1 text-[12px] text-white/55 hover:text-cream"
          >
            All instruments <ArrowUpRight size={12} />
          </Link>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 rounded-2xl border border-white/[0.05] bg-white/[0.015] p-6 text-[13px] text-white/45">
            <Loader2 size={14} className="animate-spin" /> Loading governance instruments…
          </div>
        ) : governanceStandards.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.05] bg-white/[0.015] p-6 text-[13px] text-white/55">
            <Sparkles size={14} className="mb-2 inline text-[#00A86B]" />
            <p>
              No governance-classified instruments yet. The mandate-corpus
              agent populates regulations, circulars and policies as it
              processes the pages it scrapes.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {governanceStandards.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.04 * i }}
              >
                <Link
                  href={`/dashboard/mandate/legal?slug=${encodeURIComponent(s.slug)}`}
                  className="group glass-panel relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl border border-white/[0.04] p-4 transition-colors hover:border-white/[0.1]"
                >
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/55">
                    <span className="text-[#00A86B]">{s.category}</span>
                    {s.code && <span className="text-white/45">· {s.code}</span>}
                  </div>
                  <h4 className="font-playfair text-[15px] font-semibold text-cream">{s.title}</h4>
                  {s.description && (
                    <p className="line-clamp-3 text-[12px] leading-relaxed text-white/60">
                      {s.description}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between text-[11px] text-white/45">
                    <span>{s.requirementCount} clauses indexed</span>
                    <ArrowUpRight
                      size={12}
                      className="text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:text-cream"
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
