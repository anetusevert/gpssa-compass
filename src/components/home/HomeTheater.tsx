"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useCompassTourStore } from "@/components/tour/tour-store";
import {
  HERO_MODULES,
  CORE_MODULES,
  OPS_MODULES,
  findModule,
} from "./home-modules";
import { HeroRail } from "./HeroRail";
import { ModuleTile } from "./ModuleTile";
import { FocusStage } from "./FocusStage";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

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

  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  const focused = findModule(focusedId);
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
      {/* Atmosphere */}
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
      <div className="grid-overlay pointer-events-none absolute inset-0 opacity-25" />

      {/* Header */}
      <motion.header
        className="relative z-10 shrink-0 px-5 pt-4 pb-2 text-center sm:px-8 sm:pt-5"
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <div className="mb-1.5 flex justify-center">
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
        <p className="mt-0.5 text-[12px] text-white/35">
          {isDemo
            ? "Explore the GPSSA Intelligence operating system."
            : "Social Insurance & Pension Knowledge Intelligence"}
        </p>
      </motion.header>

      {/* Theater body */}
      <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col gap-2.5 px-4 pb-2 sm:px-6 sm:gap-3">
        {/* Twin hero rails */}
        <div className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5">
          {HERO_MODULES.map((mod, i) => (
            <div key={mod.id} className="h-[68px] sm:h-[72px]">
              <HeroRail
                module={mod}
                index={i}
                active={focusedId === mod.id}
                onFocus={() => setFocusedId(mod.id)}
                onBlur={() => {}}
                onNavigate={() => navigate(mod.primaryHref)}
                tourId={
                  mod.id === "atlas"
                    ? "compass-atlas-bar"
                    : mod.id === "mandate"
                      ? "compass-mandate-bar"
                      : undefined
                }
              />
            </div>
          ))}
        </div>

        {/* Focus stage */}
        <div className="min-h-0 flex-[1.1]">
          <FocusStage module={focused} onNavigate={navigate} />
        </div>

        {/* Core + Ops tiles */}
        <div className="shrink-0 space-y-1.5">
          <div className="flex items-center gap-2 px-0.5">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
            <span className="text-[9px] font-semibold uppercase tracking-[0.26em] text-white/35">
              Core Portfolio
            </span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
          </div>
          <div
            className="grid h-[88px] grid-cols-3 gap-2 sm:h-[96px] sm:gap-2.5"
            data-tour="compass-pillar-grid"
          >
            {CORE_MODULES.map((mod, i) => (
              <ModuleTile
                key={mod.id}
                module={mod}
                index={i}
                active={focusedId === mod.id}
                onFocus={() => setFocusedId(mod.id)}
                onBlur={() => {}}
                onNavigate={() => navigate(mod.primaryHref)}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 px-0.5 pt-0.5">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
            <span className="text-[9px] font-semibold uppercase tracking-[0.26em] text-white/35">
              Operational Excellence
            </span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
          </div>
          <div
            className="grid h-[88px] grid-cols-2 gap-2 sm:h-[96px] sm:grid-cols-4 sm:gap-2.5"
            data-tour="compass-ops-grid"
          >
            {OPS_MODULES.map((mod, i) => (
              <ModuleTile
                key={mod.id}
                module={mod}
                index={CORE_MODULES.length + i}
                active={focusedId === mod.id}
                onFocus={() => setFocusedId(mod.id)}
                onBlur={() => {}}
                onNavigate={() => navigate(mod.primaryHref)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <motion.footer
        className="relative z-10 flex shrink-0 items-center justify-center gap-2 py-2"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
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
