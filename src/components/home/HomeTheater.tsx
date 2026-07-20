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
import { PageFrame } from "@/components/ui/PageFrame";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];
const DOCK = [...HERO_MODULES, ...CORE_MODULES, ...OPS_MODULES];

const DOCK_LABELS: Record<string, string> = {
  atlas: "Atlas",
  mandate: "Mandate",
  services: "Services",
  products: "Products",
  delivery: "Delivery",
  quality: "Quality",
  fulfilment: "Fulfilment",
  performance: "Performance",
  planning: "Roadmap",
};

function greetingFor(date: Date): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
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

  useEffect(() => {
    setNow(new Date());
  }, []);

  const greeting = now ? greetingFor(now) : "";
  const dateString = now
    ? now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    : "\u00A0";

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
      <div className="grid-overlay pointer-events-none absolute inset-0 opacity-15" />

      <div className="relative z-10 flex h-full min-h-0 flex-col px-3 pb-2 pt-2.5 sm:px-6">
        {/* Top bar — one row */}
        <motion.header
          className="flex shrink-0 items-end justify-between gap-3 pb-2"
          initial={reduceMotion ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <div className="min-w-0">
            <p className="text-[9px] font-medium uppercase tracking-[0.24em] text-white/30">
              {dateString}
            </p>
            <h1 className="truncate font-playfair text-xl font-bold text-cream sm:text-2xl">
              {isDemo ? greeting || "Welcome" : `${greeting || "Hello"}, ${userName}`}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2 pb-0.5">
            <EngagementModeTrigger />
            <motion.button
              type="button"
              onClick={() => replayTour()}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/45 hover:text-white/75"
              whileHover={reduceMotion ? undefined : { scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles size={10} className="text-[var(--gpssa-green)]/90" />
              Tour
            </motion.button>
          </div>
        </motion.header>

        <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col gap-2">
          <EngagementConductor />
          <OperatingSpine variant="hero" className="min-h-0 flex-1" />

          {/* Dock — floating glass bar */}
          <motion.nav
            className="flex shrink-0 justify-center"
            aria-label="Modules"
            data-tour="compass-pillar-grid"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.45, ease: EASE }}
          >
            <div className="flex max-w-full items-center gap-0.5 overflow-x-auto rounded-2xl border border-white/[0.08] bg-black/30 px-1.5 py-1 backdrop-blur-md scrollbar-none">
              {DOCK.map((mod) => {
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
                    whileHover={reduceMotion ? undefined : { y: -3, scale: 1.06 }}
                    whileTap={{ scale: 0.96 }}
                    className="group flex min-w-[54px] flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 transition hover:bg-white/[0.06]"
                    title={mod.title}
                  >
                    <Icon
                      size={15}
                      className="transition group-hover:drop-shadow-[0_0_6px_currentColor]"
                      style={{ color: `var(${mod.accentVar})` }}
                    />
                    <span className="max-w-[64px] truncate text-[8px] font-semibold uppercase tracking-[0.08em] text-white/40 group-hover:text-white/75">
                      {DOCK_LABELS[mod.id] ?? mod.title}
                    </span>
                  </motion.button>
                );
              })}
              <span className="mx-1 h-6 w-px shrink-0 bg-white/10" />
              <motion.button
                type="button"
                onClick={() => navigate("/dashboard/services/operating")}
                whileHover={reduceMotion ? undefined : { y: -3, scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
                className="flex min-w-[54px] flex-col items-center gap-0.5 rounded-xl bg-[var(--gpssa-green)]/12 px-2 py-1.5 transition hover:bg-[var(--gpssa-green)]/20"
                title="Operating blueprints"
              >
                <GitBranch size={15} className="text-[var(--gpssa-green)]" />
                <span className="text-[8px] font-semibold uppercase tracking-[0.08em] text-[var(--gpssa-green)]">
                  Blueprint
                </span>
              </motion.button>
            </div>
          </motion.nav>
        </div>

        <footer className="flex shrink-0 items-center justify-center gap-2 pt-1.5">
          <span className="text-[9px] text-white/25">powered by</span>
          <Image
            src="/images/adl-logo.png"
            alt="Arthur D. Little"
            width={44}
            height={15}
            className="adl-logo-white object-contain opacity-50"
          />
        </footer>
      </div>
    </PageFrame>
  );
}
