"use client";

import { motion } from "framer-motion";
import { Network as NetworkIcon, Users, Landmark } from "lucide-react";
import { SlideLayout } from "./SlideLayout";
import { Counter } from "../charts/Counter";
import {
  ARCHITECTURE,
  BRANCHES,
  COVERAGE_CLASSES,
} from "@/data/mandateScope";
import type { BriefingSnapshot } from "@/lib/briefing/types";

const EASE = [0.16, 1, 0.3, 1] as const;

interface Props {
  snapshot: BriefingSnapshot;
}

export function Slide05_UAEToday({ snapshot }: Props) {
  const m = snapshot.mandate;
  const counters = [
    {
      id: "instruments",
      label: "Statutory instruments",
      sub: "laws · circulars · policies",
      value: m.statutoryInstruments,
      accent: "#1B7A4A",
    },
    {
      id: "articles",
      label: "Articles & obligations",
      sub: "indexed for search",
      value: m.articles,
      accent: "#4899FF",
    },
    {
      id: "milestones",
      label: "Milestones recorded",
      sub: "GPSSA history & roadmap",
      value: m.milestones,
      accent: "#E7B02E",
    },
  ];

  return (
    <SlideLayout
      eyebrow="UAE today"
      title="The UAE pension system, in one slide."
      subtitle="Six branches. Four coverage classes. One mandate, governed by four institutions."
    >
      <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-12">
        {/* LEFT — Six branches */}
        <section className="flex min-h-0 flex-col lg:col-span-6">
          <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/55">
            <NetworkIcon size={11} className="text-[#1B7A4A]" /> Six branches
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-2 gap-2 lg:grid-cols-3">
            {BRANCHES.map((b, i) => {
              const Icon = b.Icon;
              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.45,
                    delay: 0.2 + i * 0.05,
                    ease: EASE,
                  }}
                  className="glass-panel relative flex min-h-0 flex-col overflow-hidden rounded-xl border border-white/[0.06] p-2.5"
                  style={{
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 22px rgba(0,0,0,0.28), 0 0 22px ${b.accent}10`,
                  }}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full opacity-50"
                    style={{
                      background: `radial-gradient(circle, ${b.accent}26 0%, transparent 70%)`,
                    }}
                  />
                  <div className="relative z-10 flex items-start gap-2">
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                      style={{
                        background: `linear-gradient(135deg, ${b.accent}28, ${b.accent}08)`,
                      }}
                    >
                      <Icon
                        size={12}
                        style={{ color: b.accent }}
                        strokeWidth={1.7}
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-playfair text-[12.5px] font-semibold leading-tight text-cream">
                        {b.label}
                      </h3>
                      <div className="mt-0.5 truncate text-[8.5px] uppercase tracking-[0.18em] text-white/45">
                        {b.ilo}
                      </div>
                    </div>
                  </div>
                  <p className="relative z-10 mt-1.5 line-clamp-2 text-[10.5px] leading-snug text-white/60">
                    {b.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* CENTER — Coverage classes */}
        <section className="flex min-h-0 flex-col lg:col-span-3">
          <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/55">
            <Users size={11} className="text-[#1B7A4A]" /> Coverage classes
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-2">
            {COVERAGE_CLASSES.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.45,
                  delay: 0.5 + i * 0.06,
                  ease: EASE,
                }}
                className="glass-panel relative flex min-h-0 flex-col overflow-hidden rounded-xl border border-white/[0.06] p-2.5"
                style={{
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 22px rgba(0,0,0,0.28), 0 0 22px ${c.accent}10`,
                }}
              >
                <div
                  className="text-[8.5px] uppercase tracking-[0.22em]"
                  style={{ color: c.accent }}
                >
                  Coverage class
                </div>
                <h4 className="mt-0.5 font-playfair text-[12.5px] font-semibold leading-tight text-cream">
                  {c.label}
                </h4>
                <p className="mt-1 line-clamp-2 text-[10.5px] leading-snug text-white/60">
                  {c.note}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* RIGHT — Mandate counters + governance */}
        <section className="flex min-h-0 flex-col lg:col-span-3">
          <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/55">
            <Landmark size={11} className="text-[#1B7A4A]" /> Mandate at a glance
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-2">
            {/* Counters */}
            <div className="grid grid-cols-1 gap-2">
              {counters.map((k, i) => (
                <motion.div
                  key={k.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.7 + i * 0.08,
                    ease: EASE,
                  }}
                  className="relative overflow-hidden rounded-xl px-3 py-2.5 ring-1 ring-white/[0.06]"
                  style={{
                    background:
                      "linear-gradient(160deg, rgba(17,34,64,0.55), rgba(7,17,34,0.85))",
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 0 22px ${k.accent}10`,
                  }}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <Counter
                      value={k.value}
                      className="font-playfair text-2xl font-bold leading-none tabular-nums"
                    />
                    <div
                      className="text-[8.5px] uppercase tracking-[0.18em]"
                      style={{ color: k.accent }}
                    >
                      live
                    </div>
                  </div>
                  <div className="mt-1 text-[10.5px] font-medium text-cream/85">
                    {k.label}
                  </div>
                  <div className="text-[9px] uppercase tracking-[0.16em] text-white/40">
                    {k.sub}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Governance architecture */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 1.0, ease: EASE }}
              className="relative mt-auto overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.018] p-2.5"
            >
              <div className="text-[8.5px] uppercase tracking-[0.22em] text-white/45">
                Governance architecture
              </div>
              <div className="mt-1.5 flex flex-col gap-1.5">
                {ARCHITECTURE.map((node, i) => {
                  const Icon = node.Icon;
                  return (
                    <motion.div
                      key={node.id}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 1.15 + i * 0.05,
                        ease: EASE,
                      }}
                      className="flex items-center gap-2"
                    >
                      <div
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                        style={{
                          background: `linear-gradient(135deg, ${node.accent}30, ${node.accent}06)`,
                        }}
                      >
                        <Icon
                          size={10}
                          style={{ color: node.accent }}
                          strokeWidth={1.7}
                        />
                      </div>
                      <div className="truncate text-[10.5px] font-medium text-cream/85">
                        {node.label}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </SlideLayout>
  );
}
