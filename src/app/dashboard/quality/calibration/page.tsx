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
import { PageFrame, TileScroll } from "@/components/ui/PageFrame";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { calibrationCadence } from "@/lib/qa/sampling";
import { fadeRise, staggerChildren, tileItem } from "@/lib/motion";

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
      <div className="flex h-full items-center justify-center">
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
    <PageFrame
      header={
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Scale size={16} className="text-teal-400" />
            <h1 className="font-playfair text-sm font-semibold text-cream sm:text-base">
              Calibration
            </h1>
          </div>
          <span className="text-xs text-gray-muted">Inter-rater drift to convergence</span>
          <div className="ml-auto flex items-center gap-2">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
              <span className="text-[9px] uppercase tracking-[0.16em] text-white/40">Latest IRR </span>
              <span className={`text-xs font-semibold ${latestIrr >= 85 ? "text-gpssa-green" : "text-cream"}`}>
                {latestIrr}%
              </span>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
              <span className="text-[9px] uppercase tracking-[0.16em] text-white/40">Cadence </span>
              <span className="text-xs font-semibold capitalize text-cream">{cadence}</span>
            </div>
          </div>
        </div>
      }
    >
      <div className="grid h-full min-h-0 grid-cols-1 gap-3 overflow-y-auto pb-4 lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)] lg:overflow-visible lg:pb-0">
        {/* Left: cadence note + IRR trend chart */}
        <motion.div
          variants={fadeRise}
          initial="hidden"
          animate="show"
          className="flex min-h-0 flex-col gap-3"
        >
          <div className="flex shrink-0 items-start gap-3 rounded-xl border border-teal-400/20 bg-teal-400/5 p-3">
            <Info size={15} className="mt-0.5 shrink-0 text-teal-400" />
            <p className="text-xs text-cream/90">
              Calibrate <strong>weekly</strong> until IRR ≥ 85%, then <strong>monthly</strong>.
              Latest IRR {latestIrr}% —{" "}
              {latestIrr >= 85 ? "convergence achieved." : "still stabilising."}
            </p>
          </div>

          <div className="glass-card flex min-h-0 flex-1 flex-col p-4">
            <div className="mb-2 flex shrink-0 items-center gap-2">
              <TrendingUp size={15} className="text-teal-400" />
              <h3 className="font-playfair text-sm font-semibold text-cream">
                Inter-rater reliability trend
              </h3>
            </div>
            <div className="h-56 w-full lg:min-h-0 lg:flex-1">
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
            </div>
          </div>
        </motion.div>

        {/* Right: per-session evaluator scores, scrolling */}
        <div className="glass-card flex min-h-0 flex-col p-4">
          <div className="mb-2 flex shrink-0 items-center gap-2">
            <Scale size={15} className="text-teal-400" />
            <h3 className="font-playfair text-sm font-semibold text-cream">Sessions</h3>
          </div>
          <TileScroll className="pr-1">
            <motion.div variants={staggerChildren} initial="hidden" animate="show" className="space-y-3">
              {sessions.map((s, i) => (
                <motion.div
                  key={s.id}
                  variants={tileItem}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-medium text-cream">Session {i + 1}</h4>
                      <p className="mt-0.5 text-[11px] text-gray-muted">
                        {s.caseRef} · {new Date(s.sessionDate).toLocaleDateString()} · {s.evaluatorCount} evaluators
                      </p>
                    </div>
                    <Badge variant={s.irrScore >= 85 ? "green" : "gold"} size="sm" dot>
                      IRR {s.irrScore}%
                    </Badge>
                  </div>

                  <div className="h-28 w-full">
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
                </motion.div>
              ))}
            </motion.div>
          </TileScroll>
        </div>
      </div>
    </PageFrame>
  );
}
