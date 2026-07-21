"use client";

import { useState } from "react";
import { Check, ClipboardCheck, Loader2, Server, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import type { SystemsQaOutline } from "@/lib/spine/generate";
import type { SpineGraphPayload } from "@/lib/spine/types";

/**
 * Act 5 — a second agent reads the applied SOP and outlines the systems map
 * and QA scorecard. Outline stays a labelled draft until the user confirms.
 */
export function SystemsQaActModal({
  isOpen,
  onClose,
  serviceId,
  graph,
  onApplied,
}: {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  graph: SpineGraphPayload | null;
  onApplied: () => Promise<void>;
}) {
  const [outline, setOutline] = useState<SystemsQaOutline | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  const sop = graph?.processes[0]?.sop ?? null;
  const existingSystems = graph?.processes.flatMap((p) => p.systems) ?? [];
  const existingScorecards = graph?.quality.scorecards ?? [];

  async function runAgent() {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(`/api/spine/${serviceId}/generate-systems-qa`, {
        method: "POST",
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error ?? "Agent failed");
        return;
      }
      setOutline(data.outline);
      setSource(data.source);
      setApplied(false);
    } finally {
      setBusy(false);
    }
  }

  async function confirmApply() {
    if (!outline) return;
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(`/api/spine/${serviceId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "systems-qa", outline }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error ?? "Apply failed");
        return;
      }
      setApplied(true);
      await onApplied();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Systems & QA — agent outline" size="2xl">
      <div className="max-h-[60vh] min-h-[300px] space-y-3 overflow-y-auto pr-1">
        <div className="rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
            Reads the applied SOP
          </p>
          <p className="text-[12px] text-cream">
            {sop ? `${sop.title} · ${sop.steps.length} steps` : "No SOP applied yet"}
          </p>
          {!sop && (
            <p className="mt-0.5 text-[10px] text-white/35">
              Apply the process act first — this agent maps systems and QA onto it.
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={busy || !sop}
            onClick={runAgent}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--gpssa-green)]/40 bg-[var(--gpssa-green)]/15 px-3 py-1.5 text-[12px] font-semibold text-[var(--gpssa-green)] transition hover:bg-[var(--gpssa-green)]/25 disabled:opacity-40"
          >
            {busy && !outline ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Sparkles size={12} />
            )}
            {outline ? "Re-run agent" : "Run agent outline"}
          </button>
          {outline && !applied && (
            <button
              type="button"
              disabled={busy}
              onClick={confirmApply}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--gpssa-green)] px-3 py-1.5 text-[12px] font-semibold text-[#071322] transition hover:brightness-110"
            >
              <Check size={12} /> Confirm & apply
            </button>
          )}
        </div>

        {error && <p className="text-center text-[11px] text-red-400">{error}</p>}
        {applied && (
          <p className="text-center text-[11px] text-[var(--gpssa-green)]">
            Applied — systems linked and scorecard created.
          </p>
        )}

        {outline ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
              <p className="mb-1.5 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
                <Server size={10} /> Systems map
                <span className="ml-auto rounded bg-white/[0.06] px-1.5 py-0.5 text-[8px] normal-case tracking-normal text-white/40">
                  {applied ? "applied" : `agent draft · ${source}`}
                </span>
              </p>
              <ul className="space-y-1.5">
                {outline.systems.map((s) => (
                  <li key={s.code} className="text-[12px]">
                    <span className="font-medium text-cream">{s.name}</span>
                    <span className="ml-1.5 text-[10px] text-white/35">
                      {s.kind} · {s.role}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
              <p className="mb-1.5 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
                <ClipboardCheck size={10} /> QA scorecard
              </p>
              <p className="text-[12px] font-medium text-cream">
                {outline.qaApproach.scorecardName}
              </p>
              <p className="mt-0.5 text-[10px] text-white/45">{outline.qaApproach.summary}</p>
              <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/30">
                Checkpoint focus
              </p>
              <ul className="mt-0.5 space-y-0.5">
                {outline.qaApproach.checkpointFocus.map((c, i) => (
                  <li key={i} className="text-[11px] text-white/60">
                    · {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-dashed border-white/[0.08] p-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
                Current systems
              </p>
              {existingSystems.length ? (
                <ul className="mt-1 space-y-1">
                  {existingSystems.map((s) => (
                    <li key={s.id} className="text-[11px] text-white/55">
                      {s.name} · {s.role}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-[11px] text-white/35">None linked yet</p>
              )}
            </div>
            <div className="rounded-xl border border-dashed border-white/[0.08] p-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
                Current scorecards
              </p>
              {existingScorecards.length ? (
                <ul className="mt-1 space-y-1">
                  {existingScorecards.map((s) => (
                    <li key={s.id} className="text-[11px] text-white/55">
                      {s.name} · {s.status}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-[11px] text-white/35">None yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
