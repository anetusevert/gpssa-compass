"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, GitBranch, Map, ShieldCheck, Layers } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SlideLayout } from "./SlideLayout";
import { useBriefingStore } from "../store";
import { useEngagementStore } from "@/lib/engagement/store";
import type { BriefingSnapshot } from "@/lib/briefing/types";

const EASE = [0.16, 1, 0.3, 1] as const;

interface CTA {
  label: string;
  href: string;
  icon: LucideIcon;
  color: string;
  badge: (s: BriefingSnapshot) => string;
}

const CTAS: CTA[] = [
  {
    label: "Home spine",
    href: "/dashboard",
    icon: Map,
    color: "rgba(0,168,107,0.85)",
    badge: () => "Open operating spine",
  },
  {
    label: "Operating Blueprint",
    href: "/dashboard/services/operating",
    icon: GitBranch,
    color: "rgba(0,168,107,0.85)",
    badge: (s) =>
      s.spine.goldServiceName
        ? `Gold · ${s.spine.litNodes.length}/5 lit`
        : "Blueprints",
  },
  {
    label: "Engagement Mode",
    href: "/dashboard",
    icon: Layers,
    color: "rgba(45,74,140,0.85)",
    badge: () => "Discover → Handover",
  },
  {
    label: "Quality Assurance",
    href: "/dashboard/quality/framework",
    icon: ShieldCheck,
    color: "rgba(45,212,191,0.85)",
    badge: () => "QA & CAPA",
  },
];

export function Slide16_Close({ snapshot }: { snapshot: BriefingSnapshot }) {
  const router = useRouter();
  const closeDeck = useBriefingStore((s) => s.closeDeck);
  const openDiscover = useEngagementStore((s) => s.openDiscover);

  function handleNav(href: string, label: string) {
    closeDeck();
    if (label === "Engagement Mode") openDiscover();
    router.push(href);
  }

  return (
    <SlideLayout
      eyebrow="Continue"
      title="Walk the spine. Run the engagement."
      subtitle="Open Home, light the gold path, or start Engagement Mode — one working file."
    >
      <div className="flex h-full flex-col items-center justify-center">
        <div className="grid w-full max-w-5xl grid-cols-2 gap-4 md:grid-cols-4">
          {CTAS.map((cta, i) => {
            const Icon = cta.icon;
            return (
              <motion.button
                key={cta.label}
                type="button"
                onClick={() => handleNav(cta.href, cta.label)}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.4 + i * 0.1, ease: EASE }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="group relative flex flex-col items-start gap-3 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 text-left"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, ${cta.color}, transparent)`,
                  }}
                >
                  <Icon size={18} className="text-cream" />
                </div>
                <div className="font-playfair text-lg font-semibold text-cream">{cta.label}</div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-white/45">
                  {cta.badge(snapshot)}
                </div>
                <ArrowRight
                  size={14}
                  className="absolute right-4 top-4 text-white/25 transition group-hover:translate-x-1 group-hover:text-cream"
                />
              </motion.button>
            );
          })}
        </div>
      </div>
    </SlideLayout>
  );
}
