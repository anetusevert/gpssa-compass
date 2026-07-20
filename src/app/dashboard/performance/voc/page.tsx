"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MessageSquareHeart, Sparkles } from "lucide-react";
import { fadeRise, staggerChildren, tileItem } from "@/lib/motion";
import { PageFrame, TileScroll } from "@/components/ui/PageFrame";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { TrendCard } from "@/components/performance";

interface MetricBucket {
  overall: { period: string; value: number }[];
  breakdowns: { label: string; kind: string; series: { period: string; value: number }[] }[];
  latestSampleSize: number | null;
  driver: string | null;
}
interface ParetoRow {
  theme: string;
  count: number;
  sentiment: string;
  cumulativePct: number;
}
interface VocData {
  metrics: Record<string, MetricBucket>;
  pareto: ParetoRow[];
}

// metric → display config (colour, unit, benchmark band, caveat)
const METRIC_CONFIG: Record<
  string,
  { title: string; subtitle: string; color: string; unit: string; band?: { from: number; to: number; label: string }; caveat?: string }
> = {
  csat: {
    title: "CSAT — Customer Satisfaction",
    subtitle: "Post-interaction · target 90% (pension-peer band 87–94%)",
    color: "#00A86B",
    unit: "%",
    band: { from: 87, to: 94, label: "pension-peer band 87–94% (DWP 94, CPF ~90, Dubai Govt 93.8)" },
  },
  dsat: {
    title: "DSAT — Dissatisfaction",
    subtitle: "Bottom-box % · failure-driver signal (lower is better)",
    color: "#E76363",
    unit: "%",
  },
  nps: {
    title: "NPS — Net Promoter Score",
    subtitle: "Relationship loyalty · banking benchmark ~41–44",
    color: "#2D4A8C",
    unit: "",
    band: { from: 41, to: 44, label: "banking benchmark 41–44" },
    caveat:
      "Caveat: 'would you recommend a government department?' is weak in the public sector — use NPS cautiously and lean on CSAT/CES.",
  },
  ces: {
    title: "CES — Customer Effort Score",
    subtitle: "Effort to get the job done (lower is better)",
    color: "#2DD4BF",
    unit: "",
  },
  pulse: {
    title: "Customer Pulse",
    subtitle: "Always-on rolling sentiment",
    color: "#C5A572",
    unit: "%",
  },
};

const SENTIMENT_COLOR: Record<string, string> = {
  negative: "#E76363",
  neutral: "#E9A23B",
  positive: "#00A86B",
};

