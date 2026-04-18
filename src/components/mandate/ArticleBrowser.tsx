"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, FileDown, Loader2, ScrollText, Search } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

interface StandardSummary {
  slug: string;
  title: string;
  code?: string | null;
  category?: string | null;
  description?: string | null;
  publishedAt?: string | null;
  requirementCount?: number;
}

interface RequirementDetail {
  id: string;
  slug: string;
  code: string | null;
  title: string;
  description: string | null;
  pillar: string | null;
  sortOrder: number;
}

interface SourceDetail {
  id: string;
  title: string;
  url: string;
  publisher?: string | null;
}

interface ObligationLink {
  entityType: string;
  entityId: string;
  entityLabel: string | null;
  rationale: string | null;
}

interface StandardDetail {
  slug: string;
  title: string;
  code?: string | null;
  category?: string | null;
  description?: string | null;
  rationale?: string | null;
  publishedAt?: string | null;
  url?: string | null;
  requirements: RequirementDetail[];
  sources: SourceDetail[];
  obligationLinks: ObligationLink[];
}

interface ArticleBrowserProps {
  standards: StandardSummary[];
  initialSlug?: string | null;
}

const ENTITY_BADGE: Record<string, { label: string; accent: string }> = {
  "gpssa-service": { label: "GPSSA service", accent: "#4899FF" },
  product: { label: "Product", accent: "#C5A572" },
  "delivery-channel": { label: "Channel", accent: "#7DB9A4" },
  segment: { label: "Segment", accent: "#CA63D5" },
  persona: { label: "Persona", accent: "#E7B02E" },
};

const PILLAR_BADGE: Record<string, string> = {
  registration: "rgba(72,153,255,0.7)",
  contribution: "rgba(125,185,164,0.7)",
  pension: "rgba(0,168,107,0.75)",
  "end-of-service": "rgba(231,176,46,0.75)",
  injury: "rgba(231,99,99,0.75)",
  death: "rgba(150,150,170,0.75)",
  gcc: "rgba(202,99,213,0.75)",
  advisory: "rgba(125,185,164,0.6)",
  complaint: "rgba(231,99,99,0.55)",
  governance: "rgba(255,255,255,0.5)",
  transparency: "rgba(72,153,255,0.45)",
  digital: "rgba(72,153,255,0.6)",
};

