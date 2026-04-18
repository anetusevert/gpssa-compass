"use client";

/**
 * Mandate — Obligations.
 *
 * Inverts the legal foundation: starts from the GPSSA service / product /
 * channel and lists the statutory obligations they discharge. Powered by
 * `/api/mandate/alignment` (StandardComplianceItem fan-out).
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ListChecks,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

interface AlignmentArticle {
  id: string;
  slug: string;
  code: string | null;
  title: string;
  pillar: string | null;
  description: string | null;
  standard: { id: string; slug: string; code: string | null; title: string; category: string };
  screenLinks: { screenId: string; entityLabel?: string | null; rationale?: string | null }[];
}

interface AlignmentScreen {
  id: string;
  label: string;
  pillar: string;
  href: string;
}

interface AlignmentPayload {
  articles: AlignmentArticle[];
  appScreens: AlignmentScreen[];
}

const PILLAR_COLOR: Record<string, string> = {
  services: "#2D4A8C",
  products: "#C5A572",
  delivery: "#7DB9A4",
  atlas: "#00A86B",
  mandate: "#00A86B",
  international: "#4899FF",
};

export default function MandateObligationsPage() {
  const [payload, setPayload] = useState<AlignmentPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeScreen, setActiveScreen] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/mandate/alignment")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled || !d) return;
        setPayload(d);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const grouped = useMemo(() => {
    if (!payload) return [] as { screen: AlignmentScreen; articles: AlignmentArticle[] }[];
    const out: { screen: AlignmentScreen; articles: AlignmentArticle[] }[] = [];
    for (const screen of payload.appScreens) {
      const articles = payload.articles.filter((a) =>
        a.screenLinks.some((l) => l.screenId === screen.id)
      );
      const matchSearch = (a: AlignmentArticle) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          a.title.toLowerCase().includes(q) ||
          (a.description ?? "").toLowerCase().includes(q) ||
          (a.standard.title ?? "").toLowerCase().includes(q)
        );
      };
      const filteredArticles = articles.filter(matchSearch);
      if (filteredArticles.length > 0) {
        out.push({ screen, articles: filteredArticles });
      }
    }
    return out;
  }, [payload, search]);

  const visible = activeScreen ? grouped.filter((g) => g.screen.id === activeScreen) : grouped;

  return (
    <div className="relative mx-auto max-w-7xl px-8 py-10">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
        className="mb-8 max-w-3xl"
      >
        <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-[#00A86B]">
          <ListChecks size={11} /> Mandate · Obligations
        </div>
        <h1 className="mt-1 font-playfair text-3xl font-semibold text-cream">
          Each app screen, the statutory duties it discharges
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-white/60">
          The mandate-corpus agent links every legal article it indexes to the
          concrete GPSSA service, product or channel that delivers it. Use
          this view to audit which obligations are operational, and where the
          coverage is thinnest.
        </p>
      </motion.header>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter obligations…"
            className="w-72 rounded-lg border border-white/[0.06] bg-white/[0.02] py-2 pl-8 pr-3 text-[12px] text-cream placeholder-white/40 focus:border-[#00A86B]/40 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveScreen(null)}
            className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em] transition-colors ${
              activeScreen === null
                ? "bg-[#00A86B]/15 text-cream"
                : "text-white/55 hover:text-cream hover:bg-white/[0.04]"
            }`}
          >
            All
          </button>
          {payload?.appScreens.map((s) => {
            const color = PILLAR_COLOR[s.pillar] ?? "#FFFFFF";
            const active = activeScreen === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveScreen(s.id)}
                className={`rounded-full border px-3 py-1 text-[11px] transition-colors ${
                  active ? "text-cream" : "text-white/55 hover:text-cream"
                }`}
                style={{
                  borderColor: active ? `${color}55` : "rgba(255,255,255,0.06)",
                  background: active ? `${color}1c` : "transparent",
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 rounded-2xl border border-white/[0.05] bg-white/[0.015] p-8 text-[13px] text-white/45">
          <Loader2 size={14} className="animate-spin" /> Resolving obligation links…
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.015] p-8 text-[13px] text-white/55">
          <Sparkles size={14} className="mb-2 inline text-[#00A86B]" />
          <p>
            No obligation links yet. The mandate-corpus agent populates these
            during structuring — give it a run from{" "}
            <Link className="text-cream underline" href="/dashboard/admin/agents">
              Admin · Agents
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {visible.map(({ screen, articles }) => {
            const color = PILLAR_COLOR[screen.pillar] ?? "#FFFFFF";
            return (
              <motion.section
                key={screen.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="glass-panel relative overflow-hidden rounded-2xl border border-white/[0.04] p-6"
                style={{
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 14px 32px rgba(0,0,0,0.32), 0 0 36px ${color}10`,
                }}
              >
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.22em]" style={{ color }}>
                      {screen.pillar}
                    </div>
                    <h3 className="mt-0.5 font-playfair text-xl font-semibold text-cream">
                      {screen.label}
                    </h3>
                    <p className="mt-1 text-[12px] text-white/50">
                      {articles.length} statutory obligation{articles.length === 1 ? "" : "s"} delivered here
                    </p>
                  </div>
                  <Link
                    href={screen.href}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/[0.06] px-3 py-1.5 text-[11px] text-white/65 hover:text-cream"
                  >
                    Open screen <ArrowUpRight size={11} />
                  </Link>
                </div>

                <ul className="grid gap-2 md:grid-cols-2">
                  {articles.map((a) => {
                    const linksHere = a.screenLinks.filter((l) => l.screenId === screen.id);
                    return (
                      <li
                        key={a.id}
                        className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-3 transition hover:bg-white/[0.04]"
                      >
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/45">
                          {a.standard.code ?? a.standard.slug}
                          {a.code && <span className="text-cream">· {a.code}</span>}
                        </div>
                        <div className="mt-1 text-[13px] text-cream">{a.title}</div>
                        {a.description && (
                          <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-white/55">
                            {a.description}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          {linksHere
                            .filter((l) => l.entityLabel)
                            .slice(0, 4)
                            .map((l, i) => (
                              <span
                                key={`${l.entityLabel}-${i}`}
                                className="rounded-full bg-[#00A86B]/[0.12] px-2 py-px text-[10px] text-[#9DE5C2]"
                              >
                                {l.entityLabel}
                              </span>
                            ))}
                          <Link
                            href={`/dashboard/mandate/legal?slug=${encodeURIComponent(a.standard.slug)}`}
                            className="ml-auto inline-flex items-center gap-1 text-[11px] text-white/55 hover:text-cream"
                          >
                            Read article <ArrowUpRight size={11} />
                          </Link>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </motion.section>
            );
          })}
        </div>
      )}
    </div>
  );
}
