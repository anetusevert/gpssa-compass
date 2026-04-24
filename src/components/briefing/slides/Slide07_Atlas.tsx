"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Plus, X } from "lucide-react";
import { SlideLayout } from "./SlideLayout";
import { LiveAtlasMap } from "../charts/LiveAtlasMap";
import { useComparatorStore } from "../store";
import type { AtlasCountryRow, BriefingSnapshot } from "@/lib/briefing/types";

const EASE = [0.16, 1, 0.3, 1] as const;
const SPOTLIGHT_INTERVAL_MS = 4_500;

interface Props {
  snapshot: BriefingSnapshot;
}

const MATURITY_LEGEND: { label: string; color: string }[] = [
  { label: "Leading", color: "#33C490" },
  { label: "Advanced", color: "#1B7A4A" },
  { label: "Developed", color: "#4899FF" },
  { label: "Emerging", color: "#E7B02E" },
  { label: "Foundational", color: "#E76363" },
];

const METRIC_LABELS: { key: keyof AtlasCountryRow["metrics"]; label: string }[] = [
  { key: "maturityScore", label: "Maturity" },
  { key: "coverageRate", label: "Coverage" },
  { key: "replacementRate", label: "Replacement" },
  { key: "sustainability", label: "Sustainability" },
  { key: "digitalReadiness", label: "Digital readiness" },
];

