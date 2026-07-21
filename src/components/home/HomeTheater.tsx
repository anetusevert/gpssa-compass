"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useCompassTourStore } from "@/components/tour/tour-store";
import { EngagementModeTrigger } from "@/components/engagement/EngagementMode";
import { EngagementConductor } from "@/components/engagement/EngagementConductor";
import { OperatingSpine } from "@/components/spine/OperatingSpine";
import { SpineGuideDock } from "@/components/home/SpineGuideDock";
import { PageFrame } from "@/components/ui/PageFrame";
import type { SpineNodeId } from "@/lib/spine/types";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

function greetingFor(date: Date): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function HomeTheater() {
  const { data: session } = useSession();
  const replayTour = useCompassTourStore((s) => s.replay);
  const reduceMotion = useReducedMotion();
  const userType = (session?.user as { userType?: string } | undefined)?.userType;
  const isDemo = userType === "demo";
  const rawName = (session?.user?.name ?? "there").split(" ")[0];
  const userName = rawName.split(".")[0];

  const [now, setNow] = useState<Date | null>(null);
  const [selectedNode, setSelectedNode] = useState<SpineNodeId>("episode");
  const [personaKey, setPersonaKey] = useState<string | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  const greeting = now ? greetingFor(now) : "";
  const dateString = now
    ? now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    : "\u00A0";

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
          <OperatingSpine
            variant="hero"
            className="min-h-0 flex-1"
            onSelectedNodeChange={setSelectedNode}
            onPersonaKeyChange={setPersonaKey}
          />
          <SpineGuideDock selectedNode={selectedNode} personaKey={personaKey} />
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
