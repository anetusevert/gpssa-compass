"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Server, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import type { SystemsOutline } from "@/lib/spine/generate";
import type { SpineGraphPayload } from "@/lib/spine/types";

/** Systems act — agent outlines systems from the applied SOP. */
export function SystemsActModal({
  isOpen,
  onClose,
  serviceId,
  graph,
  autoRun = true,
  onApplied,
}: {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  graph: SpineGraphPayload | null;
  autoRun?: boolean;
  onApplied: () => Promise<void>;
}) {
  const [outline, setOutline] = useState<SystemsOutline | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sop = graph?.processes[0]?.sop ?? null;
  const existingSystems = graph?.processes.flatMap((p) => p.systems) ?? [];

  async function runAgent() {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(`/api/spine/${serviceId}/generate-systems`, { method: "POST" });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error ?? "Agent failed");
        return;
      }
      setOutline(data.outline);
      setSource(data.source);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!isOpen) {
      setOutline(null);
      setSource(null);
      setError(null);
      return;
    }
    if (autoRun && sop && !outline) void runAgent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, sop?.id]);

  async function confirmApply() {
    if (!outline) return;
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(`/api/spine/${serviceId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "systems", outline }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error ?? "Apply failed");
        return;
      }
      await onApplied();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Systems — agent outline"
      description="Continues from Process"
      size="lg"
    >
      <div className="max-h-[60vh] min-h-[260px] space-y-3 overflow-y-auto pr-1">
        <div className="rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
            Reads the applied SOP
          </p>
          <p className="text-[12px] text-cream">
            {sop ? `${sop.title} · ${sop.steps.length} steps` : "No SOP applied yet"}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={busy || !sop}
            onClick={() => void runAgent()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--gpssa-green)]/40 bg-[var(--gpssa-green)]/15 px-3 py-1.5 text-[12px] font-semibold text-[var(--gpssa-green)] transition hover:bg-[var(--gpssa-green)]/25 disabled:opacity-40"
          >
            {busy && !outline ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Sparkles size={12} />
            )}
            {outline ? "Re-run agent" : "Run agent outline"}
          </button>
          {outline && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void confirmApply()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--gpssa-green)] px-3 py-1.5 text-[12px] font-semibold text-[#071322] transition hover:brightness-110"
            >
              <Check size={12} /> Confirm & apply
            </button>
          )}
        </div>

        {error && <p className="text-center text-[11px] text-red-400">{error}</p>}

        {outline ? (
          <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
            <p className="mb-1.5 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
              <Server size={10} /> Systems map
              <span className="ml-auto rounded bg-white/[0.06] px-1.5 py-0.5 text-[8px] normal-case tracking-normal text-white/40">
                agent draft · {source}
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
        ) : (
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
              <p className="mt-1 text-[11px] text-white/35">
                {busy ? "Outlining…" : "None linked yet"}
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
