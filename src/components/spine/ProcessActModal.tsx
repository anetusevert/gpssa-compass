"use client";

import { useEffect, useRef } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import type { SpineDraft } from "@/lib/spine/generate";
import type { SpineGraphPayload } from "@/lib/spine/types";
import { ProcessDraftEditor } from "./ProcessDraftEditor";

/** Process act — AI draft from journey stages; amend, then apply process section. */
export function ProcessActModal({
  isOpen,
  onClose,
  graph,
  draft,
  draftSource,
  busy,
  setDraft,
  onGenerate,
  onApply,
}: {
  isOpen: boolean;
  onClose: () => void;
  graph: SpineGraphPayload | null;
  draft: SpineDraft | null;
  draftSource: string | null;
  busy: boolean;
  setDraft: (d: SpineDraft | null) => void;
  onGenerate: () => Promise<void>;
  onApply: () => Promise<void>;
}) {
  const sop = graph?.processes[0]?.sop ?? null;
  const kicked = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      kicked.current = false;
      return;
    }
    if (!draft && !kicked.current) {
      kicked.current = true;
      void onGenerate();
    }
  }, [isOpen, draft, onGenerate]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Process — draft & apply" size="2xl">
      <div className="flex max-h-[65vh] min-h-[320px] flex-col gap-2">
        <div className="flex shrink-0 justify-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void onGenerate()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--gpssa-green)]/40 bg-[var(--gpssa-green)]/15 px-3 py-1.5 text-[12px] font-semibold text-[var(--gpssa-green)] transition hover:bg-[var(--gpssa-green)]/25"
          >
            {busy && !draft ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Sparkles size={12} />
            )}
            {draft ? "Redraft" : "Draft with AI"}
          </button>
          {draft && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void onApply()}
              className="rounded-lg bg-[var(--gpssa-green)] px-3 py-1.5 text-[12px] font-semibold text-[#071322] transition hover:brightness-110"
            >
              Apply process
            </button>
          )}
        </div>

        <div className="grid min-h-0 flex-1 gap-2 overflow-hidden sm:grid-cols-2">
          <div className="flex min-h-0 flex-col rounded-xl border border-white/[0.05] bg-black/20 p-2">
            <p className="mb-1.5 shrink-0 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
              {draftSource
                ? `Draft · ${draftSource} — amend before applying`
                : "Draft from journey"}
            </p>
            <div className="min-h-0 flex-1 overflow-hidden">
              {!draft ? (
                <p className="text-[11px] text-white/40">
                  {busy ? "Drafting from journey stages…" : "No draft yet"}
                </p>
              ) : (
                <ProcessDraftEditor draft={draft} setDraft={setDraft} busy={busy} />
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
    </Modal>
  );
}
