"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { BriefingSnapshot } from "@/lib/briefing/types";

interface SlideChromeProps {
  current: number;
  total: number;
  snapshot: BriefingSnapshot | null;
  goTo: (idx: number) => void;
  children: ReactNode;
}

function formatRelative(iso: string | null): string {
  if (!iso) return "no data yet";
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = now - then;
  if (diffMs < 0) return "just now";
  const min = Math.floor(diffMs / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}

function FreshnessChip({ snapshot }: { snapshot: BriefingSnapshot | null }) {
  if (!snapshot) return null;
  const c = snapshot.completeness;
  const pieces: string[] = [];
  if (c.countries.total > 0) {
    pieces.push(`${c.countries.done} of ${c.countries.total} nations`);
  }
  if (c.services.total > 0) {
    pieces.push(`${c.services.done} of ${c.services.total} services`);
  }
  pieces.push(`refreshed ${formatRelative(snapshot.meta.lastResearchAt)}`);

  return (
    <div className="flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-1 text-[10px] text-white/55 ring-1 ring-white/[0.06]">
      <motion.span
        className="h-1.5 w-1.5 rounded-full bg-[#00A86B]"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <span>Based on {pieces.join(" · ")}</span>
    </div>
  );
}

export function SlideChrome({
  current,
  total,
  snapshot,
  goTo,
  children,
}: SlideChromeProps) {
  return (
    <div className="relative flex h-full w-full flex-col">
      {/* Top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between px-8 pt-6">
        <div className="pointer-events-auto flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/45">
          <span className="font-playfair text-[13px] font-bold tracking-normal text-cream">
            GPSSA Compass
          </span>
          <span className="text-white/20">/</span>
          <span>Executive Briefing</span>
        </div>

        {/* Progress dots */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          {Array.from({ length: total }).map((_, i) => {
            const isActive = i === current;
            const isPast = i < current;
            return (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="group relative flex h-3 items-center justify-center"
              >
                <motion.span
                  className="block h-1 rounded-full"
                  style={{
                    backgroundColor: isActive
                      ? "rgba(0,168,107,0.95)"
                      : isPast
                      ? "rgba(255,255,255,0.6)"
                      : "rgba(255,255,255,0.18)",
                  }}
                  animate={{ width: isActive ? 22 : 6 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
              </button>
            );
          })}
        </div>

        <div className="pointer-events-auto text-[11px] tracking-[0.2em] text-white/40">
          <span className="text-cream">
            {String(current + 1).padStart(2, "0")}
          </span>
          <span className="mx-1 text-white/25">/</span>
          <span>{String(total).padStart(2, "0")}</span>
        </div>
      </div>

      {/* Slide body */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        {children}
      </div>

      {/* Bottom bar */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-end justify-between px-8 pb-6">
        <div className="pointer-events-auto flex items-center gap-2 text-[10px] text-white/40">
          <span>powered by</span>
          <Image
            src="/images/adl-logo.png"
            alt="Arthur D. Little"
            width={48}
            height={16}
            className="adl-logo-white object-contain opacity-60"
          />
        </div>
        <div className="pointer-events-auto">
          <FreshnessChip snapshot={snapshot} />
        </div>
      </div>
    </div>
  );
}
