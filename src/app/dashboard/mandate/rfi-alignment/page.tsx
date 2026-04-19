"use client";

/**
 * Mandate — RFI Alignment.
 *
 * Full-viewport home of the three-column cinematic alignment board:
 *   Statutory articles ─ RFI 02-2026 sections ─ App pillar screens.
 *
 * Renders inside the dashboard's `isFullViewport` layout.
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Network, Sparkles } from "lucide-react";
import {
  AlignmentBoard,
  type AlignmentPayload,
} from "@/components/mandate/AlignmentBoard";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function MandateRfiAlignmentPage() {
  const [payload, setPayload] = useState<AlignmentPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/mandate/alignment")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled || !d) return;
        setPayload(d as AlignmentPayload);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 12% 18%, rgba(0,168,107,0.08) 0%, transparent 55%), radial-gradient(circle at 88% 84%, rgba(202,99,213,0.07) 0%, transparent 60%)",
        }}
      />

      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="shrink-0 border-b border-white/[0.05] bg-black/15 px-4 py-2.5 backdrop-blur md:px-6 md:py-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.28em] text-[#00A86B]">
              <Network size={10} /> Mandate · RFI Alignment
            </div>
            <h1 className="mt-0.5 truncate font-playfair text-base font-semibold text-cream md:text-lg">
              How your RFI maps to the legal mandate &amp; ADL GPSSA Intelligence
            </h1>
          </div>
          <div className="hidden items-center gap-2 text-[10px] text-white/55 md:flex">
            <Sparkles size={10} className="text-[#00A86B]" />
            <span>Hover any node — connections appear</span>
          </div>
        </div>
      </motion.header>

      <div className="min-h-0 flex-1 overflow-hidden p-2 md:p-3">
        {loading ? (
          <div className="flex h-full items-center justify-center text-white/45">
            <Loader2 size={16} className="mr-2 animate-spin" /> Loading alignment graph…
          </div>
        ) : payload ? (
          <AlignmentBoard payload={payload} />
        ) : (
          <div className="flex h-full items-center justify-center text-[13px] text-white/55">
            Could not load alignment payload.
          </div>
        )}
      </div>
    </div>
  );
}
