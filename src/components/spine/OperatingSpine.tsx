"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, GitBranch, Loader2, Sparkles, Star } from "lucide-react";
import { useEngagementStore } from "@/lib/engagement/store";
import { emphasizedNodes, PHASE_SPINE_ACCENT } from "@/lib/spine/conductor";
import type { SpineDraft } from "@/lib/spine/generate";
import type { LifecycleCategory } from "@/lib/spine/library";
import type { SpineGraphPayload, SpineNodeId, SpineServiceListItem } from "@/lib/spine/types";
import { TileScroll } from "@/components/ui/PageFrame";

const SpineOrbCanvas = dynamic(() => import("@/components/home/SpineOrbCanvas"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gradient-to-b from-[var(--gpssa-green)]/5 to-transparent" />
  ),
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
  episodes: {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    personaKey: string | null;
  }[];
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
      <div
        className={`flex min-h-0 flex-1 items-center justify-center text-[12px] text-white/40 ${className}`}
      >
        <Loader2 size={16} className="mr-2 animate-spin" /> Spine
      </div>
    );
  }

  if (!graph || !services.length) {
    return (
      <div
        className={`rounded-2xl border border-dashed border-white/10 p-6 text-center text-[12px] text-white/40 ${className}`}
      >
        No spine data yet.
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
      {/* Header — one slim row */}
      <div className="flex shrink-0 items-center justify-between gap-2 px-3 py-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <GitBranch size={12} className="shrink-0 text-[var(--gpssa-green)]" />
          <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[var(--gpssa-green)]">
            Operating spine
          </span>
          {graph.isGoldPath && (
            <span className="inline-flex items-center gap-0.5 rounded bg-amber-500/15 px-1.5 py-0.5 text-[8px] uppercase tracking-wider text-amber-200">
              <Star size={8} /> Gold
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {!lockService && (
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="max-w-[190px] truncate rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-[11px] text-cream"
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
            className="inline-flex items-center gap-1 rounded-lg bg-[var(--gpssa-green)]/90 px-2.5 py-1.5 text-[11px] font-semibold text-[#071322] transition hover:brightness-110"
            title="Open blueprint"
          >
            Blueprint <ArrowRight size={11} />
          </Link>
        </div>
      </div>

      {/* Planet stage — each orb sits directly above its label column */}
      <div
        className="relative shrink-0"
        style={{ height: variant === "hero" ? 168 : 128 }}
      >
        <div className="absolute inset-x-0 top-0" style={{ bottom: 40 }}>
          <SpineOrbCanvas
            selected={selected}
            hovered={hovered}
            emphasized={emphasis}
            conducting={engagementOpen}
            accent={accent}
          />
        </div>
        {/* Column hit targets + labels */}
        <div className="absolute inset-0 flex">
          {NODE_ORDER.map((id) => {
            const node = graph.nodes.find((n) => n.id === id)!;
            const emp = emphasis.has(id);
            const dim = engagementOpen && emphasis.size > 0 && !emp && selected !== id;
            const isSel = selected === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelected(id)}
                onMouseEnter={() => setHovered(id)}
                onMouseLeave={() => setHovered(null)}
                className="group flex w-1/5 flex-col items-center justify-end pb-2"
                style={{ opacity: dim ? 0.45 : 1 }}
              >
                <motion.span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] transition ${
                    isSel
                      ? "bg-[var(--gpssa-green)]/20 text-cream ring-1 ring-[var(--gpssa-green)]/40"
                      : "text-white/50 group-hover:text-white/80"
                  }`}
                  animate={isSel ? { y: [0, -1.5, 0] } : {}}
                  transition={{ duration: 1.4, ease: EASE, repeat: isSel ? Infinity : 0 }}
                >
                  {SHORT[id]}
                </motion.span>
                <span className="mt-0.5 text-[9px] tabular-nums text-white/30">
                  {node.lit ? node.count : "—"}
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
              <SystemsInspector
                graph={graph}
                workspace={workspace}
                onNavigate={(h) => router.push(h)}
              />
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

/* ── Inspectors ─────────────────────────────────────────────── */

function Head({
  title,
  right,
  busy,
}: {
  title: string;
  right?: React.ReactNode;
  busy?: boolean;
}) {
  return (
    <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
      <h3 className="font-playfair text-[14px] font-semibold text-cream">{title}</h3>
      <div className="flex items-center gap-2">
        {busy && <Loader2 size={13} className="animate-spin text-white/40" />}
        {right}
      </div>
    </div>
  );
}

function Panel({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex min-h-0 flex-col rounded-xl border border-white/[0.05] bg-black/20 p-2 ${className}`}>
      <p className="mb-1.5 shrink-0 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
        {label}
      </p>
      <TileScroll>{children}</TileScroll>
    </div>
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
      <Head title="Episode" busy={busy} />
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
        <Panel label="Library">
          <ul className="space-y-1.5">
            {libEps.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onActivateLibrary(e.id)}
                  className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-2 text-left transition hover:border-[var(--gpssa-green)]/40 hover:bg-white/[0.05]"
                >
                  <p className="text-[12px] font-medium text-cream">{e.name}</p>
                </button>
              </li>
            ))}
          </ul>
        </Panel>
        <div className="flex min-h-0 flex-col gap-2">
          <Panel label="Active" className="flex-1">
            <ul className="space-y-1">
              {(workspace?.episodes ?? []).map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onActivateEpisode(e.id)}
                    className={`w-full truncate rounded-lg px-2 py-1.5 text-left text-[11px] ${
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
                <p className="text-[11px] text-white/35">Pick from library</p>
              )}
            </ul>
          </Panel>
          <div className="shrink-0 rounded-xl border border-white/[0.05] bg-black/20 p-2">
            <select
              value={personaPick}
              onChange={(e) => {
                setPersonaPick(e.target.value);
                if (e.target.value) onSetPersona(e.target.value);
              }}
              className="w-full rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-[11px] text-cream"
            >
              <option value="">Persona…</option>
              {(workspace?.personas ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
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
      <Head title="Journey" busy={busy} />
      <div className="grid min-h-0 flex-1 gap-2 sm:grid-cols-2">
        <Panel label="Candidates">
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
                  className="w-full rounded-lg border border-white/[0.06] px-2.5 py-2 text-left transition hover:border-[var(--gpssa-green)]/40"
                >
                  <p className="text-[12px] font-medium text-cream">{c.label}</p>
                  <p className="text-[10px] text-white/35">{c.stages.length} stages</p>
                </button>
              </li>
            ))}
            {!workspace?.journeyCandidates?.length && (
              <p className="text-[11px] text-white/35">Set an episode + persona first</p>
            )}
          </ul>
          {!!workspace?.painPoints?.length && (
            <div className="mt-2 border-t border-white/[0.05] pt-1.5">
              {workspace.painPoints.slice(0, 3).map((p) => (
                <p key={p} className="truncate text-[10px] text-amber-100/60">
                  · {p}
                </p>
              ))}
            </div>
          )}
        </Panel>
        <Panel label="Stages">
          <ol className="space-y-1.5">
            {graph.stages.map((s, i) => (
              <li key={s.id} className="flex gap-2 text-[12px]">
                <span className="font-bold text-[var(--gpssa-green)]">{i + 1}</span>
                <span className="min-w-0 truncate text-cream">{s.name}</span>
              </li>
            ))}
            {!graph.stages.length && <p className="text-[11px] text-white/35">None yet</p>}
          </ol>
        </Panel>
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
      <Head
        title="Process & SOP"
        busy={busy}
        right={
          <>
            <button
              type="button"
              disabled={busy}
              onClick={onGenerate}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--gpssa-green)]/40 bg-[var(--gpssa-green)]/15 px-2.5 py-1 text-[11px] font-semibold text-[var(--gpssa-green)]"
            >
              <Sparkles size={11} /> Draft
            </button>
            {draft && (
              <button
                type="button"
                disabled={busy}
                onClick={onApply}
                className="rounded-lg bg-[var(--gpssa-green)] px-2.5 py-1 text-[11px] font-semibold text-[#071322]"
              >
                Apply
              </button>
            )}
          </>
        }
      />
      <div className="grid min-h-0 flex-1 gap-2 sm:grid-cols-2">
        <Panel label={draftSource ? `Draft · ${draftSource}` : "Draft"}>
          {!draft ? (
            <p className="text-[11px] text-white/40">Draft an SOP from the active episode</p>
          ) : (
            <ul className="space-y-1.5">
              {draft.steps.map((st, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <input
                    className="min-w-0 flex-1 rounded border border-white/10 bg-black/30 px-1.5 py-1 text-[11px] text-cream"
                    value={st.title}
                    onChange={(e) => {
                      const steps = [...draft.steps];
                      steps[i] = { ...st, title: e.target.value };
                      setDraft({ ...draft, steps });
                    }}
                  />
                  {st.qaCheckpoint && (
                    <span className="shrink-0 text-[9px] font-bold text-[var(--gpssa-green)]">
                      QA
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel label="Live SOP">
          {sop ? (
            <ul className="space-y-1">
              <li className="text-[12px] font-medium text-cream">
                {sop.title} · v{sop.version}
              </li>
              {sop.steps.map((st) => (
                <li key={st.id} className="truncate text-[11px] text-white/55">
                  {st.sortOrder + 1}. {st.title}
                  {st.qaCheckpoint ? " · QA" : ""}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[11px] text-white/40">Nothing applied yet</p>
          )}
        </Panel>
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
      <Head
        title="Systems & fulfilment"
        right={
          <button
            type="button"
            onClick={() => onNavigate("/dashboard/fulfilment/cases")}
            className="text-[11px] text-[var(--gpssa-green)]"
          >
            Cases →
          </button>
        }
      />
      <div className="grid min-h-0 flex-1 gap-2 sm:grid-cols-2">
        <Panel label="Systems">
          <ul className="space-y-1">
            {(linked.length ? linked : workspace?.systems ?? []).map((s) => (
              <li
                key={s.id + ((s as { role?: string }).role ?? "")}
                className="flex justify-between text-[12px]"
              >
                <span className="text-cream">{s.name}</span>
                <span className="text-white/35">
                  {(s as { role?: string }).role ?? s.kind}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel label="Cases">
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
        </Panel>
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
      <Head
        title="QA & improvement"
        right={
          <button
            type="button"
            onClick={() => onNavigate("/dashboard/quality/capa")}
            className="text-[11px] text-[var(--gpssa-green)]"
          >
            CAPA →
          </button>
        }
      />
      <div className="grid min-h-0 flex-1 gap-2 sm:grid-cols-3">
        <Panel label="Scorecards">
          {graph.quality.scorecards.map((s) => (
            <p key={s.id} className="text-[12px] text-cream">
              {s.name}
            </p>
          ))}
        </Panel>
        <Panel label="Checkpoints">
          {(draft?.qaApproach?.checkpointFocus ??
            graph.processes[0]?.sop?.steps
              .filter((s) => s.qaCheckpoint)
              .map((s) => s.title) ??
            []
          ).map((t) => (
            <p key={t} className="truncate text-[11px] text-cream">
              · {t}
            </p>
          ))}
        </Panel>
        <Panel label="CAPAs">
          {graph.quality.capas.map((c) => (
            <p key={c.id} className="truncate text-[11px] text-cream">
              {c.title}
            </p>
          ))}
          {!graph.quality.capas.length && (
            <p className="text-[11px] text-white/35">None</p>
          )}
        </Panel>
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
      className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] transition ${
        active
          ? "bg-[var(--gpssa-green)]/20 text-[#9DE5C2]"
          : "bg-white/[0.04] text-white/40 hover:text-white/70"
      }`}
    >
      {children}
    </button>
  );
}
