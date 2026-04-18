"use client";

/**
 * Mandate — History.
 *
 * Vertical chronological timeline of GpssaMilestone records, scrolled with a
 * progressive accent line. Falls back to a curated baseline if the corpus
 * hasn't been hydrated yet.
 */

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { History, Loader2, Sparkles } from "lucide-react";
import { MandateTimeline } from "@/components/mandate/MandateTimeline";

const EASE = [0.16, 1, 0.3, 1] as const;

interface Milestone {
  id: string;
  year: number;
  date: string | null;
  title: string;
  description: string;
  kind: string;
  sourceUrl: string | null;
}

const FALLBACK: Milestone[] = [
  {
    id: "fl-6-1999",
    year: 1999,
    date: "1999-04-04",
    title: "Federal Law No. 7 of 1999 on Pensions and Social Security",
    description:
      "The federal law that established the GPSSA framework, defining contributions, benefits and the obligations of employers and insured persons.",
    kind: "milestone",
    sourceUrl: "https://gpssa.gov.ae/pages/en/laws-and-regulations",
  },
  {
    id: "gpssa-est-2000",
    year: 2000,
    date: null,
    title: "GPSSA established as the federal pension authority",
    description:
      "Operational launch of the General Pension and Social Security Authority to administer the federal pension system.",
    kind: "milestone",
    sourceUrl: "https://gpssa.gov.ae/pages/en/about-us",
  },
  {
    id: "gcc-extension",
    year: 2007,
    date: null,
    title: "GCC Unified Insurance Extension System",
    description:
      "Continuity of social insurance coverage for GCC nationals working in any GCC member state, administered through GPSSA in the UAE.",
    kind: "agreement",
    sourceUrl: "https://gpssa.gov.ae/pages/en/laws-and-regulations",
  },
  {
    id: "fl-57-2023",
    year: 2023,
    date: "2023-10-31",
    title: "Federal Law No. 57 of 2023 on Pension and Social Security",
    description:
      "Modernised primary law: tightens coverage rules, refines contribution and benefit formulas, anchors digital service delivery.",
    kind: "reform",
    sourceUrl: "https://gpssa.gov.ae/pages/en/laws-and-regulations",
  },
  {
    id: "rfi-2026",
    year: 2026,
    date: null,
    title: "RFI 02-2026 — Product & Service Development Roadmap",
    description:
      "GPSSA seeks input on its product and service portfolio, customer experience indicators, and modernisation roadmap.",
    kind: "press",
    sourceUrl: null,
  },
];

export default function MandateHistoryPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/mandate/milestones")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        if (cancelled) return;
        setMilestones(Array.isArray(d) ? d : []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const data = useMemo(() => {
    if (milestones.length > 0) return milestones;
    return FALLBACK;
  }, [milestones]);

  return (
    <div className="relative mx-auto max-w-5xl px-8 py-12">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
        className="mb-10 max-w-3xl"
      >
        <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-[#00A86B]">
          <History size={11} /> Mandate · History
        </div>
        <h1 className="mt-1 font-playfair text-3xl font-semibold text-cream">
          A quarter-century of GPSSA, in milestones
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-white/60">
          Federal laws, GCC agreements, modernisation reforms and public
          recognitions — every milestone with a citation back to the source
          page on gpssa.gov.ae.
        </p>
        {milestones.length === 0 && !loading && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-[11px] text-white/55">
            <Sparkles size={11} className="text-[#00A86B]" /> Showing curated
            baseline — run the mandate-corpus agent to populate live milestones.
          </div>
        )}
        {loading && (
          <div className="mt-3 inline-flex items-center gap-2 text-[12px] text-white/45">
            <Loader2 size={12} className="animate-spin" /> Loading milestones…
          </div>
        )}
      </motion.header>

      <MandateTimeline milestones={data} />
    </div>
  );
}
