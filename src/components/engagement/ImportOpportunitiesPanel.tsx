"use client";

import { useState } from "react";
import { Upload } from "lucide-react";

const SAMPLE = `title,category,description,impact,effort,status,sourceSection,owner
Digitise EOS certificate,enhancement,Reduce branch visits for certificates,high,medium,identified,§2.3-A3,Service lead
Breach early-warning,fulfilment,Ageing alerts before SLA break,high,high,identified,§2.1,Ops lead
`;

export function ImportOpportunitiesPanel() {
  const [csv, setCsv] = useState(SAMPLE);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function importCsv() {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/engagement/import/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setStatus(`Imported ${data.created} opportunities.`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Import failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
      <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
        <Upload size={13} className="text-[var(--gpssa-green)]" />
        Import opportunities (CSV)
      </div>
      <p className="mb-2 text-[11px] text-white/40">
        Replace gold seed with workshop output. Headers: title, category, description, impact,
        effort, status, sourceSection, owner. Editors only.
      </p>
      <textarea
        value={csv}
        onChange={(e) => setCsv(e.target.value)}
        rows={6}
        className="mb-2 w-full resize-y rounded-lg border border-white/[0.08] bg-black/30 px-2.5 py-2 font-mono text-[11px] text-cream focus:border-[var(--gpssa-green)]/40 focus:outline-none"
      />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={importCsv}
          className="rounded-lg bg-[var(--gpssa-green)]/90 px-3 py-1.5 text-[11px] font-semibold text-[#071322] disabled:opacity-40"
        >
          {busy ? "Importing…" : "Import to backlog"}
        </button>
        <a
          href="/api/engagement/export/pack"
          className="rounded-lg border border-white/15 px-3 py-1.5 text-[11px] text-cream/80 hover:bg-white/[0.06]"
        >
          Download workshop pack
        </a>
        {status && <span className="text-[11px] text-white/50">{status}</span>}
      </div>
    </div>
  );
}