export function Slide07_Atlas({ snapshot }: Props) {
  const slide5 = useComparatorStore((s) => s.slide5);
  const toggle = useComparatorStore((s) => s.toggle);
  const remove = useComparatorStore((s) => s.remove);
  const openPicker = useComparatorStore((s) => s.openPicker);

  // Pool of countries that the spotlight will visit — researched ones with maturity.
  const pool = useMemo(
    () =>
      snapshot.atlas.countries.filter(
        (c) => c.maturityLabel != null && c.iso3 !== "ARE"
      ),
    [snapshot.atlas.countries]
  );

  const uae = useMemo(
    () => snapshot.atlas.countries.find((c) => c.iso3 === "ARE"),
    [snapshot.atlas.countries]
  );

  // Start with UAE if available, then cycle.
  const [spotlitIso, setSpotlitIso] = useState<string | null>(uae?.iso3 ?? pool[0]?.iso3 ?? null);
  // When the user hovers the map (or hovers a chip), pause the auto-cycle.
  const [pausedAt, setPausedAt] = useState<number>(0);
  const pauseTimerRef = useRef<number | null>(null);

  // Auto-rotate spotlight every few seconds — UAE every 4 hops to keep us pinned.
  useEffect(() => {
    if (pool.length === 0) return;
    let hop = 0;
    const id = window.setInterval(() => {
      // Honour 8s pause window after a manual hover.
      if (Date.now() - pausedAt < 8_000) return;
      hop++;
      if (uae && hop % 4 === 0) {
        setSpotlitIso(uae.iso3);
      } else {
        const next = pool[Math.floor(Math.random() * pool.length)];
        setSpotlitIso(next.iso3);
      }
    }, SPOTLIGHT_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [pool, uae, pausedAt]);

  function handleSpotlightChange(iso: string | null) {
    if (!iso) return;
    setSpotlitIso(iso);
    setPausedAt(Date.now());
    if (pauseTimerRef.current) window.clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = window.setTimeout(() => {
      setPausedAt(0);
    }, 8_000);
  }

  function handlePick(c: AtlasCountryRow) {
    toggle("slide5", {
      id: `country:${c.iso3}`,
      kind: "country",
      label: c.name,
      sublabel: c.region,
      flag: c.flag ?? undefined,
    });
  }

  const spotlight = useMemo(
    () =>
      spotlitIso
        ? snapshot.atlas.countries.find((c) => c.iso3 === spotlitIso) ?? null
        : null,
    [spotlitIso, snapshot.atlas.countries]
  );

  return (
    <SlideLayout
      eyebrow="Compare · Global Atlas"
      title="We see every pension system on the planet."
      subtitle="A living world map of pension maturity — hover or click any country to inspect its scorecard."
    >
      <div className="flex h-full flex-col gap-3">
        {/* Header strip */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className="font-playfair text-2xl font-bold tabular-nums text-cream">
                {snapshot.atlas.countryCount}
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                countries scanned
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-playfair text-xl font-bold tabular-nums text-[#33C490]">
                {snapshot.atlas.researchedCount}
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                with full scorecards
              </span>
            </div>
            <div className="flex items-center gap-2 pl-2">
              {MATURITY_LEGEND.map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-sm"
                    style={{ background: l.color }}
                  />
                  <span className="text-[9.5px] uppercase tracking-[0.16em] text-white/55">
                    {l.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {slide5.length > 0 && (
              <div className="flex items-center gap-1.5">
                {slide5.slice(0, 4).map((r) => (
                  <motion.button
                    key={r.id}
                    type="button"
                    onClick={() => remove("slide5", r.id)}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="group inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[10px] text-cream"
                    style={{
                      background: `${r.color}1F`,
                      border: `1px solid ${r.color}55`,
                    }}
                    title="Remove from comparator"
                  >
                    {r.flag && <span className="leading-none">{r.flag}</span>}
                    <span className="font-medium">{r.label}</span>
                    <X
                      size={10}
                      className="text-white/45 transition-colors group-hover:text-white"
                    />
                  </motion.button>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => openPicker("slide5")}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10.5px] text-cream transition hover:bg-white/[0.1]"
            >
              <Plus size={11} />
              <Globe size={11} />
              <span className="uppercase tracking-[0.16em]">Pick countries</span>
            </button>
          </div>
        </div>

        {/* Map + scorecard */}
        <div className="relative grid min-h-0 flex-1 grid-cols-12 gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
            className="col-span-9 min-h-0"
          >
            <LiveAtlasMap
              countries={snapshot.atlas.countries}
              spotlitIso={spotlitIso}
              onSpotlightChange={handleSpotlightChange}
              onPick={handlePick}
            />
          </motion.div>

          {/* Spotlight scorecard */}
          <div className="relative col-span-3 min-h-0">
            <AnimatePresence mode="wait">
              {spotlight && (
                <motion.div
                  key={spotlight.iso3}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 18 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] p-3.5"
                  style={{
                    background:
                      "linear-gradient(160deg, rgba(17,34,64,0.7), rgba(7,17,34,0.95))",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.05), 0 18px 48px rgba(0,0,0,0.35)",
                  }}
                >
                  {/* Header */}
                  <div className="flex items-start gap-2.5">
                    <div className="text-2xl leading-none">{spotlight.flag ?? "🏳️"}</div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[9.5px] uppercase tracking-[0.18em] text-white/45">
                        {spotlight.region}
                      </div>
                      <div className="truncate font-playfair text-[15px] font-semibold leading-tight text-cream">
                        {spotlight.name}
                      </div>
                      {spotlight.maturityLabel && (
                        <div className="mt-1 inline-flex items-center gap-1.5">
                          <span
                            className="block h-2 w-2 rounded-full"
                            style={{
                              background:
                                MATURITY_LEGEND.find((m) => m.label === spotlight.maturityLabel)?.color ??
                                "#9696AA",
                            }}
                          />
                          <span className="text-[10px] uppercase tracking-[0.14em] text-cream/85">
                            {spotlight.maturityLabel}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metric mini-bars */}
                  <div className="mt-3 flex flex-1 flex-col gap-2">
                    {METRIC_LABELS.map((m) => {
                      const v = spotlight.metrics[m.key];
                      if (v == null) {
                        return (
                          <div key={m.key} className="text-[10px] text-white/35">
                            {m.label} · n/a
                          </div>
                        );
                      }
                      return (
                        <div key={m.key}>
                          <div className="flex items-baseline justify-between">
                            <span className="text-[10px] uppercase tracking-[0.14em] text-white/55">
                              {m.label}
                            </span>
                            <span className="font-playfair text-[12px] font-semibold tabular-nums text-cream">
                              {Math.round(v)}
                            </span>
                          </div>
                          <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                            <motion.div
                              key={`${spotlight.iso3}-${m.key}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.max(2, Math.min(100, v))}%` }}
                              transition={{ duration: 0.7, ease: EASE }}
                              className="h-full rounded-full"
                              style={{
                                background:
                                  "linear-gradient(90deg, #4899FF 0%, #33C490 100%)",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePick(spotlight)}
                    className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10.5px] uppercase tracking-[0.18em] text-cream/85 transition hover:bg-white/[0.1]"
                  >
                    <Plus size={11} />
                    Add to comparator
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="shrink-0 text-center text-[9.5px] uppercase tracking-[0.18em] text-white/35">
          Spotlight cycles automatically — hover to pause and inspect
        </div>
      </div>
    </SlideLayout>
  );
}
