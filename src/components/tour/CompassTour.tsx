"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useBriefingStore } from "@/components/briefing/store";
import { useCompassTourStore } from "./tour-store";
import { COMPASS_TOUR_STEPS, COMPASS_TOUR_STEP_COUNT } from "./tour-steps";
import { shouldAutoStartTour } from "./tour-storage";

const EASE = [0.16, 1, 0.3, 1] as const;
const PAD = 10;

const SELECTOR_REMOUNT_PATHS = new Set([
  "/dashboard/atlas",
  "/dashboard/services/catalog",
  "/dashboard/atlas/benchmarking",
  "/dashboard/products/portfolio",
  "/dashboard/delivery/personas",
  "/dashboard/mandate/rfi-alignment",
]);

function pathMatches(stepPath: string, pathname: string): boolean {
  if (stepPath === "/dashboard") return pathname === "/dashboard";
  return pathname === stepPath || pathname.startsWith(`${stepPath}/`);
}

function measureTarget(
  target: (typeof COMPASS_TOUR_STEPS)[0]["target"]
): { top: number; left: number; width: number; height: number } | null {
  if (target.kind === "center") return null;
  const el = document.querySelector(target.query);
  if (!el || !(el instanceof HTMLElement)) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[CompassTour] Missing target:", target.query);
    }
    return null;
  }
  const r = el.getBoundingClientRect();
  if (r.width < 4 || r.height < 4) return null;
  return {
    top: r.top - PAD,
    left: r.left - PAD,
    width: r.width + PAD * 2,
    height: r.height + PAD * 2,
  };
}

