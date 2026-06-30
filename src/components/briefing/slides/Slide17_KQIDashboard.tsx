"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target, Smile, Gauge } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
} from "recharts";
import { SlideLayout } from "./SlideLayout";

const EASE = [0.16, 1, 0.3, 1] as const;

interface DashMetric {
  id: string;
  name: string;
  unit?: string | null;
  value: number | null;
  target: number | null;
  rag: string;
  series?: { period: string; value: number }[];
}
interface VocMetric {
  overall: { period: string; value: number }[];
}

const RAG_COLOR: Record<string, string> = {
  green: "#00A86B",
  amber: "#E9A23B",
  red: "#E76363",
  gray: "#8A9BB0",
};

export function Slide17_KQIDashboard() {
  const [kqis, setKqis] = useState<DashMetric[]>([]);
  const [voc, setVoc] = useState<Record<string, VocMetric>>({});

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/performance/dashboards?tier=strategic", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/performance/voc", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([d, v]) => {
        if (cancelled) return;
        const strategic = d?.tiers?.strategic?.metrics ?? d?.all ?? [];
        if (Array.isArray(strategic)) setKqis(strategic.slice(0, 4));
        if (v?.metrics) setVoc(v.metrics);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const last = (m?: VocMetric) => (m?.overall?.length ? m.overall[m.overall.length - 1].value : null);
  const csat = last(voc.csat) ?? 89;
  const nps = last(voc.nps) ?? 42;
  const fcr = last(voc.fcr) ?? 81;

  const fallbackKqis: DashMetric[] = [
    { id: "1", name: "End-of-Service within SLA", unit: "%", value: 95, target: 95, rag: "green" },
    { id: "2", name: "Compliance-critical accuracy", unit: "%", value: 98, target: 99, rag: "amber" },
    { id: "3", name: "First-contact resolution", unit: "%", value: 81, target: 85, rag: "amber" },
    { id: "4", name: "Disbursement accuracy", unit: "%", value: 99, target: 99, rag: "green" },
  ];
  const shown = kqis.length ? kqis : fallbackKqis;

  return (
    <SlideLayout
      eyebrow="Workstream B · Measurement"
      title="KQIs that roll up from the work — and the voice of the customer"
      subtitle="Citizen-facing quality indicators decomposed into operational KPIs, on a tiered dashboard, paired with continuous VoC."
      align="left"
    >
      <div className="grid h-full grid-cols-12 gap-6">
        {/* KQI tiles */}
        <div className="col-span-7 flex flex-col justify-center gap-3">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-gray-muted">
            <Target size={13} className="text-[#00A86B]" /> Strategic KQIs
          </div>
          <div className="grid grid-cols-2 gap-3">
            {shown.map((k, i) => (
              <motion.div
                key={k.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 + i * 0.07, ease: EASE }}
                className="glass-card p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-playfair text-2xl font-bold text-cream">
                    {k.value != null ? k.value : "—"}
                    {k.unit === "%" ? "%" : ""}
                  </span>
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: RAG_COLOR[k.rag] ?? RAG_COLOR.gray }}
                  />
                </div>
                <div className="mt-1 text-[11px] text-white/65">{k.name}</div>
                {k.target != null && (
                  <div className="text-[10px] text-gray-muted">target {k.target}{k.unit === "%" ? "%" : ""}</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* VoC */}
        <div className="col-span-5 flex flex-col justify-center gap-3">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-gray-muted">
            <Smile size={13} className="text-[#2DD4BF]" /> Voice of the customer
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "CSAT", value: `${Math.round(csat)}`, color: "#00A86B" },
              { label: "NPS", value: `${Math.round(nps)}`, color: "#2DD4BF" },
              { label: "FCR", value: `${Math.round(fcr)}%`, color: "#C5A572" },
            ].map((m) => (
              <div key={m.label} className="glass-card p-3 text-center">
                <div className="font-playfair text-2xl font-bold text-cream">{m.value}</div>
                <div className="text-[10px] uppercase tracking-wide" style={{ color: m.color }}>{m.label}</div>
              </div>
            ))}
          </div>
          {voc.csat?.overall?.length ? (
            <div className="glass-card h-[150px] p-3">
              <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-wide text-gray-muted">
                <Gauge size={12} className="text-[#00A86B]" /> CSAT trend
              </div>
              <ResponsiveContainer width="100%" height="80%">
                <AreaChart data={voc.csat.overall} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="csatFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00A86B" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#00A86B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{
                      background: "rgba(7,17,34,0.92)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#00A86B" strokeWidth={2} fill="url(#csatFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-[11px] text-white/45">
              NPS is shown with caution in a government context — CSAT, CES and effort drive the picture.
            </div>
          )}
        </div>
      </div>
    </SlideLayout>
  );
}
