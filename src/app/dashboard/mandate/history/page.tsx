"use client";

/**
 * Mandate — History (cinematic story mode).
 *
 * Auto-playing full-viewport scenes — one per milestone — with prev /
 * play-pause / next controls, a year scrubber strip, keyboard shortcuts
 * and AnimatePresence cross-fades. No document scroll: the story plays
 * itself like a movie.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  History as HistoryIcon,
  Loader2,
  Pause,
  Play,
  Sparkles,
} from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;
const SLIDE_MS = 7000;

type MilestoneKind = "milestone" | "reform" | "agreement" | "award" | "press";

interface Milestone {
  id: string;
  year: number;
  date: string | null;
  title: string;
  description: string;
  kind: string;
  sourceUrl: string | null;
  imageUrl?: string | null;
}

const KIND_THEME: Record<MilestoneKind, { primary: string; secondary: string; label: string }> = {
  milestone: { primary: "#1B7A4A", secondary: "#7DB9A4", label: "Milestone" },
  reform: { primary: "#4899FF", secondary: "#9CC1FF", label: "Reform" },
  agreement: { primary: "#CA63D5", secondary: "#E1A6E8", label: "Agreement" },
  award: { primary: "#E7B02E", secondary: "#F1CB73", label: "Recognition" },
  press: { primary: "#7DB9A4", secondary: "#B8DACE", label: "Announcement" },
};

function themeFor(kind: string) {
  return KIND_THEME[(kind as MilestoneKind) in KIND_THEME ? (kind as MilestoneKind) : "milestone"];
}

/**
 * Curated narrative dataset — used when the live DB has fewer than 8 entries
 * so the story mode always feels rich. The agent can grow milestones over
 * time and they'll progressively replace this baseline.
 */
