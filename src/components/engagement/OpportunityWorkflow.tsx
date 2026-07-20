"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { BacklogItem } from "@/components/roadmap/BacklogTable";

export interface WorkflowItem extends BacklogItem {
  owner?: string | null;
  sourceSection?: string | null;
  decisionLoggedAt?: string | null;
  description?: string | null;
}

interface Props {
  item: WorkflowItem;
  onUpdated: (item: WorkflowItem) => void;
}

export function OpportunityWorkflow({ item, onUpdated }: Props) {
  const [owner, setOwner] = useState(item.owner ?? "");
  const [sourceSection, setSourceSection] = useState(item.sourceSection ?? "");
  const [status, setStatus] = useState(item.status);
  const [busy, setBusy] = useState(false);

  async function patch(data: Record<string, unknown>) {
    setBusy(true);
    try {
      const res = await fetch(`/api/roadmap/backlog/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) return;
      const updated = await res.json();
      onUpdated({
        ...item,
        owner: updated.owner,
        sourceSection: updated.sourceSection,
        status: updated.status,
        decisionLoggedAt: updated.decisionLoggedAt,
      });
      setOwner(updated.owner ?? "");
      setSourceSection(updated.sourceSection ?? "");
      setStatus(updated.status);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-2 grid gap-2 rounded-lg border border-white/[0.06] bg-black/20 p-2.5 sm:grid-cols-4">
      <label className="block text-[9px] uppercase tracking-[0.14em] text-white/35">
        Owner
        <input
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          onBlur={() => {
            if (owner !== (item.owner ?? "")) patch({ owner });
          }}
          disabled={busy}
          className="mt-0.5 w-full rounded border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-cream"
          placeholder="Named owner"
        />
      </label>
      <label className="block text-[9px] uppercase tracking-[0.14em] text-white/35">
        RFP section
        <input
          value={sourceSection}
          onChange={(e) => setSourceSection(e.target.value)}
          onBlur={() => {
            if (sourceSection !== (item.sourceSection ?? "")) patch({ sourceSection });
          }}
          disabled={busy}
          className="mt-0.5 w-full rounded border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-cream"
          placeholder="e.g. §2.3-A3"
        />
      </label>
      <label className="block text-[9px] uppercase tracking-[0.14em] text-white/35">
        Status
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            patch({ status: e.target.value });
          }}
          disabled={busy}
          className="mt-0.5 w-full rounded border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-cream"
        >
          <option value="identified">identified</option>
          <option value="prioritised">prioritised</option>
          <option value="approved">approved</option>
          <option value="in-delivery">in-delivery</option>
          <option value="done">done</option>
        </select>
      </label>
      <div className="flex items-end">
        <button
          type="button"
          disabled={busy || Boolean(item.decisionLoggedAt)}
          onClick={() => patch({ logDecision: true })}
          className={`inline-flex w-full items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
            item.decisionLoggedAt
              ? "bg-[var(--gpssa-green)]/20 text-[#9DE5C2]"
              : "border border-white/15 bg-white/[0.05] text-cream hover:bg-white/[0.1]"
          }`}
        >
          <CheckCircle2 size={12} />
          {item.decisionLoggedAt ? "Decision logged" : "Log decision"}
        </button>
      </div>
    </div>
  );
}
