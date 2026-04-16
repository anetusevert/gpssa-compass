"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Layers, Gauge, MonitorSmartphone, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface KPI {
  icon: LucideIcon;
  label: string;
  value: number;
  suffix?: string;
  sub?: string;
}

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 900;
    const step = Math.ceil(value / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="tabular-nums font-playfair font-bold text-cream">
      {display}{suffix}
    </span>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const pillVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 400, damping: 25 } },
};

interface KPIStripProps {
  totalChannels: number;
  avgMaturity: number;
  digitalFirstPct: number;
  fullyCovered: number;
  totalServices: number;
}

export function KPIStrip({ totalChannels, avgMaturity, digitalFirstPct, fullyCovered, totalServices }: KPIStripProps) {
  const kpis: KPI[] = [
    { icon: Layers, label: "Channels", value: totalChannels, sub: "total" },
    { icon: Gauge, label: "Avg Maturity", value: avgMaturity, suffix: "%", sub: "portfolio" },
    { icon: MonitorSmartphone, label: "Digital-First", value: digitalFirstPct, suffix: "%", sub: "portal reach" },
    { icon: CheckCircle2, label: "Full Coverage", value: fullyCovered, suffix: `/${totalServices}`, sub: "best depth" },
  ];

  return (
    <motion.div
      className="flex items-center gap-2 flex-shrink-0"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <motion.div
            key={kpi.label}
            variants={pillVariants}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm"
          >
            <div className="p-1.5 rounded-lg bg-teal-400/10">
              <Icon size={14} className="text-teal-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-gray-muted leading-none">{kpi.label}</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <AnimatedNumber value={kpi.value} suffix={kpi.suffix} />
                {kpi.sub && <span className="text-[9px] text-gray-muted">{kpi.sub}</span>}
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
