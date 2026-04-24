"use client";

import { motion } from "framer-motion";
import {
  Users2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Globe2,
} from "lucide-react";
import { SlideLayout } from "./SlideLayout";
import { personas, getCoverageStatus } from "@/data/personas";
import { PersonaCard } from "@/components/personas";
import type { BriefingSnapshot } from "@/lib/briefing/types";

const EASE = [0.16, 1, 0.3, 1] as const;

interface Props {
  snapshot: BriefingSnapshot;
}

const COVERAGE_TEMPLATE = [
  {
    status: "full" as const,
    label: "Full coverage",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: CheckCircle2,
  },
  {
    status: "partial" as const,
    label: "Partial",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: AlertTriangle,
  },
  {
    status: "none" as const,
    label: "No coverage",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    icon: XCircle,
  },
];

export function Slide06_Personas({ snapshot }: Props) {
  void snapshot;
  const coverageCounts = COVERAGE_TEMPLATE.map((c) => ({
    ...c,
    count: personas.filter((p) => getCoverageStatus(p) === c.status).length,
  }));

  return (
    <SlideLayout
      eyebrow="UAE today · Personas"
      title="Ten personas. Ten journeys."
      subtitle="The same lens used in the GPSSA Compass — every benefit lived from the inside, mapped to the ILO labor taxonomy."
    >
      <div className="flex h-full flex-col gap-3">
        {/* Dashboard-style header strip */}
        <motion.header
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-navy/40 px-3 py-2 backdrop-blur"
        >
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg border border-teal/30 bg-gradient-to-br from-teal/20 to-gpssa-green/20 p-1.5">
              <Users2 className="h-4 w-4 text-teal" />
            </div>
            <div>
              <div className="font-playfair text-[13px] font-semibold leading-tight text-cream">
                GPSSA Social Insurance Personas
              </div>
              <div className="text-[10px] text-gray-muted">
                Ten segments aligned to ILO labor taxonomy — from full GPSSA pension to zero coverage.
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {coverageCounts.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.status}
                  className={`flex items-center gap-1.5 rounded-full border ${c.border} ${c.bg} px-2 py-0.5`}
                >
                  <Icon className={`h-3 w-3 ${c.color}`} />
                  <span className="text-[10px] text-white/65">{c.label}:</span>
                  <span className={`text-[10px] font-semibold ${c.color}`}>
                    {c.count}
                  </span>
                </div>
              );
            })}
            <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-navy-light/60 px-2 py-0.5">
              <Globe2 className="h-3 w-3 text-white/40" />
              <span className="text-[10px] text-white/40">2025</span>
            </div>
          </div>
        </motion.header>

        {/* Personas grid — same component used on the dashboard */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
          className="grid min-h-0 flex-1 grid-cols-5 grid-rows-2 gap-3"
        >
          {personas.map((persona, index) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              index={index}
              onClick={() => {}}
            />
          ))}
        </motion.div>
      </div>
    </SlideLayout>
  );
}
