"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Globe, Layers, Package, GitCompare } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SlideLayout } from "./SlideLayout";
import { useBriefingStore } from "../store";

const EASE = [0.16, 1, 0.3, 1] as const;

interface CTA {
  label: string;
  sub: string;
  href: string;
  icon: LucideIcon;
  color: string;
}

const CTAS: CTA[] = [
  {
    label: "Global Atlas",
    sub: "196 nations",
    href: "/dashboard/atlas",
    icon: Globe,
    color: "rgba(0,168,107,0.85)",
  },
  {
    label: "Service Catalog",
    sub: "31 services",
    href: "/dashboard/services/catalog",
    icon: Layers,
    color: "rgba(45,74,140,0.85)",
  },
  {
    label: "Product Portfolio",
    sub: "Tiers & segments",
    href: "/dashboard/products/portfolio",
    icon: Package,
    color: "rgba(197,165,114,0.85)",
  },
  {
    label: "Benchmarking",
    sub: "Live comparators",
    href: "/dashboard/atlas/benchmarking",
    icon: GitCompare,
    color: "rgba(45,212,191,0.85)",
  },
];

const STATEMENTS = [
  { kicker: "01", title: "Live", body: "Updates continuously as agents finish." },
  { kicker: "02", title: "Sourced", body: "Every claim cites a verifiable source." },
  { kicker: "03", title: "Comparable", body: "Benchmarks against the world." },
];

export function Slide10_Closing() {
  const router = useRouter();
  const closeDeck = useBriefingStore((s) => s.closeDeck);

  function handleNav(href: string) {
    closeDeck();
    router.push(href);
  }

  return (
    <SlideLayout
      eyebrow="The Compass Difference"
      title="Foundations are strong. Let's turn them into leadership."
      subtitle="GPSSA Compass is your operating system for the next pension era — already up, already comparing, already proposing the next move."
    >
      <div className="flex h-full flex-col items-center justify-center gap-12">
        <div className="grid w-full max-w-4xl grid-cols-3 gap-4">
          {STATEMENTS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.4 + i * 0.18,
                ease: EASE,
              }}
              className="rounded-2xl px-6 py-5 ring-1 ring-white/[0.05]"
              style={{
                background:
                  "linear-gradient(160deg, rgba(17,34,64,0.55), rgba(7,17,34,0.85))",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.05), 0 14px 40px rgba(0,0,0,0.2)",
              }}
            >
              <div className="text-[11px] uppercase tracking-[0.32em] text-[#33C490]/85 mb-2">
                {s.kicker}
              </div>
              <div className="font-playfair text-3xl font-bold text-cream">
                {s.title}
              </div>
              <div className="mt-2 text-sm text-white/55">{s.body}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-[11px] uppercase tracking-[0.32em] text-white/40"
        >
          Continue exploring
        </motion.div>

        <div className="grid w-full max-w-4xl grid-cols-2 md:grid-cols-4 gap-3">
          {CTAS.map((cta, i) => {
            const Icon = cta.icon;
            return (
              <motion.button
                key={cta.href}
                onClick={() => handleNav(cta.href)}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 1.4 + i * 0.1,
                  ease: EASE,
                }}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group flex items-center gap-3 rounded-xl px-4 py-3 text-left ring-1 ring-white/[0.06] overflow-hidden relative"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(17,34,64,0.65), rgba(7,17,34,0.92))",
                }}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: `linear-gradient(135deg, color-mix(in srgb, ${cta.color} 26%, transparent), color-mix(in srgb, ${cta.color} 8%, transparent))`,
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
                  }}
                >
                  <Icon size={16} className="text-cream" strokeWidth={1.6} />
                </div>
                <div className="flex flex-col leading-tight">
                  <div className="text-[13px] font-semibold text-cream">
                    {cta.label}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">
                    {cta.sub}
                  </div>
                </div>
                <ArrowRight
                  size={14}
                  className="ml-auto text-white/30 transition-all duration-200 group-hover:translate-x-1 group-hover:text-cream"
                />
              </motion.button>
            );
          })}
        </div>
      </div>
    </SlideLayout>
  );
}
