"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Globe, Plus, X } from "lucide-react";
import { SlideLayout } from "./SlideLayout";
import { AtlasRegionGrid } from "../charts/AtlasRegionGrid";
import { useComparatorStore } from "../store";
import type { AtlasCountryRow, BriefingSnapshot } from "@/lib/briefing/types";

const EASE = [0.16, 1, 0.3, 1] as const;

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

export function Slide07_Atlas({ snapshot }: Props) {
  const slide5 = useComparatorStore((s) => s.slide5);
  const toggle = useComparatorStore((s) => s.toggle);
  const remove = useComparatorStore((s) => s.remove);
  const openPicker = useComparatorStore((s) => s.openPicker);

  const selectedIds = useMemo(
    () => new Set(slide5.map((r) => r.id)),
    [slide5]
  );

  function handleToggle(c: AtlasCountryRow) {
    toggle("slide5", {
      id: `country:${c.iso3}`,
      kind: "country",
      label: c.name,
      sublabel: c.region,
      flag: c.flag ?? undefined,
    });
  }

  return (
    <SlideLayout
      eyebrow="Compare · Global Atlas"
      title="We see every pension system on the planet."
      subtitle="Region-grouped maturity grid · hover for the scorecard, click to carry into the comparator."
    >
      <div className="flex h-full flex-col gap-3">
        {/* Header strip */}
        <div className="flex shrink-0 items-center justify-between gap-3">
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
                {slide5.map((r) => (
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

        {/* Grid */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2, ease: EASE }}
          className="relative min-h-0 flex-1"
        >
          <AtlasRegionGrid
            countries={snapshot.atlas.countries}
            selectedIds={selectedIds}
            onToggle={handleToggle}
          />
        </motion.div>

        {/* Footer hint */}
        <div className="shrink-0 text-center text-[9.5px] uppercase tracking-[0.18em] text-white/35">
          Selections carry forward into the Quadrant slide
        </div>
      </div>
    </SlideLayout>
  );
}
