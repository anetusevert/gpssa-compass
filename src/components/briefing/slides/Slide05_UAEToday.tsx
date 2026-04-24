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
      accent: "#33C490",
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
      title="What we cover. Who we serve. Who governs it."
      subtitle="Six branches of social protection, four coverage classes, one mandate — governed by four institutions and grounded in measurable law."
    >
      <div className="flex h-full flex-col gap-3">
        {/* Counter strip — three horizontal tiles spanning full width */}
        <div className="grid shrink-0 grid-cols-3 gap-3">
          {counters.map((k, i) => (
            <motion.div
              key={k.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.08, ease: EASE }}
              className="relative overflow-hidden rounded-xl px-4 py-2.5 ring-1 ring-white/[0.06]"
              style={{
                background:
                  "linear-gradient(160deg, rgba(17,34,64,0.55), rgba(7,17,34,0.85))",
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 0 26px ${k.accent}10`,
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-40"
                style={{
                  background: `radial-gradient(circle, ${k.accent}26 0%, transparent 70%)`,
                }}
              />
              <div className="relative flex items-baseline justify-between gap-3">
                <Counter
                  value={k.value}
                  className="font-playfair text-3xl font-bold leading-none tabular-nums text-cream"
                />
                <div className="flex flex-col items-end text-right">
                  <div
                    className="text-[8.5px] uppercase tracking-[0.18em]"
                    style={{ color: k.accent }}
                  >
                    Live
                  </div>
                  <div className="text-[11.5px] font-medium text-cream/85">
                    {k.label}
                  </div>
                  <div className="text-[9px] uppercase tracking-[0.16em] text-white/40">
                    {k.sub}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Body grid */}
        <div className="grid min-h-0 flex-1 grid-cols-12 gap-3">
          {/* LEFT — Six branches (denser 3x2) */}
          <section className="col-span-7 flex min-h-0 flex-col">
            <div className="mb-1.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/55">
              <NetworkIcon size={11} className="text-[#33C490]" /> Six branches of social protection
            </div>
            <div className="grid min-h-0 flex-1 grid-cols-3 grid-rows-2 gap-2">
              {BRANCHES.map((b, i) => {
                const Icon = b.Icon;
                return (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.45,
                      delay: 0.45 + i * 0.05,
                      ease: EASE,
                    }}
                    className="relative flex min-h-0 flex-col overflow-hidden rounded-xl border border-white/[0.06] p-2.5"
                    style={{
                      background:
                        "linear-gradient(160deg, rgba(17,34,64,0.45), rgba(7,17,34,0.85))",
                      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 0 20px ${b.accent}10`,
                    }}
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full opacity-50"
                      style={{
                        background: `radial-gradient(circle, ${b.accent}28 0%, transparent 70%)`,
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
                        <h3 className="truncate font-playfair text-[12px] font-semibold leading-tight text-cream">
                          {b.label}
                        </h3>
                        <div className="mt-0.5 truncate text-[8.5px] uppercase tracking-[0.18em] text-white/45">
                          {b.ilo}
                        </div>
                      </div>
                    </div>
                    <p className="relative z-10 mt-1 line-clamp-2 text-[10px] leading-snug text-white/60">
                      {b.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* RIGHT — Coverage classes + Governance architecture */}
          <section className="col-span-5 flex min-h-0 flex-col gap-3">
            {/* Coverage classes */}
            <div className="flex min-h-0 flex-col">
              <div className="mb-1.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/55">
                <Users size={11} className="text-[#33C490]" /> Four coverage classes
              </div>
              <div className="grid grid-cols-2 gap-2">
                {COVERAGE_CLASSES.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.45,
                      delay: 0.7 + i * 0.06,
                      ease: EASE,
                    }}
                    className="relative overflow-hidden rounded-xl border border-white/[0.06] p-2.5"
                    style={{
                      background:
                        "linear-gradient(160deg, rgba(17,34,64,0.45), rgba(7,17,34,0.85))",
                      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 0 20px ${c.accent}10`,
                    }}
                  >
                    <div
                      className="text-[8.5px] uppercase tracking-[0.22em]"
                      style={{ color: c.accent }}
                    >
                      Coverage class
                    </div>
                    <h4 className="mt-0.5 font-playfair text-[12px] font-semibold leading-tight text-cream">
                      {c.label}
                    </h4>
                    <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-white/60">
                      {c.note}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Governance architecture — horizontal row */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 1, ease: EASE }}
              className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.018] p-3"
            >
              <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/55">
                <Landmark size={11} className="text-[#33C490]" /> Governance architecture
              </div>
              <div className="grid grid-cols-4 gap-2">
                {ARCHITECTURE.map((node, i) => {
                  const Icon = node.Icon;
                  return (
                    <motion.div
                      key={node.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 1.15 + i * 0.05,
                        ease: EASE,
                      }}
                      className="flex flex-col items-center gap-1 text-center"
                    >
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-md"
                        style={{
                          background: `linear-gradient(135deg, ${node.accent}30, ${node.accent}06)`,
                          boxShadow: `0 0 14px ${node.accent}24`,
                        }}
                      >
                        <Icon
                          size={14}
                          style={{ color: node.accent }}
                          strokeWidth={1.7}
                        />
                      </div>
                      <div className="text-[10px] font-medium leading-tight text-cream/90">
                        {node.label}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </section>
        </div>
      </div>
    </SlideLayout>
  );
}
