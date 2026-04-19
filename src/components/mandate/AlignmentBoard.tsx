"use client";

/**
 * Three-column cinematic alignment board.
 *
 * Columns:
 *   ─ Left   : statutory articles (StandardRequirement)
 *   ─ Middle : RFI sections (objective / workstream / deliverable / area-of-focus)
 *   ─ Right  : app screens (services / products / delivery / atlas / mandate)
 *
 * Hovering any node highlights:
 *   - that node
 *   - the nodes it is connected to in the other two columns
 *   - the SVG paths joining them
 *
 * Connections are drawn as smooth Bezier paths inside an absolute-positioned
 * SVG that overlays the columns and recomputes its viewBox on resize.
 */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ScrollText, Target, Layers as LayersIcon, ArrowRight, ExternalLink } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import {
  RFI_KIND_ACCENT,
  RFI_KIND_LABELS,
  type RfiKind,
} from "@/lib/mandate/rfi-sections";

const EASE = [0.16, 1, 0.3, 1] as const;

interface ArticleNode {
  id: string;
  slug: string;
  code: string | null;
  title: string;
  pillar: string | null;
  description?: string | null;
  standard: { id: string; slug: string; code?: string | null; title: string; category: string };
  screenLinks: { screenId: string; entityLabel?: string | null; rationale?: string | null }[];
  rfiSectionIds: string[];
}

interface RfiNode {
  id: string;
  sectionRef: string;
  title: string;
  body: string;
  kind: RfiKind;
  relatedScreens: string[];
}

interface ScreenNode {
  id: string;
  label: string;
  pillar: string;
  href: string;
}

export interface AlignmentPayload {
  articles: ArticleNode[];
  rfiSections: RfiNode[];
  appScreens: ScreenNode[];
}

interface AlignmentBoardProps {
  payload: AlignmentPayload;
}

interface HoverState {
  type: "article" | "rfi" | "screen" | null;
  id: string | null;
}

const PILLAR_COLOR: Record<string, string> = {
  registration: "#4899FF",
  contribution: "#7DB9A4",
  pension: "#00A86B",
  "end-of-service": "#E7B02E",
  injury: "#E76363",
  death: "#9696AA",
  gcc: "#CA63D5",
  advisory: "#7DB9A4",
  complaint: "#E76363",
  governance: "#FFFFFF",
  transparency: "#4899FF",
  digital: "#4899FF",
  other: "rgba(255,255,255,0.55)",
};

const SCREEN_COLOR: Record<string, string> = {
  services: "#2D4A8C",
  products: "#C5A572",
  delivery: "#7DB9A4",
  atlas: "#00A86B",
  mandate: "#00A86B",
  international: "#4899FF",
};

const PILLAR_LABELS: Record<string, string> = {
  registration: "Registration",
  contribution: "Contribution",
  pension: "Pension",
  "end-of-service": "End of Service",
  injury: "Work Injury",
  death: "Death & Survivors",
  gcc: "GCC Coordination",
  advisory: "Advisory",
  complaint: "Complaints",
  governance: "Governance",
  transparency: "Transparency",
  digital: "Digital",
  other: "Other",
};

const SCREEN_DESCRIPTIONS: Record<string, string> = {
  "screen-services-catalog":
    "Live catalog of every GPSSA service, the journey it sits in, the law it derives from, and current channel coverage.",
  "screen-services-channels":
    "Channel-by-channel capability matrix showing which services are available in app, web, contact center, branch, and partner systems.",
  "screen-products-portfolio":
    "Portfolio of in-flight and proposed pension, end-of-service, injury and death products with status and ownership.",
  "screen-products-segments":
    "Segment coverage view: which member, employer, pensioner and beneficiary segments each product currently serves.",
  "screen-delivery-channels":
    "Operational performance per delivery channel — SLA, fulfillment time, repeat contact and complaint themes.",
  "screen-delivery-personas":
    "Persona-led journey diagnostics highlighting friction, effort and pain points across the service experience.",
  "screen-atlas-benchmarking":
    "International benchmarking atlas comparing GPSSA against peer social-security funds on KPIs and product mix.",
  "screen-mandate-governance":
    "Governance hub: mandate basis, accountable owners, review cadence and KPI ownership for each obligation.",
  "screen-mandate-hub":
    "Top-level mandate workspace linking the legal corpus, RFI alignment, history and live pillar performance.",
};

