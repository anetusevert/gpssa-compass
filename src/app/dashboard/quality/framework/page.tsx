"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Layers,
  ClipboardCheck,
  ShieldCheck,
  Target,
  CheckCircle2,
  FileText,
  Users,
  RefreshCw,
  Scale,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { CopcFamilyBadge } from "@/components/quality/CopcFamilyBadge";
import { PilotServiceSet } from "@/components/engagement/PilotServiceSet";
import { WorkshopCapture } from "@/components/engagement/WorkshopCapture";

const EASE = [0.16, 1, 0.3, 1] as const;

interface Dimension {
  id: string;
  name: string;
  definition: string | null;
  category: string;
  copcFamily: string | null;
  weight: number;
  sortOrder: number;
}

interface SummaryRow {
  period: string;
  customer: number;
  business: number;
  compliance: number;
  count: number;
}

const GOVERNANCE = [
  {
    icon: FileText,
    title: "Sampling rules",
    body: "A statistically valid random base sample per queue (95% confidence, 5% margin) for unbiased trend measurement, plus a risk-weighted overlay over high-value payments, vulnerable beneficiaries, new staff and recently-changed processes.",
  },
  {
    icon: RefreshCw,
    title: "Calibration cadence",
    body: "Calibrate weekly when launching a scorecard; shift to monthly once inter-rater reliability consistently exceeds ~85%. Re-calibrate after policy changes, scorecard edits or new evaluators.",
  },
  {
    icon: Users,
    title: "Evaluator independence",
    body: "Reviews are performed independently of case handling. Disputes follow a documented appeal path, and results feed coaching and corrective action — not punitive scoring alone.",
  },
  {
    icon: Scale,
    title: "Scoring model",
    body: "Quality is reported as three parallel COPC metrics — Customer-, Business- and Compliance-critical accuracy — never a single blended score, paired with a weighted non-critical score for coaching.",
  },
];

export default function QualityFrameworkPage() {
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [scorecardCount, setScorecardCount] = useState(0);
  const [complianceAccuracy, setComplianceAccuracy] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/quality/dimensions", { cache: "no-store" }).then((r) => (r.ok ? r.json() : [])),
      fetch("/api/quality/scorecards", { cache: "no-store" }).then((r) => (r.ok ? r.json() : [])),
      fetch("/api/quality/reviews/summary", { cache: "no-store" }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([dims, scorecards, summary]) => {
        if (Array.isArray(dims)) setDimensions(dims);
        if (Array.isArray(scorecards)) setScorecardCount(scorecards.length);
        if (Array.isArray(summary) && summary.length > 0) {
          const rows = summary as SummaryRow[];
          const avg = rows.reduce((s, r) => s + r.compliance, 0) / rows.length;
          setComplianceAccuracy(Math.round(avg * 10) / 10);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quality Framework"
        description="Job 3 — Design/pilot QA. Dimensions, policy, and the pilot service set before sector rollout."
        badge={{ label: "COPC · ISO · ISSA", variant: "green" }}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PilotServiceSet />
        <WorkshopCapture
          entityType="general"
          entityId="qa-framework-workshop"
          label="QA discovery notes (B1–B2)"
          placeholder="Current quality practices, gaps, and design decisions from workshops…"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Quality dimensions" value={dimensions.length} icon={Layers} trend="neutral" />
        <StatCard label="Active scorecards" value={scorecardCount} icon={ClipboardCheck} trend="neutral" />
        <StatCard
          label="Compliance accuracy"
          value={complianceAccuracy != null ? `${complianceAccuracy}%` : "—"}
          icon={ShieldCheck}
          trend={complianceAccuracy != null && complianceAccuracy >= 95 ? "up" : "neutral"}
        />
      </div>

      <div>
        <h2 className="mb-3 font-playfair text-lg font-semibold text-cream">
          The six dimensions of quality
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dimensions.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i, ease: EASE }}
            >
              <Card variant="glass" padding="md" className="h-full">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Target size={16} className="text-teal-400" />
                    <h3 className="font-playfair text-base font-semibold text-cream">{d.name}</h3>
                  </div>
                  <CopcFamilyBadge family={d.copcFamily} />
                </div>
                <p className="text-sm leading-relaxed text-gray-muted">{d.definition}</p>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-cream/60">
                  <span className="uppercase tracking-wide">Weight</span>
                  <span className="font-medium text-cream/80">×{d.weight.toFixed(1)}</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-playfair text-lg font-semibold text-cream">
          QA policy & governance
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {GOVERNANCE.map((g, i) => {
            const Icon = g.icon;
            return (
              <motion.div
                key={g.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i, ease: EASE }}
              >
                <Card variant="bordered" padding="md" className="h-full">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="rounded-lg bg-teal-400/10 p-1.5">
                      <Icon size={15} className="text-teal-400" />
                    </div>
                    <h3 className="font-medium text-cream">{g.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-muted">{g.body}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-gpssa-green/20 bg-gpssa-green/5 p-4">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-gpssa-green" />
          <p className="text-sm text-gray-muted">
            A written QA policy fixes scope, evaluator independence, sampling and scoring rules,
            calibration cadence, the dispute/appeal process and how results feed coaching — the
            ISSA &ldquo;permanent evaluation mechanism&rdquo; expressed as a COPC-grade discipline.
          </p>
        </div>
      </div>
    </div>
  );
}
