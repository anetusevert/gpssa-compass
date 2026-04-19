"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, Maximize2, Minimize2, X, Keyboard } from "lucide-react";
import { SlideChrome } from "./SlideChrome";
import { useComparatorStore } from "./store";
import type { BriefingSnapshot } from "@/lib/briefing/types";

interface SlideEngineProps {
  slides: ((args: { snapshot: BriefingSnapshot | null }) => ReactNode)[];
  snapshot: BriefingSnapshot | null;
  onClose: () => void;
}

const EASE = [0.16, 1, 0.3, 1] as const;
const SLIDE_DURATION_MS = 12_000;

export function SlideEngine({ slides, snapshot, onClose }: SlideEngineProps) {
  const [current, setCurrent] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const total = slides.length;

  // Pause autoplay and suppress most keyboard nav while the comparator
  // picker drawer is open.
  const pickerOpen = useComparatorStore((s) => s.pickerOpen);

  const goTo = useCallback(
    (idx: number) => {
      setCurrent((prev) => {
        const target = ((idx % total) + total) % total;
        return target === prev ? prev : target;
      });
    },
    [total]
  );

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + total) % total);
  }, [total]);

  // Fullscreen handling
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // ignore (some embeddings disallow fullscreen)
    }
  }, []);

  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Try fullscreen on mount
  useEffect(() => {
    const t = window.setTimeout(() => {
      void toggleFullscreen();
    }, 50);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard handling
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Ignore if typing in an input (covers picker search) or if the
      // picker drawer is open (it owns Esc handling).
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.dataset?.comparatorSearch != null)
      ) {
        return;
      }
      if (pickerOpen) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prev();
      } else if (e.key === " ") {
        e.preventDefault();
        setAutoplay((a) => !a);
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        void toggleFullscreen();
      } else if (e.key === "Escape") {
        e.preventDefault();
        if (document.fullscreenElement) {
          void document.exitFullscreen();
        } else {
          onClose();
        }
      } else if (e.key === "?" || e.key === "/") {
        e.preventDefault();
        setShowHelp((s) => !s);
      } else if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        const digit = Number(e.key);
        const target = digit === 0 ? 9 : digit - 1;
        if (target < total) goTo(target);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, goTo, total, toggleFullscreen, onClose, pickerOpen]);

  // Autoplay timer (paused while hovered or while the picker is open)
  useEffect(() => {
    if (!autoplay || hovered || pickerOpen) return;
    const id = window.setTimeout(() => {
      setCurrent((c) => (c + 1) % total);
    }, SLIDE_DURATION_MS);
    return () => window.clearTimeout(id);
  }, [autoplay, hovered, current, total, pickerOpen]);

  const renderSlide = slides[current];

  const ambientOrbs = useMemo(
    () => (
      <>
        <div
          className="orb pointer-events-none"
          style={{
            width: 620,
            height: 620,
            top: -160,
            right: -120,
            background:
              "radial-gradient(circle, rgba(0,168,107,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          className="orb pointer-events-none drift-slow"
          style={{
            width: 520,
            height: 520,
            bottom: -120,
            left: -120,
            background:
              "radial-gradient(circle, rgba(45,74,140,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          className="orb pointer-events-none drift-reverse"
          style={{
            width: 380,
            height: 380,
            top: "40%",
            left: "50%",
            transform: "translateX(-50%)",
            background:
              "radial-gradient(circle, rgba(197,165,114,0.04) 0%, transparent 70%)",
          }}
        />
      </>
    ),
    []
  );

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative h-full w-full overflow-hidden bg-navy"
      style={{ outline: "none" }}
      tabIndex={-1}
    >
      {/* Autoplay progress bar */}
      <div className="absolute inset-x-0 top-0 z-50 h-[2px] bg-white/[0.04]">
        {autoplay && !hovered && !pickerOpen && (
          <motion.div
            key={`progress-${current}`}
            className="h-full"
            style={{
              background:
                "linear-gradient(90deg, #00A86B, #2DD4BF, #00A86B)",
              backgroundSize: "200% 100%",
            }}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: SLIDE_DURATION_MS / 1000, ease: "linear" }}
          />
        )}
      </div>

      {/* Ambient layers */}
      {ambientOrbs}
      <div className="grid-overlay pointer-events-none absolute inset-0 opacity-30" />

      {/* Top-right control cluster */}
      <div className="pointer-events-none absolute right-6 top-3 z-50 flex items-center gap-1.5">
        <button
          onClick={() => setAutoplay((a) => !a)}
          aria-label={autoplay ? "Pause autoplay" : "Start autoplay"}
          title={autoplay ? "Pause autoplay (space)" : "Autoplay (space)"}
          className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.04] text-white/55 ring-1 ring-white/[0.06] transition-colors hover:bg-white/[0.1] hover:text-cream"
        >
          {autoplay ? <Pause size={11} /> : <Play size={11} />}
        </button>
        <button
          onClick={toggleFullscreen}
          aria-label="Toggle fullscreen"
          title="Fullscreen (F)"
          className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.04] text-white/55 ring-1 ring-white/[0.06] transition-colors hover:bg-white/[0.1] hover:text-cream"
        >
          {isFullscreen ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
        </button>
        <button
          onClick={() => setShowHelp((s) => !s)}
          aria-label="Keyboard shortcuts"
          title="Keyboard shortcuts (?)"
          className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.04] text-white/55 ring-1 ring-white/[0.06] transition-colors hover:bg-white/[0.1] hover:text-cream"
        >
          <Keyboard size={11} />
        </button>
        <button
          onClick={onClose}
          aria-label="Close briefing"
          title="Close (Esc)"
          className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.04] text-white/55 ring-1 ring-white/[0.06] transition-colors hover:bg-white/[0.1] hover:text-cream"
        >
          <X size={11} />
        </button>
      </div>

      {/* Side navigation arrows */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-1 top-1/2 z-40 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-white/30 transition-all duration-200 hover:bg-white/[0.04] hover:text-cream"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 18l-6-6 6-6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-1 top-1/2 z-40 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-white/30 transition-all duration-200 hover:bg-white/[0.04] hover:text-cream"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 18l6-6-6-6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <SlideChrome
        current={current}
        total={total}
        snapshot={snapshot}
        goTo={goTo}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            className="absolute inset-0 flex flex-col"
            initial={{ opacity: 0, y: 24, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.99 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            {renderSlide({ snapshot })}
          </motion.div>
        </AnimatePresence>
      </SlideChrome>

      {/* Help overlay */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.3, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl px-8 py-7 ring-1 ring-white/[0.08]"
              style={{
                background:
                  "linear-gradient(160deg, rgba(17,34,64,0.95), rgba(7,17,34,0.98))",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.07), 0 30px 80px rgba(0,0,0,0.5)",
              }}
            >
              <div className="text-[11px] uppercase tracking-[0.32em] text-[#33C490] mb-4">
                Keyboard
              </div>
              <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-[13px]">
                <KbdRow keys={["←", "→"]} action="Navigate slides" />
                <KbdRow keys={["Space"]} action="Play / pause autoplay" />
                <KbdRow keys={["F"]} action="Toggle fullscreen" />
                <KbdRow keys={["1", "0"]} action="Jump to slide" />
                <KbdRow keys={["Esc"]} action="Exit fullscreen / close" />
                <KbdRow keys={["?"]} action="Show this help" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function KbdRow({ keys, action }: { keys: string[]; action: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        {keys.map((k, i) => (
          <span key={i} className="flex items-center">
            {i > 0 && <span className="mx-1 text-white/25">/</span>}
            <kbd className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[11px] font-medium text-cream ring-1 ring-white/[0.08]">
              {k}
            </kbd>
          </span>
        ))}
      </div>
      <span className="text-white/55">{action}</span>
    </div>
  );
}
