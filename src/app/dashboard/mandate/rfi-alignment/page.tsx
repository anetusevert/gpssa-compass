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
import { RFI_REFERENCE } from "@/lib/mandate/rfi-sections";

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
    <div className="relative flex h-full flex-col">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 12% 18%, rgba(0,168,107,0.08) 0%, transparent 55%), radial-gradient(circle at 88% 84%, rgba(202,99,213,0.07) 0%, transparent 60%)",
        }}
      />

      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
        className="shrink-0 border-b border-white/[0.05] bg-black/15 px-8 py-5 backdrop-blur"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-[#00A86B]">
              <Network size={11} /> Mandate · RFI Alignment Board
            </div>
            <h1 className="mt-1 font-playfair text-2xl font-semibold text-cream">
              How {RFI_REFERENCE.number} maps to the legal mandate and the live
              app pillars
            </h1>
            <p className="mt-1 max-w-3xl text-[12px] leading-relaxed text-white/55">
              Hover any node to follow the obligation: legal article ↔ RFI
              objective / workstream / deliverable / area-of-focus ↔ the
              concrete GPSSA service, product or channel that delivers it.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-white/55">
            <Sparkles size={11} className="text-[#00A86B]" />
            <span>Edges drawn live · hover-driven</span>
          </div>
        </div>
      </motion.header>

      <div className="min-h-0 flex-1 overflow-hidden p-6">
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
