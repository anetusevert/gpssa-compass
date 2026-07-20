"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { GitBranch, Sparkles } from "lucide-react";
import { useCompassTourStore } from "@/components/tour/tour-store";
import { HERO_MODULES, CORE_MODULES, OPS_MODULES } from "./home-modules";
import { EngagementModeTrigger } from "@/components/engagement/EngagementMode";
import { EngagementConductor } from "@/components/engagement/EngagementConductor";
import { OperatingSpine } from "@/components/spine/OperatingSpine";
import { ENGAGEMENT_FIRST_KEY } from "@/lib/engagement/playbook";
import { useEngagementStore } from "@/lib/engagement/store";
import { PageFrame } from "@/components/ui/PageFrame";

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
    <PageFrame className="relative">
      <div
        className="orb pointer-events-none"
        style={{
          width: 420,
          height: 420,
          top: -120,
          right: -80,
          background: "radial-gradient(circle, rgba(0,168,107,0.08) 0%, transparent 70%)",
        }}
      />
      <div className="grid-overlay pointer-events-none absolute inset-0 opacity-20" />

      <div className="relative z-10 flex h-full min-h-0 flex-col px-3 pb-2 pt-2 sm:px-5 sm:pt-3">
        <header className="shrink-0 text-center">
          <div className="mb-1 flex flex-wrap justify-center gap-2">
            <EngagementModeTrigger />
            <motion.button
              type="button"
              onClick={() => replayTour()}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/45 hover:text-white/75"
              whileHover={reduceMotion ? undefined : { scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles size={10} className="text-[var(--gpssa-green)]/90" />
              Guided tour
            </motion.button>
          </div>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/30">
            {dateString}
          </p>
          <h1 className="font-playfair text-xl font-bold text-cream sm:text-2xl">
            {isDemo
              ? greeting || "Welcome"
              : greeting
                ? `${greeting}, ${userName}`
                : `Hello, ${userName}`}
          </h1>
          <p className="mx-auto mt-0.5 max-w-xl text-[11px] text-white/35">
            {engagementOpen
              ? "Conductor on — phase colours the spine. Configure the service object below."
              : "Episode → Journey → Process → Systems → QA. Toggle Engagement Mode to conduct the RFP path."}
          </p>
          {firstVisitHint && !engagementOpen && (
            <button
              type="button"
              onClick={() => {
                setEngagementOpen(true);
                setFirstVisitHint(false);
              }}
              className="mt-1 text-[11px] text-[var(--gpssa-green)] hover:underline"
            >
              First visit? Turn on Engagement Mode →
            </button>
          )}
        </header>

        <div className="mx-auto mt-2 flex min-h-0 w-full max-w-5xl flex-1 flex-col gap-2">
          <EngagementConductor />
          <OperatingSpine variant="hero" className="min-h-0 flex-1" />

          <nav
            className="shrink-0 overflow-x-auto pb-0.5 scrollbar-none"
            aria-label="Module shortcuts"
            data-tour="compass-pillar-grid"
          >
            <div className="flex min-w-min gap-1.5">
              {DOCK.map((mod, i) => {
                const Icon = mod.icon;
                const tourId =
                  mod.id === "atlas"
                    ? "compass-atlas-bar"
                    : mod.id === "mandate"
                      ? "compass-mandate-bar"
                      : undefined;
                return (
                  <motion.button
                    key={mod.id}
                    type="button"
                    data-tour={tourId}
                    onClick={() => navigate(mod.primaryHref)}
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.03, duration: 0.35, ease: EASE }}
                    whileHover={reduceMotion ? undefined : { y: -2, scale: 1.03 }}
                    className="flex min-w-[4.25rem] flex-1 flex-col items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.03] px-2 py-2 hover:border-white/15 hover:bg-white/[0.06]"
                    title={mod.valueLine}
                  >
                    <Icon size={14} style={{ color: `var(${mod.accentVar})` }} />
                    <span className="truncate text-[9px] font-semibold uppercase tracking-[0.1em] text-white/55">
                      {mod.title}
                    </span>
                  </motion.button>
                );
              })}
              <motion.button
                type="button"
                onClick={() => navigate("/dashboard/services/operating")}
                whileHover={reduceMotion ? undefined : { y: -2 }}
                className="flex min-w-[4.25rem] flex-col items-center gap-1 rounded-xl border border-[var(--gpssa-green)]/30 bg-[var(--gpssa-green)]/10 px-2 py-2"
              >
                <GitBranch size={14} className="text-[var(--gpssa-green)]" />
                <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--gpssa-green)]">
                  Blueprint
                </span>
              </motion.button>
            </div>
          </nav>
        </div>

        <footer className="flex shrink-0 items-center justify-center gap-2 py-1.5">
          <span className="text-[10px] text-white/25">powered by</span>
          <Image
            src="/images/adl-logo.png"
            alt="Arthur D. Little"
            width={48}
            height={16}
            className="adl-logo-white object-contain opacity-55"
          />
        </footer>
      </div>
    </PageFrame>
  );
}
