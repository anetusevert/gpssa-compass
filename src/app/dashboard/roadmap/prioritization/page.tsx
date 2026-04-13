"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowUpDown,
  SlidersHorizontal,
  Zap,
  Target,
  Wrench,
  TrendingUp,
} from "lucide-react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
  Cell,
} from "recharts";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface ScoringWeight {
  id: string;
  label: string;
  weight: number;
  icon: React.ElementType;
}

interface ScoredInitiative {
  id: string;
  name: string;
  customerImpact: number;
  effort: number;
  strategicFit: number;
  feasibility: number;
}

const defaultWeights: ScoringWeight[] = [
  { id: "customerImpact", label: "Customer Impact", weight: 30, icon: Target },
  { id: "effort", label: "Effort", weight: 25, icon: Wrench },
  { id: "strategicFit", label: "Strategic Fit", weight: 25, icon: TrendingUp },
  { id: "feasibility", label: "Feasibility", weight: 20, icon: Zap },
];

const sampleInitiatives: ScoredInitiative[] = [
  { id: "1", name: "Digital Portal MVP", customerImpact: 5, effort: 3, strategicFit: 5, feasibility: 4 },
  { id: "2", name: "AI Chatbot Deployment", customerImpact: 4, effort: 4, strategicFit: 5, feasibility: 3 },
  { id: "3", name: "Self-Service Kiosks", customerImpact: 4, effort: 2, strategicFit: 3, feasibility: 5 },
  { id: "4", name: "Process Automation Wave 1", customerImpact: 3, effort: 3, strategicFit: 4, feasibility: 4 },
  { id: "5", name: "CRM Platform Setup", customerImpact: 4, effort: 5, strategicFit: 4, feasibility: 2 },
  { id: "6", name: "Mobile App Launch", customerImpact: 5, effort: 4, strategicFit: 5, feasibility: 3 },
  { id: "7", name: "Analytics Dashboard v2", customerImpact: 3, effort: 2, strategicFit: 4, feasibility: 5 },
  { id: "8", name: "Staff Training Program", customerImpact: 2, effort: 2, strategicFit: 3, feasibility: 5 },
  { id: "9", name: "Omnichannel Integration", customerImpact: 5, effort: 5, strategicFit: 5, feasibility: 2 },
  { id: "10", name: "Predictive Analytics Engine", customerImpact: 3, effort: 5, strategicFit: 4, feasibility: 2 },
];

function getQuadrant(impact: number, effort: number): { label: string; color: string } {
  if (impact >= 3 && effort < 3) return { label: "Quick Win", color: "#22c55e" };
  if (impact >= 3 && effort >= 3) return { label: "Strategic Bet", color: "#d4a843" };
  if (impact < 3 && effort < 3) return { label: "Easy Fill", color: "#3b82f6" };
  return { label: "Avoid", color: "#ef4444" };
}