export function CompassTour() {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const active = useCompassTourStore((s) => s.active);
  const stepIndex = useCompassTourStore((s) => s.stepIndex);
  const start = useCompassTourStore((s) => s.start);
  const closeSkip = useCompassTourStore((s) => s.closeSkip);
  const complete = useCompassTourStore((s) => s.complete);
  const setStepIndex = useCompassTourStore((s) => s.setStepIndex);
  const setSuppressTransitionLoader = useCompassTourStore(
    (s) => s.setSuppressTransitionLoader
  );

  const [pendingStep, setPendingStep] = useState<number | null>(null);

  useEffect(() => {
    if (!active) setPendingStep(null);
  }, [active]);

  const [hole, setHole] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const primaryBtnRef = useRef<HTMLButtonElement>(null);
  const finaleBriefingRef = useRef<HTMLButtonElement>(null);
  const autoOfferedRef = useRef(false);

  const step = COMPASS_TOUR_STEPS[stepIndex] ?? COMPASS_TOUR_STEPS[0];
  const isFinale = Boolean(step.finale);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* First visit: auto-open on dashboard home */
  useEffect(() => {
    if (autoOfferedRef.current) return;
    if (!shouldAutoStartTour()) return;
    if (pathname !== "/dashboard") return;
    if (useCompassTourStore.getState().active) return;
    autoOfferedRef.current = true;
    const t = window.setTimeout(() => {
      if (window.location.pathname !== "/dashboard") return;
      if (!shouldAutoStartTour()) return;
      if (useCompassTourStore.getState().active) return;
      start(0);
    }, 520);
    return () => window.clearTimeout(t);
  }, [pathname, start]);

  /* After tour-driven navigation, land on pending step */
  useEffect(() => {
    if (pendingStep === null || !active) return;
    const targetStep = COMPASS_TOUR_STEPS[pendingStep];
    if (!targetStep || !pathMatches(targetStep.path, pathname)) return;
    setStepIndex(pendingStep);
    setPendingStep(null);
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setSuppressTransitionLoader(false);
      });
    });
    return () => window.cancelAnimationFrame(id);
  }, [
    pathname,
    pendingStep,
    active,
    setStepIndex,
    setSuppressTransitionLoader,
  ]);

  const remeasure = useCallback(() => {
    if (!active) return;
    const h = measureTarget(step.target);
    setHole(h);
  }, [active, step]);

  useLayoutEffect(() => {
    remeasure();
  }, [remeasure, stepIndex, pathname, active]);

  useEffect(() => {
    if (!active) return;
    const onResize = () => remeasure();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [active, remeasure]);

  /* Heavy pages paint after route — re-measure briefly */
  useEffect(() => {
    if (!active) return;
    if (step.target.kind !== "selector") return;
    if (!SELECTOR_REMOUNT_PATHS.has(pathname)) return;
    const id = window.setInterval(remeasure, 400);
    const stop = window.setTimeout(() => window.clearInterval(id), 6000);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(stop);
    };
  }, [active, pathname, remeasure, step.target, stepIndex]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeSkip();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, closeSkip]);

  useEffect(() => {
    if (!active) return;
    const t = window.setTimeout(() => {
      if (isFinale) finaleBriefingRef.current?.focus();
      else primaryBtnRef.current?.focus();
    }, 80);
    return () => window.clearTimeout(t);
  }, [active, isFinale, stepIndex]);

  const openBriefingAndFinish = useCallback(() => {
    complete();
    queueMicrotask(() => {
      useBriefingStore.getState().openDeck();
    });
  }, [complete]);

  const exploreApplication = useCallback(() => {
    complete();
  }, [complete]);

  const goNext = useCallback(() => {
    if (step.finale) return;
    const next = stepIndex + 1;
    const nxt = COMPASS_TOUR_STEPS[next];
    if (!pathMatches(nxt.path, pathname)) {
      setSuppressTransitionLoader(true);
      setPendingStep(next);
      router.push(nxt.path);
      return;
    }
    setStepIndex(next);
  }, [
    pathname,
    router,
    setStepIndex,
    setSuppressTransitionLoader,
    step.finale,
    stepIndex,
  ]);

  const goPrev = useCallback(() => {
    if (stepIndex <= 0) return;
    const prev = stepIndex - 1;
    const prv = COMPASS_TOUR_STEPS[prev];
    if (!pathMatches(prv.path, pathname)) {
      setSuppressTransitionLoader(true);
      setPendingStep(prev);
      router.push(prv.path);
      return;
    }
    setStepIndex(prev);
  }, [pathname, router, setStepIndex, setSuppressTransitionLoader, stepIndex]);

  const handleDialogPointerDown = useCallback((e: React.PointerEvent) => {
    if (!dialogRef.current?.contains(e.target as Node)) {
      e.preventDefault();
    }
  }, []);

  const titleId = "compass-tour-title";

  const overlay = useMemo(() => {
    if (!mounted || typeof document === "undefined") return null;
    const vw = typeof window !== "undefined" ? window.innerWidth : 0;
    const vh = typeof window !== "undefined" ? window.innerHeight : 0;

    return createPortal(
      <AnimatePresence>
        {active && (
          <motion.div
            key="compass-tour-root"
            className="fixed inset-0 z-[250]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.12 : 0.28, ease: EASE }}
            aria-hidden={false}
          >
            {/* Dim: full veil (center steps) or four shields (spotlight) */}
            {!hole ? (
              <div
                className="absolute inset-0 bg-[rgba(6,12,24,0.78)]"
                style={{ backdropFilter: "blur(2px)" }}
                onPointerDown={handleDialogPointerDown}
              />
            ) : (
              <>
                <div
                  className="absolute left-0 bg-[rgba(6,12,24,0.78)]"
                  style={{
                    top: 0,
                    width: "100%",
                    height: Math.max(0, hole.top),
                    backdropFilter: "blur(2px)",
                  }}
                  onPointerDown={handleDialogPointerDown}
                />
                <div
                  className="absolute left-0 bg-[rgba(6,12,24,0.78)]"
                  style={{
                    top: hole.top + hole.height,
                    width: "100%",
                    height: Math.max(0, vh - hole.top - hole.height),
                    backdropFilter: "blur(2px)",
                  }}
                  onPointerDown={handleDialogPointerDown}
                />
                <div
                  className="absolute bg-[rgba(6,12,24,0.78)]"
                  style={{
                    top: hole.top,
                    left: 0,
                    width: Math.max(0, hole.left),
                    height: hole.height,
                    backdropFilter: "blur(2px)",
                  }}
                  onPointerDown={handleDialogPointerDown}
                />
                <div
                  className="absolute bg-[rgba(6,12,24,0.78)]"
                  style={{
                    top: hole.top,
                    left: hole.left + hole.width,
                    width: Math.max(0, vw - hole.left - hole.width),
                    height: hole.height,
                    backdropFilter: "blur(2px)",
                  }}
                  onPointerDown={handleDialogPointerDown}
                />
                <motion.div
                  className="pointer-events-none absolute rounded-2xl border-2 border-[var(--gpssa-green)]/70 shadow-[0_0_40px_rgba(0,168,107,0.2)]"
                  initial={false}
                  animate={{
                    top: hole.top,
                    left: hole.left,
                    width: hole.width,
                    height: hole.height,
                  }}
                  transition={{ duration: reduceMotion ? 0.15 : 0.42, ease: EASE }}
                />
              </>
            )}

            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className={`absolute z-[251] w-[min(92vw,420px)] ${
                hole ? "left-1/2 -translate-x-1/2" : "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              }`}
              style={
                hole && vh > 0
                  ? (() => {
                      const below = hole.top + hole.height + 20;
                      const preferAbove = below + 260 > vh;
                      const top = preferAbove
                        ? Math.max(24, hole.top - 260 - 16)
                        : Math.min(Math.max(24, below), vh - 280);
                      return { top };
                    })()
                  : undefined
              }
            >
              <motion.div
                layout
                className="relative overflow-hidden rounded-2xl border border-white/[0.1] px-6 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
                style={{
                  background:
                    "linear-gradient(155deg, rgba(17,34,64,0.96), rgba(7,17,34,0.98))",
                  backdropFilter: "blur(20px)",
                }}
                initial={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: 14, scale: 0.98 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: reduceMotion ? 0.15 : 0.38, ease: EASE }}
              >
                <div
                  className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-50"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(0,168,107,0.2) 0%, transparent 70%)",
                  }}
                />
                <div className="relative flex items-center justify-between gap-3 mb-4">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/35">
                    GPSSA Intelligence · {String(stepIndex + 1).padStart(2, "0")} /{" "}
                    {String(COMPASS_TOUR_STEP_COUNT).padStart(2, "0")}
                  </span>
                  <Sparkles
                    size={14}
                    className="text-[var(--gpssa-green)]/80 shrink-0"
                    strokeWidth={1.5}
                  />
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: reduceMotion ? 0 : 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: reduceMotion ? 0 : -8 }}
                    transition={{ duration: reduceMotion ? 0.12 : 0.22, ease: EASE }}
                  >
                    <h2
                      id={titleId}
                      className="font-playfair text-xl font-bold leading-snug text-cream mb-2"
                    >
                      {step.title}
                    </h2>
                    <p className="text-[13px] leading-relaxed text-white/55 mb-6">
                      {step.subtitle}
                    </p>
                  </motion.div>
                </AnimatePresence>
                <div className="relative flex flex-col gap-3">
                  {isFinale ? (
                    <div className="flex flex-col gap-2">
                      <button
                        ref={finaleBriefingRef}
                        type="button"
                        onClick={openBriefingAndFinish}
                        disabled={pendingStep !== null}
                        className="w-full rounded-xl px-4 py-3 text-xs font-semibold text-[#071322] disabled:opacity-40 disabled:pointer-events-none transition-transform active:scale-[0.98]"
                        style={{
                          background:
                            "linear-gradient(135deg, var(--gpssa-green), color-mix(in srgb, var(--gpssa-green) 70%, #0a2840))",
                          boxShadow: "0 8px 24px rgba(0,168,107,0.25)",
                        }}
                      >
                        Open Executive Briefing
                      </button>
                      <button
                        type="button"
                        onClick={exploreApplication}
                        disabled={pendingStep !== null}
                        className="w-full rounded-xl border border-white/[0.12] px-4 py-3 text-xs font-semibold text-cream/90 hover:bg-white/[0.06] disabled:opacity-40 disabled:pointer-events-none transition-colors"
                      >
                        Explore the application
                      </button>
                    </div>
                  ) : null}
                  <div className="relative flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={closeSkip}
                      className="text-[11px] font-medium uppercase tracking-wider text-white/35 hover:text-white/55 transition-colors mr-auto"
                    >
                      Skip tour · Esc
                    </button>
                    <button
                      type="button"
                      onClick={goPrev}
                      disabled={stepIndex === 0 || pendingStep !== null}
                      className="rounded-xl border border-white/[0.1] px-3 py-2 text-xs font-medium text-white/70 hover:bg-white/[0.06] disabled:opacity-35 disabled:pointer-events-none transition-colors"
                    >
                      Back
                    </button>
                    {!isFinale ? (
                      <button
                        ref={primaryBtnRef}
                        type="button"
                        onClick={goNext}
                        disabled={pendingStep !== null}
                        className="rounded-xl px-4 py-2 text-xs font-semibold text-[#071322] disabled:opacity-40 disabled:pointer-events-none transition-transform active:scale-[0.98]"
                        style={{
                          background:
                            "linear-gradient(135deg, var(--gpssa-green), color-mix(in srgb, var(--gpssa-green) 70%, #0a2840))",
                          boxShadow: "0 8px 24px rgba(0,168,107,0.25)",
                        }}
                      >
                        Next
                      </button>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    );
  }, [
    active,
    closeSkip,
    exploreApplication,
    goNext,
    goPrev,
    handleDialogPointerDown,
    hole,
    isFinale,
    mounted,
    openBriefingAndFinish,
    pendingStep,
    reduceMotion,
    step.id,
    step.subtitle,
    step.title,
    stepIndex,
  ]);

  return overlay;
}