const HISTORY_FALLBACK: Milestone[] = [
  {
    id: "fl-7-1999",
    year: 1999,
    date: "1999-04-04",
    title: "Federal Law No. 7 of 1999 on Pensions and Social Security",
    description:
      "The federal pension and social security law is enacted, defining contributions, benefits, and the obligations of employers and insured persons across the United Arab Emirates. It lays the legal cornerstone on which a national pension authority will be built.",
    kind: "milestone",
    sourceUrl: "https://gpssa.gov.ae/pages/en/laws-and-regulations",
  },
  {
    id: "gpssa-est-2000",
    year: 2000,
    date: null,
    title: "GPSSA established as the federal pension authority",
    description:
      "The General Pension and Social Security Authority opens its doors as the federal authority responsible for administering pensions and social security across the UAE — a single national institution to safeguard the future of every insured person.",
    kind: "milestone",
    sourceUrl: "https://gpssa.gov.ae/pages/en/about-us",
  },
  {
    id: "first-regs",
    year: 2001,
    date: null,
    title: "First executive regulations issued",
    description:
      "Implementing regulations operationalise the federal law: contribution rates, salary definitions, employer registration mechanics, and the first plain-English procedures for insured citizens.",
    kind: "reform",
    sourceUrl: "https://gpssa.gov.ae/pages/en/laws-and-regulations",
  },
  {
    id: "branches-network",
    year: 2003,
    date: null,
    title: "Branch network across the Emirates",
    description:
      "GPSSA opens service branches in multiple emirates, bringing pension administration physically closer to citizens and employers. The federal mandate becomes a tangible presence on the ground.",
    kind: "milestone",
    sourceUrl: null,
  },
  {
    id: "gcc-extension-2007",
    year: 2007,
    date: null,
    title: "GCC Unified Insurance Extension System",
    description:
      "GPSSA implements the GCC Unified Insurance Extension Law: GCC nationals working anywhere in the Gulf retain continuity of social insurance coverage. A regional milestone in cross-border worker protection.",
    kind: "agreement",
    sourceUrl: "https://gpssa.gov.ae/pages/en/laws-and-regulations",
  },
  {
    id: "first-circulars",
    year: 2010,
    date: null,
    title: "First wave of operational circulars",
    description:
      "GPSSA begins issuing public circulars that translate statute into clear procedural guidance for employers and insured persons — the start of a transparent, citation-grade governance trail.",
    kind: "reform",
    sourceUrl: "https://gpssa.gov.ae/pages/en/laws-and-regulations",
  },
  {
    id: "estimas-2014",
    year: 2014,
    date: null,
    title: "Digital service portal — first generation",
    description:
      "GPSSA launches its first generation of online services: employer registration, contribution submission and pension status enquiries move from counter to web. A mandate that adapts to its citizens.",
    kind: "milestone",
    sourceUrl: null,
  },
  {
    id: "investments-modernised",
    year: 2016,
    date: null,
    title: "Modernised investment policy",
    description:
      "The Board of Directors approves a modernised investment policy framework, diversifying the pension fund's asset allocation while reinforcing prudential and ESG-aware governance.",
    kind: "reform",
    sourceUrl: null,
  },
  {
    id: "ma-app-2018",
    year: 2018,
    date: null,
    title: "Smart-services mobile app",
    description:
      "A native mobile experience puts core GPSSA services in every insured person's pocket — pension calculator, service of accounts, contribution history, and digital documentation.",
    kind: "milestone",
    sourceUrl: null,
  },
  {
    id: "wam-recognition-2019",
    year: 2019,
    date: null,
    title: "Public recognition for digital excellence",
    description:
      "GPSSA's digital transformation is recognised across UAE government performance indices, anchoring the authority among the federal entities leading the digital-services agenda.",
    kind: "award",
    sourceUrl: null,
  },
  {
    id: "covid-continuity",
    year: 2020,
    date: null,
    title: "Service continuity during COVID-19",
    description:
      "GPSSA maintains uninterrupted pension payments and digital services through the pandemic, issuing rapid-response circulars to support employers and insured persons facing extraordinary disruption.",
    kind: "milestone",
    sourceUrl: null,
  },
  {
    id: "ai-roadmap-2021",
    year: 2021,
    date: null,
    title: "AI & analytics roadmap",
    description:
      "GPSSA publishes an internal AI and analytics roadmap to power decision support, fraud detection and proactive pension advisory — an early signal of the data-driven mandate to come.",
    kind: "press",
    sourceUrl: null,
  },
  {
    id: "uae50-2022",
    year: 2022,
    date: null,
    title: "UAE Golden Jubilee — pension legacy report",
    description:
      "Marking the UAE's 50-year anniversary, GPSSA publishes a legacy report celebrating two decades of national pension administration and the lives protected by the federal mandate.",
    kind: "press",
    sourceUrl: null,
  },
  {
    id: "fl-57-2023",
    year: 2023,
    date: "2023-10-31",
    title: "Federal Law No. 57 of 2023 — modernised primary law",
    description:
      "A modernised pension and social security law tightens coverage rules, refines contribution and benefit formulas, and explicitly anchors digital service delivery as a core pillar of the GPSSA mandate.",
    kind: "reform",
    sourceUrl: "https://gpssa.gov.ae/pages/en/laws-and-regulations",
  },
  {
    id: "fl-57-regs-2024",
    year: 2024,
    date: null,
    title: "Executive regulations of Federal Law No. 57",
    description:
      "Implementing regulations bring FL 57/2023 to life: detailed contribution mechanics, refined survivor and disability rules, and operational standards for the modernised mandate.",
    kind: "reform",
    sourceUrl: "https://gpssa.gov.ae/pages/en/laws-and-regulations",
  },
  {
    id: "data-strategy-2025",
    year: 2025,
    date: null,
    title: "Data strategy and ecosystem partnerships",
    description:
      "GPSSA accelerates ecosystem partnerships — banks, employers, regulators — and rolls out a data strategy that powers proactive notifications, pension projections and policy intelligence.",
    kind: "press",
    sourceUrl: null,
  },
  {
    id: "rfi-2026",
    year: 2026,
    date: null,
    title: "RFI 02-2026 — Product & Service Development Roadmap",
    description:
      "GPSSA invites global partners to inform its product, service and customer-experience roadmap — the most ambitious modernisation programme in the authority's history. The mandate steps boldly into the future.",
    kind: "press",
    sourceUrl: null,
  },
  {
    id: "vision-2030",
    year: 2030,
    date: null,
    title: "Horizon — vision 2030",
    description:
      "A horizon scene: GPSSA aspires to a fully proactive, data-driven, ecosystem-integrated pension experience — every insured person accompanied across their lifetime by a mandate that anticipates, advises and protects.",
    kind: "milestone",
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

  // Prefer DB if it has at least 8 milestones, else use the curated narrative
  const data = useMemo(() => {
    const sortedDb = [...milestones].sort((a, b) => a.year - b.year);
    const sortedFallback = [...HISTORY_FALLBACK].sort((a, b) => a.year - b.year);
    if (sortedDb.length >= 8) return sortedDb;
    return sortedFallback;
  }, [milestones]);

  return (
    <div className="relative h-full overflow-hidden">
      {loading && data.length === 0 ? (
        <div className="flex h-full items-center justify-center text-white/45">
          <Loader2 size={16} className="mr-2 animate-spin" /> Loading the story…
        </div>
      ) : (
        <StoryMode milestones={data} usingFallback={milestones.length < 8} />
      )}
    </div>
  );
}

function StoryMode({ milestones, usingFallback }: { milestones: Milestone[]; usingFallback: boolean }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = milestones[index] ?? milestones[0];
  const theme = themeFor(current?.kind ?? "milestone");

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % milestones.length);
  }, [milestones.length]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + milestones.length) % milestones.length);
  }, [milestones.length]);

  const togglePlaying = useCallback(() => {
    setPlaying((p) => !p);
  }, []);

  // Autoplay timer (paused while hovered)
  useEffect(() => {
    if (!playing || hovered) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(next, SLIDE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playing, hovered, index, next]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        togglePlaying();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, togglePlaying]);

  if (!current) {
    return (
      <div className="flex h-full items-center justify-center text-white/45">No milestones.</div>
    );
  }

  return (
    <div
      className="relative h-full overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Era backdrop — gradient + ambient orbs tinted by kind */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 transition-colors duration-700"
        style={{
          background: `radial-gradient(circle at 18% 22%, ${theme.primary}1f 0%, transparent 55%), radial-gradient(circle at 82% 78%, ${theme.secondary}18 0%, transparent 60%)`,
        }}
      />

      {/* Top eyebrow */}
      <div className="absolute left-4 right-4 top-3 z-20 flex items-center justify-between gap-3 md:left-6 md:right-6 md:top-4">
        <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-[#1B7A4A]">
          <HistoryIcon size={11} /> Mandate · History
        </div>
        {usingFallback && (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-0.5 text-[10px] text-white/55">
            <Sparkles size={10} className="text-[#1B7A4A]" /> Curated narrative
          </div>
        )}
      </div>

      {/* Scene */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="relative grid h-full grid-cols-1 items-center gap-6 px-6 pb-24 pt-14 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:px-12 md:pb-28"
        >
          {/* Year (parallax drift) */}
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            transition={{ duration: 0.85, ease: EASE }}
            className="relative flex flex-col items-start justify-center"
          >
            <motion.span
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
              className="font-playfair font-bold leading-[0.9] text-cream"
              style={{
                fontSize: "clamp(96px, 14vw, 220px)",
                letterSpacing: "-0.02em",
                textShadow: `0 0 60px ${theme.primary}55`,
              }}
            >
              {current.year}
            </motion.span>
            <span
              className="mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.24em]"
              style={{
                borderColor: `${theme.primary}55`,
                background: `${theme.primary}14`,
                color: theme.secondary,
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: theme.primary }} />
              {theme.label}
            </span>
          </motion.div>

          {/* Story copy */}
          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.85, ease: EASE, delay: 0.05 }}
            className="relative max-w-2xl"
          >
            <h2 className="font-playfair text-2xl font-bold leading-tight text-cream md:text-3xl xl:text-4xl">
              {current.title}
            </h2>
            <p className="mt-4 text-[14px] leading-relaxed text-white/70 md:text-[15px]">
              {current.description}
            </p>
            {current.sourceUrl && (
              <a
                href={current.sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-5 inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-[11px] text-white/70 transition-colors hover:border-white/[0.18] hover:text-cream"
              >
                Source <ExternalLink size={11} />
              </a>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Floating control bar (bottom-center) */}
      <div className="absolute bottom-3 left-1/2 z-30 w-[min(960px,calc(100%-2rem))] -translate-x-1/2 md:bottom-5">
        <div className="glass-panel rounded-xl border border-white/[0.06] p-2.5 md:p-3" style={{ boxShadow: "0 24px 48px rgba(0,0,0,0.4)" }}>
          {/* Scrubber strip */}
          <div className="relative mb-2 h-7">
            <div className="absolute inset-x-2 top-1/2 h-px -translate-y-1/2 bg-white/10" />
            <motion.div
              className="absolute top-1/2 h-px -translate-y-1/2"
              style={{ left: "0.5rem", background: `linear-gradient(90deg, ${theme.primary}, transparent)` }}
              animate={{ width: `calc((100% - 1rem) * ${milestones.length === 1 ? 1 : index / (milestones.length - 1)})` }}
              transition={{ duration: 0.6, ease: EASE }}
            />
            <div className="relative flex h-full items-center justify-between px-2">
              {milestones.map((m, i) => {
                const active = i === index;
                const t = themeFor(m.kind);
                return (
                  <button
                    key={m.id}
                    onClick={() => setIndex(i)}
                    className="group relative flex h-full flex-col items-center justify-center"
                    aria-label={`Jump to ${m.year} — ${m.title}`}
                  >
                    <span
                      className="block rounded-full transition-all"
                      style={{
                        width: active ? 10 : 6,
                        height: active ? 10 : 6,
                        background: active ? t.primary : "rgba(255,255,255,0.35)",
                        boxShadow: active ? `0 0 10px ${t.primary}` : undefined,
                      }}
                    />
                    <span
                      className={`pointer-events-none absolute -top-4 text-[9px] tabular-nums tracking-wider transition-opacity ${
                        active ? "text-cream opacity-100" : "text-white/35 opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      {m.year}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1">
              <ControlButton onClick={prev} label="Previous">
                <ChevronLeft size={16} />
              </ControlButton>
              <ControlButton onClick={togglePlaying} label={playing ? "Pause" : "Play"} accent={theme.primary}>
                {playing ? <Pause size={15} /> : <Play size={15} />}
              </ControlButton>
              <ControlButton onClick={next} label="Next">
                <ChevronRight size={16} />
              </ControlButton>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-white/45">
              <span className="tabular-nums">
                {index + 1} / {milestones.length}
              </span>
              <span className="hidden md:inline">← / → · space</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ControlButton({
  children,
  onClick,
  label,
  accent,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  accent?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-white/75 transition-colors hover:border-white/[0.18] hover:text-cream"
      style={accent ? { boxShadow: `inset 0 0 0 1px ${accent}30, 0 0 14px ${accent}25` } : undefined}
    >
      {children}
    </button>
  );
}
