"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Timer, AlertTriangle, Gauge, Repeat } from "lucide-react";
import { SlideLayout } from "./SlideLayout";

const EASE = [0.16, 1, 0.3, 1] as const;

interface Headline {
  currentPce: number;
  pceTarget: number;
  pceStart: number;
  currentFtr: number;
  currentTat: number;
  tatStart: number;
  currentBacklog: number;
  backlogStart: number;
  sigma: number;
}
interface RiskCounts {
  green?: number;
  amber?: number;
  red?: number;
  breached?: number;
}

const RISK = [
  { key: "green", label: "On track", color: "#00A86B" },
  { key: "amber", label: "At risk", color: "#E9A23B" },
  { key: "red", label: "Critical", color: "#E76363" },
  { key: "breached", label: "Breached", color: "#b91c1c" },
] as const;

export function Slide09_Fulfilment() {
  const [headline, setHeadline] = useState<Headline | null>(null);
  const [risk, setRisk] = useState<RiskCounts>({});

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/fulfilment/analytics", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/fulfilment/breach", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([a, b]) => {
        if (cancelled) return;
        if (a?.headline) setHeadline(a.headline);
        if (b?.riskCounts) setRisk(b.riskCounts);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const h = headline ?? {
    currentPce: 24, pceTarget: 25, pceStart: 9,
    currentFtr: 92, currentTat: 18, tatStart: 46,
    currentBacklog: 320, backlogStart: 980, sigma: 4.0,
  };
  const riskTotal = RISK.reduce((s, r) => s + (risk[r.key] ?? 0), 0) || 1;

  const stats = [
    { icon: Gauge, label: "Process cycle efficiency", value: `${h.currentPce.toFixed(0)}%`, sub: `from ${h.pceStart.toFixed(0)}% → ${h.pceTarget}% Lean target`, color: "#2DD4BF" },
    { icon: Repeat, label: "First-time-right", value: `${h.currentFtr.toFixed(0)}%`, sub: "rework falling", color: "#00A86B" },
    { icon: Timer, label: "Avg turnaround", value: `${h.currentTat.toFixed(0)}h`, sub: `from ${h.tatStart.toFixed(0)}h`, color: "#C5A572" },
    { icon: AlertTriangle, label: "Backlog", value: `${h.currentBacklog}`, sub: `from ${h.backlogStart}`, color: "#E9A23B" },
  ];

  return (
    <SlideLayout
      eyebrow="Fulfil on time"
      title="Breach early-warning — by design, not firefighting."
      subtitle="Case board, tiered SLA/OLA, Lean cycle-time and first-time-right — fulfilment as a managed system."
      align="left"
    >
      <div className="grid h-full grid-cols-12 gap-6">
        <div className="col-span-7 flex flex-col justify-center gap-3">
          <div className="grid grid-cols-2 gap-3">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.1 + i * 0.07, ease: EASE }}
                  className="glass-card p-4"
                >
                  <Icon size={18} style={{ color: s.color }} />
                  <div className="mt-1 font-playfair text-3xl font-bold text-cream">{s.value}</div>
                  <div className="text-[10px] uppercase tracking-wide text-gray-muted">{s.label}</div>
                  <div className="mt-0.5 text-[11px] text-white/50">{s.sub}</div>
                </motion.div>
              );
            })}
          </div>
          <div className="glass flex items-center gap-2 rounded-xl px-4 py-2 text-[12px] text-white/65">
            Six Sigma level <span className="font-bold text-cream">{h.sigma.toFixed(1)}σ</span> · defect rate trending down
          </div>
        </div>

        {/* Live SLA-risk distribution */}
        <div className="col-span-5 flex flex-col justify-center">
          <div className="glass-card p-5">
            <div className="mb-3 text-[11px] uppercase tracking-wide text-gray-muted">
              Live SLA-risk distribution (open cases)
            </div>
            <div className="flex flex-col gap-3">
              {RISK.map((r) => {
                const n = risk[r.key] ?? 0;
                const pct = Math.round((n / riskTotal) * 100);
                return (
                  <div key={r.key}>
                    <div className="mb-1 flex justify-between text-[12px]">
                      <span className="text-cream">{r.label}</span>
                      <span className="text-gray-muted">{n}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: r.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: EASE }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-[11px] text-white/45">
              Amber at ≥70% of SLA elapsed · red at ≥90% · recomputed live every request.
            </div>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}
