"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, GitBranch, Loader2, Lock, Star, Wand2 } from "lucide-react";
import { useEngagementStore } from "@/lib/engagement/store";
import { PHASE_SPINE_ACCENT } from "@/lib/spine/conductor";
import {
  ACT_LABELS,
  ACT_LOCK_REASON,
  ACT_ORDER,
  ACT_SUCCESS,
  actToBrowseNode,
  computeConductorSnapshot,
  nextAct,
  nodeToAct,
  type ActStatus,
  type ConductorAct,
} from "@/lib/spine/conductor-acts";
import type { SpineDraft } from "@/lib/spine/generate";
import { buildJourneyOutline, type OutlineStage } from "@/lib/spine/journey-outline";
import type { SpineGraphPayload, SpineNodeId, SpineServiceListItem } from "@/lib/spine/types";
import { filterEligibleEpisodes } from "@/lib/spine/eligibility";
import { EASE } from "@/lib/motion";
import { getPersonaById } from "@/data/personas";
import { PersonaAvatar } from "@/components/personas/PersonaAvatar";
import { SpineSetupWizard, type WizardStep } from "./SpineSetupWizard";
import { SpineBrowseModal } from "./SpineBrowseModal";
import { PersonaChooserModal } from "./PersonaChooserModal";
import { JourneyOutlineModal } from "./JourneyOutlineModal";
import { ProcessActModal } from "./ProcessActModal";
import { SystemsActModal } from "./SystemsActModal";
import { QaActModal } from "./QaActModal";
import type { LibraryPayload, Workspace } from "./workspace-types";

const SpineOrbCanvas = dynamic(() => import("@/components/home/SpineOrbCanvas"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gradient-to-b from-[var(--gpssa-green)]/5 to-transparent" />
  ),
});

const DEFAULT_PERSONA = "emirati-govt-employee";
const ADVANCE_DELAY_MS = 400;
const TOAST_MS = 2200;

const EMPTY_STATUSES: Record<ConductorAct, ActStatus> = {
  persona: "current",
  episode: "locked",
  journey: "locked",
  process: "locked",
  systems: "locked",
  qa: "locked",
};

const STEP_TO_ACT: Record<WizardStep, ConductorAct> = {
  persona: "persona",
  episode: "episode",
  journey: "journey",
  process: "process",
  review: "qa",
};

function readUrlPersona(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("persona");
}

function writeUrlPersona(personaKey: string) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.set("persona", personaKey);
  window.history.replaceState({}, "", url.toString());
}

function actToSpineNode(act: ConductorAct): SpineNodeId {
  if (act === "persona") return "episode";
  return act;
}