type ActiveSelection = { kind: "article" | "rfi" | "screen"; id: string } | null;

export function AlignmentBoard({ payload }: AlignmentBoardProps) {
  const [hover, setHover] = useState<HoverState>({ type: null, id: null });
  const [active, setActive] = useState<ActiveSelection>(null);

  const articleById = useMemo(
    () => new Map(payload.articles.map((a) => [a.id, a])),
    [payload]
  );
  const rfiById = useMemo(
    () => new Map(payload.rfiSections.map((r) => [r.id, r])),
    [payload]
  );
  const screenById = useMemo(
    () => new Map(payload.appScreens.map((s) => [s.id, s])),
    [payload]
  );

  // Group statutory articles by pillar (count desc, unknown last)
  const articleGroups = useMemo(() => {
    const buckets = new Map<string, ArticleNode[]>();
    for (const a of payload.articles) {
      const key = a.pillar ?? "other";
      const bucket = buckets.get(key);
      if (bucket) bucket.push(a);
      else buckets.set(key, [a]);
    }
    return Array.from(buckets.entries())
      .sort((a, b) => {
        if (a[0] === "other") return 1;
        if (b[0] === "other") return -1;
        return b[1].length - a[1].length;
      })
      .map(([pillar, items]) => ({
        pillar,
        items,
        color: PILLAR_COLOR[pillar] ?? "rgba(255,255,255,0.55)",
        label: PILLAR_LABELS[pillar] ?? pillar,
      }));
  }, [payload]);

  const articleRefs = useRef<Map<string, HTMLLIElement>>(new Map());
  const rfiRefs = useRef<Map<string, HTMLLIElement>>(new Map());
  const screenRefs = useRef<Map<string, HTMLLIElement>>(new Map());
  const stageRef = useRef<HTMLDivElement>(null);

  // Edges
  const articleToScreen = useMemo(() => {
    const edges: { articleId: string; screenId: string }[] = [];
    for (const a of payload.articles) {
      for (const link of a.screenLinks) edges.push({ articleId: a.id, screenId: link.screenId });
    }
    return edges;
  }, [payload]);

  const articleToRfi = useMemo(() => {
    const edges: { articleId: string; rfiId: string }[] = [];
    for (const a of payload.articles) {
      for (const rfiId of a.rfiSectionIds) edges.push({ articleId: a.id, rfiId });
    }
    return edges;
  }, [payload]);

  const rfiToScreen = useMemo(() => {
    const screenByPath = new Map(payload.appScreens.map((s) => [s.href, s]));
    const edges: { rfiId: string; screenId: string }[] = [];
    for (const r of payload.rfiSections) {
      for (const path of r.relatedScreens) {
        const s = screenByPath.get(path);
        if (s) edges.push({ rfiId: r.id, screenId: s.id });
      }
    }
    return edges;
  }, [payload]);

  // Highlighted sets, derived from hover
  const highlight = useMemo(() => {
    const articles = new Set<string>();
    const rfis = new Set<string>();
    const screens = new Set<string>();
    if (hover.type && hover.id) {
      if (hover.type === "article") {
        articles.add(hover.id);
        for (const e of articleToScreen) if (e.articleId === hover.id) screens.add(e.screenId);
        for (const e of articleToRfi) if (e.articleId === hover.id) rfis.add(e.rfiId);
      } else if (hover.type === "rfi") {
        rfis.add(hover.id);
        for (const e of articleToRfi) if (e.rfiId === hover.id) articles.add(e.articleId);
        for (const e of rfiToScreen) if (e.rfiId === hover.id) screens.add(e.screenId);
      } else if (hover.type === "screen") {
        screens.add(hover.id);
        for (const e of articleToScreen) if (e.screenId === hover.id) articles.add(e.articleId);
        for (const e of rfiToScreen) if (e.screenId === hover.id) rfis.add(e.rfiId);
      }
    }
    return { articles, rfis, screens };
  }, [hover, articleToScreen, articleToRfi, rfiToScreen]);

  const isDimmed = (type: HoverState["type"], id: string): boolean => {
    if (!hover.type) return false;
    if (type === "article") return !highlight.articles.has(id);
    if (type === "rfi") return !highlight.rfis.has(id);
    if (type === "screen") return !highlight.screens.has(id);
    return false;
  };

  const isHighlighted = (type: HoverState["type"], id: string): boolean => {
    if (!hover.type) return false;
    if (type === "article") return highlight.articles.has(id);
    if (type === "rfi") return highlight.rfis.has(id);
    if (type === "screen") return highlight.screens.has(id);
    return false;
  };

  // ── SVG path computation ───────────────────────────────────────────────
  const [paths, setPaths] = useState<{
    articleToRfi: { id: string; d: string; color: string; active: boolean }[];
    rfiToScreen: { id: string; d: string; color: string; active: boolean }[];
    articleToScreen: { id: string; d: string; color: string; active: boolean }[];
    width: number;
    height: number;
  }>({ articleToRfi: [], rfiToScreen: [], articleToScreen: [], width: 0, height: 0 });

  const recompute = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const stageRect = stage.getBoundingClientRect();
    const width = stageRect.width;
    const height = stageRect.height;

    const centerY = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.top - stageRect.top + r.height / 2;
    };
    const right = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.right - stageRect.left;
    };
    const left = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.left - stageRect.left;
    };

    const buildPath = (sx: number, sy: number, tx: number, ty: number) => {
      const dx = Math.max(60, (tx - sx) * 0.45);
      return `M${sx},${sy} C${sx + dx},${sy} ${tx - dx},${ty} ${tx},${ty}`;
    };

    const isActive = (set: Set<string>, ids: string[]) => {
      if (!hover.type) return false;
      return ids.every((i) => set.has(i));
    };

    const a2r: typeof paths.articleToRfi = [];
    for (const e of articleToRfi) {
      const a = articleRefs.current.get(e.articleId);
      const r = rfiRefs.current.get(e.rfiId);
      if (!a || !r) continue;
      const sx = right(a);
      const sy = centerY(a);
      const tx = left(r);
      const ty = centerY(r);
      const article = payload.articles.find((x) => x.id === e.articleId);
      const color = (article?.pillar && PILLAR_COLOR[article.pillar]) || "rgba(255,255,255,0.4)";
      const active = isActive(
        new Set<string>([...Array.from(highlight.articles), ...Array.from(highlight.rfis)]),
        [e.articleId, e.rfiId]
      );
      a2r.push({ id: `a2r-${e.articleId}-${e.rfiId}`, d: buildPath(sx, sy, tx, ty), color, active });
    }

    const r2s: typeof paths.rfiToScreen = [];
    for (const e of rfiToScreen) {
      const r = rfiRefs.current.get(e.rfiId);
      const s = screenRefs.current.get(e.screenId);
      if (!r || !s) continue;
      const sx = right(r);
      const sy = centerY(r);
      const tx = left(s);
      const ty = centerY(s);
      const rfi = payload.rfiSections.find((x) => x.id === e.rfiId);
      const color = rfi ? RFI_KIND_ACCENT[rfi.kind] : "rgba(255,255,255,0.4)";
      const active = isActive(
        new Set<string>([...Array.from(highlight.rfis), ...Array.from(highlight.screens)]),
        [e.rfiId, e.screenId]
      );
      r2s.push({ id: `r2s-${e.rfiId}-${e.screenId}`, d: buildPath(sx, sy, tx, ty), color, active });
    }

    const a2s: typeof paths.articleToScreen = [];
    for (const e of articleToScreen) {
      const a = articleRefs.current.get(e.articleId);
      const s = screenRefs.current.get(e.screenId);
      if (!a || !s) continue;
      const sx = right(a);
      const sy = centerY(a);
      const tx = left(s);
      const ty = centerY(s);
      const screen = payload.appScreens.find((x) => x.id === e.screenId);
      const color = (screen?.pillar && SCREEN_COLOR[screen.pillar]) || "rgba(255,255,255,0.4)";
      const active = isActive(
        new Set<string>([...Array.from(highlight.articles), ...Array.from(highlight.screens)]),
        [e.articleId, e.screenId]
      );
      a2s.push({ id: `a2s-${e.articleId}-${e.screenId}`, d: buildPath(sx, sy, tx, ty), color, active });
    }

    setPaths({ articleToRfi: a2r, rfiToScreen: r2s, articleToScreen: a2s, width, height });
  };

  useLayoutEffect(() => {
    recompute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload, hover]);

  useEffect(() => {
    const onResize = () => recompute();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload, hover]);

  const setRef = (
    map: React.MutableRefObject<Map<string, HTMLLIElement>>,
    key: string
  ) => (el: HTMLLIElement | null) => {
    if (el) map.current.set(key, el);
    else map.current.delete(key);
  };

  return (
    <div
      ref={stageRef}
      className="relative grid h-full w-full grid-cols-3 gap-2 overflow-hidden rounded-2xl border border-white/[0.04] bg-gradient-to-b from-white/[0.015] to-transparent p-2 md:gap-3 md:p-3"
      onMouseLeave={() => setHover({ type: null, id: null })}
    >
      {/* Edges only render on hover; idle board is intentionally clean so the
          dense item lists remain readable. */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox={`0 0 ${Math.max(1, paths.width)} ${Math.max(1, paths.height)}`}
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {hover.type && (
          <g>
            {paths.articleToScreen.filter((p) => p.active).map((p) => (
              <motion.path
                key={p.id}
                d={p.d}
                fill="none"
                stroke={p.color}
                strokeWidth={2}
                strokeOpacity={0.95}
                filter="url(#soft-glow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              />
            ))}
            {paths.articleToRfi.filter((p) => p.active).map((p) => (
              <motion.path
                key={p.id}
                d={p.d}
                fill="none"
                stroke={p.color}
                strokeWidth={2}
                strokeOpacity={0.95}
                filter="url(#soft-glow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            ))}
            {paths.rfiToScreen.filter((p) => p.active).map((p) => (
              <motion.path
                key={p.id}
                d={p.d}
                fill="none"
                stroke={p.color}
                strokeWidth={2}
                strokeOpacity={0.95}
                filter="url(#soft-glow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            ))}
          </g>
        )}
      </svg>

      <Column
        title="Statutory articles"
        subtitle={`${payload.articles.length} obligations`}
        Icon={ScrollText}
        accent="#00A86B"
      >
        <div className="flex flex-col gap-2 pr-1">
          {articleGroups.map((group) => (
            <section key={group.pillar} className="flex flex-col">
              <header
                className="sticky top-0 z-10 mb-1 flex items-center gap-1.5 rounded-md border border-white/[0.05] bg-black/55 px-1.5 py-1 backdrop-blur"
                style={{ borderLeft: `3px solid ${group.color}` }}
              >
                <span
                  className="text-[9px] font-semibold uppercase tracking-[0.18em]"
                  style={{ color: group.color }}
                >
                  {group.label}
                </span>
                <span className="ml-auto text-[9px] font-medium tabular-nums text-white/40">
                  {group.items.length}
                </span>
              </header>
              <ul className="flex flex-col gap-1">
                {group.items.map((a) => {
                  const dim = isDimmed("article", a.id);
                  const hi = isHighlighted("article", a.id);
                  const color = group.color;
                  return (
                    <li
                      key={a.id}
                      ref={setRef(articleRefs, a.id)}
                      onMouseEnter={() => setHover({ type: "article", id: a.id })}
                      onClick={() => setActive({ kind: "article", id: a.id })}
                      className={`group relative cursor-pointer rounded-md border border-white/[0.04] px-2 py-1 transition-colors duration-200 ${
                        hi ? "bg-white/[0.07]" : "bg-white/[0.018] hover:bg-white/[0.04]"
                      }`}
                      style={{
                        opacity: dim ? 0.2 : 1,
                        boxShadow: hi ? `inset 0 0 0 1px ${color}66, 0 0 18px ${color}22` : undefined,
                        borderLeft: `2px solid ${color}88`,
                      }}
                    >
                      <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-[0.14em] text-white/45">
                        <span className="truncate">
                          {(a.standard.code ?? a.standard.slug ?? "").toString().slice(0, 18)}
                        </span>
                        {a.code && <span className="shrink-0 text-white/65">· {a.code}</span>}
                      </div>
                      <div className="mt-0.5 line-clamp-2 text-[10.5px] leading-snug text-cream">
                        {a.title}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
          {payload.articles.length === 0 && (
            <div className="rounded-lg p-4 text-[12px] text-white/40">
              No statutory articles indexed yet.
            </div>
          )}
        </div>
      </Column>

      <Column
        title="Your RFI"
        subtitle={`${payload.rfiSections.length} sections`}
        Icon={Target}
        accent="#E7B02E"
      >
        <ul className="flex flex-col gap-1 pr-1">
          {payload.rfiSections.map((r) => {
            const dim = isDimmed("rfi", r.id);
            const hi = isHighlighted("rfi", r.id);
            const color = RFI_KIND_ACCENT[r.kind];
            return (
              <li
                key={r.id}
                ref={setRef(rfiRefs, r.id)}
                onMouseEnter={() => setHover({ type: "rfi", id: r.id })}
                onClick={() => setActive({ kind: "rfi", id: r.id })}
                className={`group relative cursor-pointer rounded-md border border-white/[0.04] px-2 py-1 transition-colors duration-200 ${
                  hi ? "bg-white/[0.07]" : "bg-white/[0.018] hover:bg-white/[0.04]"
                }`}
                style={{
                  opacity: dim ? 0.2 : 1,
                  boxShadow: hi ? `inset 0 0 0 1px ${color}66, 0 0 18px ${color}22` : undefined,
                  borderLeft: `2px solid ${color}88`,
                }}
              >
                <div className="flex items-center gap-1.5 text-[8.5px] uppercase tracking-[0.14em] text-white/45">
                  <span className="truncate">{r.sectionRef}</span>
                  <span className="shrink-0" style={{ color }}>· {RFI_KIND_LABELS[r.kind]}</span>
                </div>
                <div className="mt-0.5 line-clamp-2 text-[10.5px] leading-snug text-cream">{r.title}</div>
              </li>
            );
          })}
        </ul>
      </Column>

      <Column
        title="ADL GPSSA Intelligence"
        subtitle={`${payload.appScreens.length} touchpoints`}
        Icon={LayersIcon}
        accent="#4899FF"
      >
        <ul className="flex flex-col gap-1 pr-1">
          {payload.appScreens.map((s) => {
            const dim = isDimmed("screen", s.id);
            const hi = isHighlighted("screen", s.id);
            const color = SCREEN_COLOR[s.pillar] ?? "#FFFFFF";
            return (
              <li
                key={s.id}
                ref={setRef(screenRefs, s.id)}
                onMouseEnter={() => setHover({ type: "screen", id: s.id })}
                onClick={() => setActive({ kind: "screen", id: s.id })}
                className={`group relative cursor-pointer rounded-md border border-white/[0.04] px-2 py-1 transition-colors duration-200 ${
                  hi ? "bg-white/[0.07]" : "bg-white/[0.018] hover:bg-white/[0.04]"
                }`}
                style={{
                  opacity: dim ? 0.2 : 1,
                  boxShadow: hi ? `inset 0 0 0 1px ${color}66, 0 0 18px ${color}22` : undefined,
                  borderLeft: `2px solid ${color}88`,
                }}
              >
                <div className="flex items-center justify-between text-[8.5px] uppercase tracking-[0.14em] text-white/45">
                  <span>{s.pillar}</span>
                  <a
                    href={s.href}
                    onClick={(e) => e.stopPropagation()}
                    className="text-white/40 transition-colors hover:text-white"
                  >
                    <ArrowRight size={11} />
                  </a>
                </div>
                <div className="mt-0.5 line-clamp-2 text-[10.5px] leading-snug text-cream">{s.label}</div>
              </li>
            );
          })}
        </ul>
      </Column>

      <AnimatePresence>
        {!hover.type && (
          <motion.div
            key="hint"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="pointer-events-none absolute inset-x-0 bottom-2 z-10 mx-auto w-fit rounded-full border border-white/[0.06] bg-black/40 px-3 py-1 text-[9px] uppercase tracking-[0.22em] text-white/45 backdrop-blur"
          >
            Hover any node — the connections light up · Click any tile for detail
          </motion.div>
        )}
      </AnimatePresence>

      <DetailModal
        active={active}
        onClose={() => setActive(null)}
        onJump={(next) => setActive(next)}
        articleById={articleById}
        rfiById={rfiById}
        screenById={screenById}
        articles={payload.articles}
      />
    </div>
  );
}

function DetailModal({
  active,
  onClose,
  onJump,
  articleById,
  rfiById,
  screenById,
  articles,
}: {
  active: ActiveSelection;
  onClose: () => void;
  onJump: (next: ActiveSelection) => void;
  articleById: Map<string, ArticleNode>;
  rfiById: Map<string, RfiNode>;
  screenById: Map<string, ScreenNode>;
  articles: ArticleNode[];
}) {
  if (!active) {
    return <Modal isOpen={false} onClose={onClose}>{null}</Modal>;
  }

  if (active.kind === "article") {
    const a = articleById.get(active.id);
    if (!a) return <Modal isOpen={false} onClose={onClose}>{null}</Modal>;
    const color = (a.pillar && PILLAR_COLOR[a.pillar]) || "rgba(255,255,255,0.55)";
    const linkedScreens = a.screenLinks
      .map((l) => screenById.get(l.screenId))
      .filter((s): s is ScreenNode => Boolean(s));
    const linkedRfis = a.rfiSectionIds
      .map((id) => rfiById.get(id))
      .filter((r): r is RfiNode => Boolean(r));
    return (
      <Modal isOpen onClose={onClose} size="xl" title={a.title}>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-white/70">
              {a.standard.code ?? a.standard.slug}
            </span>
            <span className="text-[11px] text-white/55">{a.standard.title}</span>
            {a.code && (
              <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-white/65">
                {a.code}
              </span>
            )}
            {a.pillar && (
              <span
                className="ml-auto rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
                style={{ background: `${color}26`, color }}
              >
                {PILLAR_LABELS[a.pillar] ?? a.pillar}
              </span>
            )}
          </div>

          {a.description ? (
            <p className="whitespace-pre-line text-[13px] leading-relaxed text-cream/90">
              {a.description}
            </p>
          ) : (
            <p className="text-[12px] italic text-white/45">
              No additional legal text recorded for this article in the corpus.
            </p>
          )}

          {linkedRfis.length > 0 && (
            <div>
              <h4 className="mb-1.5 text-[10px] uppercase tracking-[0.22em] text-white/50">
                Maps to RFI sections
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {linkedRfis.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => onJump({ kind: "rfi", id: r.id })}
                    className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-left text-[11px] text-cream transition hover:border-white/20 hover:bg-white/[0.08]"
                    style={{ borderLeft: `2px solid ${RFI_KIND_ACCENT[r.kind]}` }}
                  >
                    <span className="text-white/55">{r.sectionRef}</span> · {r.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {linkedScreens.length > 0 && (
            <div>
              <h4 className="mb-1.5 text-[10px] uppercase tracking-[0.22em] text-white/50">
                Addressed by Intelligence
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {linkedScreens.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onJump({ kind: "screen", id: s.id })}
                    className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-left text-[11px] text-cream transition hover:border-white/20 hover:bg-white/[0.08]"
                    style={{ borderLeft: `2px solid ${SCREEN_COLOR[s.pillar] ?? "#FFFFFF"}` }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    );
  }

  if (active.kind === "rfi") {
    const r = rfiById.get(active.id);
    if (!r) return <Modal isOpen={false} onClose={onClose}>{null}</Modal>;
    const color = RFI_KIND_ACCENT[r.kind];
    const backArticles = articles.filter((a) => a.rfiSectionIds.includes(r.id));
    return (
      <Modal isOpen onClose={onClose} size="xl" title={r.title}>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-white/70">
              {r.sectionRef}
            </span>
            <span
              className="rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
              style={{ background: `${color}26`, color }}
            >
              {RFI_KIND_LABELS[r.kind]}
            </span>
          </div>

          <p className="whitespace-pre-line text-[13px] leading-relaxed text-cream/90">
            {r.body}
          </p>

          {r.relatedScreens.length > 0 && (
            <div>
              <h4 className="mb-1.5 text-[10px] uppercase tracking-[0.22em] text-white/50">
                Related Intelligence screens
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {r.relatedScreens.map((path) => (
                  <a
                    key={path}
                    href={path}
                    className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-cream transition hover:border-white/20 hover:bg-white/[0.08]"
                  >
                    {path}
                    <ExternalLink size={11} className="text-white/45" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {backArticles.length > 0 && (
            <div>
              <h4 className="mb-1.5 text-[10px] uppercase tracking-[0.22em] text-white/50">
                Anchored in {backArticles.length} statutory{" "}
                {backArticles.length === 1 ? "article" : "articles"}
              </h4>
              <div className="flex max-h-48 flex-wrap gap-1.5 overflow-y-auto pr-1">
                {backArticles.slice(0, 30).map((a) => {
                  const c = (a.pillar && PILLAR_COLOR[a.pillar]) || "rgba(255,255,255,0.55)";
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => onJump({ kind: "article", id: a.id })}
                      className="max-w-full rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-left text-[11px] text-cream transition hover:border-white/20 hover:bg-white/[0.08]"
                      style={{ borderLeft: `2px solid ${c}` }}
                    >
                      <span className="text-white/55">
                        {a.standard.code ?? a.standard.slug}
                        {a.code ? ` · ${a.code}` : ""}
                      </span>
                      <span className="ml-1 line-clamp-1">{a.title}</span>
                    </button>
                  );
                })}
                {backArticles.length > 30 && (
                  <span className="self-center text-[11px] text-white/40">
                    +{backArticles.length - 30} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>
    );
  }

  // screen
  const s = screenById.get(active.id);
  if (!s) return <Modal isOpen={false} onClose={onClose}>{null}</Modal>;
  const color = SCREEN_COLOR[s.pillar] ?? "#FFFFFF";
  const description =
    SCREEN_DESCRIPTIONS[s.id] ?? "Intelligence touchpoint linked to the GPSSA mandate.";
  return (
    <Modal isOpen onClose={onClose} size="lg" title={s.label}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
            style={{ background: `${color}26`, color }}
          >
            {s.pillar}
          </span>
          <span className="text-[11px] text-white/45">{s.href}</span>
        </div>

        <p className="text-[13px] leading-relaxed text-cream/90">{description}</p>

        <a
          href={s.href}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium text-cream transition hover:border-white/25 hover:bg-white/[0.09]"
          style={{ boxShadow: `inset 0 0 0 1px ${color}33` }}
        >
          Open this screen
          <ExternalLink size={12} />
        </a>
      </div>
    </Modal>
  );
}

function Column({
  title,
  subtitle,
  Icon,
  accent,
  children,
}: {
  title: string;
  subtitle: string;
  Icon: typeof ScrollText;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-1.5 overflow-hidden">
      <div className="flex shrink-0 items-center gap-2 px-1">
        <div
          className="flex h-6 w-6 items-center justify-center rounded-md"
          style={{
            background: `linear-gradient(135deg, ${accent}25, ${accent}05)`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 0 12px ${accent}22`,
          }}
        >
          <Icon size={12} style={{ color: accent }} strokeWidth={1.7} />
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-playfair text-sm font-semibold leading-tight text-cream">
            {title}
          </h3>
          <div className="text-[9px] uppercase tracking-[0.22em] text-white/40">{subtitle}</div>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-none">{children}</div>
    </div>
  );
}
