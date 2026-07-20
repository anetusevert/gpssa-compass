"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { HomeModule } from "./home-modules";
import { getPhase, type EngagementPhaseId } from "@/lib/engagement/playbook";
import type { MorphTargetKey } from "./MorphScene";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const MorphCanvas = dynamic(() => import("./MorphCanvas"), {
  ssr: false,
  loading: () => <MorphFallback />,
});

function MorphFallback({ color = "#00A86B" }: { color?: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="h-40 w-40 rounded-full opacity-70 sm:h-52 sm:w-52"
        style={{
          background: `radial-gradient(circle at 35% 30%, ${color}aa 0%, ${color}33 45%, transparent 70%)`,
          boxShadow: `0 0 80px ${color}44`,
        }}
      />
    </div>
  );
}

export function MorphStage({
  module,
  phaseId,
  engagementOpen,
  onNavigate,
  dimmed = false,
}: {
  module: HomeModule | null;
  phaseId: EngagementPhaseId;
  engagementOpen: boolean;
  onNavigate: (href: string) => void;
  dimmed?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onVis = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const phase = getPhase(phaseId);
  const targetKey: MorphTargetKey = engagementOpen ? phaseId : module?.id ?? "idle";

  const title = engagementOpen
    ? phase.label
    : module?.title ?? "GPSSA Intelligence";
  const line = engagementOpen
    ? phase.value
    : module?.valueLine ??
      "Hover a module — the form morphs with your focus. Open Engagement Mode to run the RFP journey.";
  const accent = engagementOpen ? phase.accent : module?.glowColor ?? "rgba(0,168,107,0.35)";
  const links = engagementOpen
    ? phase.screens.slice(0, 3).map((s) => ({ label: s.label, href: s.href }))
    : module?.links.slice(0, 4).map((l) => ({ label: l.label, href: l.href })) ?? [];

  return (
    <motion.div
      layout={!reduceMotion}
      className="relative flex h-full min-h-0 flex-col justify-end overflow-hidden rounded-2xl"
      style={{
        background: "linear-gradient(165deg, rgba(7,17,34,0.2), rgba(7,17,34,0.75))",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 20px 60px rgba(0,0,0,0.3)",
        opacity: dimmed ? 0.55 : 1,
      }}
      data-tour="compass-focus-stage"
      data-morph-target={targetKey}
    >
      <div className="absolute inset-0">
        {reduceMotion || !visible ? (
          <MorphFallback color={engagementOpen ? phase.accent : "#00A86B"} />
        ) : (
          <MorphCanvas targetKey={targetKey} />
        )}
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%]"
        style={{
          background:
            "linear-gradient(to top, rgba(7,17,34,0.92) 10%, rgba(7,17,34,0.45) 55%, transparent)",
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={`${engagementOpen ? phaseId : module?.id ?? "idle"}-copy`}
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="relative z-10 px-5 pb-4 pt-2"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35">
            {engagementOpen ? "Journey presence" : module ? "Focus" : "Living stage"}
          </p>
          <h3 className="font-playfair text-lg font-bold text-cream sm:text-xl">{title}</h3>
          <p className="mt-1 max-w-xl text-[12px] leading-relaxed text-white/55 sm:text-[13px]">
            {line}
          </p>
          {links.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {links.map((link) => (
                <button
                  key={link.href}
                  type="button"
                  onClick={() => onNavigate(link.href)}
                  className="group/link inline-flex items-center gap-1.5 rounded-lg bg-white/[0.06] px-2.5 py-1.5 text-[11px] text-white/65 transition-colors hover:bg-white/[0.12] hover:text-white/95"
                  style={{ boxShadow: `inset 0 0 0 1px ${accent}33` }}
                >
                  {link.label}
                  <ArrowRight
                    size={11}
                    className="opacity-40 transition group-hover/link:translate-x-0.5 group-hover/link:opacity-90"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
