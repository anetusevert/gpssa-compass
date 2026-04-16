"use client";

import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, AlertTriangle, Info } from "lucide-react";
import type { ChannelData } from "./ChannelTile";
import type { DeliveryModelData } from "./DeliveryModelCard";
import { MaturityGauge } from "./MaturityGauge";
import { Badge } from "@/components/ui/Badge";

interface CountryChannelScore {
  country: string;
  iso3: string;
  score: number;
}

const BENCHMARK_COUNTRIES: CountryChannelScore[] = [
  { country: "Singapore (CPF)", iso3: "SGP", score: 92 },
  { country: "Estonia (ENSIB)", iso3: "EST", score: 88 },
  { country: "Saudi Arabia (GOSI)", iso3: "SAU", score: 62 },
  { country: "Bahrain (SIO)", iso3: "BHR", score: 55 },
  { country: "Kuwait (PIFSS)", iso3: "KWT", score: 45 },
];

const channelBenchmarkMap: Record<string, number[]> = {
  portal:  [95, 91, 65, 58, 48],
  mobile:  [90, 82, 55, 42, 35],
  centers: [80, 70, 88, 85, 82],
  call:    [88, 78, 72, 65, 60],
  partner: [85, 75, 35, 30, 25],
  api:     [92, 88, 40, 28, 20],
};

function getChannelBenchmarks(channelId: string): CountryChannelScore[] {
  const scores = channelBenchmarkMap[channelId] ?? [70, 65, 50, 45, 40];
  return BENCHMARK_COUNTRIES.map((c, i) => ({ ...c, score: scores[i] }));
}

function findRelatedModels(channel: ChannelData, models: DeliveryModelData[]): DeliveryModelData[] {
  const channelKeywords = channel.name.toLowerCase().split(/\s+/);
  return models.filter((m) =>
    m.covers.some((c) => {
      const coverLower = c.toLowerCase();
      return channelKeywords.some((kw) => coverLower.includes(kw)) || coverLower.includes(channel.id);
    })
  );
}

interface ChannelDetailProps {
  channel: ChannelData;
  models: DeliveryModelData[];
  onBack: () => void;
}

const containerVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 26, staggerChildren: 0.05 },
  },
  exit: { opacity: 0, x: 30, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 400, damping: 25 } },
};

export function ChannelDetail({ channel, models, onBack }: ChannelDetailProps) {
  const Icon = channel.icon;
  const benchmarks = getChannelBenchmarks(channel.id);
  const relatedModels = findRelatedModels(channel, models);
  const maxScore = Math.max(channel.maturity, ...benchmarks.map((b) => b.score));

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="h-full flex flex-col overflow-hidden"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-3 mb-4 flex-shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
        >
          <ArrowLeft size={14} className="text-gray-muted" />
        </button>
        <div className="p-2 rounded-xl bg-teal-400/10 border border-teal-400/20">
          <Icon size={16} className="text-teal-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-playfair text-base font-semibold text-cream truncate">{channel.name}</h3>
          <p className="text-[10px] text-gray-muted">{channel.subtitle}</p>
        </div>
        <MaturityGauge value={channel.maturity} size={48} strokeWidth={3} />
      </motion.div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {/* Capabilities */}
        <motion.div variants={itemVariants} className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Info size={11} className="text-adl-blue" />
            <span className="text-[10px] uppercase tracking-wider text-gray-muted font-semibold">Capabilities</span>
          </div>
          <p className="text-[11px] text-cream/80 leading-relaxed">{channel.capabilities}</p>
        </motion.div>

        {/* Strengths & Gaps */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl bg-gpssa-green/[0.04] border border-gpssa-green/10 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp size={11} className="text-gpssa-green" />
              <span className="text-[10px] uppercase tracking-wider text-gpssa-green font-semibold">Strengths</span>
            </div>
            <ul className="space-y-1.5">
              {channel.strengths.map((s, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                  className="text-[10px] text-cream/70 leading-snug flex gap-1.5"
                >
                  <span className="text-gpssa-green mt-0.5 shrink-0">+</span>
                  <span>{s}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-gold/[0.04] border border-gold/10 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle size={11} className="text-gold" />
              <span className="text-[10px] uppercase tracking-wider text-gold font-semibold">Gaps</span>
            </div>
            <ul className="space-y-1.5">
              {channel.gaps.map((g, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                  className="text-[10px] text-cream/70 leading-snug flex gap-1.5"
                >
                  <span className="text-gold mt-0.5 shrink-0">-</span>
                  <span>{g}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Country Comparison */}
        <motion.div variants={itemVariants} className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3">
          <h4 className="text-[10px] uppercase tracking-wider text-gray-muted font-semibold mb-3">
            GPSSA vs Peers — {channel.name}
          </h4>

          <div className="space-y-2">
            {/* GPSSA bar */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-teal-400 font-semibold w-[110px] truncate shrink-0">GPSSA</span>
              <div className="flex-1 h-3 rounded-full bg-white/[0.06] overflow-hidden relative">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-teal-400 to-gpssa-green"
                  initial={{ width: 0 }}
                  animate={{ width: `${(channel.maturity / maxScore) * 100}%` }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                />
              </div>
              <span className="text-[10px] text-cream tabular-nums w-8 text-right">{channel.maturity}</span>
            </div>

            {benchmarks.map((b, i) => (
              <div key={b.iso3} className="flex items-center gap-2">
                <span className="text-[10px] text-gray-muted w-[110px] truncate shrink-0">{b.country}</span>
                <div className="flex-1 h-2.5 rounded-full bg-white/[0.04] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-white/20"
                    initial={{ width: 0 }}
                    animate={{ width: `${(b.score / maxScore) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 + i * 0.06 }}
                  />
                </div>
                <span className="text-[10px] text-gray-muted tabular-nums w-8 text-right">{b.score}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Related delivery models */}
        {relatedModels.length > 0 && (
          <motion.div variants={itemVariants} className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3">
            <h4 className="text-[10px] uppercase tracking-wider text-gray-muted font-semibold mb-2">
              Related Delivery Models
            </h4>
            <div className="space-y-1.5">
              {relatedModels.map((m) => {
                const MIcon = m.icon;
                return (
                  <div key={m.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03]">
                    <MIcon size={13} className="text-teal-400 shrink-0" />
                    <span className="text-[11px] text-cream flex-1 truncate">{m.title}</span>
                    <Badge variant={m.maturity === "High" ? "green" : m.maturity === "Medium" ? "gold" : "gray"} size="sm">
                      {m.maturity}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {channel.extra && (
          <motion.div variants={itemVariants} className="text-[10px] text-adl-blue/80 border-l-2 border-adl-blue/30 pl-2.5 py-1">
            {channel.extra}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
