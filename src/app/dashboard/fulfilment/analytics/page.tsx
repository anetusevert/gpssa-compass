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
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageFrame, TileScroll } from "@/components/ui/PageFrame";
import { EASE, staggerChildren, tileItem } from "@/lib/motion";

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
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const h = data.headline;
  const tatChange = (((h.tatStart - h.currentTat) / Math.max(1, h.tatStart)) * 100).toFixed(0);
  const backlogChange = (((h.backlogStart - h.currentBacklog) / Math.max(1, h.backlogStart)) * 100).toFixed(0);

  const statChips = [
    { label: "Avg TAT", value: `${h.currentTat}h`, change: `${tatChange}% vs start` },
    { label: "First-time-right", value: `${h.currentFtr}%`, change: `${h.currentRework}% rework` },
    { label: "Backlog", value: String(h.currentBacklog), change: `${backlogChange}% vs start` },
    { label: "Process σ", value: `${h.sigma}σ`, change: `${h.currentDpmo.toLocaleString()} DPMO` },
  ];

  return (
    <PageFrame
      header={
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-white/5 shrink-0">
              <Gauge size={16} className="text-gpssa-green" />
            </div>
            <h1 className="font-playfair text-sm sm:text-base font-semibold text-cream">
              Fulfilment Analytics
            </h1>
            <span className="hidden rounded-full border border-gpssa-green/30 bg-gpssa-green/10 px-2 py-0.5 text-[10px] font-medium text-gpssa-green sm:inline">
              Lean Six Sigma · DMAIC
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {statChips.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2"
              >
                <p className="text-[9px] uppercase tracking-[0.16em] text-white/40">{s.label}</p>
                <p className="text-sm font-semibold text-cream tabular-nums">
                  {s.value}{" "}
                  <span className="text-[9px] font-normal text-gray-muted">{s.change}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <TileScroll className="pr-1">
        <motion.div
          variants={staggerChildren}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-5 lg:grid-cols-2"
        >
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
                  Typical back-office PCE is just 5–10%. Lifting value-added ratio toward{" "}
                  <span className="text-cream">≥25%</span> is the biggest improvement lever.
                </p>
              </div>
            </div>
          </ChartCard>
        </motion.div>
      </TileScroll>
    </PageFrame>
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
    <motion.div variants={tileItem}>
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
