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
  LayoutGrid,
} from "lucide-react";
import { PageFrame, TileScroll } from "@/components/ui/PageFrame";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { CopcFamilyBadge } from "@/components/quality/CopcFamilyBadge";
import { PilotServiceSet } from "@/components/engagement/PilotServiceSet";
import { WorkshopCapture } from "@/components/engagement/WorkshopCapture";
import { staggerChildren, tileItem } from "@/lib/motion";

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
    body: "Statistically valid random base sample per queue (95% confidence, 5% margin), plus a risk-weighted overlay on high-value payments, vulnerable beneficiaries and new staff.",
  },
  {
    icon: RefreshCw,
    title: "Calibration cadence",
    body: "Weekly at launch; monthly once inter-rater reliability exceeds ~85%. Re-calibrate after policy or scorecard changes.",
  },
  {
    icon: Users,
    title: "Evaluator independence",
    body: "Reviews are independent of case handling, with a documented appeal path. Results feed coaching, not punitive scoring.",
  },
  {
    icon: Scale,
    title: "Scoring model",
    body: "Three parallel COPC metrics — Customer-, Business- and Compliance-critical accuracy — never a single blended score.",
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
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <PageFrame
      header={
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <LayoutGrid size={16} className="text-teal-400" />
            <h1 className="font-playfair text-sm font-semibold text-cream sm:text-base">
              Quality Framework
            </h1>
          </div>
          <span className="text-xs text-gray-muted">COPC · ISO · ISSA</span>
          <div className="ml-auto flex items-center gap-2">
            <StatChip icon={Layers} label="Dimensions" value={String(dimensions.length)} />
            <StatChip icon={ClipboardCheck} label="Scorecards" value={String(scorecardCount)} />
            <StatChip
              icon={ShieldCheck}
              label="Compliance"
              value={complianceAccuracy != null ? `${complianceAccuracy}%` : "—"}
            />
          </div>
        </div>
      }
    >
      <TileScroll className="h-full pr-1">
        <motion.div variants={staggerChildren} initial="hidden" animate="show" className="space-y-4 pb-4">
          <motion.div variants={tileItem} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <PilotServiceSet />
            <WorkshopCapture
              entityType="general"
              entityId="qa-framework-workshop"
              label="QA discovery notes (B1–B2)"
              placeholder="Current quality practices, gaps, and design decisions from workshops…"
            />
          </motion.div>

          <motion.div variants={tileItem}>
            <h2 className="mb-2 font-playfair text-sm font-semibold text-cream">
              The six dimensions of quality
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {dimensions.map((d) => (
                <Card key={d.id} variant="glass" padding="md" className="h-full">
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
              ))}
            </div>
          </motion.div>

          <motion.div variants={tileItem}>
            <h2 className="mb-2 font-playfair text-sm font-semibold text-cream">
              QA policy &amp; governance
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {GOVERNANCE.map((g) => {
                const Icon = g.icon;
                return (
                  <Card key={g.title} variant="bordered" padding="md" className="h-full">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="rounded-lg bg-teal-400/10 p-1.5">
                        <Icon size={15} className="text-teal-400" />
                      </div>
                      <h3 className="font-medium text-cream">{g.title}</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-muted">{g.body}</p>
                  </Card>
                );
              })}
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-gpssa-green/20 bg-gpssa-green/5 p-3">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-gpssa-green" />
              <p className="text-sm text-gray-muted">
                A written QA policy fixes scope, independence, sampling, scoring, calibration
                cadence and appeals — the ISSA &ldquo;permanent evaluation mechanism&rdquo; as a
                COPC-grade discipline.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </TileScroll>
    </PageFrame>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Layers;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
      <Icon size={13} className="text-teal-400" />
      <div className="flex flex-col leading-tight">
        <span className="text-[9px] uppercase tracking-[0.16em] text-white/40">{label}</span>
        <span className="text-xs font-semibold text-cream">{value}</span>
      </div>
    </div>
  );
}
