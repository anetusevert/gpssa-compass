"use client";

/**
 * Mandate — Legal Foundation.
 *
 * Lists every statutory instrument in the GPSSA mandate corpus and lets the
 * analyst browse article-by-article in a two-pane reader. Categories
 * (federal-law / circular / policy) are filterable from a top tab strip.
 */

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useMemo, useState } from "react";
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
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center text-white/45"><Loader2 size={16} className="mr-2 animate-spin" /> Loading…</div>}>
      <MandateLegalView />
    </Suspense>
  );
}

function MandateLegalView() {
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
    <div className="relative flex h-full flex-col overflow-hidden">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="shrink-0 flex flex-wrap items-end justify-between gap-3 px-4 pt-3 pb-2 md:px-6 md:pt-4"
      >
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-[#1B7A4A]">
            <Scale size={11} /> Mandate · Legal Foundation
          </div>
          <h1 className="mt-0.5 truncate font-playfair text-xl font-semibold text-cream md:text-2xl">
            Read the law, article by article
          </h1>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.02] p-0.5">
          <Filter size={10} className="ml-1.5 text-white/40" />
          {CATEGORY_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] transition-colors ${
                tab === t.id
                  ? "bg-[#1B7A4A]/20 text-cream"
                  : "text-white/55 hover:bg-white/[0.04] hover:text-cream"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </motion.header>

      <div className="min-h-0 flex-1 px-4 pb-4 md:px-6 md:pb-6">
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
