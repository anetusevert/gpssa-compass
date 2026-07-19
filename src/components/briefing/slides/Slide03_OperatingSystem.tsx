"use client";

import { motion } from "framer-motion";
import {
  Scale,
  Globe,
  Layers,
  ShieldCheck,
  Network,
  type LucideIcon,
} from "lucide-react";
import { SlideLayout } from "./SlideLayout";

const EASE = [0.16, 1, 0.3, 1] as const;

interface Node {
  id: string;
  label: string;
  sub: string;
  icon: LucideIcon;
  color: string;
}

const NODES: Node[] = [
  { id: "mandate", label: "Mandate", sub: "Legal remit", icon: Scale, color: "#00A86B" },
  { id: "atlas", label: "Atlas", sub: "Global bar", icon: Globe, color: "#2DD4BF" },
  { id: "portfolio", label: "Portfolio", sub: "Svc · Prod · Del", icon: Layers, color: "#2D4A8C" },
  { id: "ops", label: "Operations", sub: "QA · Fulfil · Perf", icon: ShieldCheck, color: "#E9A23B" },
  { id: "govern", label: "Govern", sub: "Roadmap · RACI", icon: Network, color: "#C5A572" },
];

export function Slide03_OperatingSystem() {
  return (
    <SlideLayout
      eyebrow="One operating system"
      title="Compass is not a report. It is how GPSSA runs."
      subtitle="Mandate grounds every claim. Atlas sets the bar. Portfolio diagnoses. Operations assure. Governance makes it stick."
    >
      <div className="flex h-full flex-col items-center justify-center">
        {/* Path line */}
        <div className="relative mb-2 w-full max-w-5xl px-4">
          <svg
            className="pointer-events-none absolute left-0 right-0 top-1/2 hidden h-2 -translate-y-1/2 md:block"
            viewBox="0 0 1000 8"
            preserveAspectRatio="none"
          >
            <motion.path
              d="M 40 4 H 960"
              fill="none"
              stroke="rgba(0,168,107,0.35)"
              strokeWidth="2"
              strokeDasharray="8 6"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.4, ease: EASE, delay: 0.2 }}
            />
          </svg>

          <div className="relative z-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 md:gap-4">
            {NODES.map((node, i) => {
              const Icon = node.icon;
              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, y: 20, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.55, ease: EASE, delay: 0.15 + i * 0.12 }}
                  className="flex flex-col items-center rounded-2xl px-3 py-5 text-center"
                  style={{
                    background:
                      "linear-gradient(160deg, rgba(17,34,64,0.9), rgba(7,17,34,0.96))",
                    border: "1px solid rgba(255,255,255,0.06)",
                    boxShadow: `0 16px 40px rgba(0,0,0,0.3), 0 0 40px ${node.color}18`,
                  }}
                >
                  <motion.div
                    className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{
                      background: `linear-gradient(135deg, ${node.color}33, ${node.color}10)`,
                    }}
                    animate={{
                      boxShadow: [
                        `0 0 0 0 ${node.color}00`,
                        `0 0 24px 2px ${node.color}44`,
                        `0 0 0 0 ${node.color}00`,
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
                  >
                    <Icon size={20} style={{ color: node.color }} strokeWidth={1.5} />
                  </motion.div>
                  <div className="font-playfair text-base font-bold text-cream">
                    {node.label}
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/40">
                    {node.sub}
                  </div>
                  <div
                    className="mt-3 text-[10px] font-semibold tabular-nums"
                    style={{ color: node.color }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mt-8 max-w-xl text-center text-sm text-white/45"
        >
          So what: leadership gets one picture — from statute to scorecard — without
          stitching five tools together.
        </motion.p>
      </div>
    </SlideLayout>
  );
}
