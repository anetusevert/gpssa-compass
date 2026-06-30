"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  AlarmClockOff,
  LayoutGrid,
  FileCheck2,
  LineChart,
  ArrowUpRight,
  ArrowRightLeft,
  Activity,
  RefreshCw,
} from "lucide-react";
import { SectionTabs } from "@/components/ui/SectionTabs";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { AgingBoard, type AgingBucket } from "@/components/fulfilment/AgingBoard";
import { Badge } from "@/components/ui/Badge";

const EASE = [0.16, 1, 0.3, 1] as const;

const fulfilmentTabs = [
  { id: "cases", label: "Case Board", href: "/dashboard/fulfilment/cases", icon: LayoutGrid },
  { id: "sla", label: "SLA / OLA", href: "/dashboard/fulfilment/sla", icon: FileCheck2 },
  { id: "breach", label: "Breach & Aging", href: "/dashboard/fulfilment/breach", icon: AlarmClockOff },
  { id: "analytics", label: "Analytics", href: "/dashboard/fulfilment/analytics", icon: LineChart },
];

interface BreachRow {
  id: string;
  caseRef: string | null;
  serviceName: string | null;
  priority: string | null;
  owner: string | null;
  slaName: string | null;
  slaTier: string | null;
  breachedAt: string;
  hoursOver: number;
  reason: string | null;
  escalationType: string;
}

interface BreachPayload {
  breaches: BreachRow[];
  buckets: AgingBucket[];
  riskCounts: { green: number; amber: number; red: number; breached: number };
  littlesLaw: { wip: number; throughputPerDay: number; resolvedLast30: number };
  now: string;
}

