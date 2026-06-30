"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Target, TrendingUp, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { BenefitBar } from "@/components/performance";
import type { BenefitBarData } from "@/components/performance";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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
    <div className="space-y-6">
      <PageHeader
        title="Benefits Realisation"
        description="Tracking each initiative's baseline → target → actual variance, validated against real GPSSA wins. Declare success only after a sustained window."
        badge={{ label: "MG4 · validated outcomes", variant: "gold" }}
      />

      {total === 0 ? (
        <EmptyState
          icon={Target}
          title="No benefits tracked yet"
          description="Seed the Performance module (POST /api/performance/seed) to populate benefits realisation."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Benefits realised"
              value={`${realised}/${total}`}
              icon={CheckCircle2}
              trend="up"
              change={`${total ? Math.round((realised / total) * 100) : 0}%`}
            />
            <StatCard
              label="% targets met"
              value={`${pctMet}%`}
              icon={Target}
              trend={pctMet >= 60 ? "up" : "neutral"}
            />
            <StatCard
              label="At risk"
              value={atRisk}
              icon={TrendingUp}
              trend={atRisk > 0 ? "neutral" : "up"}
            />
            <StatCard
              label="Missed"
              value={missed}
              icon={AlertTriangle}
              trend={missed > 0 ? "down" : "up"}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {benefits.map((b, i) => (
              <BenefitBar key={b.id} benefit={b} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
