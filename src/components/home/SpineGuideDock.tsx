"use client";

import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { GitBranch } from "lucide-react";
import { HERO_MODULES, CORE_MODULES, OPS_MODULES } from "./home-modules";
import { EASE } from "@/lib/motion";
import { SpineConductorRail } from "./SpineConductorRail";

const MODULES = [...HERO_MODULES, ...CORE_MODULES, ...OPS_MODULES];

const DOCK_LABELS: Record<string, string> = {
  atlas: "Atlas",
  mandate: "Mandate",
  services: "Services",
  products: "Products",
  delivery: "Delivery",
  quality: "Quality",
  fulfilment: "Fulfilment",
  performance: "Performance",
  planning: "Roadmap",
};

export function SpineGuideDock() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  return (
    <motion.nav
      className="flex shrink-0 flex-col items-center gap-1.5"
      aria-label="Guide"
      data-tour="compass-pillar-grid"
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.45, ease: EASE }}
    >
      {/* Operational conductor — persona → episode → journey → process → systems & QA */}
      <SpineConductorRail />

      {/* Compact secondary module rail */}
      <div className="flex max-w-full items-center gap-0.5 overflow-x-auto rounded-2xl border border-white/[0.06] bg-black/20 px-1.5 py-0.5 backdrop-blur-md scrollbar-none">
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          const tourId =
            mod.id === "atlas"
              ? "compass-atlas-bar"
              : mod.id === "mandate"
                ? "compass-mandate-bar"
                : undefined;
          return (
            <motion.button
              key={mod.id}
              type="button"
              data-tour={tourId}
              onClick={() => router.push(mod.primaryHref)}
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="group flex min-w-[48px] flex-col items-center gap-0.5 rounded-xl px-1.5 py-1 transition hover:bg-white/[0.05]"
              title={mod.title}
            >
              <Icon
                size={13}
                className="transition group-hover:drop-shadow-[0_0_6px_currentColor]"
                style={{ color: `var(${mod.accentVar})` }}
              />
              <span className="max-w-[56px] truncate text-[7px] font-semibold uppercase tracking-[0.08em] text-white/35 group-hover:text-white/70">
                {DOCK_LABELS[mod.id] ?? mod.title}
              </span>
            </motion.button>
          );
        })}
        <span className="mx-1 h-5 w-px shrink-0 bg-white/10" />
        <motion.button
          type="button"
          onClick={() => router.push("/dashboard/services/operating")}
          whileHover={reduceMotion ? undefined : { y: -2 }}
          whileTap={{ scale: 0.96 }}
          className="flex min-w-[48px] flex-col items-center gap-0.5 rounded-xl bg-[var(--gpssa-green)]/12 px-1.5 py-1"
          title="Operating blueprints"
        >
          <GitBranch size={13} className="text-[var(--gpssa-green)]" />
          <span className="text-[7px] font-semibold uppercase tracking-[0.08em] text-[var(--gpssa-green)]">
            Blueprint
          </span>
        </motion.button>
      </div>
    </motion.nav>
  );
}
