"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { GitBranch, Sparkles } from "lucide-react";
import { useCompassTourStore } from "@/components/tour/tour-store";
import { HERO_MODULES, CORE_MODULES, OPS_MODULES } from "./home-modules";
import {
  EngagementModeTrigger,
  EngagementModePanel,
} from "@/components/engagement/EngagementMode";
import { OperatingSpine } from "@/components/spine/OperatingSpine";
import { ENGAGEMENT_FIRST_KEY } from "@/lib/engagement/playbook";
import { useEngagementStore } from "@/lib/engagement/store";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const DOCK = [...HERO_MODULES, ...CORE_MODULES, ...OPS_MODULES];

function greetingFor(date: Date): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function HomeTheater() {
  const router = useRouter();
  const { data: session } = useSession();
  const replayTour = useCompassTourStore((s) => s.replay);
  const reduceMotion = useReducedMotion();
  const userType = (session?.user as { userType?: string } | undefined)?.userType;
  const isDemo = userType === "demo";
  const rawName = (session?.user?.name ?? "there").split(" ")[0];
  const userName = rawName.split(".")[0];

  const [now, setNow] = useState<Date | null>(null);
  const [firstVisitHint, setFirstVisitHint] = useState(false);
  const engagementOpen = useEngagementStore((s) => s.engagementOpen);
  const setEngagementOpen = useEngagementStore((s) => s.setEngagementOpen);

  useEffect(() => {
    setNow(new Date());
  }, []);

  // Hint only — do not auto-open Engagement Mode (it crushed the service spine).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.localStorage.getItem(ENGAGEMENT_FIRST_KEY)) {
      setFirstVisitHint(true);
    }
  }, []);

  const greeting = now ? greetingFor(now) : "";
  const dateString = now ? formatDate(now) : "\u00A0";

  const navigate = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router]
  );

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
      <div
        className="orb pointer-events-none"
        style={{
          width: 480,
          height: 480,
          top: -140,
          right: -100,
          background: "radial-gradient(circle, rgba(0,168,107,0.08) 0%, transparent 70%)",
        }}
      />
      <div
        className="orb pointer-events-none drift-slow"
        style={{
          width: 360,
          height: 360,
          bottom: -100,
          left: -80,
          background: "radial-gradient(circle, rgba(45,74,140,0.08) 0%, transparent 70%)",
        }}
      />
      <div className="grid-overlay pointer-events-none absolute inset-0 opacity-20" />

      <motion.header
        className="relative z-10 shrink-0 px-5 pt-3 pb-2 text-center sm:px-8 sm:pt-4"
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <div className="mb-1.5 flex flex-wrap justify-center gap-2">
          <EngagementModeTrigger />
          <motion.button
            type="button"
            onClick={() => replayTour()}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/45 transition-colors hover:border-[var(--gpssa-green)]/35 hover:text-white/75"
            whileHover={reduceMotion ? undefined : { scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Sparkles size={10} className="text-[var(--gpssa-green)]/90" strokeWidth={2} />
            Guided tour
          </motion.button>
        </div>
        <p className="mb-0.5 text-[10px] font-medium tracking-[0.22em] text-white/30 uppercase">
          {dateString}
        </p>
        <h1 className="font-playfair text-2xl font-bold text-cream sm:text-3xl">
          {isDemo
            ? greeting || "Welcome"
            : greeting
              ? `${greeting}, ${userName}`
              : `Hello, ${userName}`}
        </h1>
        <p className="mx-auto mt-0.5 max-w-xl text-[12px] text-white/35">
          {engagementOpen
            ? "20-week RFP journey — pick a phase, then Start."
            : "One service object: Episode → Journey → Process → Systems → QA. Open Engagement Mode for the project path."}
        </p>
        {firstVisitHint && !engagementOpen && (
          <button
            type="button"
            onClick={() => {
              setEngagementOpen(true);
              setFirstVisitHint(false);
            }}
            className="mt-2 text-[11px] text-[var(--gpssa-green)] hover:underline"
          >
            First visit? Open Engagement Mode for the workshop path →
          </button>
        )}
      </motion.header>

      <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col gap-3 px-4 pb-2 sm:px-6">
        {engagementOpen ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-black/25 px-4 py-4 sm:px-5">
            <EngagementModePanel />
          </div>
        ) : (
          <>
            <OperatingSpine variant="hero" className="min-h-0 flex-1" />

            <nav
              className="shrink-0 overflow-x-auto pb-0.5 scrollbar-none"
              aria-label="Module shortcuts"
              data-tour="compass-pillar-grid"
            >
              <div className="flex min-w-min items-stretch gap-1.5">
                {DOCK.map((mod) => {
                  const Icon = mod.icon;
                  const tourId =
                    mod.id === "atlas"
                      ? "compass-atlas-bar"
                      : mod.id === "mandate"
                        ? "compass-mandate-bar"
                        : undefined;
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      data-tour={tourId}
                      onClick={() => navigate(mod.primaryHref)}
                      className="flex min-w-[4.5rem] flex-1 flex-col items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.03] px-2 py-2 transition hover:border-white/15 hover:bg-white/[0.06]"
                      title={mod.valueLine}
                    >
                      <Icon size={14} style={{ color: `var(${mod.accentVar})` }} />
                      <span className="truncate text-[9px] font-semibold uppercase tracking-[0.1em] text-white/55">
                        {mod.title}
                      </span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/services/operating")}
                  className="flex min-w-[4.5rem] flex-col items-center gap-1 rounded-xl border border-[var(--gpssa-green)]/30 bg-[var(--gpssa-green)]/10 px-2 py-2 transition hover:bg-[var(--gpssa-green)]/18"
                  title="All operating blueprints"
                >
                  <GitBranch size={14} className="text-[var(--gpssa-green)]" />
                  <span className="truncate text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--gpssa-green)]">
                    Blueprint
                  </span>
                </button>
              </div>
            </nav>
          </>
        )}
      </div>

      <motion.footer
        className="relative z-10 flex shrink-0 items-center justify-center gap-2 py-2"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <span className="text-[10px] text-white/25">powered by</span>
        <Image
          src="/images/adl-logo.png"
          alt="Arthur D. Little"
          width={52}
          height={18}
          className="adl-logo-white object-contain opacity-55"
        />
      </motion.footer>
    </div>
  );
}
