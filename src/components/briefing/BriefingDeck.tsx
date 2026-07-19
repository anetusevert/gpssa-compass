"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useBriefingStore } from "./store";
import { SlideEngine } from "./SlideEngine";
import { useResearchUpdates } from "@/lib/hooks/useResearchUpdates";
import type { BriefingSnapshot } from "@/lib/briefing/types";

import { Slide01_Cover } from "./slides/Slide01_Cover";
import { Slide02_Ambition } from "./slides/Slide02_Ambition";
import { Slide03_OperatingSystem } from "./slides/Slide03_OperatingSystem";
import { Slide04_Mandate } from "./slides/Slide04_Mandate";
import { Slide05_GlobalBar } from "./slides/Slide05_GlobalBar";
import { Slide06_Diagnose } from "./slides/Slide06_Diagnose";
import { Slide07_Roadmap } from "./slides/Slide07_Roadmap";
import { Slide08_Quality } from "./slides/Slide08_Quality";
import { Slide09_Fulfilment } from "./slides/Slide09_Fulfilment";
import { Slide10_Performance } from "./slides/Slide10_Performance";
import { Slide11_Decision } from "./slides/Slide11_Decision";
import { Slide12_Close } from "./slides/Slide12_Close";
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
  () => <Slide02_Ambition />,
  () => <Slide03_OperatingSystem />,
  dataReadySlide(({ snapshot }) => <Slide04_Mandate snapshot={snapshot} />, "Mandate"),
  dataReadySlide(({ snapshot }) => <Slide05_GlobalBar snapshot={snapshot} />, "Global Atlas"),
  dataReadySlide(({ snapshot }) => <Slide06_Diagnose snapshot={snapshot} />, "Diagnose"),
  dataReadySlide(({ snapshot }) => <Slide07_Roadmap snapshot={snapshot} />, "Roadmap"),
  () => <Slide08_Quality />,
  () => <Slide09_Fulfilment />,
  () => <Slide10_Performance />,
  dataReadySlide(({ snapshot }) => <Slide11_Decision snapshot={snapshot} />, "Decision"),
  dataReadySlide(({ snapshot }) => <Slide12_Close snapshot={snapshot} />, "Close"),
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

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    void fetchSnapshot(controller.signal);
    return () => controller.abort();
  }, [open, fetchSnapshot]);

  useResearchUpdates({
    enabled: open,
    onComplete: () => {
      void fetchSnapshot();
    },
  });

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
          <motion.div
            className="absolute inset-0 bg-navy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />

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
                  type="button"
                  onClick={() => void fetchSnapshot()}
                  className="rounded-full bg-white/[0.06] px-4 py-1.5 text-xs text-cream ring-1 ring-white/[0.08] hover:bg-white/[0.1]"
                >
                  Retry
                </button>
                <button
                  type="button"
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

            {snapshot && <ComparatorPicker snapshot={snapshot} />}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
