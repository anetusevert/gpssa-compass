"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Globe, Layers, Package, GitCompare } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SlideLayout } from "./SlideLayout";
import { useBriefingStore } from "../store";
import type { BriefingSnapshot } from "@/lib/briefing/types";

const EASE = [0.16, 1, 0.3, 1] as const;

interface Props {
  snapshot: BriefingSnapshot;
}

interface CTA {
  label: string;
  href: string;
  icon: LucideIcon;
  color: string;
  badge: (s: BriefingSnapshot) => string;
}

const CTAS: CTA[] = [
  {
    label: "Global Atlas",
    href: "/dashboard/atlas",
    icon: Globe,
    color: "rgba(0,168,107,0.85)",
    badge: (s) => `${s.atlas.countryCount} nations`,
  },
  {
    label: "Service Catalog",
    href: "/dashboard/services/catalog",
    icon: Layers,
    color: "rgba(45,74,140,0.85)",
    badge: (s) => `${s.services.count} services`,
  },
  {
    label: "Product Portfolio",
    href: "/dashboard/products/portfolio",
    icon: Package,
    color: "rgba(197,165,114,0.85)",
    badge: (s) => `${s.products.count} products`,
  },
  {
    label: "Benchmarking",
    href: "/dashboard/atlas/benchmarking",
    icon: GitCompare,
    color: "rgba(45,212,191,0.85)",
    badge: (s) => `${s.benchmarks.peers.length} peers`,
  },
];

function AmbientBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 grid-overlay opacity-40" />

      <div
        className="orb halo-pulse"
        style={{
          width: 700,
          height: 700,
          left: "-10%",
          top: "-12%",
          background:
            "radial-gradient(circle, rgba(0,168,107,0.12) 0%, transparent 70%)",
        }}
      />
      <div
        className="orb drift-slow drift-reverse"
        style={{
          width: 520,
          height: 520,
          right: "-6%",
          top: "20%",
          background:
            "radial-gradient(circle, rgba(45,74,140,0.1) 0%, transparent 72%)",
        }}
      />
      <div
        className="orb drift-slow"
        style={{
          width: 400,
          height: 400,
          left: "50%",
          bottom: "-8%",
          background:
            "radial-gradient(circle, rgba(197,165,114,0.1) 0%, transparent 75%)",
        }}
      />

      <div className="ambient-ring left-[12%] top-[18%] h-72 w-72 opacity-30" />
      <div className="ambient-ring bottom-[14%] right-[12%] h-96 w-96 opacity-20" />

      <motion.div
        className="absolute left-[15%] top-[35%] h-px w-48 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        animate={{ x: [0, 50, -15, 0], opacity: [0.15, 0.5, 0.25, 0.15] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[30%] right-[18%] h-px w-64 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{ x: [0, -70, 20, 0], opacity: [0.1, 0.4, 0.15, 0.1] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export function Slide14_Closing({ snapshot }: Props) {
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
      <div className="relative flex h-full flex-col items-center justify-center">
        <AmbientBackdrop />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative z-10 mb-8 text-[11px] uppercase tracking-[0.32em] text-white/40"
        >
          Continue exploring
        </motion.div>

        <div className="relative z-10 grid w-full max-w-5xl grid-cols-2 gap-5 md:grid-cols-4">
          {CTAS.map((cta, i) => {
            const Icon = cta.icon;
            return (
              <motion.button
                key={cta.href}
                onClick={() => handleNav(cta.href)}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.6 + i * 0.12,
                  ease: EASE,
                }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="group glass-card surface-depth tile-no-frame relative flex flex-col items-start gap-4 overflow-hidden rounded-[28px] p-6 text-left transition"
                style={{
                  boxShadow:
                    "0 18px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
              >
                {/* Soft glow on hover */}
                <motion.div
                  className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-0 transition group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle, ${cta.color} 0%, transparent 70%)`,
                  }}
                />

                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl"
                  style={{
                    background: `linear-gradient(135deg, color-mix(in srgb, ${cta.color} 28%, transparent), color-mix(in srgb, ${cta.color} 8%, transparent))`,
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
                  }}
                >
                  <Icon size={18} className="text-cream" strokeWidth={1.6} />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="font-playfair text-xl font-semibold text-cream leading-tight">
                    {cta.label}
                  </div>
                  <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/[0.05] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white/55 ring-1 ring-white/10">
                    <span
                      className="block h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: cta.color }}
                    />
                    {cta.badge(snapshot)}
                  </div>
                </div>

                <ArrowRight
                  size={16}
                  className="absolute right-5 top-5 text-white/25 transition-all duration-200 group-hover:translate-x-1 group-hover:text-cream"
                />
              </motion.button>
            );
          })}
        </div>
      </div>
    </SlideLayout>
  );
}
