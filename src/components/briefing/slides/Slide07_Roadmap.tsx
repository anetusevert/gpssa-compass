"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { SlideLayout } from "./SlideLayout";
import { RaceBar, type RaceBarRow } from "../charts/RaceBar";
import type { BriefingSnapshot } from "@/lib/briefing/types";

const EASE = [0.16, 1, 0.3, 1] as const;

interface Props {
  snapshot: BriefingSnapshot;
}

const PHASES = [
  { id: "p1", label: "Diagnose", weeks: "W1–4", color: "#2DD4BF" },
  { id: "p2", label: "Design", weeks: "W5–10", color: "#4899FF" },
  { id: "p3", label: "Pilot", weeks: "W11–16", color: "#C5A572" },
  { id: "p4", label: "Scale", weeks: "W17–20", color: "#00A86B" },
];

export function Slide07_Roadmap({ snapshot }: Props) {
  const rows: RaceBarRow[] = useMemo(() => {
    const top = snapshot.opportunities.top.slice(0, 5);
    if (top.length === 0) {
      return [
        { id: "1", label: "Digital self-service", sub: "High impact", value: 92, color: "#00A86B", highlight: true },
        { id: "2", label: "Parametric product tier", sub: "Strategic", value: 84, color: "#2DD4BF" },
        { id: "3", label: "Channel unification", sub: "Efficiency", value: 78, color: "#C5A572" },
        { id: "4", label: "Persona journey fix", sub: "CX", value: 71, color: "#4899FF" },
        { id: "5", label: "QA sampling roll-out", sub: "Assurance", value: 66, color: "#E9A23B" },
      ];
    }
    const colors = ["#00A86B", "#2DD4BF", "#C5A572", "#4899FF", "#E9A23B"];
    return top.map((o, i) => ({
      id: o.id,
      label: o.title.length > 28 ? o.title.slice(0, 26) + "…" : o.title,
      sub: o.category || o.impact,
      value: Math.round(
        ((o.strategicFit ?? 70) + (o.feasibility ?? 60)) / 2
      ),
      color: colors[i % colors.length],
      highlight: i === 0,
    }));
  }, [snapshot.opportunities.top]);

  return (
    <SlideLayout
      eyebrow="Prioritise & plan"
      title="From backlog to a dual-workstream roadmap."
      subtitle="RICE-ranked opportunities feed a 20-week / 12-month plan — Compass turns diagnosis into a sequenced ask."
      align="left"
    >
      <div className="grid h-full grid-cols-12 gap-6">
        <div className="col-span-12 flex flex-col justify-center md:col-span-7">
          <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-white/40">
            Top opportunities · {snapshot.opportunities.count || rows.length} in backlog
          </p>
          <RaceBar rows={rows} />
        </div>

        <div className="col-span-12 flex flex-col justify-center gap-3 md:col-span-5">
          <p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-white/40">
            20-week dual workstream
          </p>
          {PHASES.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.2 + i * 0.1 }}
              className="relative overflow-hidden rounded-xl px-4 py-3"
              style={{
                background:
                  "linear-gradient(160deg, rgba(17,34,64,0.85), rgba(7,17,34,0.95))",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <motion.div
                className="absolute inset-y-0 left-0"
                style={{ background: p.color, opacity: 0.2 }}
                initial={{ width: 0 }}
                animate={{ width: `${35 + i * 15}%` }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.35 + i * 0.1 }}
              />
              <div className="relative z-10 flex items-center justify-between">
                <span className="font-playfair text-base font-bold text-cream">
                  {p.label}
                </span>
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                  style={{ color: p.color }}
                >
                  {p.weeks}
                </span>
              </div>
            </motion.div>
          ))}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-2 text-[12px] text-white/40"
          >
            So what: the room leaves with a plan, not a wishlist.
          </motion.p>
        </div>
      </div>
    </SlideLayout>
  );
}
