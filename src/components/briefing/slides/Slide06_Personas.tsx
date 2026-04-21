"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  Layers,
  Package,
  MonitorSmartphone,
} from "lucide-react";
import { SlideLayout } from "./SlideLayout";
import { personas } from "@/data/personas";
import type { BriefingSnapshot } from "@/lib/briefing/types";

const EASE = [0.16, 1, 0.3, 1] as const;
const SPOTLIGHT_INTERVAL_MS = 6_000;

interface Props {
  snapshot: BriefingSnapshot;
}

interface Touchpoints {
  services: string[];
  products: string[];
  channels: string[];
}

function inferTouchpoints(
  text: string,
  serviceNames: string[],
  productNames: string[],
  channelNames: string[]
): Touchpoints {
  const haystack = text.toLowerCase();
  const dedupe = (arr: string[]) =>
    Array.from(new Set(arr.map((n) => n.trim()).filter(Boolean)));
  const matches = (cands: string[]) =>
    dedupe(
      cands.filter((c) => {
        const needle = c.toLowerCase().trim();
        if (!needle || needle.length < 3) return false;
        return haystack.includes(needle);
      })
    ).slice(0, 3);
  return {
    services: matches(serviceNames),
    products: matches(productNames),
    channels: matches(channelNames),
  };
}

function CoverageChip({
  label,
  active,
  color,
}: {
  label: string;
  active: boolean;
  color: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-1.5 py-[1px] text-[8.5px] uppercase tracking-[0.14em]"
      style={{
        background: active ? `${color}1F` : "rgba(255,255,255,0.04)",
        color: active ? color : "rgba(255,255,255,0.32)",
        border: `1px solid ${active ? `${color}55` : "rgba(255,255,255,0.06)"}`,
      }}
    >
      {label}
    </span>
  );
}

