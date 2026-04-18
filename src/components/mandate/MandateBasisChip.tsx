"use client";

/**
 * Bidirectional link from any pillar page back to the legal mandate + RFI catalog.
 *
 * Renders a small chip such as "Mandate basis · 3 articles · 2 RFI refs" that
 * opens a slide-over panel listing:
 *   ─ matching statutory articles (StandardRequirement / Standard)
 *   ─ matching RFI sections (from rfi-sections.ts)
 *   ─ deep links to /dashboard/mandate/legal#<slug> and /dashboard/mandate/rfi-alignment
 *
 * Usage:
 *   <MandateBasisChip
 *     screenPath="/dashboard/services/catalog"
 *     entityIds={[serviceId, ...]}
 *   />
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Scale, ScrollText, Target, X, ArrowRight, Sparkles } from "lucide-react";
import {
  getRfiSectionsByScreen,
  RFI_KIND_ACCENT,
  RFI_KIND_LABELS,
  type RfiSection,
} from "@/lib/mandate/rfi-sections";

const EASE = [0.16, 1, 0.3, 1] as const;

interface ArticleHit {
  id: string;
  slug: string;
  code: string | null;
  title: string;
  description?: string | null;
  pillar: string | null;
  standard: { slug: string; code: string | null; title: string };
  entityLabels: string[];
}

interface MandateBasisChipProps {
  screenPath: string;
  entityIds?: string[];
  className?: string;
  variant?: "inline" | "floating";
}

export function MandateBasisChip({
  screenPath,
  entityIds = [],
  className,
  variant = "inline",
}: MandateBasisChipProps) {
  const [open, setOpen] = useState(false);
  const [articles, setArticles] = useState<ArticleHit[]>([]);
  const [loading, setLoading] = useState(true);

  const rfiHits = useMemo<RfiSection[]>(() => getRfiSectionsByScreen(screenPath), [screenPath]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ screenPath });
        if (entityIds.length) params.set("entityIds", entityIds.join(","));
        const res = await fetch(`/api/mandate/alignment?${params.toString()}`);
        if (!res.ok) return;
        const json = (await res.json()) as {
          articles?: {
            id: string;
            slug: string;
            code: string | null;
            title: string;
            description: string | null;
            pillar: string | null;
            standard: { slug: string; code: string | null; title: string };
            screenLinks: { screenId: string; entityLabel?: string | null }[];
          }[];
        };
        if (cancelled) return;
        const targetScreen = screenPath;
        const filtered: ArticleHit[] = (json.articles ?? [])
          .filter((a) => a.screenLinks.some((l) => l.screenId === targetScreen))
          .map((a) => ({
            id: a.id,
            slug: a.slug,
            code: a.code,
            title: a.title,
            description: a.description,
            pillar: a.pillar,
            standard: a.standard,
            entityLabels: Array.from(
              new Set(
                a.screenLinks
                  .filter((l) => l.screenId === targetScreen && l.entityLabel)
                  .map((l) => l.entityLabel as string)
              )
            ),
          }));
        setArticles(filtered);
      } catch {
        // soft fail; chip simply shows RFI hits only
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [screenPath, entityIds.join("|")]);

  const total = articles.length + rfiHits.length;
  if (!loading && total === 0) return null;

  const chipBase =
    "group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] transition-all duration-300";
  const chipStyle =
    "border-[#00A86B]/30 bg-[#00A86B]/[0.06] text-[#9DE5C2] hover:border-[#00A86B]/55 hover:bg-[#00A86B]/[0.12] hover:text-cream";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${chipBase} ${chipStyle} ${
          variant === "floating" ? "fixed bottom-6 right-6 z-30 shadow-2xl" : ""
        } ${className ?? ""}`}
        title="View the legal mandate and RFI references behind this screen"
      >
        <Scale size={12} className="text-[#00A86B]" />
        <span className="text-cream">Mandate basis</span>
        <span className="rounded-full bg-white/[0.08] px-1.5 py-px text-[9px] tracking-widest text-white/65">
          {articles.length} art · {rfiHits.length} RFI
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              key="panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.45, ease: EASE }}
              className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[520px] flex-col border-l border-white/[0.06] bg-[#0A0F18] shadow-[0_0_64px_rgba(0,0,0,0.6)]"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.28em] text-[#00A86B]">
                    Mandate basis
                  </div>
                  <h2 className="mt-0.5 font-playfair text-lg font-semibold text-cream">
                    Legal &amp; RFI references for this screen
                  </h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-full p-1.5 text-white/55 hover:bg-white/[0.06] hover:text-cream"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6">
                <section>
                  <SectionHeader
                    Icon={ScrollText}
                    accent="#00A86B"
                    title="Statutory articles"
                    count={articles.length}
                  />
                  {loading ? (
                    <div className="mt-3 text-[12px] text-white/45">Resolving obligations…</div>
                  ) : articles.length === 0 ? (
                    <div className="mt-3 rounded-xl border border-white/[0.04] bg-white/[0.015] p-4 text-[12px] text-white/45">
                      No statutory articles are explicitly linked to this screen yet.
                    </div>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {articles.map((a) => (
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
                            <p className="mt-1.5 text-[12px] leading-relaxed text-white/60">
                              {a.description}
                            </p>
                          )}
                          {a.entityLabels.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {a.entityLabels.slice(0, 4).map((l) => (
                                <span
                                  key={l}
                                  className="rounded-full bg-[#00A86B]/[0.12] px-2 py-px text-[10px] text-[#9DE5C2]"
                                >
                                  <Sparkles size={9} className="mr-1 inline" /> {l}
                                </span>
                              ))}
                            </div>
                          )}
                          <Link
                            href={`/dashboard/mandate/legal#${a.standard.slug}`}
                            className="mt-2 inline-flex items-center gap-1 text-[11px] text-white/55 hover:text-cream"
                          >
                            Read article <ArrowRight size={11} />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section>
                  <SectionHeader
                    Icon={Target}
                    accent="#E7B02E"
                    title="RFI 02-2026 references"
                    count={rfiHits.length}
                  />
                  {rfiHits.length === 0 ? (
                    <div className="mt-3 rounded-xl border border-white/[0.04] bg-white/[0.015] p-4 text-[12px] text-white/45">
                      No RFI sections directly reference this screen.
                    </div>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {rfiHits.map((r) => {
                        const color = RFI_KIND_ACCENT[r.kind];
                        return (
                          <li
                            key={r.id}
                            className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-3"
                            style={{ boxShadow: `inset 3px 0 0 ${color}99` }}
                          >
                            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/45">
                              {r.sectionRef}
                              <span style={{ color }}>· {RFI_KIND_LABELS[r.kind]}</span>
                            </div>
                            <div className="mt-1 text-[13px] text-cream">{r.title}</div>
                            <p className="mt-1.5 line-clamp-3 text-[12px] leading-relaxed text-white/60">
                              {r.body}
                            </p>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  <Link
                    href="/dashboard/mandate/rfi-alignment"
                    className="mt-3 inline-flex items-center gap-1 text-[11px] text-white/55 hover:text-cream"
                  >
                    Open the alignment board <ArrowRight size={11} />
                  </Link>
                </section>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SectionHeader({
  Icon,
  accent,
  title,
  count,
}: {
  Icon: typeof ScrollText;
  accent: string;
  title: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="flex h-7 w-7 items-center justify-center rounded-lg"
        style={{
          background: `linear-gradient(135deg, ${accent}25, ${accent}05)`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 0 16px ${accent}25`,
        }}
      >
        <Icon size={12} style={{ color: accent }} strokeWidth={1.7} />
      </div>
      <h3 className="font-playfair text-[15px] font-semibold text-cream">{title}</h3>
      <span className="rounded-full bg-white/[0.06] px-2 py-px text-[10px] tracking-widest text-white/55">
        {count}
      </span>
    </div>
  );
}
