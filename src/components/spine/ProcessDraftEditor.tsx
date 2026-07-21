"use client";

import { ArrowDown, ArrowUp, Plus, ShieldCheck, Trash2 } from "lucide-react";
import type { SpineDraft } from "@/lib/spine/generate";

/**
 * Editable AI process draft — rename, edit instruction, toggle QA checkpoint,
 * reorder, delete, add. All local; parent owns the draft state and apply.
 */
export function ProcessDraftEditor({
  draft,
  setDraft,
  busy,
}: {
  draft: SpineDraft;
  setDraft: (d: SpineDraft) => void;
  busy: boolean;
}) {
  function updateStep(i: number, patch: Partial<SpineDraft["steps"][number]>) {
    const steps = [...draft.steps];
    steps[i] = { ...steps[i], ...patch };
    setDraft({ ...draft, steps });
  }

  function moveStep(i: number, delta: number) {
    const j = i + delta;
    if (j < 0 || j >= draft.steps.length) return;
    const steps = [...draft.steps];
    [steps[i], steps[j]] = [steps[j], steps[i]];
    setDraft({ ...draft, steps });
  }

  function removeStep(i: number) {
    setDraft({ ...draft, steps: draft.steps.filter((_, idx) => idx !== i) });
  }

  function addStep() {
    setDraft({
      ...draft,
      steps: [
        ...draft.steps,
        {
          title: "New step",
          instruction: "",
          qaCheckpoint: false,
        },
      ],
    });
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-1.5">
      <input
        className="w-full shrink-0 rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-[12px] font-semibold text-cream"
        value={draft.processName}
        disabled={busy}
        onChange={(e) => setDraft({ ...draft, processName: e.target.value })}
        aria-label="Process name"
      />
      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
        {draft.steps.map((st, i) => (
          <div
            key={i}
            className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-1.5"
          >
            <div className="flex items-center gap-1">
              <span className="w-4 shrink-0 text-center text-[10px] font-bold text-white/30">
                {i + 1}
              </span>
              <input
                className="min-w-0 flex-1 rounded border border-white/10 bg-black/30 px-1.5 py-1 text-[11px] font-medium text-cream"
                value={st.title}
                disabled={busy}
                onChange={(e) => updateStep(i, { title: e.target.value })}
                aria-label={`Step ${i + 1} title`}
              />
              <button
                type="button"
                disabled={busy}
                onClick={() => updateStep(i, { qaCheckpoint: !st.qaCheckpoint })}
                title={st.qaCheckpoint ? "QA checkpoint on" : "Mark as QA checkpoint"}
                className={`shrink-0 rounded p-1 transition ${
                  st.qaCheckpoint
                    ? "bg-[var(--gpssa-green)]/20 text-[var(--gpssa-green)]"
                    : "text-white/25 hover:text-white/60"
                }`}
              >
                <ShieldCheck size={12} />
              </button>
              <button
                type="button"
                disabled={busy || i === 0}
                onClick={() => moveStep(i, -1)}
                className="shrink-0 rounded p-1 text-white/25 transition hover:text-white/60 disabled:opacity-30"
                title="Move up"
              >
                <ArrowUp size={11} />
              </button>
              <button
                type="button"
                disabled={busy || i === draft.steps.length - 1}
                onClick={() => moveStep(i, 1)}
                className="shrink-0 rounded p-1 text-white/25 transition hover:text-white/60 disabled:opacity-30"
                title="Move down"
              >
                <ArrowDown size={11} />
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => removeStep(i)}
                className="shrink-0 rounded p-1 text-white/25 transition hover:text-red-400"
                title="Delete step"
              >
                <Trash2 size={11} />
              </button>
            </div>
            <textarea
              className="mt-1 w-full resize-none rounded border border-white/[0.06] bg-black/20 px-1.5 py-1 text-[10px] leading-snug text-white/60"
              rows={2}
              value={st.instruction}
              disabled={busy}
              placeholder="Instruction…"
              onChange={(e) => updateStep(i, { instruction: e.target.value })}
              aria-label={`Step ${i + 1} instruction`}
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={addStep}
        className="inline-flex shrink-0 items-center justify-center gap-1 rounded-lg border border-dashed border-white/15 px-2 py-1.5 text-[11px] text-white/45 transition hover:border-[var(--gpssa-green)]/40 hover:text-[var(--gpssa-green)]"
      >
        <Plus size={11} /> Add step
      </button>
    </div>
  );
}