export function OperatingSpine({
  className = "",
  initialServiceId,
  lockService = false,
  variant = "hero",
  onSelectedNodeChange,
  onPersonaKeyChange,
}: {
  className?: string;
  initialServiceId?: string;
  lockService?: boolean;
  variant?: "hero" | "embedded";
  onSelectedNodeChange?: (node: SpineNodeId) => void;
  onPersonaKeyChange?: (personaKey: string | null) => void;
}) {
  const engagementOpen = useEngagementStore((s) => s.engagementOpen);
  const phaseId = useEngagementStore((s) => s.phaseId);
  const accent = engagementOpen ? PHASE_SPINE_ACCENT[phaseId] : null;

  const [services, setServices] = useState<SpineServiceListItem[]>([]);
  const [serviceId, setServiceId] = useState(initialServiceId ?? "");
  const [graph, setGraph] = useState<SpineGraphPayload | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [library, setLibrary] = useState<LibraryPayload | null>(null);
  const [personaKey, setPersonaKey] = useState<string | null>(null);
  const [selected, setSelected] = useState<ConductorAct>("persona");
  const [hovered, setHovered] = useState<ConductorAct | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<SpineDraft | null>(null);
  const [draftSource, setDraftSource] = useState<string | null>(null);

  const [browseOpen, setBrowseOpen] = useState(false);
  const [browseNode, setBrowseNode] = useState<SpineNodeId>("episode");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardEntryStep, setWizardEntryStep] = useState<WizardStep>("persona");
  const [wizardLitStep, setWizardLitStep] = useState<WizardStep | null>(null);
  const [personaChooserOpen, setPersonaChooserOpen] = useState(false);
  const [journeyOpen, setJourneyOpen] = useState(false);
  const [processOpen, setProcessOpen] = useState(false);
  const [systemsOpen, setSystemsOpen] = useState(false);
  const [qaOpen, setQaOpen] = useState(false);

  const [journeyStages, setJourneyStages] = useState<OutlineStage[]>([]);
  const [journeySource, setJourneySource] = useState("library");
  const [toast, setToast] = useState<string | null>(null);

  const bootstrapped = useRef(false);
  const applyingPersona = useRef(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openActRef = useRef<(act: ConductorAct) => void>(() => {});

  const refresh = useCallback(async (id: string, lens?: string | null) => {
    const q = lens ? `?personaKey=${encodeURIComponent(lens)}` : "";
    const [g, w] = await Promise.all([
      fetch(`/api/spine/${id}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/spine/${id}/workspace${q}`).then((r) => (r.ok ? r.json() : null)),
    ]);
    setGraph(g);
    setWorkspace(w);
    if (w?.personaKey && !lens) {
      setPersonaKey(w.personaKey);
    }
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  const advanceAfter = useCallback(
    (from: ConductorAct) => {
      const nxt = nextAct(from);
      showToast(ACT_SUCCESS[from]);
      if (!nxt) return;
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      advanceTimer.current = setTimeout(() => {
        setSelected(nxt);
        openActRef.current(nxt);
      }, ADVANCE_DELAY_MS);
    },
    [showToast]
  );

  useEffect(() => {
    if (initialServiceId) setServiceId(initialServiceId);
  }, [initialServiceId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const node = params.get("node");
    if (node) {
      const act = nodeToAct(node);
      if (act) setSelected(act);
    }
    const p = params.get("persona");
    if (p) setPersonaKey(p);
  }, []);

  useEffect(() => {
    onSelectedNodeChange?.(actToSpineNode(selected));
  }, [selected, onSelectedNodeChange]);

  useEffect(() => {
    onPersonaKeyChange?.(personaKey);
  }, [personaKey, onPersonaKeyChange]);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const applyPersonaLens = useCallback(
    async (key: string, serviceList?: SpineServiceListItem[], opts?: { advance?: boolean }) => {
      const list = serviceList ?? services;
      applyingPersona.current = true;
      setBusy(true);
      setPersonaKey(key);
      writeUrlPersona(key);

      try {
        const lens = await fetch(
          `/api/spine/persona-lens?personaKey=${encodeURIComponent(key)}`
        ).then((r) => (r.ok ? r.json() : null));

        const currentId = serviceId;
        const nextServiceId =
          !lockService && lens?.preferredServiceId
            ? (lens.preferredServiceId as string)
            : currentId ||
              list.find((s) => s.isGoldPath)?.id ||
              list[0]?.id ||
              "";

        if (nextServiceId && nextServiceId !== currentId) {
          setServiceId(nextServiceId);
        }

        const targetId = nextServiceId || currentId;
        if (!targetId) return;

        await fetch(`/api/spine/${targetId}/workspace`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "set-persona", personaKey: key }),
        });

        await refresh(targetId, key);
        if (opts?.advance) advanceAfter("persona");
      } finally {
        applyingPersona.current = false;
        setBusy(false);
      }
    },
    [lockService, refresh, serviceId, services, advanceAfter]
  );

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/spine/services").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/spine/library/episodes").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(async ([rows, lib]) => {
        if (cancelled) return;
        const list = Array.isArray(rows) ? (rows as SpineServiceListItem[]) : [];
        setServices(list);
        setLibrary(lib);
        if (initialServiceId && list.some((s) => s.id === initialServiceId)) {
          setServiceId(initialServiceId);
        } else if (!lockService) {
          const gold = list.find((s) => s.isGoldPath) ?? list[0];
          if (gold) setServiceId(gold.id);
        }

        if (!bootstrapped.current && list.length && !lockService) {
          bootstrapped.current = true;
          const key = readUrlPersona() || DEFAULT_PERSONA;
          await applyPersonaLens(key, list);
        } else if (list.length && lockService && initialServiceId) {
          bootstrapped.current = true;
          const key = readUrlPersona() || DEFAULT_PERSONA;
          setPersonaKey(key);
          await refresh(initialServiceId, key);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialServiceId, lockService]);

  useEffect(() => {
    if (!serviceId || applyingPersona.current || !bootstrapped.current) return;
    refresh(serviceId, personaKey);
  }, [serviceId, personaKey, refresh]);

  const preloadJourneyOutline = useCallback(
    (ws: Workspace | null, g: SpineGraphPayload | null, lens: string | null) => {
      const eligible = ws?.eligibleEpisodes ?? ws?.episodes ?? [];
      const active =
        eligible.find((e) => e.isActive) ??
        ws?.episodes.find((e) => e.isActive) ??
        null;
      const existing = (g?.stages ?? []).map((s) => ({
        name: s.name,
        actor: s.actor,
        outcome: s.outcome ?? undefined,
      }));
      const built = buildJourneyOutline({
        libraryId: active?.libraryId,
        personaKey: lens,
        existingStages: existing.length ? existing : undefined,
      });
      setJourneyStages(built.stages);
      setJourneySource(built.source);
    },
    []
  );

  const workspaceAction = useCallback(
    async (action: string, payload: Record<string, unknown> = {}) => {
      if (!serviceId) return;
      if (action === "set-persona" && typeof payload.personaKey === "string") {
        await applyPersonaLens(payload.personaKey, undefined, { advance: true });
        return;
      }
      setBusy(true);
      try {
        const body = {
          action,
          ...payload,
          ...(personaKey && !payload.personaKey ? { personaKey } : {}),
        };
        const r = await fetch(`/api/spine/${serviceId}/workspace`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        await refresh(serviceId, personaKey);

        if (
          r.ok &&
          (action === "activate-episode" || action === "activate-library")
        ) {
          setBrowseOpen(false);
          const [g, w] = await Promise.all([
            fetch(`/api/spine/${serviceId}`).then((res) => (res.ok ? res.json() : null)),
            fetch(
              `/api/spine/${serviceId}/workspace${
                personaKey ? `?personaKey=${encodeURIComponent(personaKey)}` : ""
              }`
            ).then((res) => (res.ok ? res.json() : null)),
          ]);
          preloadJourneyOutline(w, g, personaKey);
          advanceAfter("episode");
        }
      } finally {
        setBusy(false);
      }
    },
    [serviceId, personaKey, refresh, applyPersonaLens, advanceAfter, preloadJourneyOutline]
  );

  const runGenerate = useCallback(async () => {
    if (!serviceId) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/spine/${serviceId}/generate`, { method: "POST" });
      const data = await r.json();
      if (r.ok) {
        setDraft(data.draft);
        setDraftSource(data.source);
      }
    } finally {
      setBusy(false);
    }
  }, [serviceId]);

  const runApplyProcess = useCallback(async () => {
    if (!serviceId || !draft) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/spine/${serviceId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft, section: "process" }),
      });
      if (r.ok) {
        await refresh(serviceId, personaKey);
        setProcessOpen(false);
        advanceAfter("process");
      }
    } finally {
      setBusy(false);
    }
  }, [serviceId, draft, refresh, personaKey, advanceAfter]);

  function openWizard(step: WizardStep) {
    setWizardEntryStep(step);
    setWizardLitStep(step);
    setWizardOpen(true);
    setBrowseOpen(false);
    setJourneyOpen(false);
    setProcessOpen(false);
    setSystemsOpen(false);
    setQaOpen(false);
  }

  const eligibleEpisodes = useMemo(() => {
    if (workspace?.eligibleEpisodes) return workspace.eligibleEpisodes;
    return filterEligibleEpisodes(workspace?.episodes ?? [], personaKey);
  }, [workspace, personaKey]);

  const activeEpisode =
    eligibleEpisodes.find((e) => e.isActive) ??
    workspace?.episodes.find((e) => e.isActive && eligibleEpisodes.some((x) => x.id === e.id)) ??
    null;

  const conductorSnap = useMemo(() => {
    if (!graph) {
      return {
        statuses: EMPTY_STATUSES,
        summaries: {
          persona: "",
          episode: "",
          journey: "",
          process: "",
          systems: "",
          qa: "",
        } as Record<ConductorAct, string>,
      };
    }
    return computeConductorSnapshot({
      personaName: workspace?.persona?.name ?? null,
      episodeName: activeEpisode?.name ?? null,
      stageCount: graph.stages.length,
      sopStepCount: graph.processes[0]?.sop?.steps.length ?? 0,
      systemCount: graph.processes.reduce((n, p) => n + p.systems.length, 0),
      scorecardCount: graph.quality.scorecards.length,
    });
  }, [graph, workspace, activeEpisode]);

  const openAct = useCallback(
    (act: ConductorAct) => {
      const status = conductorSnap.statuses[act];
      if (status === "locked") return;
      setSelected(act);

      if (act === "persona") {
        setPersonaChooserOpen(true);
        return;
      }
      if (act === "journey") {
        preloadJourneyOutline(workspace, graph, personaKey);
        setBrowseOpen(false);
        setJourneyOpen(true);
        return;
      }
      if (act === "process") {
        setBrowseOpen(false);
        setProcessOpen(true);
        return;
      }
      if (act === "systems") {
        setBrowseOpen(false);
        setSystemsOpen(true);
        return;
      }
      if (act === "qa") {
        setBrowseOpen(false);
        setQaOpen(true);
        return;
      }
      const browse = actToBrowseNode(act);
      if (browse) {
        setBrowseNode(browse);
        setBrowseOpen(true);
      }
    },
    [conductorSnap.statuses, workspace, graph, personaKey, preloadJourneyOutline]
  );

  openActRef.current = openAct;

  const litSelection =
    wizardOpen && wizardLitStep ? STEP_TO_ACT[wizardLitStep] : selected;

  const currentActIndex = ACT_ORDER.findIndex(
    (a) => conductorSnap.statuses[a] === "current"
  );
  const progressAct = currentActIndex >= 0 ? currentActIndex + 1 : 6;
  const progressVerb =
    currentActIndex >= 0
      ? ACT_LABELS[ACT_ORDER[currentActIndex]].verb
      : "Spine path complete — open Blueprint for detail";

  if (loading && !graph) {
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

  const serviceName = graph.service.name;
  const lensKey = personaKey ?? workspace?.personaKey ?? null;
  const persona = lensKey ? getPersonaById(lensKey) : null;
  const hasAppliedJourney = graph.stages.length > 0;

  return (
    <section
      className={`relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent ${className}`}
      data-tour="compass-operating-spine"
    >
      <div className="flex shrink-0 items-center justify-between gap-2 px-3 py-2 sm:px-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <GitBranch size={12} className="shrink-0 text-[var(--gpssa-green)]" />
            <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[var(--gpssa-green)]">
              Operating spine
            </span>
            {graph.isGoldPath && (
              <Star size={10} className="shrink-0 text-amber-300" aria-label="Gold path" />
            )}
          </div>
          <p className="mt-0.5 truncate pl-5 text-[11px] text-white/35">{serviceName}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => openWizard("persona")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--gpssa-green)]/40 bg-[var(--gpssa-green)]/15 px-2.5 py-1.5 text-[11px] font-semibold text-[var(--gpssa-green)] transition hover:bg-[var(--gpssa-green)]/25"
          >
            <Wand2 size={11} /> Set up
          </button>
          <Link
            href={`/dashboard/services/operating/${serviceId}`}
            className="inline-flex items-center gap-1 rounded-lg bg-[var(--gpssa-green)]/90 px-2.5 py-1.5 text-[11px] font-semibold text-[#071322] transition hover:brightness-110"
            title="Open blueprint"
          >
            Blueprint <ArrowRight size={11} />
          </Link>
        </div>
      </div>

      {/* Act line — Persona (avatar) → Episode → Journey → Process → Systems → QA */}
      <div className="relative shrink-0" style={{ height: variant === "hero" ? 200 : 148 }}>
        <div className="absolute inset-x-0 top-0" style={{ bottom: 52 }}>
          <SpineOrbCanvas
            selected={litSelection}
            hovered={hovered}
            statuses={conductorSnap.statuses}
            accent={
              accent ??
              (conductorSnap.statuses[litSelection] !== "locked" ? "#00A86B" : null)
            }
          />
        </div>
        <div className="absolute inset-0 flex">
          {ACT_ORDER.map((act, i) => {
            const status = conductorSnap.statuses[act];
            const locked = status === "locked";
            const isSel = litSelection === act;
            const summary = conductorSnap.summaries[act];
            return (
              <button
                key={act}
                type="button"
                disabled={locked}
                onClick={() => openAct(act)}
                onMouseEnter={() => setHovered(act)}
                onMouseLeave={() => setHovered(null)}
                title={locked ? ACT_LOCK_REASON[act] : ACT_LABELS[act].verb}
                className={`group relative flex w-1/6 flex-col items-center justify-end pb-1.5 ${
                  locked ? "cursor-not-allowed opacity-50" : ""
                }`}
              >
                {act === "persona" && (
                  <div className="pointer-events-none absolute left-1/2 top-[22%] z-10 -translate-x-1/2">
                    {persona ? (
                      <PersonaAvatar
                        persona={persona}
                        size={variant === "hero" ? "lg" : "md"}
                        showGlow={status === "current" || isSel}
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-black/40 text-[10px] text-white/40">
                        ?
                      </div>
                    )}
                  </div>
                )}

                <span className="mb-0.5 flex items-center gap-1">
                  <span
                    className={`flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold ${
                      status === "done"
                        ? "bg-[var(--gpssa-green)] text-[#071322]"
                        : status === "current"
                          ? "bg-[var(--gpssa-green)]/90 text-[#071322]"
                          : locked
                            ? "bg-white/[0.06] text-white/35"
                            : "bg-white/[0.1] text-white/50"
                    }`}
                  >
                    {status === "done" ? (
                      <Check size={8} />
                    ) : locked ? (
                      <Lock size={7} />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <motion.span
                    className={`text-[10px] font-semibold uppercase tracking-[0.14em] transition ${
                      isSel
                        ? "text-cream"
                        : locked
                          ? "text-white/35"
                          : "text-white/55 group-hover:text-white/85"
                    }`}
                  >
                    {ACT_LABELS[act].label}
                  </motion.span>
                </span>
                <span className="max-w-[92%] truncate text-center text-[9px] tabular-nums text-white/35">
                  {act === "persona"
                    ? summary || (locked ? ACT_LOCK_REASON[act] : ACT_LABELS[act].verb)
                    : summary || (locked ? ACT_LOCK_REASON[act] : ACT_LABELS[act].verb)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative min-h-0 flex-1 border-t border-white/[0.05] px-3 py-2 sm:px-4">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: EASE }}
              className="absolute inset-x-3 top-1 z-20 rounded-lg border border-[var(--gpssa-green)]/35 bg-[var(--gpssa-green)]/15 px-3 py-1.5 text-center text-[11px] font-medium text-[var(--gpssa-green)] backdrop-blur-sm sm:inset-x-4"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          key={progressAct}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: EASE }}
          className="flex h-full min-h-0 items-center gap-3"
        >
          <span className="shrink-0 rounded-full border border-[var(--gpssa-green)]/30 bg-[var(--gpssa-green)]/10 px-2.5 py-1 text-[10px] font-semibold text-[var(--gpssa-green)]">
            Act {progressAct} of 6
          </span>
          <p className="min-w-0 truncate text-[12px] text-cream">{progressVerb}</p>
          <p className="ml-auto hidden text-[10px] text-white/25 sm:block">
            Click a step on the line to continue
          </p>
        </motion.div>
      </div>

      <PersonaChooserModal
        isOpen={personaChooserOpen}
        onClose={() => setPersonaChooserOpen(false)}
        personaKey={lensKey}
        busy={busy}
        onSelect={(key) => void applyPersonaLens(key, undefined, { advance: true })}
      />

      <SpineBrowseModal
        isOpen={browseOpen}
        onClose={() => setBrowseOpen(false)}
        node={browseNode}
        graph={graph}
        workspace={workspace}
        personaKey={lensKey}
        busy={busy}
        onAction={workspaceAction}
        onOpenWizardProcess={() => openWizard("process")}
      />

      <JourneyOutlineModal
        isOpen={journeyOpen}
        onClose={() => setJourneyOpen(false)}
        stages={journeyStages}
        source={journeySource}
        hasAppliedJourney={hasAppliedJourney}
        busy={busy}
        onApply={async (stages, source) => {
          setBusy(true);
          try {
            const r = await fetch(`/api/spine/${serviceId}/workspace`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "apply-journey",
                stages,
                source,
                ...(personaKey ? { personaKey } : {}),
              }),
            });
            if (r.ok) {
              await refresh(serviceId, personaKey);
              setJourneyOpen(false);
              setDraft(null);
              advanceAfter("journey");
            }
          } finally {
            setBusy(false);
          }
        }}
      />

      <ProcessActModal
        isOpen={processOpen}
        onClose={() => setProcessOpen(false)}
        graph={graph}
        draft={draft}
        draftSource={draftSource}
        busy={busy}
        setDraft={setDraft}
        onGenerate={runGenerate}
        onApply={runApplyProcess}
      />

      <SystemsActModal
        isOpen={systemsOpen}
        onClose={() => setSystemsOpen(false)}
        serviceId={serviceId}
        graph={graph}
        onApplied={async () => {
          await refresh(serviceId, personaKey);
          setSystemsOpen(false);
          advanceAfter("systems");
        }}
      />

      <QaActModal
        isOpen={qaOpen}
        onClose={() => setQaOpen(false)}
        serviceId={serviceId}
        graph={graph}
        onApplied={async () => {
          await refresh(serviceId, personaKey);
          setQaOpen(false);
          advanceAfter("qa");
        }}
      />

      <SpineSetupWizard
        isOpen={wizardOpen}
        onClose={() => {
          setWizardOpen(false);
          setWizardLitStep(null);
        }}
        entryStep={wizardEntryStep}
        serviceId={serviceId}
        serviceName={graph.service.name}
        graph={graph}
        workspace={workspace}
        library={library}
        personaKey={lensKey}
        busy={busy}
        draft={draft}
        draftSource={draftSource}
        setDraft={setDraft}
        onAction={workspaceAction}
        onGenerate={runGenerate}
        onApply={runApplyProcess}
        onStepChange={setWizardLitStep}
        onPersonaSelect={(key) => void applyPersonaLens(key, undefined, { advance: true })}
      />
    </section>
  );
}
