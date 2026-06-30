"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { Scale, Info, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { calibrationCadence } from "@/lib/qa/sampling";

const EASE = [0.16, 1, 0.3, 1] as const;

interface CalScore {
  id: string;
  evaluator: string;
  score: number;
}

interface CalSession {
  id: string;
  caseRef: string;
  sessionDate: string;
  evaluatorCount: number;
  irrScore: number;
  driftNote: string | null;
  scores: CalScore[];
  scorecard: { name: string } | null;
}

export default function CalibrationPage() {
  const [sessions, setSessions] = useState<CalSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/quality/calibration", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setSessions(data);
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

  const latestIrr = sessions.length > 0 ? sessions[sessions.length - 1].irrScore : 0;
  const cadence = calibrationCadence(latestIrr);
  const trendData = sessions.map((s, i) => ({
    label: `S${i + 1}`,
    irr: s.irrScore,
    date: new Date(s.sessionDate).toLocaleDateString(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calibration"
        description="Multiple evaluators score the same case; inter-rater reliability (IRR) trends up as drift is reconciled."
        badge={{ label: `IRR ${latestIrr}%`, variant: latestIrr >= 85 ? "green" : "gold" }}
      />

      {/* Cadence banner */}
      <div className="flex items-start gap-3 rounded-xl border border-teal-400/20 bg-teal-400/5 p-4">
        <Info size={16} className="mt-0.5 shrink-0 text-teal-400" />
        <div>
          <p className="text-sm text-cream/90">
            Calibrate <strong>weekly</strong> until IRR ≥ 85%, then <strong>monthly</strong>.
          </p>
          <p className="mt-0.5 text-xs text-gray-muted">
            Latest IRR is {latestIrr}% → recommended cadence:{" "}
            <span className="font-medium capitalize text-cream/80">{cadence}</span>
            {latestIrr >= 85
              ? " — convergence achieved."
              : " — still stabilising, keep calibrating weekly."}
          </p>
        </div>
      </div>

      {/* IRR trend */}
      <Card variant="glass" padding="md">
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp size={16} className="text-teal-400" />
          <h3 className="font-playfair text-base font-semibold text-cream">
            Inter-rater reliability — drift → convergence
          </h3>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="h-64 w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 8, right: 16, bottom: 4, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 11 }} />
              <YAxis domain={[60, 100]} tickFormatter={(v) => `${v}%`} tick={{ fill: "#9ca3af", fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  background: "rgba(13,20,38,0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={((v: number) => [`${v}%`, "IRR"]) as never}
              />
              <ReferenceLine y={85} stroke="#E9A23B" strokeDasharray="4 4" label={{ value: "85% target", fill: "#E9A23B", fontSize: 10, position: "insideTopRight" }} />
              <Line type="monotone" dataKey="irr" stroke="#00A86B" strokeWidth={2.5} dot={{ r: 4, fill: "#00A86B" }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </Card>

      {/* Per-session evaluator scores */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {sessions.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * i, ease: EASE }}
          >
            <Card variant="bordered" padding="md" className="h-full">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Scale size={15} className="text-teal-400" />
                    <h3 className="font-medium text-cream">Session {i + 1}</h3>
                  </div>
                  <p className="mt-0.5 text-[11px] text-gray-muted">
                    {s.caseRef} · {new Date(s.sessionDate).toLocaleDateString()} · {s.evaluatorCount} evaluators
                  </p>
                </div>
                <Badge variant={s.irrScore >= 85 ? "green" : "gold"} size="sm" dot>
                  IRR {s.irrScore}%
                </Badge>
              </div>

              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={s.scores} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="evaluator" tick={{ fill: "#9ca3af", fontSize: 9 }} interval={0} />
                    <YAxis domain={[70, 100]} tick={{ fill: "#9ca3af", fontSize: 9 }} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(13,20,38,0.95)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="score" fill="#2DD4BF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {s.driftNote && (
                <p className="mt-2 text-[11px] leading-relaxed text-gray-muted">{s.driftNote}</p>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
