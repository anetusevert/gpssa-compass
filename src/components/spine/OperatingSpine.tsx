"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, GitBranch, Loader2, Sparkles, Star } from "lucide-react";
import { useEngagementStore } from "@/lib/engagement/store";
import { emphasizedNodes, PHASE_SPINE_ACCENT } from "@/lib/spine/conductor";
import type { SpineDraft } from "@/lib/spine/generate";
import type { LifecycleCategory } from "@/lib/spine/library";
import type { SpineGraphPayload, SpineNodeId, SpineServiceListItem } from "@/lib/spine/types";
import { TileScroll } from "@/components/ui/PageFrame";

const SpineOrbCanvas = dynamic(() => import("@/components/home/SpineOrbCanvas"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gradient-to-b from-[var(--gpssa-green)]/10 to-transparent" />,
});

const EASE = [0.16, 1, 0.3, 1] as const;
const NODE_ORDER: SpineNodeId[] = ["episode", "journey", "process", "systems", "qa"];
const SHORT: Record<SpineNodeId, string> = {
  episode: "Episode",
  journey: "Journey",
  process: "Process",
  systems: "Systems",
  qa: "QA",
};

type LibraryPayload = {
  categories: { id: LifecycleCategory; label: string; blurb: string }[];
  episodes: {
    id: string;
    category: LifecycleCategory;
    name: string;
    description: string;
    suggestedPersonaKeys: string[];
  }[];
};

type Workspace = {
  episodes: { id: string; name: string; description: string | null; isActive: boolean; personaKey: string | null }[];
  personaKey: string | null;
  persona: { id: string; name: string; tagline: string } | null;
  personas: { id: string; name: string; tagline: string }[];
  journeyCandidates: {
    id: string;
    source: string;
    label: string;
    stages: { name: string; actor: string; outcome?: string | null }[];
  }[];
  painPoints: string[];
  systems: { id: string; code: string; name: string; kind: string }[];
};

