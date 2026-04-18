"use client";

/**
 * Mandate — Legal Foundation.
 *
 * Lists every statutory instrument in the GPSSA mandate corpus and lets the
 * analyst browse article-by-article in a two-pane reader. Categories
 * (federal-law / circular / policy) are filterable from a top tab strip.
 */

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Filter, Loader2, Scale } from "lucide-react";
import { ArticleBrowser } from "@/components/mandate/ArticleBrowser";

const EASE = [0.16, 1, 0.3, 1] as const;

interface StandardSummary {
  id: string;
  slug: string;
  title: string;
  code: string | null;
  category: string;
  description: string | null;
  publishedAt: string | null;
  requirementCount: number;
}

const CATEGORY_TABS = [
  { id: "all", label: "All" },
  { id: "legal-mandate", label: "Federal laws" },
  { id: "circular", label: "Circulars" },
  { id: "policy", label: "Policies" },
] as const;

type TabId = (typeof CATEGORY_TABS)[number]["id"];

export default function MandateLegalPage() {
  const searchParams = useSearchParams();
  const initialSlug = searchParams.get("slug");

  const [standards, setStandards] = useState<StandardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabId>("all");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/mandate/standards")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        if (cancelled) return;
        setStandards(Array.isArray(d) ? d : []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (tab === "all") return standards;
    return standards.filter((s) => s.category === tab);
  }, [standards, tab]);

  return (
    <div className="relative mx-auto flex h-full max-w-[1500px] flex-col gap-6 px-8 py-8">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
        className="flex flex-wrap items-end justify-between gap-6"
      >
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-[#00A86B]">
            <Scale size={11} /> Mandate · Legal Foundation
          </div>
          <h1 className="mt-1 font-playfair text-3xl font-semibold text-cream">
            Read the law, article by article
          </h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-white/60">
            Federal Law No. 6 of 1999, Federal Law No. 57 of 2023, executive
            regulations and circulars — extracted from gpssa.gov.ae and
            decoded into plain-English articles tagged to the GPSSA pillars
            they govern.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] p-1">
          <Filter size={11} className="ml-2 text-white/40" />
          {CATEGORY_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em] transition-colors ${
                tab === t.id
                  ? "bg-[#00A86B]/15 text-cream"
                  : "text-white/55 hover:bg-white/[0.04] hover:text-cream"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </motion.header>

      <div className="min-h-0 flex-1">
        {loading ? (
          <div className="flex h-full items-center justify-center text-white/45">
            <Loader2 size={16} className="mr-2 animate-spin" /> Loading legal corpus…
          </div>
        ) : (
          <ArticleBrowser standards={filtered} initialSlug={initialSlug} />
        )}
      </div>
    </div>
  );
}
