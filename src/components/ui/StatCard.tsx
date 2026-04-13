"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

const trendConfig = {
  up: { icon: TrendingUp, color: "text-gpssa-green", bg: "bg-gpssa-green/10" },
  down: { icon: TrendingDown, color: "text-red-400", bg: "bg-red-400/10" },
  neutral: { icon: Minus, color: "text-gray-muted", bg: "bg-gray-muted/10" },
} as const;

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
  trend = "neutral",
  className = "",
}: StatCardProps) {
  const t = trendConfig[trend];
  const TrendIcon = t.icon;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`glass-card p-5 ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-xl bg-white/5">
          <Icon size={20} className="text-gray-muted" />
        </div>

        {change && (
          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${t.bg} ${t.color}`}>
            <TrendIcon size={12} />
            {change}
          </div>
        )}
      </div>

      <p className="text-2xl font-bold text-cream font-playfair">{value}</p>
      <p className="text-xs text-gray-muted mt-0.5 uppercase tracking-wide">
        {label}
      </p>
    </motion.div>
  );
}