export function ArticleBrowser({ standards, initialSlug }: ArticleBrowserProps) {
  const initial = useMemo(() => {
    if (initialSlug && standards.some((s) => s.slug === initialSlug)) return initialSlug;
    return standards[0]?.slug ?? null;
  }, [initialSlug, standards]);

  const [activeSlug, setActiveSlug] = useState<string | null>(initial);
  const [detail, setDetail] = useState<StandardDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [activeRequirementId, setActiveRequirementId] = useState<string | null>(null);

  useEffect(() => {
    setActiveSlug(initial);
  }, [initial]);

  useEffect(() => {
    if (!activeSlug) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/mandate/standards/${encodeURIComponent(activeSlug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        setDetail(d);
        setActiveRequirementId(d?.requirements?.[0]?.id ?? null);
      })
      .catch(() => {
        if (!cancelled) setDetail(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeSlug]);

  const filteredStandards = useMemo(() => {
    if (!filter.trim()) return standards;
    const f = filter.toLowerCase();
    return standards.filter(
      (s) =>
        s.title.toLowerCase().includes(f) ||
        (s.code ?? "").toLowerCase().includes(f) ||
        (s.description ?? "").toLowerCase().includes(f)
    );
  }, [filter, standards]);

  const activeRequirement = useMemo(
    () => detail?.requirements.find((r) => r.id === activeRequirementId) ?? null,
    [detail, activeRequirementId]
  );
  const linksForActiveRequirement = detail?.obligationLinks ?? [];

  return (
    <div className="grid h-full gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="glass-panel relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-white/[0.04] p-4">
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter laws / circulars / policies"
            className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] py-2 pl-8 pr-3 text-[12px] text-cream placeholder-white/35 focus:border-[#00A86B]/40 focus:outline-none"
          />
        </div>
        <div className="flex-1 overflow-y-auto pr-1 scrollbar-none">
          <ul className="space-y-1">
            {filteredStandards.map((s) => {
              const active = s.slug === activeSlug;
              return (
                <li key={s.slug}>
                  <button
                    onClick={() => setActiveSlug(s.slug)}
                    className={`group w-full rounded-xl px-3 py-2.5 text-left transition-colors ${
                      active ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
                    }`}
                    style={
                      active
                        ? { boxShadow: "inset 0 0 0 1px rgba(0,168,107,0.35)" }
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-[#7DB9A4]">
                      {s.category ?? "legal-mandate"}
                      {s.publishedAt && (
                        <span className="text-white/30">· {new Date(s.publishedAt).getFullYear()}</span>
                      )}
                    </div>
                    <div className="mt-1 line-clamp-2 text-[13px] font-medium text-cream">{s.title}</div>
                    {typeof s.requirementCount === "number" && (
                      <div className="mt-1 text-[11px] text-white/45">{s.requirementCount} articles</div>
                    )}
                  </button>
                </li>
              );
            })}
            {filteredStandards.length === 0 && (
              <li className="px-3 py-6 text-center text-[12px] text-white/40">No matches.</li>
            )}
          </ul>
        </div>
      </aside>

      <section className="glass-panel relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-white/[0.04] p-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full items-center justify-center text-white/45"
            >
              <Loader2 size={18} className="mr-2 animate-spin" /> Loading article…
            </motion.div>
          ) : detail ? (
            <motion.div
              key={detail.slug}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="flex h-full flex-col gap-5"
            >
              <header className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/50">
                    <span className="text-[#00A86B]">{detail.category ?? "legal-mandate"}</span>
                    {detail.code && <span>· {detail.code}</span>}
                    {detail.publishedAt && <span>· {new Date(detail.publishedAt).getFullYear()}</span>}
                  </div>
                  <h2 className="mt-1 font-playfair text-2xl font-bold text-cream">{detail.title}</h2>
                  {detail.description && (
                    <p className="mt-3 max-w-3xl text-[13px] leading-relaxed text-white/65">{detail.description}</p>
                  )}
                  {detail.rationale && (
                    <p className="mt-2 max-w-3xl text-[12px] leading-relaxed text-white/50 italic">{detail.rationale}</p>
                  )}
                </div>
                {detail.url && (
                  <a
                    href={detail.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-[11px] text-white/65 transition-colors hover:border-[#00A86B]/40 hover:text-cream"
                  >
                    <FileDown size={12} /> Open source
                    <ArrowUpRight size={11} />
                  </a>
                )}
              </header>

              <div className="grid flex-1 gap-5 lg:grid-cols-[260px_1fr] overflow-hidden">
                <div className="overflow-y-auto pr-1 scrollbar-none">
                  <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/50">
                    <ScrollText size={11} className="text-[#00A86B]" />
                    Articles
                  </div>
                  <ul className="space-y-1">
                    {detail.requirements.map((r) => {
                      const active = r.id === activeRequirementId;
                      return (
                        <li key={r.id}>
                          <button
                            onClick={() => setActiveRequirementId(r.id)}
                            className={`group w-full rounded-lg px-3 py-2 text-left text-[12px] transition-colors ${
                              active ? "bg-white/[0.06] text-cream" : "text-white/65 hover:bg-white/[0.03] hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/40">
                              {r.code ?? `Article ${r.sortOrder + 1}`}
                              {r.pillar && (
                                <span
                                  className="rounded-full px-1.5 py-px text-[9px] tracking-wider text-white/85"
                                  style={{ background: PILLAR_BADGE[r.pillar] ?? "rgba(255,255,255,0.1)" }}
                                >
                                  {r.pillar}
                                </span>
                              )}
                            </div>
                            <div className="mt-0.5 truncate">{r.title}</div>
                          </button>
                        </li>
                      );
                    })}
                    {detail.requirements.length === 0 && (
                      <li className="rounded-lg px-3 py-3 text-[12px] text-white/40">
                        No articles indexed yet — run the mandate-corpus agent to populate them.
                      </li>
                    )}
                  </ul>
                </div>

                <div className="relative overflow-y-auto pr-1 scrollbar-none">
                  {activeRequirement ? (
                    <motion.article
                      key={activeRequirement.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className="space-y-5"
                    >
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">
                          {activeRequirement.code ?? `Article ${activeRequirement.sortOrder + 1}`}
                        </div>
                        <h3 className="mt-1 font-playfair text-xl font-semibold text-cream">
                          {activeRequirement.title}
                        </h3>
                      </div>
                      {activeRequirement.description ? (
                        <p className="text-[13px] leading-relaxed text-white/75">{activeRequirement.description}</p>
                      ) : (
                        <p className="text-[12px] italic text-white/45">
                          No plain-English explainer yet. Run the mandate-corpus agent to generate one.
                        </p>
                      )}

                      {linksForActiveRequirement.length > 0 && (
                        <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-4">
                          <div className="mb-3 text-[10px] uppercase tracking-[0.22em] text-white/45">
                            Fulfilled today by
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {linksForActiveRequirement.map((link, i) => {
                              const meta = ENTITY_BADGE[link.entityType] ?? { label: link.entityType, accent: "#7DB9A4" };
                              return (
                                <span
                                  key={`${link.entityType}-${link.entityId}-${i}`}
                                  className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] px-3 py-1 text-[11px] text-cream"
                                  style={{ boxShadow: `inset 0 0 0 1px ${meta.accent}33` }}
                                  title={link.rationale ?? undefined}
                                >
                                  <span
                                    className="h-1.5 w-1.5 rounded-full"
                                    style={{ background: meta.accent }}
                                  />
                                  <span className="text-white/55">{meta.label}</span>
                                  <span>{link.entityLabel ?? "Linked entity"}</span>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {detail.sources.length > 0 && (
                        <div>
                          <div className="mb-2 text-[10px] uppercase tracking-[0.22em] text-white/45">Sources</div>
                          <ul className="space-y-1.5">
                            {detail.sources.map((src) => (
                              <li key={src.id}>
                                <a
                                  href={src.url}
                                  target="_blank"
                                  rel="noreferrer noopener"
                                  className="inline-flex items-center gap-2 text-[12px] text-white/65 hover:text-cream"
                                >
                                  <ArrowUpRight size={11} className="text-[#00A86B]" />
                                  {src.title}
                                  {src.publisher && <span className="text-white/35">· {src.publisher}</span>}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.article>
                  ) : (
                    <div className="flex h-full items-center justify-center text-[12px] text-white/40">
                      Select an article to read its plain-English explainer.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full items-center justify-center text-[13px] text-white/45"
            >
              No statutory instruments indexed yet. Run the GPSSA Mandate Corpus agent in Admin → Agents to populate.
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
