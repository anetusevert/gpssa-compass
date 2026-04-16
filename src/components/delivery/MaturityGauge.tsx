"use client";

import { motion } from "framer-motion";

interface MaturityGaugeProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
  delay?: number;
}

export function MaturityGauge({
  value,
  size = 56,
  strokeWidth = 4,
  label,
  className = "",
  delay = 0,
}: MaturityGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (value / 100) * circumference;
  const offset = circumference - filled;

  const color =
    value >= 70 ? "var(--gpssa-green)" :
    value >= 40 ? "var(--teal)" :
    "var(--gold)";

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: "spring", stiffness: 60, damping: 15, delay }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs font-bold text-cream tabular-nums leading-none">{value}%</span>
        {label && <span className="text-[8px] text-gray-muted mt-0.5 leading-none">{label}</span>}
      </div>
    </div>
  );
}
