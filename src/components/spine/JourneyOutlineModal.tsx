"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Check, Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import type { OutlineStage } from "@/lib/spine/journey-outline";

/**
 * Journey act — editable stage outline (auto-built after episode).
 * Confirm applies stages permanently via apply-journey.
 */
export function JourneyOutlineModal({
  isOpen,
  onClose,
  stages: initialStages,
  source,
  hasAppliedJourney,
  busy,
  onApply,
}: {
  isOpen: boolean;
  onClose: () => void;
  stages: OutlineStage[];
  source: string;
  hasAppliedJourney: boolean;
  busy: boolean;
  onApply: (stages: OutlineStage[], source: string) => Promise<void>;
}) {
  const [stages, setStages] = useState<OutlineStage[]>(initialStages);
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStages(initialStages.length ? initialStages : [{ name: "New stage", actor: "agent" }]);
      setConfirmOverwrite(false);
      setError(null);
    }
  }, [isOpen, initialStages]);

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
    if (hasAppliedJourney && !confirmOverwrite) {
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Journey outline" size="2xl">
      <div className="max-h-[60vh] min-h-[280px] space-y-3 overflow-y-auto pr-1">
        <div className="rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
            Auto-outline · {source}
          </p>
          <p className="text-[11px] text-white/45">
            Amend stages, then apply to store the journey on this episode.
          </p>
        </div>

        {hasAppliedJourney && confirmOverwrite && (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-100/90">
            A journey is already applied. Confirm again to replace it.
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
                  onClick={() => setStages((prev) => prev.filter((_, idx) => idx !== i))}
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
            setStages((prev) => [...prev, { name: "New stage", actor: "agent", outcome: "" }])
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
            {confirmOverwrite ? "Replace & apply journey" : "Apply journey"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
