"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, GitBranch, Star } from "lucide-react";
import type { SpineGraphPayload, SpineNodeId, SpineServiceListItem } from "@/lib/spine/types";

const EASE = [0.16, 1, 0.3, 1] as const;

const NODE_ORDER: SpineNodeId[] = ["episode", "journey", "process", "systems", "qa"];

const SHORT_LABEL: Record<SpineNodeId, string> = {
  episode: "Episode",
  journey: "Journey",
  process: "Process",
  systems: "Systems",
  qa: "QA",
};

export function OperatingSpine({
  className = "",
  initialServiceId,
  lockService = false,
  /** hero = landing primary stage with full inspector */
  variant = "hero",
}: {
  className?: string;
  initialServiceId?: string;
  lockService?: boolean;
  variant?: "hero" | "embedded";
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [services, setServices] = useState<SpineServiceListItem[]>([]);
  const [serviceId, setServiceId] = useState<string>(initialServiceId ?? "");
  const [graph, setGraph] = useState<SpineGraphPayload | null>(null);
  const [selected, setSelected] = useState<SpineNodeId | null>("episode");
  const [hovered, setHovered] = useState<SpineNodeId | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const active = hovered ?? selected;

  useEffect(() => {
    if (initialServiceId) setServiceId(initialServiceId);
  }, [initialServiceId]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/spine/services")
      .then(async (r) => {
        if (!r.ok) throw new Error(`Spine list failed (${r.status})`);
        return r.json();
      })
      .then((rows: SpineServiceListItem[]) => {
        if (cancelled) return;
        const list = Array.isArray(rows) ? rows : [];
        setServices(list);
        if (initialServiceId && list.some((s) => s.id === initialServiceId)) {
          setServiceId(initialServiceId);
          return;
        }
        if (!lockService) {
          const gold = list.find((s) => s.isGoldPath) ?? list[0];
          if (gold) setServiceId(gold.id);
        }
      })
      .catch((e: Error) => {
        if (!cancelled) setLoadError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initialServiceId, lockService]);

  useEffect(() => {
    if (!serviceId) return;
    let cancelled = false;
    setGraph(null);
    fetch(`/api/spine/${serviceId}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`Spine graph failed (${r.status})`);
        return r.json();
      })
      .then((g: SpineGraphPayload) => {
        if (cancelled) return;
        setGraph(g);
        setLoadError(null);
        const firstLit = g.nodes.find((n) => n.lit)?.id ?? "episode";
        setSelected(firstLit);
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setGraph(null);
          setLoadError(e.message);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [serviceId]);

  const litSet = useMemo(() => {
    if (!graph) return new Set<SpineNodeId>();
    if (active) {
      const set = new Set<SpineNodeId>([active]);
      for (const e of graph.edges) {
        if (e.lit && (e.from === active || e.to === active)) {
          set.add(e.from);
          set.add(e.to);
        }
      }
      return set;
    }
    return new Set(graph.nodes.filter((n) => n.lit).map((n) => n.id));
  }, [graph, active]);

  const onSelect = useCallback((id: SpineNodeId) => {
    setSelected((prev) => (prev === id ? prev : id));
  }, []);

  if (loading) {
    return (
      <div
        className={`flex min-h-[200px] items-center justify-center rounded-2xl border border-white/[0.06] bg-black/20 text-[12px] text-white/40 ${className}`}
      >
        Loading operating spine…
      </div>
    );
  }

  if (loadError || !services.length || !graph) {
    return (
      <div
        className={`rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] px-4 py-8 text-center ${className}`}
      >
        <p className="text-[13px] text-white/50">
          {loadError ?? "No operating spine data yet."}
        </p>
        <p className="mt-1 text-[12px] text-white/35">
          Redeploy runs seed automatically. Gold path: End of Service – Civil.
        </p>
      </div>
    );
  }

  const hero = variant === "hero";

  return (
    <section
      className={`relative flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] via-white/[0.02] to-transparent ${
        hero ? "px-4 py-4 sm:px-6 sm:py-5" : "px-4 py-4"
      } ${className}`}
      data-tour="compass-operating-spine"
    >
      {/* Header */}
      <div className="mb-4 flex shrink-0 flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-[var(--gpssa-green)]">
            <GitBranch size={11} />
            Service operating spine
            {graph.isGoldPath && (
              <span className="ml-1 inline-flex items-center gap-0.5 rounded bg-amber-500/15 px-1.5 py-0.5 text-[8px] tracking-[0.14em] text-amber-200/90">
                <Star size={8} /> Gold path
              </span>
            )}
          </div>
          <p className="mt-1 max-w-xl text-[12px] text-white/40">
            Click a node to inspect. {graph.service.name}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!lockService && (
            <select
              value={serviceId}
              onChange={(e) => {
                setServiceId(e.target.value);
                setHovered(null);
              }}
              className="max-w-[220px] truncate rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-[11px] text-cream"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.isGoldPath ? "★ " : ""}
                  {s.name}
                </option>
              ))}
            </select>
          )}
          <Link
            href={`/dashboard/services/operating/${serviceId}`}
            className="inline-flex items-center gap-1 rounded-lg bg-[var(--gpssa-green)] px-3 py-1.5 text-[11px] font-semibold text-[#071322] transition hover:brightness-110"
          >
            Open blueprint
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Nodes — short labels, no overflow */}
      <div className="relative mx-auto w-full max-w-3xl shrink-0 px-2 pt-1">
        <div className="absolute left-[10%] right-[10%] top-[22px] h-px bg-white/10" />
        <div className="absolute left-[10%] right-[10%] top-[22px] flex h-px">
          {NODE_ORDER.slice(0, -1).map((id, i) => {
            const edge = graph.edges.find((e) => e.from === id);
            const lit = edge?.lit && litSet.has(id) && litSet.has(NODE_ORDER[i + 1]);
            return (
              <div
                key={id}
                className="h-full flex-1 transition-colors duration-300"
                style={{
                  background: lit
                    ? "linear-gradient(90deg, var(--gpssa-green), rgba(0,168,107,0.25))"
                    : "transparent",
                }}
              />
            );
          })}
        </div>

        <div className="relative flex justify-between">
          {NODE_ORDER.map((id, i) => {
            const node = graph.nodes.find((n) => n.id === id)!;
            const isLit = litSet.has(id);
            const isSelected = selected === id;
            const isDim = active !== null && !isLit;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelect(id)}
                onMouseEnter={() => setHovered(id)}
                onMouseLeave={() => setHovered(null)}
                className="group relative z-[1] flex w-[18%] min-w-0 flex-col items-center gap-2"
                style={{ opacity: isDim ? 0.3 : 1 }}
                aria-pressed={isSelected}
              >
                <motion.span
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-[12px] font-bold transition ${
                    node.lit
                      ? isSelected
                        ? "bg-[var(--gpssa-green)] text-[#071322] shadow-[0_0_32px_rgba(0,168,107,0.5)] ring-2 ring-white/30"
                        : "bg-[var(--gpssa-green)] text-[#071322] shadow-[0_0_24px_rgba(0,168,107,0.35)]"
                      : "bg-white/[0.04] text-white/35 ring-1 ring-white/10"
                  }`}
                  animate={
                    !reduceMotion && isSelected
                      ? { scale: [1, 1.06, 1] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 1.2, ease: EASE }}
                >
                  {i + 1}
                </motion.span>
                <span
                  className={`w-full truncate text-center text-[10px] font-semibold uppercase tracking-[0.14em] ${
                    isSelected || node.lit ? "text-cream" : "text-white/30"
                  }`}
                >
                  {SHORT_LABEL[id]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Inspector — outside node hover zone so Open works */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={`${serviceId}-${selected}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.28, ease: EASE }}
            className={`mt-4 min-h-0 flex-1 rounded-xl border border-white/[0.07] bg-black/30 ${
              hero ? "overflow-y-auto p-4" : "p-3"
            }`}
          >
            <NodeInspector
              graph={graph}
              nodeId={selected}
              dense={!hero}
              onNavigate={(href) => router.push(href)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-3 flex shrink-0 flex-wrap gap-x-3 gap-y-1 text-[10px] text-white/35">
        <span>
          {graph.fulfilment.cases.length} cases · {graph.fulfilment.breachCount} breaches
        </span>
        <span>·</span>
        <span>{graph.quality.capas.length} CAPAs</span>
        <span>·</span>
        <span>
          {graph.processes.reduce(
            (n, p) => n + (p.sop?.steps.filter((s) => s.qaCheckpoint).length ?? 0),
            0
          )}{" "}
          QA checkpoints
        </span>
        <span>·</span>
        <span className="text-white/25">Seed rehearsal — not live Ma&apos;ashi</span>
      </div>
    </section>
  );
}

function NodeInspector({
  graph,
  nodeId,
  dense,
  onNavigate,
}: {
  graph: SpineGraphPayload;
  nodeId: SpineNodeId;
  dense: boolean;
  onNavigate: (href: string) => void;
}) {
  const blueprint = `/dashboard/services/operating/${graph.service.id}`;

  if (nodeId === "episode") {
    return (
      <InspectorShell
        title={graph.episode?.name ?? "No episode"}
        subtitle="Customer life event that triggers this service"
        ctaLabel="Full blueprint"
        ctaHref={blueprint}
        onNavigate={onNavigate}
      >
        <p className="text-[12px] leading-relaxed text-white/50">
          {graph.episode?.description ?? "Seed an episode for this service."}
        </p>
      </InspectorShell>
    );
  }

  if (nodeId === "journey") {
    return (
      <InspectorShell
        title={`${graph.stages.length} journey stages`}
        subtitle="Organisation + customer path"
        ctaLabel="Open blueprint"
        ctaHref={`${blueprint}#journey`}
        onNavigate={onNavigate}
      >
        {graph.stages.length === 0 ? (
          <p className="text-[12px] text-white/40">No stages seeded.</p>
        ) : (
          <ol className={`flex flex-wrap gap-2 ${dense ? "" : "sm:gap-2.5"}`}>
            {graph.stages.map((s, i) => (
              <li
                key={s.id}
                className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5"
              >
                <span className="text-[10px] font-bold text-[var(--gpssa-green)]">{i + 1}</span>
                <p className="text-[11px] font-medium text-cream">{s.name}</p>
                {!dense && s.outcome && (
                  <p className="text-[10px] text-white/35">{s.outcome}</p>
                )}
              </li>
            ))}
          </ol>
        )}
      </InspectorShell>
    );
  }

  if (nodeId === "process") {
    const proc = graph.processes[0];
    const sop = proc?.sop;
    return (
      <InspectorShell
        title={sop?.title ?? proc?.name ?? "Process & SOP"}
        subtitle={sop ? `v${sop.version} · back-office runbook with QA checkpoints` : "No SOP"}
        ctaLabel="Open SOP section"
        ctaHref={`${blueprint}#process`}
        onNavigate={onNavigate}
      >
        {!sop ? (
          <p className="text-[12px] text-white/40">No SOP linked.</p>
        ) : (
          <ul className="space-y-1.5">
            {sop.steps.slice(0, dense ? 4 : 8).map((st) => (
              <li
                key={st.id}
                className="flex items-start gap-2 text-[12px] text-cream/90"
              >
                <span className="mt-0.5 w-4 shrink-0 text-[10px] font-bold text-white/30">
                  {st.sortOrder + 1}
                </span>
                <span className="min-w-0">
                  {st.title}
                  {st.qaCheckpoint && (
                    <span className="ml-1.5 rounded bg-[var(--gpssa-green)]/15 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--gpssa-green)]">
                      QA
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </InspectorShell>
    );
  }

  if (nodeId === "systems") {
    const systems = graph.processes.flatMap((p) => p.systems);
    return (
      <InspectorShell
        title={`${systems.length} systems · ${graph.fulfilment.cases.length} cases`}
        subtitle="Where work sits — inventory only, not live integration"
        ctaLabel="Case board"
        ctaHref="/dashboard/fulfilment/cases"
        onNavigate={onNavigate}
      >
        <div className="mb-2 flex flex-wrap gap-1.5">
          {systems.map((s) => (
            <span
              key={`${s.id}-${s.role}`}
              className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[11px] text-cream"
            >
              {s.name}
              <span className="ml-1 text-white/30">{s.role}</span>
            </span>
          ))}
        </div>
        <ul className="space-y-1">
          {graph.fulfilment.cases.slice(0, dense ? 3 : 5).map((c) => (
            <li key={c.id} className="flex items-center justify-between text-[11px]">
              <span className="font-mono text-cream/90">{c.caseRef}</span>
              <span
                className={
                  c.breached || c.breachRiskLevel === "red"
                    ? "text-red-300/90"
                    : "text-white/40"
                }
              >
                {c.breached ? "breached" : c.breachRiskLevel} · {c.status}
              </span>
            </li>
          ))}
        </ul>
      </InspectorShell>
    );
  }

  return (
    <InspectorShell
      title={`${graph.quality.scorecards.length} scorecards · ${graph.quality.capas.length} CAPAs`}
      subtitle={`${graph.quality.reviewCount} reviews · ${graph.quality.defects.length} defects — process QA, not software QA`}
      ctaLabel="CAPA board"
      ctaHref="/dashboard/quality/capa"
      onNavigate={onNavigate}
    >
      {graph.quality.capas.length === 0 ? (
        <p className="text-[12px] text-white/40">No CAPAs on this service yet.</p>
      ) : (
        <ul className="space-y-1.5">
          {graph.quality.capas.map((c) => (
            <li key={c.id} className="text-[12px] text-cream">
              {c.title}{" "}
              <span className="text-white/35">({c.status})</span>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={() => onNavigate("/dashboard/quality/scorecards")}
        className="mt-2 text-[11px] text-[var(--gpssa-green)] hover:underline"
      >
        Open scorecards →
      </button>
    </InspectorShell>
  );
}

function InspectorShell({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  onNavigate,
  children,
}: {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  onNavigate: (href: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-[14px] font-semibold text-cream">{title}</h3>
          <p className="mt-0.5 text-[11px] text-white/40">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate(ctaHref)}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[var(--gpssa-green)]/35 bg-[var(--gpssa-green)]/10 px-2.5 py-1.5 text-[11px] font-semibold text-[var(--gpssa-green)] hover:bg-[var(--gpssa-green)]/20"
        >
          {ctaLabel}
          <ArrowRight size={12} />
        </button>
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
