"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  ComposedChart,
  Bar,
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Gauge, Timer, RefreshCcw, Layers, Target, Sigma } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const EASE = [0.16, 1, 0.3, 1] as const;

const COLORS = {
  green: "#00A86B",
  teal: "#2DD4BF",
  amber: "#E9A23B",
  rose: "#E76363",
  gold: "#C5A572",
  blue: "#2D4A8C",
};

interface TrendPoint {
  period: string;
  avgTatHours: number;
  firstTimeRightPct: number;
  reworkPct: number;
  backlogCount: number;
  wipOver30: number;
  pcePct: number;
  dpmo: number;
}

interface AnalyticsPayload {
  periods: string[];
  services: string[];
  trend: TrendPoint[];
  headline: {
    currentPce: number;
    pceTarget: number;
    pceStart: number;
    currentDpmo: number;
    sigma: number;
    currentFtr: number;
    currentRework: number;
    currentBacklog: number;
    backlogStart: number;
    currentTat: number;
    tatStart: number;
  };
}

const tooltipStyle = {
  background: "rgba(10,15,30,0.95)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  fontSize: 11,
  color: "#F5EFE0",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/fulfilment/analytics", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const h = data.headline;
  const tatTrend: "up" | "down" = h.currentTat <= h.tatStart ? "down" : "up";
  const backlogTrend: "up" | "down" = h.currentBacklog <= h.backlogStart ? "down" : "up";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fulfilment Analytics"
        description="Lean Six Sigma cycle-time, first-time-right and process-cycle-efficiency trends — the most persuasive evidence in the fulfilment framework."
        badge={{ label: "Lean Six Sigma · DMAIC", variant: "green" }}
      />

      {/* StatCards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Avg TAT (latest)"
          value={`${h.currentTat}h`}
          change={`${(((h.tatStart - h.currentTat) / Math.max(1, h.tatStart)) * 100).toFixed(0)}%`}
          icon={Timer}
          trend={tatTrend}
        />
        <StatCard
          label="First-time-right"
          value={`${h.currentFtr}%`}
          change={`+${(h.currentFtr - (h.currentFtr - h.currentRework)).toFixed(0)}`}
          icon={RefreshCcw}
          trend="up"
        />
        <StatCard
          label="Backlog (latest)"
          value={h.currentBacklog}
          change={`${(((h.backlogStart - h.currentBacklog) / Math.max(1, h.backlogStart)) * 100).toFixed(0)}%`}
          icon={Layers}
          trend={backlogTrend}
        />
        <StatCard label="Process σ level" value={`${h.sigma}σ`} icon={Sigma} trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* TAT trend */}
        <ChartCard title="Turnaround time trend" icon={Timer} subtitle="Avg TAT (hours), mean across services">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.trend} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="period" tick={{ fontSize: 10, fill: "#9CA3AF" }} />
              <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="avgTatHours"
                name="Avg TAT (h)"
                stroke={COLORS.teal}
                strokeWidth={2.5}
                dot={{ r: 3, fill: COLORS.teal }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* First-time-right vs rework */}
        <ChartCard
          title="First-time-right vs rework"
          icon={RefreshCcw}
          subtitle="Right-first-time % (bars) against rework % (line)"
        >
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={data.trend} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="period" tick={{ fontSize: 10, fill: "#9CA3AF" }} />
              <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="firstTimeRightPct" name="First-time-right %" fill={COLORS.green} radius={[4, 4, 0, 0]} barSize={22} />
              <Line type="monotone" dataKey="reworkPct" name="Rework %" stroke={COLORS.rose} strokeWidth={2.5} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Backlog burn-down */}
        <ChartCard title="Backlog burn-down" icon={Layers} subtitle="Open backlog count + WIP over 30 days">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.trend} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="backlogGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.gold} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={COLORS.gold} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="wipGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.rose} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={COLORS.rose} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="period" tick={{ fontSize: 10, fill: "#9CA3AF" }} />
              <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Area type="monotone" dataKey="backlogCount" name="Backlog" stroke={COLORS.gold} fill="url(#backlogGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="wipOver30" name="WIP >30d" stroke={COLORS.rose} fill="url(#wipGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* PCE gauge + DPMO */}
        <ChartCard title="Process Cycle Efficiency" icon={Target} subtitle="Current PCE vs the ≥25% world-class Lean target">
          <div className="flex items-center gap-6 h-[220px]">
            <PceGauge current={h.currentPce} target={h.pceTarget} start={h.pceStart} />
            <div className="flex-1 space-y-3">
              <DpmoBadge dpmo={h.currentDpmo} sigma={h.sigma} />
              <p className="text-[10px] text-gray-muted leading-relaxed">
                Typical back-office PCE is just 5–10% — most of a pension case&apos;s life is
                waiting, not working. Lifting value-added ratio toward{" "}
                <span className="text-cream">≥25%</span> is the single biggest improvement lever.
              </p>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: typeof Timer;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      <Card variant="glass" padding="md">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-white/[0.05]">
            <Icon size={14} className="text-gpssa-green" />
          </div>
          <div>
            <h3 className="text-[12px] font-semibold text-cream">{title}</h3>
            {subtitle && <p className="text-[9px] text-gray-muted">{subtitle}</p>}
          </div>
        </div>
        {children}
      </Card>
    </motion.div>
  );
}

/** Radial progress gauge: current PCE against the 25% Lean target. */
function PceGauge({ current, target, start }: { current: number; target: number; start: number }) {
  const size = 150;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  // Scale so the target sits at ~85% of the arc for a satisfying gauge.
  const scaleMax = target / 0.85;
  const pct = Math.min(1, current / scaleMax);
  const targetPct = Math.min(1, target / scaleMax);
  const reached = current >= target;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={reached ? COLORS.green : COLORS.amber}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={{ duration: 1, ease: EASE }}
        />
        {/* Target tick */}
        <circle
          cx={size / 2 + r * Math.cos(2 * Math.PI * targetPct)}
          cy={size / 2 + r * Math.sin(2 * Math.PI * targetPct)}
          r={4}
          fill={COLORS.gold}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-cream font-playfair tabular-nums">
          {current}%
        </span>
        <span className="text-[9px] text-gray-muted">PCE now</span>
        <span className="text-[8px] text-gold mt-0.5">target {target}%</span>
        <span className="text-[8px] text-gray-muted">from {start}%</span>
      </div>
    </div>
  );
}

function DpmoBadge({ dpmo, sigma }: { dpmo: number; sigma: number }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 flex items-center gap-3">
      <div className="p-2 rounded-lg bg-gpssa-green/10">
        <Sigma size={18} className="text-gpssa-green" />
      </div>
      <div>
        <p className="text-lg font-bold text-cream font-playfair tabular-nums leading-none">
          {sigma}σ
        </p>
        <p className="text-[9px] text-gray-muted mt-1">
          {dpmo.toLocaleString()} DPMO (defects / million)
        </p>
      </div>
      <Gauge size={16} className="text-gray-muted ml-auto" />
    </div>
  );
}