export default function VocPage() {
  const [data, setData] = useState<VocData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<unknown>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/performance/voc", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  async function runAi() {
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);
    try {
      const res = await fetch("/api/performance/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "voc-synthesis" }),
      });
      const json = await res.json();
      if (!res.ok) setAiError(json.error ?? "AI request failed");
      else setAiResult(json);
    } catch {
      setAiError("AI request failed");
    } finally {
      setAiLoading(false);
    }
  }

  const empty = !data || Object.keys(data.metrics).length === 0;
  const fcr = data?.metrics["fcr"];
  const repeat = data?.metrics["repeat-contact"];

  return (
    <PageFrame
      header={
        <div className="flex items-center justify-between gap-3 pb-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <MessageSquareHeart size={16} className="shrink-0 text-gpssa-green" />
            <h1 className="truncate font-playfair text-sm font-semibold text-cream sm:text-base">
              Voice of Customer
            </h1>
            <span className="hidden text-[11px] text-white/40 md:inline">
              CSAT · NPS · CES · complaint Pareto
            </span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setAiOpen(true)}>
            <Sparkles size={14} /> Synthesise (AI)
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="flex h-full items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : empty ? (
        <EmptyState
          icon={MessageSquareHeart}
          title="No Voice-of-Customer data"
          description="Seed the Performance module (POST /api/performance/seed) to populate VoC metrics."
        />
      ) : (
        <TileScroll className="pr-1">
          <motion.div
            variants={staggerChildren}
            initial="hidden"
            animate="show"
            className="space-y-4 pb-4"
          >
            {/* Trend cards with benchmark bands */}
            <motion.div
              variants={tileItem}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            >
              {Object.entries(METRIC_CONFIG).map(([key, cfg], i) => {
                const bucket = data!.metrics[key];
                if (!bucket || bucket.overall.length === 0) return null;
                return (
                  <TrendCard
                    key={key}
                    index={i}
                    title={cfg.title}
                    subtitle={cfg.subtitle}
                    data={bucket.overall}
                    color={cfg.color}
                    unit={cfg.unit}
                    band={cfg.band}
                    caveat={cfg.caveat}
                  />
                );
              })}
            </motion.div>

            {/* FCR + repeat-contact */}
            {(fcr || repeat) && (
              <motion.div
                variants={tileItem}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {fcr && (
                  <TrendCard
                    title="First-Contact Resolution (FCR)"
                    subtitle="Resolved on first contact · top quartile 85%+"
                    data={fcr.overall}
                    color="#00A86B"
                    unit="%"
                    band={{ from: 70, to: 75, label: "typical 70–75%; 85%+ top quartile" }}
                  />
                )}
                {repeat && (
                  <TrendCard
                    title="Repeat-Contact Rate"
                    subtitle="Repeat within 7 days (lower is better)"
                    data={repeat.overall}
                    color="#E9A23B"
                    unit="%"
                  />
                )}
              </motion.div>
            )}

            {/* Complaint Pareto */}
            <motion.div variants={fadeRise}>
              <Card variant="glass" padding="lg">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h2 className="font-playfair text-lg font-semibold text-cream">
                      Complaint-theme Pareto
                    </h2>
                    <p className="text-xs text-gray-muted mt-0.5">
                      The vital few themes drive most complaints.
                    </p>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={data!.pareto}
                      margin={{ top: 10, right: 16, bottom: 70, left: 0 }}
                    >
                      <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis
                        dataKey="theme"
                        tick={{ fill: "#9CA3AF", fontSize: 10 }}
                        angle={-30}
                        textAnchor="end"
                        interval={0}
                        height={70}
                        tickLine={false}
                      />
                      <YAxis
                        yAxisId="left"
                        tick={{ fill: "#9CA3AF", fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        domain={[0, 100]}
                        unit="%"
                        tick={{ fill: "#9CA3AF", fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(13,20,33,0.95)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 12,
                          fontSize: 12,
                          color: "#F5EFE0",
                        }}
                      />
                      <Bar yAxisId="left" dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
                        {data!.pareto.map((row) => (
                          <Cell
                            key={row.theme}
                            fill={SENTIMENT_COLOR[row.sentiment] ?? "#2D4A8C"}
                            fillOpacity={0.85}
                          />
                        ))}
                      </Bar>
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="cumulativePct"
                        stroke="#C5A572"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: "#C5A572" }}
                        isAnimationActive={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </TileScroll>
      )}

      <Modal
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        title="Synthesise VoC (AI)"
        description="Turn raw complaint themes into drivers and prioritised corrective actions."
        size="xl"
      >
        <div className="space-y-4">
          <Button variant="primary" size="sm" loading={aiLoading} onClick={runAi}>
            <Sparkles size={14} /> Synthesise
          </Button>
          {aiError && (
            <p className="text-xs text-rose-300 bg-rose-500/10 rounded-lg px-3 py-2">
              {aiError}
            </p>
          )}
          {aiResult != null && (
            <pre className="text-[11px] text-gray-muted bg-black/30 rounded-xl p-3 overflow-auto max-h-80 whitespace-pre-wrap">
              {JSON.stringify(aiResult, null, 2)}
            </pre>
          )}
        </div>
      </Modal>
    </PageFrame>
  );
}
