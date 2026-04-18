"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Calendar, ExternalLink, Sparkles } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

interface Milestone {
  id: string;
  year: number;
  date: string | null;
  title: string;
  description: string;
  kind: string;
  sourceUrl: string | null;
}

interface MandateTimelineProps {
  milestones: Milestone[];
}

const KIND_META: Record<string, { color: string; label: string }> = {
  milestone: { color: "#00A86B", label: "Milestone" },
  reform: { color: "#4899FF", label: "Reform" },
  agreement: { color: "#C5A572", label: "Agreement" },
  award: { color: "#E7B02E", label: "Award" },
  press: { color: "#CA63D5", label: "Announcement" },
};

export function MandateTimeline({ milestones }: MandateTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  if (milestones.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.015] p-12 text-center text-sm text-white/55">
        No historical milestones indexed yet. Run the mandate-corpus agent against the GPSSA About / News pages.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative pt-6">
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/[0.06]" />
      <motion.div
        className="absolute left-1/2 top-0 w-px -translate-x-1/2"
        style={{
          height: lineHeight,
          background: "linear-gradient(180deg, rgba(0,168,107,0.7), rgba(72,153,255,0.7))",
          boxShadow: "0 0 24px rgba(0,168,107,0.35)",
        }}
      />

      <div className="space-y-12">
        {milestones.map((m, i) => {
          const meta = KIND_META[m.kind] ?? KIND_META.milestone;
          const isLeft = i % 2 === 0;
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: EASE }}
              className={`relative flex flex-col gap-3 sm:flex-row sm:items-start ${
                isLeft ? "" : "sm:flex-row-reverse"
              }`}
            >
              <div className="hidden w-1/2 sm:block" />

              <div className="absolute left-1/2 top-3 z-10 -translate-x-1/2">
                <div
                  className="h-3 w-3 rounded-full ring-4"
                  style={{ background: meta.color, boxShadow: `0 0 18px ${meta.color}66` }}
                />
              </div>

              <div className="sm:w-1/2 sm:px-8">
                <div
                  className="glass-panel relative overflow-hidden rounded-2xl border border-white/[0.04] p-5"
                  style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 12px 32px rgba(0,0,0,0.28), 0 0 24px ${meta.color}10` }}
                >
                  <div
                    className="absolute inset-y-0 left-0 w-[3px]"
                    style={{ background: `linear-gradient(180deg, ${meta.color}, transparent)` }}
                  />
                  <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.22em]">
                    <span className="font-playfair text-3xl font-bold text-cream tracking-normal">
                      {m.year}
                    </span>
                    <span style={{ color: meta.color }}>{meta.label}</span>
                    {m.date && (
                      <span className="inline-flex items-center gap-1 text-white/45">
                        <Calendar size={11} /> {m.date}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 font-playfair text-lg font-semibold text-cream">{m.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-white/65">{m.description}</p>

                  {m.sourceUrl && (
                    <a
                      href={m.sourceUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-3 inline-flex items-center gap-1 text-[11px] text-white/55 hover:text-cream"
                    >
                      <Sparkles size={10} className="text-[#00A86B]" /> Source <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
