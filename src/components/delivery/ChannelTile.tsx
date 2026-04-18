"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { MaturityGauge } from "./MaturityGauge";
import { Badge } from "@/components/ui/Badge";

type ChannelStatus = "Active" | "Developing" | "Pilot" | "Planned";

function statusVariant(status: ChannelStatus): "green" | "gold" | "blue" | "gray" {
  switch (status) {
    case "Active": return "green";
    case "Developing": return "gold";
    case "Pilot": return "blue";
    default: return "gray";
  }
}

export interface ChannelData {
  id: string;
  name: string;
  subtitle: string;
  icon: LucideIcon;
  maturity: number;
  servicesAvailable: number;
  servicesTotal: number;
  status: ChannelStatus;
  capabilities: string;
  strengths: string[];
  gaps: string[];
  benchmarkComparison?: string | null;
  extra?: string;
}

interface ChannelTileProps {
  channel: ChannelData;
  index: number;
  selected: boolean;
  onSelect: (channel: ChannelData) => void;
}

const tileVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
      delay: 0.15 + i * 0.06,
    },
  }),
};

export function ChannelTile({ channel, index, selected, onSelect }: ChannelTileProps) {
  const Icon = channel.icon;
  const coveragePct = Math.round((channel.servicesAvailable / channel.servicesTotal) * 100);

  return (
    <motion.button
      custom={index}
      variants={tileVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.015, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onSelect(channel)}
      className={`
        relative w-full text-left rounded-2xl p-4 transition-all duration-300 cursor-pointer
        border backdrop-blur-sm overflow-hidden group
        ${selected
          ? "bg-white/[0.07] border-teal-400/40 shadow-[0_0_24px_rgba(45,212,191,0.12)]"
          : "bg-white/[0.03] border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.1]"
        }
      `}
    >
      {selected && (
        <motion.div
          layoutId="channel-selected-glow"
          className="absolute inset-0 rounded-2xl border-2 border-teal-400/30 pointer-events-none"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}

      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-teal-400/[0.04] blur-2xl pointer-events-none group-hover:bg-teal-400/[0.08] transition-all duration-500" />

      <div className="relative flex items-start gap-3">
        <MaturityGauge value={channel.maturity} size={52} strokeWidth={3.5} delay={0.2 + index * 0.06} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-400/10">
                  <Icon size={14} className="text-teal-400" />
                </div>
                <h3 className="font-playfair text-sm font-semibold text-cream truncate">{channel.name}</h3>
              </div>
              <p className="text-[10px] text-gray-muted mt-1 ml-[30px]">{channel.subtitle}</p>
            </div>
            <Badge variant={statusVariant(channel.status)} size="sm" dot>
              {channel.status}
            </Badge>
          </div>

          <div className="mt-2.5 flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] uppercase tracking-wider text-gray-muted">Coverage</span>
                <span className="text-[10px] text-cream tabular-nums">
                  {channel.servicesAvailable}/{channel.servicesTotal}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-teal-400/80 to-gpssa-green/80"
                  initial={{ width: 0 }}
                  animate={{ width: `${coveragePct}%` }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 + index * 0.06 }}
                />
              </div>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-3 text-[9px] text-gray-muted">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gpssa-green/70" />
              {channel.strengths.length} strengths
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gold/70" />
              {channel.gaps.length} gaps
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
