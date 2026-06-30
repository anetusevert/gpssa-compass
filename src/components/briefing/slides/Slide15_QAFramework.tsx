"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, UserCheck, Briefcase, Scale } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { SlideLayout } from "./SlideLayout";

const EASE = [0.16, 1, 0.3, 1] as const;

interface SummaryRow {
  period: string;
  customer: number;
  business: number;
  compliance: number;
  count: number;
}

const COMPONENTS = [
  "Quality dimensions",
  "QA policy & governance",
  "Review methodology",
  "Statistical + risk sampling",
  "Scorecards (auto-fail)",
  "3-metric scoring (COPC)",
  "Calibration (IRR)",
  "Error taxonomy",
  "Corrective action (CAPA)",
];

export function Slide15_QAFramework() {
  const [rows, setRows] = useState<SummaryRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/quality/reviews/summary", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        if (!cancelled && Array.isArray(d)) setRows(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const latest = rows[rows.length - 1] ?? {
    customer: 94.5,
    business: 92.1,
    compliance: 97.8,
    count: 0,
  };

  const metrics = [
    { label: "Customer-critical accuracy", value: latest.customer, icon: UserCheck, color: "#00A86B" },
    { label: "Business-critical accuracy", value: latest.business, icon: Briefcase, color: "#2DD4BF" },
    { label: "Compliance-critical accuracy", value: latest.compliance, icon: Scale, color: "#C5A572" },
  ];

  return (
    <SlideLayout
      eyebrow="Workstream B · Quality Assurance"
      title="An end-to-end Quality Assurance framework"
      subtitle="Nine integrated components, scored the COPC way — three parallel accuracy metrics, never one blended number."
      align="left"
    >
      <div className="grid h-full grid-cols-12 gap-6">
        {/* Nine components */}
        <div className="col-span-5 flex flex-col justify-center gap-2">
          {COMPONENTS.map((c, i) => (
            <motion.div
              key={c}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.05, ease: EASE }}
              className="glass flex items-center gap-3 rounded-xl px-3 py-2"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#2DD4BF]/15 text-[11px] font-bold text-[#2DD4BF]">
                {i + 1}
              </span>
              <span className="text-[13px] text-cream">{c}</span>
            </motion.div>
          ))}
        </div>

        {/* COPC metrics + trend */}
        <div className="col-span-7 flex flex-col justify-center gap-4">
          <div className="grid grid-cols-3 gap-3">
            {metrics.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="glass-card flex flex-col gap-1 p-4">
                  <Icon size={18} style={{ color: m.color }} />
                  <span className="font-playfair text-2xl font-bold text-cream">
                    {m.value.toFixed(1)}%
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-gray-muted">
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>

          {rows.length > 1 && (
            <div className="glass-card h-[220px] p-4">
              <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-wide text-gray-muted">
                <ShieldCheck size={13} className="text-[#2DD4BF]" /> Accuracy trend (COPC, last {rows.length} months)
              </div>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={rows} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="period" tick={{ fill: "#8A9BB0", fontSize: 10 }} />
                  <YAxis domain={[80, 100]} tick={{ fill: "#8A9BB0", fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(7,17,34,0.92)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Line type="monotone" dataKey="customer" stroke="#00A86B" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="business" stroke="#2DD4BF" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="compliance" stroke="#C5A572" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </SlideLayout>
  );
}