export function OperatingSpine({
  className = "",
  initialServiceId,
  lockService = false,
  variant = "hero",
}: {
  className?: string;
  initialServiceId?: string;
  lockService?: boolean;
  variant?: "hero" | "embedded";
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const engagementOpen = useEngagementStore((s) => s.engagementOpen);
  const phaseId = useEngagementStore((s) => s.phaseId);
  const emphasis = useMemo(
    () => emphasizedNodes(phaseId, engagementOpen),
    [phaseId, engagementOpen]
  );
  const accent = engagementOpen ? PHASE_SPINE_ACCENT[phaseId] : null;

  const [services, setServices] = useState<SpineServiceListItem[]>([]);
  const [serviceId, setServiceId] = useState(initialServiceId ?? "");
  const [graph, setGraph] = useState<SpineGraphPayload | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [library, setLibrary] = useState<LibraryPayload | null>(null);
  const [selected, setSelected] = useState<SpineNodeId>("episode");
  const [hovered, setHovered] = useState<SpineNodeId | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<SpineDraft | null>(null);
  const [draftSource, setDraftSource] = useState<string | null>(null);
  const [category, setCategory] = useState<LifecycleCategory | "all">("end-of-service");
  const [personaPick, setPersonaPick] = useState("");

  const refresh = useCallback(async (id: string) => {
    const [g, w] = await Promise.all([
      fetch(`/api/spine/${id}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/spine/${id}/workspace`).then((r) => (r.ok ? r.json() : null)),
    ]);
    setGraph(g);
    setWorkspace(w);
    if (w?.personaKey) setPersonaPick(w.personaKey);
  }, []);

  useEffect(() => {
    if (initialServiceId) setServiceId(initialServiceId);
  }, [initialServiceId]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/spine/services").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/spine/library/episodes").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([rows, lib]) => {
        if (cancelled) return;
        const list = Array.isArray(rows) ? rows : [];
        setServices(list);
        setLibrary(lib);
        if (initialServiceId && list.some((s: SpineServiceListItem) => s.id === initialServiceId)) {
          setServiceId(initialServiceId);
        } else if (!lockService) {
          const gold = list.find((s: SpineServiceListItem) => s.isGoldPath) ?? list[0];
          if (gold) setServiceId(gold.id);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initialServiceId, lockService]);

  useEffect(() => {
    if (!serviceId) return;
    let cancelled = false;
    refresh(serviceId).then(() => {
      if (!cancelled) setSelected("episode");
    });
    return () => {
      cancelled = true;
    };
  }, [serviceId, refresh]);

  async function workspaceAction(action: string, payload: Record<string, unknown> = {}) {
    if (!serviceId) return;
    setBusy(true);
    try {
      await fetch(`/api/spine/${serviceId}/workspace`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });
      await refresh(serviceId);
    } finally {
      setBusy(false);
    }
  }

  async function runGenerate() {
    if (!serviceId) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/spine/${serviceId}/generate`, { method: "POST" });
      const data = await r.json();
      if (r.ok) {
        setDraft(data.draft);
        setDraftSource(data.source);
        setSelected("process");
      }
    } finally {
      setBusy(false);
    }
  }

  async function runApply() {
    if (!serviceId || !draft) return;
    setBusy(true);
    try {
      await fetch(`/api/spine/${serviceId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft }),
      });
      await refresh(serviceId);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className={`flex min-h-0 flex-1 items-center justify-center text-[12px] text-white/40 ${className}`}>
        Loading operating spine…
      </div>
    );
  }

  if (!graph || !services.length) {
    return (
      <div className={`rounded-2xl border border-dashed border-white/10 p-6 text-center text-[12px] text-white/40 ${className}`}>
        No spine data. Redeploy seed for End of Service – Civil.
      </div>
    );
  }

  const libEps =
    library?.episodes.filter((e) => category === "all" || e.category === category) ?? [];

  return (
    <section
      className={`relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent ${className}`}
      data-tour="compass-operating-spine"
    >
      {/* Header */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-white/[0.05] px-3 py-2 sm:px-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--gpssa-green)]">
            <GitBranch size={11} />
            Service operating spine
            {graph.isGoldPath && (
              <span className="inline-flex items-center gap-0.5 rounded bg-amber-500/15 px-1.5 py-0.5 text-[8px] text-amber-200">
                <Star size={8} /> Gold
              </span>
            )}
          </div>
          <p className="truncate text-[11px] text-white/40">{graph.service.name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!lockService && (
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="max-w-[200px] truncate rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-[11px] text-cream"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.isGoldPath ? "★ " : ""}
                  {s.name}
                </option>
              ))}
            </select>
          )}
          <Link
            href={`/dashboard/services/operating/${serviceId}`}
            className="inline-flex items-center gap-1 rounded-lg bg-[var(--gpssa-green)] px-2.5 py-1.5 text-[11px] font-semibold text-[#071322]"
          >
            Blueprint <ArrowRight size={11} />
          </Link>
        </div>
      </div>

      {/* 3D stage + hit targets */}
      <div className="relative shrink-0" style={{ height: variant === "hero" ? 132 : 100 }}>
        <div className="absolute inset-0">
          <SpineOrbCanvas
            selected={selected}
            hovered={hovered}
            emphasized={emphasis}
            conducting={engagementOpen}
            accent={accent}
          />
        </div>
        <div className="absolute inset-x-2 bottom-1 top-0 flex items-end justify-between gap-1 sm:inset-x-6">
          {NODE_ORDER.map((id) => {
            const node = graph.nodes.find((n) => n.id === id)!;
            const emp = emphasis.has(id);
            const dim = engagementOpen && emphasis.size > 0 && !emp && selected !== id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelected(id)}
                onMouseEnter={() => setHovered(id)}
                onMouseLeave={() => setHovered(null)}
                className="flex min-h-[44px] w-[18%] flex-col items-center justify-end pb-0.5"
                style={{ opacity: dim ? 0.45 : 1 }}
              >
                <motion.span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                    selected === id ? "bg-black/50 text-cream" : "text-white/55"
                  }`}
                  animate={!reduceMotion && selected === id ? { y: [0, -2, 0] } : {}}
                  transition={{ duration: 1.2, ease: EASE }}
                >
                  {SHORT[id]}
                </motion.span>
                <span className="max-w-full truncate text-[9px] text-white/30">
                  {node.lit ? node.summary : "Empty"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Inspector */}
      <div className="min-h-0 flex-1 border-t border-white/[0.05] px-3 py-2 sm:px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="flex h-full min-h-0 flex-col"
          >
            {selected === "episode" && (
              <EpisodeInspector
                library={library}
                libEps={libEps}
                category={category}
                setCategory={setCategory}
                workspace={workspace}
                personaPick={personaPick}
                setPersonaPick={setPersonaPick}
                busy={busy}
                onActivateLibrary={(libraryId) =>
                  workspaceAction("activate-library", {
                    libraryId,
                    personaKey: personaPick || undefined,
                  })
                }
                onActivateEpisode={(episodeId) =>
                  workspaceAction("activate-episode", {
                    episodeId,
                    personaKey: personaPick || undefined,
                  })
                }
                onSetPersona={(key) => {
                  setPersonaPick(key);
                  workspaceAction("set-persona", { personaKey: key });
                }}
              />
            )}
            {selected === "journey" && (
              <JourneyInspector
                graph={graph}
                workspace={workspace}
                busy={busy}
                onApply={(stages, source) =>
                  workspaceAction("apply-journey", { stages, source })
                }
              />
            )}
            {selected === "process" && (
              <ProcessInspector
                graph={graph}
                draft={draft}
                draftSource={draftSource}
                busy={busy}
                onGenerate={runGenerate}
                onApply={runApply}
                setDraft={setDraft}
              />
            )}
            {selected === "systems" && (
              <SystemsInspector graph={graph} workspace={workspace} onNavigate={(h) => router.push(h)} />
            )}
            {selected === "qa" && (
              <QaInspector graph={graph} draft={draft} onNavigate={(h) => router.push(h)} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function EpisodeInspector({
  library,
  libEps,
  category,
  setCategory,
  workspace,
  personaPick,
  setPersonaPick,
  busy,
  onActivateLibrary,
  onActivateEpisode,
  onSetPersona,
}: {
  library: LibraryPayload | null;
  libEps: LibraryPayload["episodes"];
  category: LifecycleCategory | "all";
  setCategory: (c: LifecycleCategory | "all") => void;
  workspace: Workspace | null;
  personaPick: string;
  setPersonaPick: (k: string) => void;
  busy: boolean;
  onActivateLibrary: (id: string) => void;
  onActivateEpisode: (id: string) => void;
  onSetPersona: (key: string) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-[13px] font-semibold text-cream">Episode × persona</h3>
          <p className="text-[11px] text-white/40">Lifecycle library or an existing episode on this service</p>
        </div>
        {busy && <Loader2 size={14} className="animate-spin text-white/40" />}
      </div>

      <div className="flex shrink-0 flex-wrap gap-1">
        <Chip active={category === "all"} onClick={() => setCategory("all")}>
          All
        </Chip>
        {library?.categories.map((c) => (
          <Chip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
            {c.label}
          </Chip>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 gap-2 sm:grid-cols-[1.2fr_0.8fr]">
        <TileScroll className="rounded-lg border border-white/[0.05] bg-black/20 p-2">
          <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
            Library
          </p>
          <ul className="space-y-1.5">
            {libEps.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onActivateLibrary(e.id)}
                  className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-2 text-left transition hover:border-[var(--gpssa-green)]/35"
                >
                  <p className="text-[12px] font-medium text-cream">{e.name}</p>
                  <p className="line-clamp-2 text-[10px] text-white/40">{e.description}</p>
                </button>
              </li>
            ))}
          </ul>
        </TileScroll>

        <div className="flex min-h-0 flex-col gap-2">
          <TileScroll className="rounded-lg border border-white/[0.05] bg-black/20 p-2">
            <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
              On this service
            </p>
            <ul className="space-y-1">
              {(workspace?.episodes ?? []).map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onActivateEpisode(e.id)}
                    className={`w-full rounded-lg px-2 py-1.5 text-left text-[11px] ${
                      e.isActive
                        ? "bg-[var(--gpssa-green)]/15 text-cream"
                        : "text-white/55 hover:bg-white/[0.04]"
                    }`}
                  >
                    {e.isActive ? "● " : ""}
                    {e.name}
                  </button>
                </li>
              ))}
              {!workspace?.episodes?.length && (
                <p className="text-[11px] text-white/35">None yet — pick from library.</p>
              )}
            </ul>
          </TileScroll>

          <div className="shrink-0 rounded-lg border border-white/[0.05] bg-black/20 p-2">
            <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
              Persona
            </p>
            <select
              value={personaPick}
              onChange={(e) => {
                setPersonaPick(e.target.value);
                if (e.target.value) onSetPersona(e.target.value);
              }}
              className="w-full rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-[11px] text-cream"
            >
              <option value="">Select persona…</option>
              {(workspace?.personas ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {workspace?.persona && (
              <p className="mt-1 text-[10px] text-white/40">{workspace.persona.tagline}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function JourneyInspector({
  graph,
  workspace,
  busy,
  onApply,
}: {
  graph: SpineGraphPayload;
  workspace: Workspace | null;
  busy: boolean;
  onApply: (stages: { name: string; actor: string; outcome?: string }[], source: string) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div>
        <h3 className="text-[13px] font-semibold text-cream">Journey</h3>
        <p className="text-[11px] text-white/40">
          Choose a candidate map — persona research, gold path, or current stages
        </p>
      </div>
      <div className="grid min-h-0 flex-1 gap-2 sm:grid-cols-2">
        <TileScroll className="rounded-lg border border-white/[0.05] bg-black/20 p-2">
          <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
            Candidates
          </p>
          <ul className="space-y-1.5">
            {(workspace?.journeyCandidates ?? []).map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    onApply(
                      c.stages.map((s) => ({
                        name: s.name,
                        actor: s.actor,
                        outcome: s.outcome ?? undefined,
                      })),
                      c.source
                    )
                  }
                  className="w-full rounded-lg border border-white/[0.06] px-2.5 py-2 text-left hover:border-[var(--gpssa-green)]/35"
                >
                  <p className="text-[12px] font-medium text-cream">{c.label}</p>
                  <p className="text-[10px] text-white/35">
                    {c.source} · {c.stages.length} stages
                  </p>
                </button>
              </li>
            ))}
            {!workspace?.journeyCandidates?.length && (
              <p className="text-[11px] text-white/35">Activate an episode + persona first.</p>
            )}
          </ul>
          {!!workspace?.painPoints?.length && (
            <div className="mt-3 border-t border-white/[0.05] pt-2">
              <p className="mb-1 text-[9px] uppercase tracking-[0.14em] text-white/30">
                Research pain points
              </p>
              <ul className="space-y-1">
                {workspace.painPoints.slice(0, 4).map((p) => (
                  <li key={p} className="text-[10px] text-amber-100/70">
                    · {p}
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard/atlas"
                className="mt-1 inline-block text-[10px] text-[var(--gpssa-green)]"
              >
                Open Atlas research →
              </Link>
            </div>
          )}
        </TileScroll>
        <TileScroll className="rounded-lg border border-white/[0.05] bg-black/20 p-2">
          <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
            Active stages
          </p>
          <ol className="space-y-1.5">
            {graph.stages.map((s, i) => (
              <li key={s.id} className="flex gap-2 text-[12px]">
                <span className="font-bold text-[var(--gpssa-green)]">{i + 1}</span>
                <span className="text-cream">
                  {s.name}
                  <span className="block text-[10px] text-white/35">
                    {s.actor}
                    {s.outcome ? ` · ${s.outcome}` : ""}
                  </span>
                </span>
              </li>
            ))}
            {!graph.stages.length && (
              <p className="text-[11px] text-white/35">No stages yet.</p>
            )}
          </ol>
        </TileScroll>
      </div>
    </div>
  );
}

function ProcessInspector({
  graph,
  draft,
  draftSource,
  busy,
  onGenerate,
  onApply,
  setDraft,
}: {
  graph: SpineGraphPayload;
  draft: SpineDraft | null;
  draftSource: string | null;
  busy: boolean;
  onGenerate: () => void;
  onApply: () => void;
  setDraft: (d: SpineDraft | null) => void;
}) {
  const sop = graph.processes[0]?.sop;
  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-[13px] font-semibold text-cream">Process & SOP</h3>
          <p className="text-[11px] text-white/40">
            Agentic draft from episode + journey — amend, then apply
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onGenerate}
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--gpssa-green)]/40 bg-[var(--gpssa-green)]/15 px-2.5 py-1.5 text-[11px] font-semibold text-[var(--gpssa-green)]"
          >
            <Sparkles size={12} />
            {busy ? "Working…" : "Generate"}
          </button>
          {draft && (
            <button
              type="button"
              disabled={busy}
              onClick={onApply}
              className="rounded-lg bg-[var(--gpssa-green)] px-2.5 py-1.5 text-[11px] font-semibold text-[#071322]"
            >
              Apply draft
            </button>
          )}
        </div>
      </div>
      <div className="grid min-h-0 flex-1 gap-2 sm:grid-cols-2">
        <TileScroll className="rounded-lg border border-white/[0.05] bg-black/20 p-2">
          <p className="mb-1 text-[9px] uppercase tracking-[0.14em] text-white/30">
            Draft {draftSource ? `(${draftSource})` : ""}
          </p>
          {!draft ? (
            <p className="text-[11px] text-white/40">
              Generate a process + SOP with QA checkpoints from the active episode/journey.
            </p>
          ) : (
            <ul className="space-y-1.5">
              <li className="text-[12px] font-medium text-cream">{draft.sopTitle}</li>
              {draft.steps.map((st, i) => (
                <li key={i} className="text-[11px] text-cream/90">
                  <input
                    className="w-full rounded border border-white/10 bg-black/30 px-1.5 py-1 text-[11px]"
                    value={st.title}
                    onChange={(e) => {
                      const steps = [...draft.steps];
                      steps[i] = { ...st, title: e.target.value };
                      setDraft({ ...draft, steps });
                    }}
                  />
                  {st.qaCheckpoint && (
                    <span className="text-[9px] text-[var(--gpssa-green)]"> QA</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </TileScroll>
        <TileScroll className="rounded-lg border border-white/[0.05] bg-black/20 p-2">
          <p className="mb-1 text-[9px] uppercase tracking-[0.14em] text-white/30">Live SOP</p>
          {sop ? (
            <ul className="space-y-1">
              <li className="text-[12px] text-cream">
                {sop.title} · v{sop.version}
              </li>
              {sop.steps.map((st) => (
                <li key={st.id} className="text-[11px] text-white/55">
                  {st.sortOrder + 1}. {st.title}
                  {st.qaCheckpoint ? " · QA" : ""}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[11px] text-white/40">No SOP applied yet.</p>
          )}
        </TileScroll>
      </div>
    </div>
  );
}

function SystemsInspector({
  graph,
  workspace,
  onNavigate,
}: {
  graph: SpineGraphPayload;
  workspace: Workspace | null;
  onNavigate: (h: string) => void;
}) {
  const linked = graph.processes.flatMap((p) => p.systems);
  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[13px] font-semibold text-cream">Systems & fulfilment</h3>
          <p className="text-[11px] text-white/40">Inventory only — not live Ma&apos;ashi</p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate("/dashboard/fulfilment/cases")}
          className="text-[11px] text-[var(--gpssa-green)]"
        >
          Case board →
        </button>
      </div>
      <div className="grid min-h-0 flex-1 gap-2 sm:grid-cols-2">
        <TileScroll className="rounded-lg border border-white/[0.05] bg-black/20 p-2">
          <p className="mb-1 text-[9px] uppercase text-white/30">Linked / inventory</p>
          <ul className="space-y-1">
            {(linked.length ? linked : workspace?.systems ?? []).map((s) => (
              <li key={s.id + (s as { role?: string }).role} className="text-[12px] text-cream">
                {s.name}{" "}
                <span className="text-white/35">
                  {(s as { role?: string }).role ?? s.kind}
                </span>
              </li>
            ))}
          </ul>
        </TileScroll>
        <TileScroll className="rounded-lg border border-white/[0.05] bg-black/20 p-2">
          <p className="mb-1 text-[9px] uppercase text-white/30">Cases</p>
          <ul className="space-y-1">
            {graph.fulfilment.cases.slice(0, 8).map((c) => (
              <li key={c.id} className="flex justify-between text-[11px]">
                <span className="font-mono text-cream">{c.caseRef}</span>
                <span className={c.breached ? "text-red-300" : "text-white/40"}>
                  {c.status}
                </span>
              </li>
            ))}
          </ul>
        </TileScroll>
      </div>
    </div>
  );
}

function QaInspector({
  graph,
  draft,
  onNavigate,
}: {
  graph: SpineGraphPayload;
  draft: SpineDraft | null;
  onNavigate: (h: string) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[13px] font-semibold text-cream">QA & improvement</h3>
          <p className="text-[11px] text-white/40">Process QA — not software QA</p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate("/dashboard/quality/capa")}
          className="text-[11px] text-[var(--gpssa-green)]"
        >
          CAPA →
        </button>
      </div>
      <div className="grid min-h-0 flex-1 gap-2 sm:grid-cols-3">
        <TileScroll className="rounded-lg border border-white/[0.05] bg-black/20 p-2">
          <p className="mb-1 text-[9px] uppercase text-white/30">Scorecards</p>
          {graph.quality.scorecards.map((s) => (
            <p key={s.id} className="text-[12px] text-cream">
              {s.name}
            </p>
          ))}
          {draft?.qaApproach && (
            <p className="mt-2 text-[10px] text-white/40">{draft.qaApproach.summary}</p>
          )}
        </TileScroll>
        <TileScroll className="rounded-lg border border-white/[0.05] bg-black/20 p-2">
          <p className="mb-1 text-[9px] uppercase text-white/30">Checkpoints</p>
          {(draft?.qaApproach?.checkpointFocus ??
            graph.processes[0]?.sop?.steps.filter((s) => s.qaCheckpoint).map((s) => s.title) ??
            []
          ).map((t) => (
            <p key={t} className="text-[11px] text-cream">
              · {t}
            </p>
          ))}
        </TileScroll>
        <TileScroll className="rounded-lg border border-white/[0.05] bg-black/20 p-2">
          <p className="mb-1 text-[9px] uppercase text-white/30">CAPAs</p>
          {graph.quality.capas.map((c) => (
            <p key={c.id} className="text-[11px] text-cream">
              {c.title}
            </p>
          ))}
          {!graph.quality.capas.length && (
            <p className="text-[11px] text-white/35">None yet</p>
          )}
        </TileScroll>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] ${
        active
          ? "bg-[var(--gpssa-green)]/20 text-[#9DE5C2]"
          : "bg-white/[0.04] text-white/40 hover:text-white/70"
      }`}
    >
      {children}
    </button>
  );
}
