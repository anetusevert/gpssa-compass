"use client";

/**
 * Mandate — Governance (single-viewport).
 *
 * Three vertical bands sharing min-h-0 flex partitioning so nothing overflows
 * the viewport: institutional architecture (4-up), three control pillars
 * (3-up), and governance instruments (compact 2/3-col grid, capped at 6).
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
    note: "Approves federal pension legislation & regulations.",
    Icon: Landmark,
    accent: "#1B7A4A",
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
    note: "Strategic direction, investment policy, regulations.",
    Icon: ShieldCheck,
    accent: "#4899FF",
  },
  {
    id: "dg",
    label: "Director General",
    note: "Day-to-day administration of the mandate.",
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
    accent: "#1B7A4A",
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
      standards
        .filter((s) => {
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
        })
        .slice(0, 6),
    [standards]
  );

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      {/* Compact header */}
      <header className="shrink-0 px-4 pt-3 pb-2 md:px-6 md:pt-4">
        <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-[#1B7A4A]">
          <Landmark size={11} /> Mandate · Governance
        </div>
        <h1 className="mt-0.5 truncate font-playfair text-xl font-semibold text-cream md:text-2xl">
          How the mandate is steered, supervised and audited
        </h1>
      </header>

      {/* Three vertical bands */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 pb-4 md:px-6 md:pb-6">
        {/* Band 1: Institutional architecture (4-up) */}
        <section className="flex min-h-0 shrink-0 flex-col">
          <div className="mb-1.5 text-[10px] uppercase tracking-[0.24em] text-white/55">
            Institutional architecture
          </div>
          <div className="relative overflow-hidden rounded-xl border border-white/[0.05] bg-white/[0.015] px-4 py-3">
            <div className="absolute inset-x-6 top-1/2 -z-10 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-[#1B7A4A]/40 to-transparent" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {ARCHITECTURE.map((node, i) => {
                const Icon = node.Icon;
                return (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: EASE, delay: 0.08 + i * 0.06 }}
                    className="flex items-center gap-2.5"
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        background: `linear-gradient(135deg, ${node.accent}28, ${node.accent}06)`,
                        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 0 14px ${node.accent}25`,
                      }}
                    >
                      <Icon size={14} style={{ color: node.accent }} strokeWidth={1.7} />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-playfair text-[13px] font-semibold leading-tight text-cream">
                        {node.label}
                      </div>
                      <div className="line-clamp-2 text-[10px] leading-snug text-white/55">
                        {node.note}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Band 2: Three control pillars (3-up) */}
        <section className="flex min-h-0 shrink-0 flex-col">
          <div className="mb-1.5 text-[10px] uppercase tracking-[0.24em] text-white/55">
            Three control pillars
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            {CONTROL_PILLARS.map((p, i) => {
              const Icon = p.Icon;
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: EASE, delay: 0.05 * i }}
                  className="glass-panel relative overflow-hidden rounded-xl border border-white/[0.05] p-3"
                  style={{
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 22px rgba(0,0,0,0.28), 0 0 24px ${p.accent}10`,
                  }}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                      style={{ background: `linear-gradient(135deg, ${p.accent}28, ${p.accent}08)` }}
                    >
                      <Icon size={13} style={{ color: p.accent }} strokeWidth={1.7} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-playfair text-[14px] font-semibold leading-tight text-cream">
                        {p.label}
                      </h3>
                      <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-white/60">
                        {p.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Band 3: Governance instruments (fills remaining space) */}
        <section className="flex min-h-0 flex-1 flex-col">
          <div className="mb-1.5 flex items-end justify-between gap-3">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/55">
              <ScrollText size={10} /> Governance instruments
            </div>
            <Link
              href="/dashboard/mandate/legal"
              className="inline-flex items-center gap-1 text-[10px] text-white/55 hover:text-cream"
            >
              See all <ArrowUpRight size={11} />
            </Link>
          </div>
          {loading ? (
            <div className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.015] text-[12px] text-white/45">
              <Loader2 size={13} className="animate-spin" /> Loading instruments…
            </div>
          ) : governanceStandards.length === 0 ? (
            <div className="flex flex-1 items-center rounded-xl border border-white/[0.05] bg-white/[0.015] p-4 text-[12px] text-white/55">
              <div>
                <Sparkles size={13} className="mb-1.5 inline text-[#1B7A4A]" />
                <p className="text-[11.5px]">
                  No governance-classified instruments yet. Run the mandate-corpus
                  agent to populate regulations, circulars and policies.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid min-h-0 flex-1 grid-cols-2 gap-2 xl:grid-cols-3">
              {governanceStandards.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: EASE, delay: 0.04 * i }}
                  className="min-h-0"
                >
                  <Link
                    href={`/dashboard/mandate/legal?slug=${encodeURIComponent(s.slug)}`}
                    className="group glass-panel relative flex h-full flex-col gap-1.5 overflow-hidden rounded-xl border border-white/[0.05] p-3 transition-colors hover:border-white/[0.14]"
                  >
                    <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-white/55">
                      <span className="text-[#1B7A4A]">{s.category}</span>
                      {s.code && <span className="truncate text-white/45">· {s.code}</span>}
                    </div>
                    <h4 className="line-clamp-2 font-playfair text-[13px] font-semibold leading-tight text-cream">
                      {s.title}
                    </h4>
                    {s.description && (
                      <p className="line-clamp-2 text-[11px] leading-snug text-white/60">
                        {s.description}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between text-[10px] text-white/45">
                      <span>{s.requirementCount} clauses</span>
                      <ArrowUpRight
                        size={11}
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
    </div>
  );
}
