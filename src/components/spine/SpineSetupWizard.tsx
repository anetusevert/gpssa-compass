"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { PersonaAvatar } from "@/components/personas/PersonaAvatar";
import { getPersonaById } from "@/data/personas";
import { EASE } from "@/lib/motion";
import type { SpineDraft } from "@/lib/spine/generate";
import type { LifecycleCategory } from "@/lib/spine/library";
import type { SpineGraphPayload } from "@/lib/spine/types";
import type { LibraryPayload, Workspace } from "./workspace-types";

export type WizardStep = "persona" | "episode" | "journey" | "process" | "review";

export const WIZARD_STEPS: { id: WizardStep; label: string }[] = [
  { id: "persona", label: "Persona" },
  { id: "episode", label: "Episode" },
  { id: "journey", label: "Journey" },
  { id: "process", label: "Process" },
  { id: "review", label: "Review" },
];

export function SpineSetupWizard({
  isOpen,
  onClose,
  entryStep = "persona",
  serviceId,
  serviceName,
  graph,
  workspace,
  library,
  personaKey = null,
  busy,
  draft,
  draftSource,
  setDraft,
  onAction,
  onGenerate,
  onApply,
  onStepChange,
  onPersonaSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  /** Set only when opening — ignored while the wizard stays open. */
  entryStep?: WizardStep;
  serviceId: string;
  serviceName: string;
  graph: SpineGraphPayload | null;
  workspace: Workspace | null;
  library: LibraryPayload | null;
  personaKey?: string | null;
  busy: boolean;
  draft: SpineDraft | null;
  draftSource: string | null;
  setDraft: (d: SpineDraft | null) => void;
  onAction: (action: string, payload?: Record<string, unknown>) => Promise<void>;
  onGenerate: () => Promise<void>;
  onApply: () => Promise<void>;
  /** One-way: lights the matching planet. Does not feed back into entryStep. */
  onStepChange?: (step: WizardStep) => void;
  /** Prefer over set-persona alone so home lens + service resolve stay in sync. */
  onPersonaSelect?: (key: string) => void;
}) {
  const [step, setStep] = useState<WizardStep>(entryStep);
  const [category, setCategory] = useState<LifecycleCategory | "all">("all");
  const wasOpen = useRef(false);

  // One-shot init when the modal opens; ignore entryStep churn while open.
  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      setStep(entryStep);
    }
    wasOpen.current = isOpen;
  }, [isOpen, entryStep]);

  useEffect(() => {
    if (isOpen) onStepChange?.(step);
  }, [isOpen, step, onStepChange]);

  const stepIdx = WIZARD_STEPS.findIndex((s) => s.id === step);

  const lensKey = personaKey ?? workspace?.personaKey ?? null;

  const eligibleEpisodes = useMemo(() => {
    if (workspace?.eligibleEpisodes) return workspace.eligibleEpisodes;
    return workspace?.episodes ?? [];
  }, [workspace]);

  const done: Record<WizardStep, boolean> = useMemo(() => {
    const activeEpisode = eligibleEpisodes.find((e) => e.isActive) ?? null;
    return {
      persona: Boolean(lensKey),
      episode: Boolean(activeEpisode),
      journey: Boolean(graph?.stages.length),
      process: Boolean(graph?.processes[0]?.sop),
      review: false,
    };
  }, [eligibleEpisodes, lensKey, graph]);

  const canNext = done[step] || step === "review";

  function go(delta: number) {
    const next = WIZARD_STEPS[Math.min(WIZARD_STEPS.length - 1, Math.max(0, stepIdx + delta))];
    setStep(next.id);
  }

  const libEps =
    library?.episodes.filter((e) => {
      const catOk = category === "all" || e.category === category;
      if (!catOk) return false;
      if (!lensKey) return true;
      return e.suggestedPersonaKeys.includes(lensKey);
    }) ?? [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <div className="flex h-[62vh] min-h-[380px] flex-col">
        {/* Step rail */}
        <div className="mb-4 flex shrink-0 items-center justify-center gap-1">
          {WIZARD_STEPS.map((s, i) => {
            const active = s.id === step;
            const complete = done[s.id] && !active;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setStep(s.id)}
                className="group flex items-center gap-1.5"
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition ${
                    active
                      ? "bg-[var(--gpssa-green)] text-[#071322] shadow-[0_0_14px_rgba(0,168,107,0.5)]"
                      : complete
                        ? "bg-[var(--gpssa-green)]/25 text-[var(--gpssa-green)]"
                        : "bg-white/[0.06] text-white/40"
                  }`}
                >
                  {complete ? <Check size={12} /> : i + 1}
                </span>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-[0.14em] transition ${
                    active ? "text-cream" : "text-white/35 group-hover:text-white/60"
                  }`}
                >
                  {s.label}
                </span>
                {i < WIZARD_STEPS.length - 1 && (
                  <span className="mx-1.5 h-px w-4 bg-white/10 sm:w-8" />
                )}
              </button>
            );
          })}
        </div>

        {/* Step body */}
        <div className="min-h-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.28, ease: EASE }}
              className="h-full min-h-0"
            >
              {step === "persona" && (
                <PersonaStep
                  workspace={workspace}
                  personaKey={lensKey}
                  busy={busy}
                  onPick={(key) =>
                    onPersonaSelect
                      ? onPersonaSelect(key)
                      : void onAction("set-persona", { personaKey: key })
                  }
                />
              )}
              {step === "episode" && (
                <EpisodeStep
                  library={library}
                  libEps={libEps}
                  category={category}
                  setCategory={setCategory}
                  workspace={workspace}
                  eligibleEpisodes={eligibleEpisodes}
                  busy={busy}
                  onActivateLibrary={(libraryId) =>
                    onAction("activate-library", {
                      libraryId,
                      personaKey: lensKey ?? undefined,
                    })
                  }
                  onActivateEpisode={(episodeId) =>
                    onAction("activate-episode", {
                      episodeId,
                      personaKey: lensKey ?? undefined,
                    })
                  }
                />
              )}
              {step === "journey" && (
                <JourneyStep
                  graph={graph}
                  workspace={workspace}
                  busy={busy}
                  onApply={(stages, source) => onAction("apply-journey", { stages, source })}
                />
              )}
              {step === "process" && (
                <ProcessStep
                  graph={graph}
                  draft={draft}
                  draftSource={draftSource}
                  busy={busy}
                  onGenerate={onGenerate}
                  onApply={onApply}
                  setDraft={setDraft}
                />
              )}
              {step === "review" && (
                <ReviewStep
                  serviceId={serviceId}
                  serviceName={serviceName}
                  graph={graph}
                  workspace={workspace}
                  eligibleEpisodes={eligibleEpisodes}
                  done={done}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="mt-4 flex shrink-0 items-center justify-between">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={stepIdx === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-[12px] text-white/60 transition hover:text-cream disabled:opacity-30"
          >
            <ArrowLeft size={13} /> Back
          </button>
          <div className="flex items-center gap-2">
            {busy && <Loader2 size={14} className="animate-spin text-white/40" />}
            {step !== "review" ? (
              <button
                type="button"
                onClick={() => go(1)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-[12px] font-semibold transition ${
                  canNext
                    ? "bg-[var(--gpssa-green)] text-[#071322] hover:brightness-110"
                    : "bg-white/[0.06] text-white/40"
                }`}
              >
                {canNext ? "Next" : "Skip"} <ArrowRight size={13} />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--gpssa-green)] px-4 py-1.5 text-[12px] font-semibold text-[#071322] hover:brightness-110"
              >
                Done <Check size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ── Steps ─────────────────────────────────────────────── */

function StepIntro({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="mb-3 shrink-0 text-center">
      <h3 className="font-playfair text-lg font-semibold text-cream">{title}</h3>
      <p className="text-[11px] text-white/40">{hint}</p>
    </div>
  );
}

function PersonaStep({
  workspace,
  personaKey,
  busy,
  onPick,
}: {
  workspace: Workspace | null;
  personaKey: string | null;
  busy: boolean;
  onPick: (key: string) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <StepIntro title="Who is this for?" hint="Home lens — episodes can serve multiple personas" />
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {(workspace?.personas ?? []).map((p) => {
            const full = getPersonaById(p.id);
            const active = personaKey === p.id;
            return (
              <motion.button
                key={p.id}
                type="button"
                disabled={busy}
                onClick={() => onPick(p.id)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`relative flex items-center gap-3 rounded-xl border p-2.5 text-left transition ${
                  active
                    ? "border-[var(--gpssa-green)]/60 bg-[var(--gpssa-green)]/10"
                    : "border-white/[0.07] bg-white/[0.03] hover:border-white/20"
                }`}
              >
                {full ? (
                  <PersonaAvatar persona={full} size="sm" showGlow={false} />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-cream">
                    {p.name.charAt(0)}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-cream">{p.name}</p>
                  <p className="truncate text-[10px] text-white/40">{p.tagline}</p>
                </div>
                {active && (
                  <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--gpssa-green)] text-[#071322]">
                    <Check size={10} />
                  </span>
                )}
                <Link
                  href={`/dashboard/delivery/personas?persona=${p.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-2 right-2 text-white/30 transition hover:text-[var(--gpssa-green)]"
                  title="Open profile"
                >
                  <ExternalLink size={12} />
                </Link>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EpisodeStep({
  library,
  libEps,
  category,
  setCategory,
  workspace,
  eligibleEpisodes,
  busy,
  onActivateLibrary,
  onActivateEpisode,
}: {
  library: LibraryPayload | null;
  libEps: LibraryPayload["episodes"];
  category: LifecycleCategory | "all";
  setCategory: (c: LifecycleCategory | "all") => void;
  workspace: Workspace | null;
  eligibleEpisodes: NonNullable<Workspace["eligibleEpisodes"]> | Workspace["episodes"];
  busy: boolean;
  onActivateLibrary: (id: string) => void;
  onActivateEpisode: (id: string) => void;
}) {
  const activeId = eligibleEpisodes.find((e) => e.isActive)?.id ?? null;
  return (
    <div className="flex h-full min-h-0 flex-col">
      <StepIntro
        title="Which life episode?"
        hint="Eligible for this customer — shared episodes can appear for more than one persona"
      />
      <div className="mb-2 flex shrink-0 flex-wrap justify-center gap-1">
        <WizardChip active={category === "all"} onClick={() => setCategory("all")}>
          All
        </WizardChip>
        {library?.categories.map((c) => (
          <WizardChip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
            {c.label}
          </WizardChip>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 gap-2 sm:grid-cols-2">
        <div className="min-h-0 overflow-y-auto pr-1">
          <div className="space-y-1.5">
            {libEps.map((e) => (
              <motion.button
                key={e.id}
                type="button"
                disabled={busy}
                onClick={() => onActivateLibrary(e.id)}
                whileHover={{ y: -1 }}
                className="w-full rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-left transition hover:border-[var(--gpssa-green)]/40"
              >
                <p className="text-[12px] font-medium text-cream">{e.name}</p>
              </motion.button>
            ))}
            {!libEps.length && (
              <p className="text-[11px] text-white/35">No library matches for this persona</p>
            )}
          </div>
        </div>
        <div className="flex min-h-0 flex-col rounded-xl border border-white/[0.05] bg-black/20 p-2">
          <p className="mb-1.5 shrink-0 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
            Eligible on this service
          </p>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {eligibleEpisodes.map((e) => (
              <button
                key={e.id}
                type="button"
                disabled={busy}
                onClick={() => onActivateEpisode(e.id)}
                className={`mb-1 w-full truncate rounded-lg px-2 py-1.5 text-left text-[11px] transition ${
                  e.id === activeId
                    ? "bg-[var(--gpssa-green)]/15 text-cream"
                    : "text-white/55 hover:bg-white/[0.04]"
                }`}
              >
                {e.id === activeId ? "● " : ""}
                {e.name}
              </button>
            ))}
            {!eligibleEpisodes.length && (
              <p className="text-[11px] text-white/35">None yet — pick from the library</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function JourneyStep({
  graph,
  workspace,
  busy,
  onApply,
}: {
  graph: SpineGraphPayload | null;
  workspace: Workspace | null;
  busy: boolean;
  onApply: (stages: { name: string; actor: string; outcome?: string }[], source: string) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <StepIntro title="Which journey?" hint="Apply a candidate — it becomes the service journey" />
      <div className="grid min-h-0 flex-1 gap-2 sm:grid-cols-2">
        <div className="min-h-0 overflow-y-auto pr-1">
          <div className="space-y-1.5">
            {(workspace?.journeyCandidates ?? []).map((c) => (
              <motion.button
                key={c.id}
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
                whileHover={{ y: -1 }}
                className="w-full rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-left transition hover:border-[var(--gpssa-green)]/40"
              >
                <p className="text-[12px] font-medium text-cream">{c.label}</p>
                <p className="text-[10px] text-white/35">
                  {c.stages.length} stages · {c.source}
                </p>
              </motion.button>
            ))}
            {!workspace?.journeyCandidates?.length && (
              <p className="text-[11px] text-white/35">Set an episode and persona first</p>
            )}
          </div>
        </div>
        <div className="flex min-h-0 flex-col rounded-xl border border-white/[0.05] bg-black/20 p-2">
          <p className="mb-1.5 shrink-0 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
            Current journey
          </p>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <ol className="space-y-1.5">
              {(graph?.stages ?? []).map((s, i) => (
                <li key={s.id} className="flex gap-2 text-[12px]">
                  <span className="font-bold text-[var(--gpssa-green)]">{i + 1}</span>
                  <span className="min-w-0 truncate text-cream">{s.name}</span>
                </li>
              ))}
              {!graph?.stages.length && <p className="text-[11px] text-white/35">Not set yet</p>}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProcessStep({
  graph,
  draft,
  draftSource,
  busy,
  onGenerate,
  onApply,
  setDraft,
}: {
  graph: SpineGraphPayload | null;
  draft: SpineDraft | null;
  draftSource: string | null;
  busy: boolean;
  onGenerate: () => void;
  onApply: () => void;
  setDraft: (d: SpineDraft | null) => void;
}) {
  const sop = graph?.processes[0]?.sop ?? null;
  return (
    <div className="flex h-full min-h-0 flex-col">
      <StepIntro title="Draft the process" hint="Agentic SOP draft — amend, then apply" />
      <div className="mb-2 flex shrink-0 justify-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={onGenerate}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--gpssa-green)]/40 bg-[var(--gpssa-green)]/15 px-3 py-1.5 text-[12px] font-semibold text-[var(--gpssa-green)] transition hover:bg-[var(--gpssa-green)]/25"
        >
          <Sparkles size={12} /> {draft ? "Redraft" : "Draft with AI"}
        </button>
        {draft && (
          <button
            type="button"
            disabled={busy}
            onClick={onApply}
            className="rounded-lg bg-[var(--gpssa-green)] px-3 py-1.5 text-[12px] font-semibold text-[#071322] transition hover:brightness-110"
          >
            Apply
          </button>
        )}
      </div>
      <div className="grid min-h-0 flex-1 gap-2 sm:grid-cols-2">
        <div className="flex min-h-0 flex-col rounded-xl border border-white/[0.05] bg-black/20 p-2">
          <p className="mb-1.5 shrink-0 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
            {draftSource ? `Draft · ${draftSource}` : "Draft"}
          </p>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {!draft ? (
              <p className="text-[11px] text-white/40">No draft yet</p>
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
          </div>
        </div>
        <div className="flex min-h-0 flex-col rounded-xl border border-white/[0.05] bg-black/20 p-2">
          <p className="mb-1.5 shrink-0 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
            Live SOP
          </p>
          <div className="min-h-0 flex-1 overflow-y-auto">
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
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewStep({
  serviceId,
  serviceName,
  graph,
  workspace,
  eligibleEpisodes,
  done,
}: {
  serviceId: string;
  serviceName: string;
  graph: SpineGraphPayload | null;
  workspace: Workspace | null;
  eligibleEpisodes: Workspace["episodes"];
  done: Record<WizardStep, boolean>;
}) {
  const persona = workspace?.persona;
  const episode = eligibleEpisodes.find((e) => e.isActive);
  const sop = graph?.processes[0]?.sop;
  const rows: { label: string; value: string; ok: boolean }[] = [
    { label: "Persona", value: persona?.name ?? "Not set", ok: done.persona },
    { label: "Episode", value: episode?.name ?? "Not set", ok: done.episode },
    {
      label: "Journey",
      value: graph?.stages.length ? `${graph.stages.length} stages` : "Not set",
      ok: done.journey,
    },
    {
      label: "Process",
      value: sop ? `${sop.title} · ${sop.steps.length} steps` : "Not applied",
      ok: done.process,
    },
    {
      label: "QA",
      value: graph?.quality.scorecards.length
        ? `${graph.quality.scorecards.length} scorecards`
        : "Via QA module",
      ok: Boolean(graph?.quality.scorecards.length),
    },
  ];
  return (
    <div className="flex h-full min-h-0 flex-col">
      <StepIntro title={serviceName} hint="Spine setup summary" />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-md space-y-1.5">
          {rows.map((r) => (
            <div
              key={r.label}
              className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
            >
              <span className="text-[11px] uppercase tracking-[0.12em] text-white/40">
                {r.label}
              </span>
              <span className="flex items-center gap-2 text-[12px] text-cream">
                {r.value}
                <span
                  className={`h-2 w-2 rounded-full ${
                    r.ok ? "bg-[var(--gpssa-green)]" : "bg-white/15"
                  }`}
                />
              </span>
            </div>
          ))}
          <div className="flex justify-center gap-2 pt-2">
            <Link
              href={`/dashboard/services/operating/${serviceId}`}
              className="rounded-lg bg-[var(--gpssa-green)]/90 px-3 py-1.5 text-[11px] font-semibold text-[#071322] hover:brightness-110"
            >
              Open blueprint
            </Link>
            <Link
              href="/dashboard/quality/scorecards"
              className="rounded-lg border border-white/10 px-3 py-1.5 text-[11px] text-white/60 hover:text-cream"
            >
              QA scorecards
            </Link>
            <Link
              href="/dashboard/fulfilment/cases"
              className="rounded-lg border border-white/10 px-3 py-1.5 text-[11px] text-white/60 hover:text-cream"
            >
              Cases
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function WizardChip({
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
