"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface SlidePlaceholderProps {
  pillar: string;
  done?: number;
  total?: number;
  message?: string;
}

export function SlidePlaceholder({
  pillar,
  done,
  total,
  message,
}: SlidePlaceholderProps) {
  const ratio = total && total > 0 ? Math.min(1, (done ?? 0) / total) : 0;
  const pct = Math.round(ratio * 100);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-12 text-center">
      <motion.div
        className="relative mb-8 flex h-32 w-32 items-center justify-center"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Outer ring */}
        <svg
          viewBox="0 0 120 120"
          className="absolute inset-0 -rotate-90"
          width="100%"
          height="100%"
        >
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="2"
          />
          <motion.circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="url(#placeholderRing)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 54}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 54 }}
            animate={{
              strokeDashoffset: 2 * Math.PI * 54 * (1 - ratio),
            }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          />
          <defs>
            <linearGradient id="placeholderRing" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#00A86B" />
              <stop offset="100%" stopColor="#2D4A8C" />
            </linearGradient>
          </defs>
        </svg>

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="text-white/40"
        >
          <Loader2 size={28} strokeWidth={1.5} />
        </motion.div>
      </motion.div>

      <motion.h2
        className="font-playfair text-3xl font-bold text-cream"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {pillar} research in progress
      </motion.h2>

      {total !== undefined && total > 0 && (
        <motion.p
          className="mt-3 text-sm text-white/55"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <span className="text-cream font-semibold">{done ?? 0}</span>{" "}
          <span className="text-white/40">of</span>{" "}
          <span className="text-cream">{total}</span> complete{" "}
          <span className="text-white/30">·</span>{" "}
          <span className="text-[#33C490]">{pct}%</span>
        </motion.p>
      )}

      {message && (
        <motion.p
          className="mt-4 max-w-md text-[13px] leading-relaxed text-white/45"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.55 }}
        >
          {message}
        </motion.p>
      )}

      <motion.div
        className="mt-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/35"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <motion.span
          className="h-1 w-1 rounded-full bg-[#00A86B]"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />
        Live data still loading
      </motion.div>
    </div>
  );
}
