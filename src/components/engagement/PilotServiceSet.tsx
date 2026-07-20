"use client";

import { useEffect, useState } from "react";
import { Target } from "lucide-react";

const STORAGE_KEY = "gpssa_pilot_services_v1";

/** Explicit pilot service set for QA / fulfilment Lock phase. */
export function PilotServiceSet({ className = "" }: { className?: string }) {
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/engagement/captures?entityType=pilot-set&entityId=default")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: { body?: string }[]) => {
        if (Array.isArray(rows) && rows[0]?.body) {
          setText(rows[0].body);
          return;
        }
        const local = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
        if (local) setText(local);
      })
      .catch(() => {
        const local = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
        if (local) setText(local);
      });
  }, []);

  async function save() {
    localStorage.setItem(STORAGE_KEY, text);
    try {
      await fetch("/api/engagement/captures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: "pilot-set",
          entityId: "default",
          body: text,
        }),
      });
    } catch {
      /* local fallback already saved */
    }
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div
      className={`rounded-xl border border-teal-500/25 bg-teal-500/[0.06] p-4 ${className}`}
      data-tour="compass-pilot-set"
    >
      <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-200/90">
        <Target size={13} />
        Pilot service set (B3)
      </div>
      <p className="mb-2 text-[11px] text-white/45">
        Name the services in the QA / fulfilment pilot before sector rollout. One per line.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder={"e.g.\nEnd of Service Benefits\nPension Certificate\nComplaint Handling"}
        className="w-full resize-y rounded-lg border border-white/[0.08] bg-black/25 px-2.5 py-2 text-[12px] text-cream placeholder:text-white/25 focus:border-teal-400/40 focus:outline-none"
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[9px] text-white/30">
          {saved ? "Saved" : "Used in Lock phase reviews"}
        </span>
        <button
          type="button"
          onClick={save}
          className="rounded-lg border border-teal-400/30 bg-teal-500/15 px-2.5 py-1 text-[10px] font-medium text-teal-100 hover:bg-teal-500/25"
        >
          Save pilot set
        </button>
      </div>
    </div>
  );
}
