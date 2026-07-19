"use client";

import { motion } from "framer-motion";
import { Scale, FileText, Link2, BookOpen } from "lucide-react";
import { SlideLayout } from "./SlideLayout";
import { Counter } from "../charts/Counter";
import { SourceChip } from "@/components/ui/SourceChip";
import type { BriefingSnapshot } from "@/lib/briefing/types";

const EASE = [0.16, 1, 0.3, 1] as const;

interface Props {
  snapshot: BriefingSnapshot;
}

export function Slide04_Mandate({ snapshot }: Props) {
  const m = snapshot.mandate;
  const stats = [
    {
      label: "Statutory instruments",
      value: m.statutoryInstruments,
      icon: Scale,
      color: "#00A86B",
    },
    {
      label: "Articles & obligations",
      value: m.articles,
      icon: FileText,
      color: "#2DD4BF",
    },
    {
      label: "Obligation links",
      value: m.obligationLinks,
      icon: Link2,
      color: "#C5A572",
    },
    {
      label: "Source pages",
      value: m.sourcePages,
      icon: BookOpen,
      color: "#2D4A8C",
    },
  ];

  const featured = m.featuredStandards.slice(0, 4);

  return (
    <SlideLayout
      eyebrow="Mandate-grounded"
      title="Every recommendation sits on GPSSA’s remit."
      subtitle="Compass binds services, products and channels to the legal corpus — so a pitch in the boardroom is also a citation trail."
    >
      <div className="flex h-full flex-col gap-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.1 + i * 0.08 }}
                className="rounded-2xl px-4 py-5 text-center"
                style={{
                  background:
                    "linear-gradient(160deg, rgba(17,34,64,0.88), rgba(7,17,34,0.95))",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <Icon
                  size={16}
                  className="mx-auto mb-2"
                  style={{ color: s.color }}
                  strokeWidth={1.6}
                />
                <div className="font-playfair text-3xl font-bold text-cream">
                  <Counter value={s.value} />
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/40">
                  {s.label}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2">
          {featured.map((std, i) => (
            <motion.div
              key={std.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.45 + i * 0.08 }}
              className="flex items-center gap-4 rounded-xl bg-white/[0.03] px-4 py-3 ring-1 ring-white/[0.05]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00A86B]/15 text-[11px] font-bold text-[#33C490]">
                {std.code?.slice(0, 4) ?? "STD"}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-cream">
                  {std.title}
                </div>
                <div className="text-[11px] text-white/40">
                  {std.requirementCount} requirements · {std.category}
                </div>
              </div>
            </motion.div>
          ))}
          {featured.length === 0 && (
            <p className="col-span-2 self-center text-center text-sm text-white/40">
              Mandate corpus seeding in progress — structure is ready.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <SourceChip label="GPSSA corpus" publisher="GPSSA" />
          <SourceChip label="Standards library" publisher="ILO / ISSA" />
          <SourceChip
            label={`${m.sourcePages} source pages`}
            publisher="Evidence base"
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center text-[12px] text-white/40"
        >
          So what: sponsors can ask “under which article?” — and Compass answers.
        </motion.p>
      </div>
    </SlideLayout>
  );
}