export function Slide06_Personas({ snapshot }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [spotlightIdx, setSpotlightIdx] = useState(0);

  // Idle spotlight cycle (paused while hovering a tile)
  useEffect(() => {
    if (hoveredId) return;
    const id = window.setInterval(() => {
      setSpotlightIdx((i) => (i + 1) % personas.length);
    }, SPOTLIGHT_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [hoveredId]);

  const productNames = useMemo(
    () => snapshot.products.tiers.map((t) => t.tier),
    [snapshot]
  );

  const activeIdx = useMemo(() => {
    if (!hoveredId) return spotlightIdx;
    const i = personas.findIndex((p) => p.id === hoveredId);
    return i >= 0 ? i : spotlightIdx;
  }, [hoveredId, spotlightIdx]);

  const active = personas[activeIdx];

  const touchpoints = useMemo(() => {
    const text = active.gpssaJourney.steps
      .map((s) => `${s.title} ${s.description}`)
      .join(" ");
    return inferTouchpoints(
      text,
      snapshot.services.serviceNames,
      productNames,
      snapshot.delivery.channels.map((c) => c.name)
    );
  }, [active, snapshot, productNames]);

  return (
    <SlideLayout
      eyebrow="UAE today · Personas"
      title="Ten personas. Ten journeys."
      subtitle="Every benefit lived from the inside — coverage, gaps, and the touchpoints that matter."
    >
      <div className="flex h-full flex-col gap-3">
        {/* Persona grid (5x2) */}
        <div className="grid shrink-0 grid-cols-5 grid-rows-2 gap-2.5">
          {personas.map((p, i) => {
            const Icon = p.icon;
            const isActive = i === activeIdx;
            return (
              <motion.button
                key={p.id}
                type="button"
                onMouseEnter={() => setHoveredId(p.id)}
                onMouseLeave={() => setHoveredId(null)}
                onFocus={() => setHoveredId(p.id)}
                onBlur={() => setHoveredId(null)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: 0.2 + i * 0.04,
                  ease: EASE,
                }}
                className="group relative overflow-hidden rounded-xl border p-2.5 text-left transition-all duration-200"
                style={{
                  borderColor: isActive
                    ? "rgba(0,168,107,0.45)"
                    : "rgba(255,255,255,0.06)",
                  background:
                    "linear-gradient(160deg, rgba(17,34,64,0.55), rgba(7,17,34,0.85))",
                  boxShadow: isActive
                    ? "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 24px rgba(0,168,107,0.18)"
                    : "inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-6 -top-6 h-14 w-14 rounded-full opacity-50 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle, ${p.color === "purple" ? "#8B5CF6" : p.color === "cyan" ? "#22D3EE" : p.color === "amber" ? "#E7B02E" : "#1B7A4A"}28 0%, transparent 70%)`,
                    opacity: isActive ? 0.85 : 0.35,
                  }}
                />
                <div className="relative z-10 flex items-start gap-2">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(0,168,107,0.22), rgba(45,74,140,0.22))",
                    }}
                  >
                    <Icon size={13} className="text-cream" strokeWidth={1.7} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-playfair text-[11.5px] font-semibold leading-tight text-cream">
                      {p.name}
                    </div>
                    <div className="mt-0.5 line-clamp-1 text-[9.5px] italic text-white/55">
                      {p.tagline}
                    </div>
                  </div>
                </div>
                <div className="relative z-10 mt-2 flex flex-wrap gap-1">
                  <CoverageChip
                    label="Pension"
                    active={p.coverage.pension}
                    color="#1B7A4A"
                  />
                  <CoverageChip
                    label="EOS"
                    active={p.coverage.endOfService}
                    color="#E7B02E"
                  />
                  <CoverageChip
                    label="Disab."
                    active={p.coverage.disabilityBenefit}
                    color="#4899FF"
                  />
                  <CoverageChip
                    label="Death"
                    active={p.coverage.deathBenefit}
                    color="#9696AA"
                  />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Journey strip — animates between personas */}
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.018]">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="relative flex h-full flex-col gap-2.5 p-3"
            >
              {/* Header row */}
              <div className="flex shrink-0 items-baseline justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[9px] uppercase tracking-[0.22em] text-[#33C490]">
                    Spotlight · journey
                  </div>
                  <h3 className="truncate font-playfair text-[15px] font-semibold leading-tight text-cream">
                    {active.name} · {active.gpssaJourney.outcome}
                  </h3>
                </div>
                <div className="hidden shrink-0 text-[9.5px] uppercase tracking-[0.18em] text-white/45 lg:block">
                  {active.gpssaJourney.totalDuration}
                </div>
              </div>

              {/* Row 1 — 6 journey steps */}
              <div className="flex shrink-0 items-stretch gap-1.5">
                {active.gpssaJourney.steps.slice(0, 6).map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.05, ease: EASE }}
                    className="relative flex-1 rounded-lg border border-white/[0.06] bg-white/[0.025] px-2 py-1.5"
                  >
                    <div className="flex items-baseline justify-between gap-1.5">
                      <div className="text-[9px] uppercase tracking-[0.18em] text-[#33C490]">
                        Step {i + 1}
                      </div>
                      <div className="text-[8.5px] uppercase tracking-[0.14em] text-white/45">
                        {s.duration}
                      </div>
                    </div>
                    <div className="mt-0.5 line-clamp-2 text-[10.5px] font-medium leading-tight text-cream">
                      {s.title}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Row 2 + 3 grid */}
              <div className="grid min-h-0 flex-1 grid-cols-1 gap-2.5 lg:grid-cols-2">
                {/* Row 2 — coverage gaps */}
                <div className="flex flex-col rounded-lg border border-white/[0.05] bg-white/[0.015] p-2">
                  <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] text-[#E76363]">
                    <AlertTriangle size={10} /> Coverage gaps
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {active.coverage.gaps.length === 0 ? (
                      <span className="inline-flex items-center gap-1 text-[10.5px] text-white/55">
                        <CheckCircle2 size={11} className="text-[#1B7A4A]" />
                        No structural gaps recorded
                      </span>
                    ) : (
                      active.coverage.gaps.map((g, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.92 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            duration: 0.3,
                            delay: 0.2 + i * 0.05,
                            ease: EASE,
                          }}
                          className="rounded-full px-2 py-[2px] text-[10px]"
                          style={{
                            background: "rgba(231,99,99,0.12)",
                            color: "#FFB1B1",
                            border: "1px solid rgba(231,99,99,0.32)",
                          }}
                        >
                          {g}
                        </motion.span>
                      ))
                    )}
                  </div>
                </div>

                {/* Row 3 — inferred touchpoints */}
                <div className="grid min-h-0 grid-cols-3 gap-1.5 rounded-lg border border-white/[0.05] bg-white/[0.015] p-2">
                  <TouchpointCol
                    icon={<Layers size={10} className="text-[#1B7A4A]" />}
                    label="Services"
                    items={touchpoints.services}
                  />
                  <TouchpointCol
                    icon={<Package size={10} className="text-[#E7B02E]" />}
                    label="Products"
                    items={touchpoints.products}
                  />
                  <TouchpointCol
                    icon={
                      <MonitorSmartphone size={10} className="text-[#4899FF]" />
                    }
                    label="Channels"
                    items={touchpoints.channels}
                  />
                </div>
              </div>

              {/* Spotlight progress / hint footer */}
              <div className="flex shrink-0 items-center justify-between text-[9.5px] uppercase tracking-[0.18em] text-white/35">
                <span>{hoveredId ? "Locked on hover" : "Spotlight cycling · hover to pin"}</span>
                <span>
                  {activeIdx + 1} / {personas.length}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </SlideLayout>
  );
}

function TouchpointCol({
  icon,
  label,
  items,
}: {
  icon: React.ReactNode;
  label: string;
  items: string[];
}) {
  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] text-white/50">
        {icon}
        {label}
      </div>
      <div className="mt-1 flex flex-wrap gap-1">
        {items.length === 0 ? (
          <span className="text-[10px] italic text-white/30">No matches</span>
        ) : (
          items.map((it, i) => (
            <span
              key={i}
              className="truncate rounded-md bg-white/[0.04] px-1.5 py-[1px] text-[10px] text-cream/85 ring-1 ring-white/[0.06]"
            >
              {it}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