export default function PrioritizationPage() {
  const [weights, setWeights] = useState(defaultWeights);
  const [sortAsc, setSortAsc] = useState(false);

  const scored = useMemo(() => {
    return sampleInitiatives
      .map((init) => {
        const w = weights.reduce((acc, w) => {
          acc[w.id] = w.weight / 100;
          return acc;
        }, {} as Record<string, number>);

        const weightedScore =
          init.customerImpact * (w.customerImpact ?? 0.3) +
          (6 - init.effort) * (w.effort ?? 0.25) +
          init.strategicFit * (w.strategicFit ?? 0.25) +
          init.feasibility * (w.feasibility ?? 0.2);

        return { ...init, weightedScore: Math.round(weightedScore * 100) / 100 };
      })
      .sort((a, b) => (sortAsc ? a.weightedScore - b.weightedScore : b.weightedScore - a.weightedScore));
  }, [weights, sortAsc]);

  const scatterData = scored.map((init) => ({
    x: init.effort,
    y: init.customerImpact,
    name: init.name,
    score: init.weightedScore,
  }));

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={fadeUp}>
        <PageHeader
          title="Initiative Prioritization"
          description="Score and rank initiatives by impact, effort, and strategic fit"
          actions={
            <Button variant="secondary" size="sm">
              <Sparkles size={16} />
              AI Suggest Prioritization
            </Button>
          }
        />
      </motion.div>

      {/* Scoring Criteria */}
      <motion.div variants={fadeUp} className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal size={16} className="text-gold" />
          <h2 className="font-playfair text-lg font-semibold text-cream">Scoring Criteria</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {weights.map((w) => {
            const Icon = w.icon;
            return (
              <div key={w.id} className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={16} className="text-gold" />
                  <span className="text-sm font-medium text-cream">{w.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={5}
                    max={50}
                    value={w.weight}
                    onChange={(e) => {
                      setWeights((prev) =>
                        prev.map((pw) =>
                          pw.id === w.id ? { ...pw, weight: Number(e.target.value) } : pw
                        )
                      );
                    }}
                    className="flex-1 accent-gold h-1"
                  />
                  <span className="text-sm font-bold text-gold w-10 text-right">{w.weight}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Scoring Table */}
      <motion.div variants={fadeUp} className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h2 className="font-playfair text-lg font-semibold text-cream">Initiative Scores</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-xs uppercase tracking-wide text-gray-muted font-medium">
                  Rank
                </th>
                <th className="text-left p-4 text-xs uppercase tracking-wide text-gray-muted font-medium">
                  Initiative
                </th>
                <th className="text-center p-4 text-xs uppercase tracking-wide text-gray-muted font-medium">
                  Impact
                </th>
                <th className="text-center p-4 text-xs uppercase tracking-wide text-gray-muted font-medium">
                  Effort
                </th>
                <th className="text-center p-4 text-xs uppercase tracking-wide text-gray-muted font-medium">
                  Fit
                </th>
                <th className="text-center p-4 text-xs uppercase tracking-wide text-gray-muted font-medium">
                  Feasibility
                </th>
                <th className="p-4 text-xs uppercase tracking-wide text-gray-muted font-medium">
                  <button
                    onClick={() => setSortAsc(!sortAsc)}
                    className="inline-flex items-center gap-1 hover:text-cream transition-colors"
                  >
                    Score
                    <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="text-center p-4 text-xs uppercase tracking-wide text-gray-muted font-medium">
                  Quadrant
                </th>
              </tr>
            </thead>
            <tbody>
              {scored.map((init, idx) => {
                const q = getQuadrant(init.customerImpact, init.effort);
                return (
                  <motion.tr
                    key={init.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-4">
                      <span className="w-6 h-6 rounded-lg bg-white/5 inline-flex items-center justify-center text-xs font-bold text-cream">
                        {idx + 1}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-cream">{init.name}</td>
                    <td className="p-4 text-center">
                      <ScoreCell value={init.customerImpact} />
                    </td>
                    <td className="p-4 text-center">
                      <ScoreCell value={init.effort} inverted />
                    </td>
                    <td className="p-4 text-center">
                      <ScoreCell value={init.strategicFit} />
                    </td>
                    <td className="p-4 text-center">
                      <ScoreCell value={init.feasibility} />
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-bold text-gold">{init.weightedScore.toFixed(2)}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className="text-xs font-medium px-2 py-1 rounded-full"
                        style={{ backgroundColor: `${q.color}20`, color: q.color }}
                      >
                        {q.label}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Impact vs Effort Matrix */}
      <motion.div variants={fadeUp} className="glass-card p-6">
        <h2 className="font-playfair text-lg font-semibold text-cream mb-6">
          Impact vs. Effort Matrix
        </h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                type="number"
                dataKey="x"
                domain={[0, 6]}
                ticks={[1, 2, 3, 4, 5]}
                stroke="rgba(255,255,255,0.2)"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
              >
                <Label value="Effort →" position="bottom" offset={10} style={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} />
              </XAxis>
              <YAxis
                type="number"
                dataKey="y"
                domain={[0, 6]}
                ticks={[1, 2, 3, 4, 5]}
                stroke="rgba(255,255,255,0.2)"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
              >
                <Label value="Impact →" angle={-90} position="left" offset={10} style={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} />
              </YAxis>
              <ReferenceLine x={3} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
              <ReferenceLine y={3} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
              <Tooltip
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="glass-panel rounded-lg p-3 text-sm shadow-xl">
                      <p className="font-medium text-cream">{d.name}</p>
                      <p className="text-gray-muted mt-1">
                        Impact: {d.y} · Effort: {d.x} · Score: {d.score}
                      </p>
                    </div>
                  );
                }}
              />
              <Scatter data={scatterData}>
                {scatterData.map((entry, i) => (
                  <Cell key={i} fill={getQuadrant(entry.y, entry.x).color} fillOpacity={0.8} r={8} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Quadrant legend */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {[
            { label: "Quick Wins", desc: "High impact, low effort", color: "#22c55e" },
            { label: "Strategic Bets", desc: "High impact, high effort", color: "#d4a843" },
            { label: "Easy Fills", desc: "Low impact, low effort", color: "#3b82f6" },
            { label: "Avoid", desc: "Low impact, high effort", color: "#ef4444" },
          ].map((q) => (
            <div key={q.label} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: q.color }} />
              <div>
                <p className="text-xs font-medium text-cream">{q.label}</p>
                <p className="text-[10px] text-gray-muted">{q.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function ScoreCell({ value, inverted }: { value: number; inverted?: boolean }) {
  const display = inverted ? 6 - value : value;
  const color =
    display >= 4 ? "text-green-400" : display >= 3 ? "text-gold" : "text-red-400";
  return (
    <span className={`font-mono font-medium ${color}`}>
      {value}
    </span>
  );
}
