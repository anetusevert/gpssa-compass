"use client";

import { useEffect, useState } from "react";
import { NotebookPen, Save } from "lucide-react";

interface WorkshopCaptureProps {
  entityType: "service" | "pilot-set" | "general";
  entityId?: string;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function WorkshopCapture({
  entityType,
  entityId,
  label = "Workshop notes",
  placeholder = "What we know / don’t know — capture in the room…",
  className = "",
}: WorkshopCaptureProps) {
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const qs = new URLSearchParams({ entityType });
    if (entityId) qs.set("entityId", entityId);
    fetch(`/api/engagement/captures?${qs}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: { body?: string; updatedAt?: string }[]) => {
        if (Array.isArray(rows) && rows[0]?.body) {
          setBody(rows[0].body);
          setSavedAt(rows[0].updatedAt ?? null);
        }
      })
      .catch(() => {});
  }, [entityType, entityId]);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/engagement/captures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, entityId, body }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Save failed");
      }
      const row = await res.json();
      setSavedAt(row.updatedAt ?? new Date().toISOString());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={`rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 ${className}`}
      data-tour="compass-workshop-capture"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
          <NotebookPen size={12} className="text-[var(--gpssa-green)]" />
          {label}
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving || !body.trim()}
          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-medium text-cream/80 hover:bg-white/[0.08] disabled:opacity-40"
        >
          <Save size={11} />
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder={placeholder}
        className="w-full resize-y rounded-lg border border-white/[0.06] bg-black/20 px-2.5 py-2 text-[12px] text-cream placeholder:text-white/25 focus:border-[var(--gpssa-green)]/40 focus:outline-none"
      />
      <div className="mt-1 flex items-center justify-between text-[9px] text-white/30">
        <span>{error ?? (savedAt ? `Saved ${new Date(savedAt).toLocaleString()}` : "Editors can persist notes")}</span>
      </div>
    </div>
  );
}
