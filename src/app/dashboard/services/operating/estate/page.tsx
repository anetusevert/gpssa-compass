"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { PageFrame, TileScroll } from "@/components/ui/PageFrame";
import { EASE, staggerChildren, tileItem } from "@/lib/motion";
import type { MatrixPayload } from "@/lib/spine/estate-types";
import { personas } from "@/data/personas";

export default function SpineEstatePage() {
  const [matrix, setMatrix] = useState<MatrixPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [personaKey, setPersonaKey] = useState("emirati-govt-employee");
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/spine/estate", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setMatrix(data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  async function runGenerate() {
    if (!selected.length) return;
    setBusy(true);
    setMessage(null);
    try {
      const r = await fetch("/api/spine/estate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceIds: selected, personaKey }),
      });
      const data = await r.json();
      if (r.ok) {
        const ok = (data.results as { draftApplied: boolean }[]).filter(
          (x) => x.draftApplied
        ).length;
        setMessage(`Drafted ${ok} service spine(s) — status draft until reviewed.`);
        load();
      } else {
        setMessage(data.error || "Generate failed");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageFrame
      header={
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-2.5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/dashboard/services/operating"
              className="text-white/40 transition hover:text-cream"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="font-playfair text-sm font-bold text-cream sm:text-base">
                Persona × service matrix
              </h1>
              <p className="text-[11px] text-white/40">Draft estate spines (max 3)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={personaKey}
              onChange={(e) => setPersonaKey(e.target.value)}
              className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-[11px] text-cream"
            >
              {personas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={busy || !selected.length}
              onClick={runGenerate}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--gpssa-green)] px-3 py-1.5 text-[11px] font-semibold text-[#071322] disabled:opacity-40"
            >
              {busy ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              Draft selected
            </button>
          </div>
        </div>
      }
    >
      <TileScroll className="px-4 py-3 sm:px-6">
        {message && (
          <p className="mb-3 rounded-lg border border-[var(--gpssa-green)]/30 bg-[var(--gpssa-green)]/10 px-3 py-2 text-[12px] text-[#9DE5C2]">
            {message}
          </p>
        )}
        {loading || !matrix ? (
          <div className="flex items-center gap-2 text-[12px] text-white/40">
            <Loader2 size={14} className="animate-spin" /> Loading matrix…
          </div>
        ) : (
          <motion.div
            variants={staggerChildren}
            initial="hidden"
            animate="show"
            className="space-y-2"
          >
            <p className="text-[11px] text-white/40">
              Select up to 3 services · persona{" "}
              <span className="text-cream">
                {personas.find((p) => p.id === personaKey)?.name}
              </span>
              . Drafts are labelled — not client fact.
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {matrix.services.map((s) => {
                const cell = matrix.cells.find(
                  (c) => c.serviceId === s.id && c.personaId === personaKey
                );
                const on = selected.includes(s.id);
                return (
                  <motion.button
                    key={s.id}
                    type="button"
                    variants={tileItem}
                    onClick={() => toggle(s.id)}
                    transition={{ duration: 0.3, ease: EASE }}
                    className={`rounded-xl border px-3 py-3 text-left transition ${
                      on
                        ? "border-[var(--gpssa-green)]/50 bg-[var(--gpssa-green)]/10"
                        : "border-white/[0.07] bg-white/[0.02] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[12px] font-medium text-cream">{s.name}</p>
                      {s.isGoldPath && (
                        <span className="shrink-0 text-[9px] uppercase tracking-wider text-amber-200">
                          Gold
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[10px] text-white/35">
                      {cell?.status === "ready"
                        ? "Ready"
                        : cell?.status === "partial"
                          ? "Partial"
                          : "Empty"}{" "}
                      · {cell?.episodeCount ?? 0} episodes
                      {cell?.hasSop ? " · SOP" : ""}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </TileScroll>
    </PageFrame>
  );
}
