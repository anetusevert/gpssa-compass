"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { HomeModule } from "./home-modules";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const DEFAULT_COPY = {
  title: "GPSSA Intelligence",
  line: "Hover a module to preview destinations — click to enter. Strategy and operations in one command surface.",
};

export function FocusStage({
  module,
  onNavigate,
}: {
  module: HomeModule | null;
  onNavigate: (href: string) => void;
}) {
  const reduceMotion = useReducedMotion();
  const accent = module?.accentVar ?? "--gpssa-green";
  const glow = module?.glowColor ?? "rgba(0,168,107,0.18)";
  const Icon = module?.icon;

  return (
    <motion.div
      layout={!reduceMotion}
      className="relative flex h-full min-h-0 flex-col justify-center overflow-hidden rounded-2xl px-5 py-4"
      style={{
        background:
          "linear-gradient(160deg, rgba(17, 34, 64, 0.72), rgba(7, 17, 34, 0.88))",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 20px 60px rgba(0,0,0,0.25), 0 0 80px ${glow}`,
      }}
      data-tour="compass-focus-stage"
    >
      <motion.div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full"
        style={{
          background: `radial-gradient(circle, ${glow} 0%, transparent 65%)`,
        }}
        animate={
          reduceMotion
            ? undefined
            : { scale: [1, 1.12, 1], opacity: [0.45, 0.7, 0.45] }
        }
        transition={{ duration: 4.5, ease: "easeInOut", repeat: Infinity }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={module?.id ?? "default"}
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="relative z-10"
        >
          <div className="mb-2 flex items-center gap-3">
            {Icon ? (
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{
                  background: `linear-gradient(135deg, color-mix(in srgb, var(${accent}) 22%, transparent), color-mix(in srgb, var(${accent}) 6%, transparent))`,
                }}
              >
                <Icon size={16} className="icon-white" strokeWidth={1.6} />
              </div>
            ) : null}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35">
                {module ? "Focus" : "Command surface"}
              </p>
              <h3 className="font-playfair text-lg font-bold text-cream sm:text-xl">
                {module?.title ?? DEFAULT_COPY.title}
              </h3>
            </div>
          </div>

          <p className="mb-3 max-w-2xl text-[12px] leading-relaxed text-white/50 sm:text-[13px]">
            {module?.valueLine ?? DEFAULT_COPY.line}
          </p>

          {module ? (
            <div className="flex flex-wrap gap-1.5">
              {module.links.slice(0, 4).map((link) => {
                const LinkIcon = link.icon;
                return (
                  <button
                    key={link.href}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(link.href);
                    }}
                    className="group/link inline-flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-2.5 py-1.5 text-[11px] text-white/55 transition-colors hover:bg-white/[0.1] hover:text-white/90"
                  >
                    <LinkIcon size={11} strokeWidth={1.8} />
                    {link.label}
                    <ArrowRight
                      size={10}
                      className="opacity-0 transition-all group-hover/link:translate-x-0.5 group-hover/link:opacity-60"
                    />
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
              Atlas · Mandate · Portfolio · Operations
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
