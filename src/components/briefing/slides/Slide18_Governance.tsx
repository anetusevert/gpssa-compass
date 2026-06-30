"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Network, CalendarClock, Map } from "lucide-react";
import { SlideLayout } from "./SlideLayout";

const EASE = [0.16, 1, 0.3, 1] as const;

interface Forum {
  id: string;
  name: string;
  tier: number;
  cadence: string;
  purpose?: string | null;
}
interface Phase {
  id: string;
  name: string;
  workstream?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

const TIER_COLOR: Record<number, string> = {
  1: "#00A86B",
  2: "#2DD4BF",
  3: "#C5A572",
  4: "#E9A23B",
};

export function Slide18_Governance() {
  const [forums, setForums] = useState<Forum[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/governance/forums", { cache: "no-store" }).then((r) => (r.ok ? r.json() : [])),
      fetch("/api/roadmap", { cache: "no-store" }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([f, p]) => {
        if (cancelled) return;
        if (Array.isArray(f)) setForums(f);
        if (Array.isArray(p)) setPhases(p);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const byTier = [1, 2, 3, 4].map((t) => ({
    tier: t,
    forums: forums.filter((f) => f.tier === t),
  }));
  const aCount = phases.filter((p) => p.workstream === "A").length || 6;
  const bCount = phases.filter((p) => p.workstream === "B").length || 5;

  const fallbackTiers = [
    { tier: 1, label: "Daily front-line huddle", cadence: "daily" },
    { tier: 2, label: "Daily supervisor stand-up", cadence: "daily" },
    { tier: 3, label: "Weekly operations review", cadence: "weekly" },
    { tier: 4, label: "Monthly steering / QBR", cadence: "monthly" },
  ];

  return (
    <SlideLayout
      eyebrow="Workstream B · Governance & Roadmap"
      title="A management rhythm that sustains the gains"
      subtitle="Tiered daily-management routines, a sector-wide RACI, a federated Centre of Excellence — and a practical 20-week, two-workstream roadmap."
      align="left"
    >
      <div className="grid h-full grid-cols-12 gap-6">
        {/* Tiered governance */}
        <div className="col-span-7 flex flex-col justify-center gap-3">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-gray-muted">
            <CalendarClock size={13} className="text-[#2DD4BF]" /> Tiered management routines
          </div>
          <div className="flex flex-col gap-2">
            {byTier.map((row, i) => {
              const f = row.forums[0];
              const label = f?.name ?? fallbackTiers[i].label;
              const cadence = f?.cadence ?? fallbackTiers[i].cadence;
              return (
                <motion.div
                  key={row.tier}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.1 + i * 0.08, ease: EASE }}
                  className="glass flex items-center gap-3 rounded-xl px-4 py-3"
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold"
                    style={{ background: `${TIER_COLOR[row.tier]}22`, color: TIER_COLOR[row.tier] }}
                  >
                    T{row.tier}
                  </span>
                  <div className="flex-1">
                    <div className="text-[13px] text-cream">{label}</div>
                    <div className="text-[10px] uppercase tracking-wide text-gray-muted">{cadence}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[#00A86B]/20 bg-[#00A86B]/[0.06] px-4 py-2 text-[11px] text-white/70">
            <Network size={13} className="text-[#00A86B]" />
            Federated Centre of Excellence · sector-wide RACI · capability transfer to ≥6-month sustainment
          </div>
        </div>

        {/* Roadmap */}
        <div className="col-span-5 flex flex-col justify-center gap-3">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-gray-muted">
            <Map size={13} className="text-[#C5A572]" /> 12-month roadmap
          </div>
          <div className="glass-card flex flex-col gap-4 p-5">
            <div className="flex items-end justify-around">
              <div className="text-center">
                <div className="font-playfair text-4xl font-bold text-cream">{aCount}</div>
                <div className="text-[10px] uppercase tracking-wide text-[#2D4A8C]">Workstream A phases</div>
                <div className="text-[10px] text-gray-muted">Product & Service Roadmap</div>
              </div>
              <div className="h-12 w-px bg-white/10" />
              <div className="text-center">
                <div className="font-playfair text-4xl font-bold text-cream">{bCount}</div>
                <div className="text-[10px] uppercase tracking-wide text-[#2DD4BF]">Workstream B phases</div>
                <div className="text-[10px] text-gray-muted">QA & Fulfilment Framework</div>
              </div>
            </div>
            <div className="h-px bg-white/[0.06]" />
            <div className="text-center text-[12px] text-white/60">
              Diagnostic → Design → Pilot → Full deployment → Capability transfer · <span className="text-cream">20 weeks</span>
            </div>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}
