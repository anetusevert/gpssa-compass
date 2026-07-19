"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { HomeModule } from "./home-modules";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function ModuleTile({
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
      layout={!reduceMotion}
      onMouseEnter={onFocus}
      onFocus={onFocus}
      onMouseLeave={onBlur}
      onBlur={onBlur}
      onClick={onNavigate}
      initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: EASE, delay: 0.18 + index * 0.05 }}
      whileHover={reduceMotion ? undefined : { y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="glass-pillar group relative flex h-full min-h-0 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl px-2 py-3 text-center outline-none focus-visible:ring-2 focus-visible:ring-[var(--gpssa-green)]/50"
      style={{
        boxShadow: active
          ? `0 0 0 1px color-mix(in srgb, var(${module.accentVar}) 45%, transparent), 0 12px 40px ${module.glowColor}`
          : undefined,
      }}
    >
      <motion.div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 100,
          height: 100,
          right: -28,
          top: -28,
          background: `radial-gradient(circle, ${module.glowColor} 0%, transparent 70%)`,
          opacity: active ? 0.7 : 0.35,
        }}
        animate={
          reduceMotion
            ? undefined
            : { scale: [1, 1.12, 1], opacity: active ? [0.55, 0.8, 0.55] : [0.3, 0.45, 0.3] }
        }
        transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
      />

      <div
        className="relative z-10 flex h-9 w-9 items-center justify-center rounded-xl sm:h-10 sm:w-10"
        style={{
          background: `linear-gradient(135deg, color-mix(in srgb, var(${module.accentVar}) 20%, transparent), color-mix(in srgb, var(${module.accentVar}) 6%, transparent))`,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 6px 20px rgba(0,0,0,0.18)",
        }}
      >
        <Icon size={18} className="icon-white" strokeWidth={1.5} />
      </div>

      <span className="relative z-10 font-playfair text-[13px] font-bold leading-tight text-cream sm:text-sm">
        {module.title}
      </span>
    </motion.button>
  );
}
