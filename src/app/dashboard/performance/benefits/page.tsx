"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { staggerChildren, tileItem } from "@/lib/motion";
import { PageFrame, TileScroll } from "@/components/ui/PageFrame";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { BenefitBar } from "@/components/performance";
import type { BenefitBarData } from "@/components/performance";

function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
      <p className="text-[9px] uppercase tracking-[0.16em] text-white/40">{label}</p>
      <p className="text-sm font-semibold text-cream">{value}</p>
    </div>
  );
}

export default function BenefitsPage() {
  const [benefits, setBenefits] = useState<BenefitBarData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/performance/benefits", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setBenefits(Array.isArray(data) ? data : []))
      .catch(() => setBenefits([]))
      .finally(() => setLoading(false));
  }, []);

  const total = benefits.length;
  const realised = benefits.filter((b) => b.status === "realised").length;
  const atRisk = benefits.filter((b) => b.status === "at-risk").length;
  const missed = benefits.filter((b) => b.status === "missed").length;

  // % of targets met = actual reached/passed target (direction-aware).
  const metTargets = benefits.filter((b) => {
    if (b.actual == null) return false;
    return b.target >= b.baseline ? b.actual >= b.target : b.actual <= b.target;
  }).length;
  const pctMet = total > 0 ? Math.round((metTargets / total) * 100) : 0;

  return (
    <PageFrame
      header={
        <div className="flex items-center justify-between gap-3 pb-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <Target size={16} className="shrink-0 text-gold" />
            <h1 className="truncate font-playfair text-sm font-semibold text-cream sm:text-base">
              Benefits Realisation
            </h1>
            <span className="hidden text-[11px] text-white/40 md:inline">
              Baseline → target → actual variance
            </span>
          </div>
          {!loading && total > 0 && (
            <div className="hidden items-stretch gap-2 sm:flex">
              <StatChip label="Realised" value={`${realised}/${total}`} />
              <StatChip label="Targets met" value={`${pctMet}%`} />
              <StatChip label="At risk" value={atRisk} />
              <StatChip label="Missed" value={missed} />
            </div>
          )}
        </div>
      }
    >
      {loading ? (
        <div className="flex h-full items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : total === 0 ? (
        <EmptyState
          icon={Target}
          title="No benefits tracked yet"
          description="Seed the Performance module (POST /api/performance/seed) to populate benefits realisation."
        />
      ) : (
        <TileScroll className="pr-1">
          <motion.div
            variants={staggerChildren}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-4"
          >
            {benefits.map((b, i) => (
              <motion.div key={b.id} variants={tileItem}>
                <BenefitBar benefit={b} index={i} />
              </motion.div>
            ))}
          </motion.div>
        </TileScroll>
      )}
    </PageFrame>
  );
}
