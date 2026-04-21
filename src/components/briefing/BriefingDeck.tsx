"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useBriefingStore } from "./store";
import { SlideEngine } from "./SlideEngine";
import { useResearchUpdates } from "@/lib/hooks/useResearchUpdates";
import type { BriefingSnapshot } from "@/lib/briefing/types";

import { Slide01_Cover } from "./slides/Slide01_Cover";
import { Slide02_Outline } from "./slides/Slide02_Outline";
import { Slide03_Compass } from "./slides/Slide03_Compass";
import { Slide04_Evidence } from "./slides/Slide04_Evidence";
import { Slide05_UAEToday } from "./slides/Slide05_UAEToday";
import { Slide06_Personas } from "./slides/Slide06_Personas";
import { Slide07_Atlas } from "./slides/Slide07_Atlas";
import { Slide08_GlobalBenchmarks } from "./slides/Slide08_GlobalBenchmarks";
import { Slide09_Quadrant } from "./slides/Slide09_Quadrant";
import { Slide10_PeerInstitutions } from "./slides/Slide10_PeerInstitutions";
import { Slide11_ServiceChannelHeatmap } from "./slides/Slide11_ServiceChannelHeatmap";
import { Slide12_Decision } from "./slides/Slide12_Decision";
import { Slide13_Roadmap } from "./slides/Slide13_Roadmap";
import { Slide14_Closing } from "./slides/Slide14_Closing";
import { SlidePlaceholder } from "./SlidePlaceholder";
import { ComparatorPicker } from "./ComparatorPicker";

const EASE = [0.16, 1, 0.3, 1] as const;

type SlideRenderer = (args: {
  snapshot: BriefingSnapshot | null;
  total: number;
}) => React.ReactNode;

function dataReadySlide(
  Component: (props: { snapshot: BriefingSnapshot }) => React.ReactNode,
  pillar: string,
  total = 0
): SlideRenderer {
  return function DataReadySlide({ snapshot }) {
    if (!snapshot) {
      return (
        <SlidePlaceholder
          pillar={pillar}
          done={0}
          total={total}
          message="Loading the latest snapshot from the database…"
        />
      );
    }
    return <Component snapshot={snapshot} />;
  };
}

const SLIDES: SlideRenderer[] = [
  () => <Slide01_Cover />,
  ({ total }) => <Slide02_Outline total={total} />,
  dataReadySlide(({ snapshot }) => <Slide03_Compass snapshot={snapshot} />, "Compass"),
  dataReadySlide(({ snapshot }) => <Slide04_Evidence snapshot={snapshot} />, "Evidence Base"),
  dataReadySlide(
    ({ snapshot }) => <Slide05_UAEToday snapshot={snapshot} />,
    "UAE Today"
  ),
  dataReadySlide(
    ({ snapshot }) => <Slide06_Personas snapshot={snapshot} />,
    "Personas & Journeys"
  ),
  dataReadySlide(
    ({ snapshot }) => <Slide07_Atlas snapshot={snapshot} />,
    "Global Atlas"
  ),
  dataReadySlide(
    ({ snapshot }) => <Slide08_GlobalBenchmarks snapshot={snapshot} />,
    "Standards & Compliance"
  ),
  dataReadySlide(
    ({ snapshot }) => <Slide09_Quadrant snapshot={snapshot} />,
    "Quadrant View"
  ),
  dataReadySlide(
    ({ snapshot }) => <Slide10_PeerInstitutions snapshot={snapshot} />,
    "Peer Benchmarking"
  ),
  dataReadySlide(
    ({ snapshot }) => <Slide11_ServiceChannelHeatmap snapshot={snapshot} />,
    "Service x Channel"
  ),
  dataReadySlide(
    ({ snapshot }) => <Slide12_Decision snapshot={snapshot} />,
    "Decision Walkthrough"
  ),
  dataReadySlide(
    ({ snapshot }) => <Slide13_Roadmap snapshot={snapshot} />,
    "12-Month Roadmap"
  ),
  dataReadySlide(({ snapshot }) => <Slide14_Closing snapshot={snapshot} />, "Closing"),
];

export function BriefingDeck() {
  const open = useBriefingStore((s) => s.open);
  const closeDeck = useBriefingStore((s) => s.closeDeck);
  const [snapshot, setSnapshot] = useState<BriefingSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchSnapshot = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/briefing/snapshot", {
        signal,
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as BriefingSnapshot;
      setSnapshot(data);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.error("[BriefingDeck] failed to load snapshot", err);
      setError("Unable to load briefing data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch when deck opens
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    void fetchSnapshot(controller.signal);
    return () => controller.abort();
  }, [open, fetchSnapshot]);

  // Re-fetch when any research job completes (deck stays current)
  useResearchUpdates({
    enabled: open,
    onComplete: () => {
      void fetchSnapshot();
    },
  });

  // Lock body scroll while deck is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const renderedSlides = useMemo(() => SLIDES, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="briefing-deck"
          className="fixed inset-0 z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          {/* Cinematic open backdrop */}
          <motion.div
            className="absolute inset-0 bg-navy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />

          {/* Loading state until first snapshot arrives */}
          <div className="relative h-full w-full">
            {loading && !snapshot && (
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <div className="text-[11px] uppercase tracking-[0.32em] text-white/55">
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                  >
                    Composing your briefing…
                  </motion.span>
                </div>
              </div>
            )}

            {error && !snapshot && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4">
                <div className="text-sm text-white/70">{error}</div>
                <button
                  onClick={() => void fetchSnapshot()}
                  className="rounded-full bg-white/[0.06] px-4 py-1.5 text-xs text-cream ring-1 ring-white/[0.08] hover:bg-white/[0.1]"
                >
                  Retry
                </button>
                <button
                  onClick={closeDeck}
                  className="text-[11px] uppercase tracking-[0.2em] text-white/40 hover:text-cream"
                >
                  Close
                </button>
              </div>
            )}

            <SlideEngine
              slides={renderedSlides}
              snapshot={snapshot}
              onClose={closeDeck}
            />

            {/* Shared comparator drawer (Slides 5 & 7) */}
            {snapshot && <ComparatorPicker snapshot={snapshot} />}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