export default function BreachPage() {
  const [data, setData] = useState<BreachPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [pulse, setPulse] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/fulfilment/breach", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setPulse(true);
        setTimeout(() => setPulse(false), 600);
      }
    } catch {
      /* keep last good */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Subtle auto-refresh every ~20s so aging visibly advances.
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, [load]);

  if (loading || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-5 py-2 border-b border-white/[0.06]">
        <h1 className="font-playfair text-base font-semibold text-cream shrink-0">
          Breach &amp; Aging
        </h1>
        <div className="h-4 w-px bg-white/10" />
        <div className="hidden md:block">
          <SectionTabs items={fulfilmentTabs} pillar="products" />
        </div>
        <div className="ml-auto flex items-center gap-2 text-[10px] text-gray-muted">
          <span className={`flex items-center gap-1.5 ${pulse ? "text-gpssa-green" : ""}`}>
            <RefreshCw size={11} className={pulse ? "animate-spin" : ""} />
            Live · auto-refresh 20s
          </span>
        </div>
      </div>

      {/* Body scroll */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-5 py-4 space-y-5">
        {/* Aging board */}
        <section>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-sm font-semibold text-cream font-playfair flex items-center gap-2">
              <Activity size={15} className="text-gpssa-green" />
              Live aging buckets
            </h2>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="text-amber-300">{data.riskCounts.amber} at-risk</span>
              <span className="text-rose-300">{data.riskCounts.red} critical</span>
              <span className="text-rose-400 font-medium">
                {data.riskCounts.breached} breached
              </span>
            </div>
          </div>
          <AgingBoard buckets={data.buckets} />
          <p className="text-[10px] text-gray-muted mt-2 italic">
            FIFO-with-aging: older normal items elevate so they don&apos;t starve;
            amber at ≥70% of SLA elapsed, red at ≥90%.
          </p>
        </section>

        {/* Little's Law widget + escalation summary */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <LittlesLawWidget
            wip={data.littlesLaw.wip}
            throughputPerDay={data.littlesLaw.throughputPerDay}
          />
          <EscalationSplit breaches={data.breaches} />
        </section>

        {/* Breach log */}
        <section>
          <h2 className="text-sm font-semibold text-cream font-playfair mb-2.5 flex items-center gap-2">
            <AlarmClockOff size={15} className="text-rose-300" />
            Breach log
            <span className="text-[10px] text-gray-muted font-normal">
              ({data.breaches.length})
            </span>
          </h2>
          <div className="rounded-xl border border-white/[0.07] overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.03] text-[9px] uppercase tracking-wide text-gray-muted">
                  <th className="px-3 py-2 font-medium">Case</th>
                  <th className="px-3 py-2 font-medium">Service</th>
                  <th className="px-3 py-2 font-medium">SLA</th>
                  <th className="px-3 py-2 font-medium text-right">Over</th>
                  <th className="px-3 py-2 font-medium">Escalation</th>
                  <th className="px-3 py-2 font-medium hidden lg:table-cell">Reason</th>
                </tr>
              </thead>
              <tbody>
                {data.breaches.map((b, i) => (
                  <motion.tr
                    key={b.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.02 }}
                    className="border-t border-white/[0.05] hover:bg-white/[0.02]"
                  >
                    <td className="px-3 py-2 text-[11px] text-cream tabular-nums whitespace-nowrap">
                      {b.caseRef ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-[10px] text-cream/80">{b.serviceName ?? "—"}</td>
                    <td className="px-3 py-2 text-[10px] text-gray-muted">
                      {b.slaTier && (
                        <Badge variant="gray" size="sm" className="mr-1">
                          {b.slaTier}
                        </Badge>
                      )}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-rose-300 text-right tabular-nums whitespace-nowrap">
                      {b.hoursOver >= 24 ? `${(b.hoursOver / 24).toFixed(1)}d` : `${b.hoursOver}h`}
                    </td>
                    <td className="px-3 py-2">
                      <EscalationChip type={b.escalationType} />
                    </td>
                    <td className="px-3 py-2 text-[10px] text-gray-muted hidden lg:table-cell">
                      {b.reason ?? "—"}
                    </td>
                  </motion.tr>
                ))}
                {data.breaches.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-[11px] text-gray-muted">
                      No breaches recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function EscalationChip({ type }: { type: string }) {
  const hierarchical = type === "hierarchical";
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-medium border ${
        hierarchical
          ? "bg-rose-500/15 text-rose-300 border-rose-500/25"
          : "bg-adl-blue/15 text-adl-blue border-adl-blue/25"
      }`}
    >
      {hierarchical ? <ArrowUpRight size={9} /> : <ArrowRightLeft size={9} />}
      {hierarchical ? "Hierarchical" : "Functional"}
    </span>
  );
}

function EscalationSplit({ breaches }: { breaches: BreachRow[] }) {
  const functional = breaches.filter((b) => b.escalationType === "functional").length;
  const hierarchical = breaches.filter((b) => b.escalationType === "hierarchical").length;
  const total = Math.max(1, functional + hierarchical);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="lg:col-span-2 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"
    >
      <h3 className="text-[11px] font-semibold text-cream mb-3 flex items-center gap-2">
        <ArrowRightLeft size={13} className="text-adl-blue" />
        Escalation routing
      </h3>
      <div className="space-y-3">
        <Bar label="Functional (route to skills/access)" value={functional} total={total} color="bg-adl-blue/70" />
        <Bar label="Hierarchical (route up to seniority)" value={hierarchical} total={total} color="bg-rose-400/70" />
      </div>
      <p className="text-[9px] text-gray-muted mt-3 italic">
        Functional = horizontal hand-off to the right skills; hierarchical = vertical
        escalation when a decision exceeds staff authority.
      </p>
    </motion.div>
  );
}

function Bar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] mb-1">
        <span className="text-cream/80">{label}</span>
        <span className="text-gray-muted tabular-nums">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${(value / total) * 100}%` }}
          transition={{ duration: 0.5, ease: EASE }}
        />
      </div>
    </div>
  );
}

function LittlesLawWidget({ wip, throughputPerDay }: { wip: number; throughputPerDay: number }) {
  // Allow the user to tweak throughput to explore the cycle-time impact.
  const [tp, setTp] = useState<number>(throughputPerDay > 0 ? throughputPerDay : 3);
  const cycleTime = useMemo(() => (tp > 0 ? wip / tp : 0), [wip, tp]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"
    >
      <h3 className="text-[11px] font-semibold text-cream mb-1 flex items-center gap-2">
        <Activity size={13} className="text-gpssa-green" />
        Little&apos;s Law
      </h3>
      <p className="text-[9px] text-gray-muted mb-3 font-mono">
        Cycle Time = WIP ÷ Throughput
      </p>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-lg bg-white/[0.03] p-2 text-center">
          <p className="text-lg font-bold text-cream font-playfair tabular-nums">{wip}</p>
          <p className="text-[8px] text-gray-muted uppercase">WIP (open)</p>
        </div>
        <div className="rounded-lg bg-white/[0.03] p-2 text-center">
          <p className="text-lg font-bold text-gpssa-green font-playfair tabular-nums">
            {cycleTime.toFixed(1)}
          </p>
          <p className="text-[8px] text-gray-muted uppercase">Days cycle</p>
        </div>
      </div>

      <label className="block text-[9px] text-gray-muted mb-1">
        Throughput: <span className="text-cream tabular-nums">{tp.toFixed(1)}</span> cases/day
      </label>
      <input
        type="range"
        min={0.5}
        max={20}
        step={0.5}
        value={tp}
        onChange={(e) => setTp(Number(e.target.value))}
        className="w-full accent-gpssa-green"
      />
      <p className="text-[9px] text-gray-muted mt-2 italic">
        Lower WIP or raise throughput to cut backlog — not just &quot;work harder.&quot;
      </p>
    </motion.div>
  );
}
