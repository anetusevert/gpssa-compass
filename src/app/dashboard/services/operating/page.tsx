"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GitBranch, ArrowRight, Star } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageFrame, TileScroll } from "@/components/ui/PageFrame";
import type { SpineServiceListItem } from "@/lib/spine/types";

export default function OperatingBlueprintsPage() {
  const [services, setServices] = useState<SpineServiceListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/spine/services")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => setServices(Array.isArray(rows) ? rows : []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageFrame
      header={
        <div className="px-6 pt-4 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--gpssa-green)]">
            Service operating spine
          </p>
          <h1 className="font-playfair text-2xl font-bold text-cream">Operating Blueprints</h1>
          <p className="mt-1 text-[12px] text-white/40">
            Episode → journey → process → systems → QA. Gold path lights all five.
          </p>
        </div>
      }
    >
      {loading ? (
        <div className="flex h-full items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <TileScroll className="px-6 pb-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <Link
                key={s.id}
                href={`/dashboard/services/operating/${s.id}`}
                className="group rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 transition hover:border-[var(--gpssa-green)]/35"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="truncate text-[13px] font-semibold text-cream">{s.name}</h2>
                    <p className="text-[11px] text-white/35">{s.category}</p>
                  </div>
                  {s.isGoldPath && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-amber-200">
                      <Star size={9} /> Gold
                    </span>
                  )}
                </div>
                <div className="mb-3 flex flex-wrap gap-1">
                  {(["episode", "journey", "process", "systems", "qa"] as const).map((n) => (
                    <span
                      key={n}
                      className={`rounded px-1.5 py-0.5 text-[9px] uppercase ${
                        s.litNodes.includes(n)
                          ? "bg-[var(--gpssa-green)]/20 text-[var(--gpssa-green)]"
                          : "bg-white/[0.04] text-white/25"
                      }`}
                    >
                      {n}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-[11px] text-white/40">
                  <span className="inline-flex items-center gap-1">
                    <GitBranch size={11} />
                    {s.counts.stages} stages · {s.counts.sopSteps} steps
                  </span>
                  <ArrowRight size={14} className="text-[var(--gpssa-green)] opacity-60" />
                </div>
              </Link>
            ))}
          </div>
        </TileScroll>
      )}
    </PageFrame>
  );
}
