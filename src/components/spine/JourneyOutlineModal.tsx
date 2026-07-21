"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Check, Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import {
  stagesEqual,
  type JourneyCandidate,
  type OutlineStage,
} from "@/lib/spine/journey-outline";

/**
 * Journey act — choose a candidate (if multiple), amend outline, apply.
 */
export function JourneyOutlineModal({
  isOpen,
  onClose,
  candidates,
  stages: initialStages,
  source: initialSource,
  appliedStages,
  busy,
  onApply,
}: {
  isOpen: boolean;
  onClose: () => void;
  candidates: JourneyCandidate[];
  stages: OutlineStage[];
  source: string;
  appliedStages: OutlineStage[];
  busy: boolean;
  onApply: (stages: OutlineStage[], source: string) => Promise<void>;
}) {
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [stages, setStages] = useState<OutlineStage[]>(initialStages);
  const [source, setSource] = useState(initialSource);
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showChooser = candidates.length > 1 && !pickedId;

  useEffect(() => {
    if (!isOpen) return;
    setConfirmOverwrite(false);
    setError(null);
    if (candidates.length > 1) {
      setPickedId(null);
      setStages(initialStages.length ? initialStages : candidates[0]?.stages ?? []);
      setSource(initialSource || candidates[0]?.source || "library");
    } else {
      const only = candidates[0];
      setPickedId(only?.id ?? "single");
      setStages(
        initialStages.length
          ? initialStages
          : only?.stages?.length
            ? only.stages
            : [{ name: "New stage", actor: "agent" }]
      );
      setSource(initialSource || only?.source || "library");
    }
  }, [isOpen, candidates, initialStages, initialSource]);

  const unchangedFromApplied = useMemo(
    () => appliedStages.length > 0 && stagesEqual(stages, appliedStages),
    [stages, appliedStages]
  );

  function pickCandidate(c: JourneyCandidate) {
    setPickedId(c.id);
    setStages(c.stages);
    setSource(c.source);
    setConfirmOverwrite(false);
    setError(null);
  }

  function update(i: number, patch: Partial<OutlineStage>) {
    setStages((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], ...patch };
      return next;
    });
  }

  function move(i: number, delta: number) {
    const j = i + delta;
    if (j < 0 || j >= stages.length) return;
    setStages((prev) => {
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function submit() {
    if (!stages.length || stages.every((s) => !s.name.trim())) {
      setError("Add at least one named stage");
      return;
    }
    const differs =
      appliedStages.length > 0 && !stagesEqual(stages, appliedStages);
    if (differs && !confirmOverwrite) {
      setConfirmOverwrite(true);
      return;
    }
    setError(null);
    await onApply(
      stages.map((s) => ({
        name: s.name.trim(),
        actor: s.actor.trim() || "agent",
        outcome: s.outcome?.trim() || undefined,
      })),
      source === "applied" ? "custom" : source
    );
  }

  const ctaLabel = confirmOverwrite
    ? "Replace & apply journey"
    : unchangedFromApplied
      ? "Confirm journey"
      : appliedStages.length
        ? "Apply journey"
        : "Apply journey";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={showChooser ? "Choose a journey" : "Journey outline"}
      description="Continues from Episode"
      size="2xl"
    >
      <div className="max-h-[60vh] min-h-[280px] space-y-3 overflow-y-auto pr-1">
        {showChooser ? (
          <ul className="grid gap-2 sm:grid-cols-2">
            {candidates.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => pickCandidate(c)}
                  className="w-full rounded-xl border border-white/[0.08] bg-black/20 px-3 py-3 text-left transition hover:border-[var(--gpssa-green)]/40 hover:bg-[var(--gpssa-green)]/5"
                >
                  <p className="text-[12px] font-semibold text-cream">{c.label}</p>
                  <p className="mt-0.5 text-[10px] text-white/35">
                    {c.source} · {c.stages.length} stages
                  </p>
                  <p className="mt-1.5 line-clamp-2 text-[10px] text-white/45">
                    {c.stages
                      .slice(0, 3)
                      .map((s) => s.name)
                      .join(" → ")}
                    {c.stages.length > 3 ? "…" : ""}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <>
            {candidates.length > 1 && (
              <button
                type="button"
                disabled={busy}
                onClick={() => setPickedId(null)}
                className="text-[11px] text-[var(--gpssa-green)] hover:underline"
              >
                ← Other journeys for this episode
              </button>
            )}

            <div className="rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
                Outline · {source}
              </p>
              <p className="text-[11px] text-white/45">
                Amend stages, then apply to store the journey on this episode.
              </p>
            </div>

            {confirmOverwrite && (
              <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-100/90">
                This outline differs from the applied journey. Confirm to replace it.
              </p>
            )}

            <ul className="space-y-1.5">
              {stages.map((st, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-1.5"
                >
                  <div className="flex items-center gap-1">
                    <span className="w-4 shrink-0 text-center text-[10px] font-bold text-white/30">
                      {i + 1}
                    </span>
                    <input
                      className="min-w-0 flex-1 rounded border border-white/10 bg-black/30 px-1.5 py-1 text-[11px] font-medium text-cream"
                      value={st.name}
                      disabled={busy}
                      onChange={(e) => update(i, { name: e.target.value })}
                      aria-label={`Stage ${i + 1} name`}
                    />
                    <select
                      className="shrink-0 rounded border border-white/10 bg-black/30 px-1 py-1 text-[10px] text-white/70"
                      value={st.actor}
                      disabled={busy}
                      onChange={(e) => update(i, { actor: e.target.value })}
                      aria-label={`Stage ${i + 1} actor`}
                    >
                      <option value="customer">customer</option>
                      <option value="agent">agent</option>
                      <option value="employer">employer</option>
                      <option value="system">system</option>
                    </select>
                    <button
                      type="button"
                      disabled={busy || i === 0}
                      onClick={() => move(i, -1)}
                      className="shrink-0 rounded p-1 text-white/25 hover:text-white/60 disabled:opacity-30"
                    >
                      <ArrowUp size={11} />
                    </button>
                    <button
                      type="button"
                      disabled={busy || i === stages.length - 1}
                      onClick={() => move(i, 1)}
                      className="shrink-0 rounded p-1 text-white/25 hover:text-white/60 disabled:opacity-30"
                    >
                      <ArrowDown size={11} />
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        setStages((prev) => prev.filter((_, idx) => idx !== i))
                      }
                      className="shrink-0 rounded p-1 text-white/25 hover:text-red-400"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                  <input
                    className="mt-1 w-full rounded border border-white/[0.06] bg-black/20 px-1.5 py-1 text-[10px] text-white/55"
                    value={st.outcome ?? ""}
                    disabled={busy}
                    placeholder="Outcome…"
                    onChange={(e) => update(i, { outcome: e.target.value })}
                    aria-label={`Stage ${i + 1} outcome`}
                  />
                </li>
              ))}
            </ul>

            <button
              type="button"
              disabled={busy}
              onClick={() =>
                setStages((prev) => [
                  ...prev,
                  { name: "New stage", actor: "agent", outcome: "" },
                ])
              }
              className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-white/15 px-2 py-1.5 text-[11px] text-white/45 hover:border-[var(--gpssa-green)]/40 hover:text-[var(--gpssa-green)]"
            >
              <Plus size={11} /> Add stage
            </button>

            {error && <p className="text-center text-[11px] text-red-400">{error}</p>}

            <div className="flex justify-center">
              <button
                type="button"
                disabled={busy || !stages.length}
                onClick={() => void submit()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--gpssa-green)] px-4 py-2 text-[12px] font-semibold text-[#071322] transition hover:brightness-110 disabled:opacity-40"
              >
                <Check size={12} />
                {ctaLabel}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
