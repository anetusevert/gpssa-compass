"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { HomeModule } from "./home-modules";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function HeroRail({
  module,
  index,
  active,
  onFocus,
  onBlur,
  onNavigate,
  tourId,
}: {
  module: HomeModule;
  index: number;
  active: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onNavigate: () => void;
  tourId?: string;
}) {
  const reduceMotion = useReducedMotion();
  const Icon = module.icon;

  return (
    <motion.button
      type="button"
      data-tour={tourId}
      onMouseEnter={onFocus}
      onFocus={onFocus}
      onMouseLeave={onBlur}
      onBlur={onBlur}
      onClick={onNavigate}
      className="shimmer-border glass-bar group relative flex h-full min-h-0 w-full items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--gpssa-green)]/50 sm:px-5"
      initial={reduceMotion ? false : { opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: EASE, delay: 0.08 + index * 0.06 }}
      whileHover={reduceMotion ? undefined : { y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.995 }}
      style={{
        boxShadow: active
          ? `0 0 0 1px color-mix(in srgb, var(${module.accentVar}) 40%, transparent), 0 16px 48px ${module.glowColor}`
          : undefined,
      }}
    >
      <motion.div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full"
        style={{
          background: `radial-gradient(circle, ${module.glowColor} 0%, transparent 70%)`,
        }}
        animate={
          reduceMotion
            ? undefined
            : { x: [0, -10, 0], y: [0, 6, 0], scale: [1, 1.15, 1] }
        }
        transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
      />

      <div
        className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: `linear-gradient(135deg, color-mix(in srgb, var(${module.accentVar}) 22%, transparent), color-mix(in srgb, var(${module.accentVar}) 8%, transparent))`,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 6px 20px rgba(0,0,0,0.15)",
        }}
      >
        <Icon size={18} className="text-[#00A86B]" strokeWidth={1.6} />
      </div>

      <div className="relative z-10 min-w-0 flex-1">
        <h3 className="truncate font-playfair text-base font-bold text-cream sm:text-lg">
          {module.title}
        </h3>
        <p className="mt-0.5 truncate text-[11px] text-white/40">{module.subtitle}</p>
      </div>

      <motion.div
        className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.04]"
        animate={reduceMotion ? undefined : { x: [0, 3, 0] }}
        transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
      >
        <ArrowRight
          size={14}
          className="text-white/45 transition-colors group-hover:text-white/80"
        />
      </motion.div>
    </motion.button>
  );
}
