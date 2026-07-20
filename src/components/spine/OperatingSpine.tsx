"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, GitBranch } from "lucide-react";
import type { SpineGraphPayload, SpineNodeId, SpineServiceListItem } from "@/lib/spine/types";

const EASE = [0.16, 1, 0.3, 1] as const;

const NODE_ORDER: SpineNodeId[] = ["episode", "journey", "process", "systems", "qa"];

export function OperatingSpine({
  compact = false,
  className = "",
  initialServiceId,
  lockService = false,
}: {
  compact?: boolean;
  className?: string;
  /** Prefer this service when the list loads (e.g. blueprint page). */
  initialServiceId?: string;
  /** Hide the service selector and keep the initial id. */
  lockService?: boolean;
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [services, setServices] = useState<SpineServiceListItem[]>([]);
  const [serviceId, setServiceId] = useState<string>(initialServiceId ?? "");
  const [graph, setGraph] = useState<SpineGraphPayload | null>(null);
  const [active, setActive] = useState<SpineNodeId | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialServiceId) setServiceId(initialServiceId);
  }, [initialServiceId]);

  useEffect(() => {
    fetch("/api/spine/services")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: SpineServiceListItem[]) => {
        setServices(Array.isArray(rows) ? rows : []);
        if (initialServiceId && rows.some((s) => s.id === initialServiceId)) {
          setServiceId(initialServiceId);
          return;
        }
        if (!lockService) {
          const gold = rows.find((s) => s.isGoldPath) ?? rows[0];
          if (gold) setServiceId(gold.id);
        }
      })
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, [initialServiceId, lockService]);

  useEffect(() => {
    if (!serviceId) return;
    let cancelled = false;
    fetch(`/api/spine/${serviceId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((g) => {
        if (!cancelled) setGraph(g);
      })
      .catch(() => {
        if (!cancelled) setGraph(null);
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

  const onNode = useCallback((id: SpineNodeId) => {
    setActive((prev) => (prev === id ? null : id));
  }, []);

  if (loading) {
    return (
      <div className={`rounded-2xl border border-white/[0.06] bg-black/20 px-4 py-6 text-center text-[12px] text-white/40 ${className}`}>
        Loading operating spine…
      </div>
    );
  }

  if (!services.length || !graph) {
    return (
      <div className={`rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] px-4 py-5 text-center ${className}`}>
        <p className="text-[12px] text-white/45">
          No operating spine seeded yet. Run <code className="text-cream">npm run db:seed</code> to light End of Service – Civil.
        </p>
      </div>
    );
  }

  return (
    <section
      className={`relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent ${compact ? "px-3 py-3" : "px-4 py-4 sm:px-5 sm:py-5"} ${className}`}
      data-tour="compass-operating-spine"
    >
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-[var(--gpssa-green)]">
            <GitBranch size={11} />
            Service operating spine
          </div>
          <p className={`mt-0.5 text-white/40 ${compact ? "text-[11px]" : "text-[12px]"}`}>
            Episode → journey → process &amp; SOP → systems &amp; fulfilment → QA &amp; improvement
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!lockService && (
            <select
              value={serviceId}
              onChange={(e) => {
                setServiceId(e.target.value);
                setActive(null);
              }}
              className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5 text-[11px] text-cream"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.isGoldPath ? "★ " : ""}
                  {s.name}
                </option>
              ))}
            </select>
          )}
          {!lockService && (
            <Link
              href={`/dashboard/services/operating/${serviceId}`}
              className="inline-flex items-center gap-1 rounded-lg bg-[var(--gpssa-green)]/90 px-2.5 py-1.5 text-[11px] font-semibold text-[#071322]"
            >
              Open blueprint
              <ArrowRight size={12} />
            </Link>
          )}
        </div>
      </div>

      {/* Spine */}
      <div className="relative mx-auto max-w-4xl px-1 pt-2">
        <div className="absolute left-[6%] right-[6%] top-[22px] h-px bg-white/10" />
        <div className="relative flex justify-between gap-1">
          {NODE_ORDER.map((id, i) => {
            const node = graph.nodes.find((n) => n.id === id)!;
            const lit = litSet.has(id);
            const dim = active !== null && !lit;
            const edgeLit = i < NODE_ORDER.length - 1 && graph.edges.find((e) => e.from === id)?.lit;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onNode(id)}
                onMouseEnter={() => setActive(id)}
                onMouseLeave={() => setActive(null)}
                className="group relative z-[1] flex min-w-0 flex-1 flex-col items-center gap-1.5"
                style={{ opacity: dim ? 0.28 : 1 }}
              >
                {i < NODE_ORDER.length - 1 && (
                  <span
                    className="pointer-events-none absolute left-[55%] top-[21px] h-px w-[90%]"
                    style={{
                      background: edgeLit && lit
                        ? "linear-gradient(90deg, var(--gpssa-green), rgba(0,168,107,0.2))"
                        : "transparent",
                    }}
                  />
                )}
                <motion.span
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-[11px] font-bold transition ${
                    lit
                      ? "bg-[var(--gpssa-green)] text-[#071322] shadow-[0_0_28px_rgba(0,168,107,0.4)]"
                      : "bg-white/[0.04] text-white/35 ring-1 ring-white/10"
                  }`}
                  animate={
                    !reduceMotion && lit && active === id
                      ? { scale: [1, 1.08, 1] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 0.9, ease: EASE }}
                >
                  {i + 1}
                </motion.span>
                <span
                  className={`truncate text-center text-[10px] font-semibold uppercase tracking-[0.12em] ${
                    lit ? "text-cream" : "text-white/30"
                  }`}
                >
                  {node.label}
                </span>
                {!compact && (
                  <span className="line-clamp-2 max-w-[9rem] text-center text-[9px] text-white/30">
                    {node.summary}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {active && (
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="mt-4 rounded-xl border border-white/[0.06] bg-black/25 px-3 py-2.5"
          >
            <NodeDetail graph={graph} nodeId={active} onNavigate={(href) => router.push(href)} />
          </motion.div>
        )}
      </AnimatePresence>

      {!compact && (
        <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-white/35">
          <span>{graph.isGoldPath ? "Gold path · seed rehearsal" : "Partial spine"}</span>
          <span>·</span>
          <span>{graph.fulfilment.cases.length} cases</span>
          <span>·</span>
          <span>{graph.quality.capas.length} CAPAs</span>
          <span>·</span>
          <span>
            {graph.processes.reduce((n, p) => n + (p.sop?.steps.filter((s) => s.qaCheckpoint).length ?? 0), 0)}{" "}
            QA checkpoints
          </span>
        </div>
      )}
    </section>
  );
}

function NodeDetail({
  graph,
  nodeId,
  onNavigate,
}: {
  graph: SpineGraphPayload;
  nodeId: SpineNodeId;
  onNavigate: (href: string) => void;
}) {
  if (nodeId === "episode") {
    return (
      <Detail
        title={graph.episode?.name ?? "No episode"}
        body={graph.episode?.description ?? "Seed an episode for this service."}
        href={`/dashboard/services/operating/${graph.service.id}`}
        onNavigate={onNavigate}
      />
    );
  }
  if (nodeId === "journey") {
    return (
      <Detail
        title={`${graph.stages.length} journey stages`}
        body={graph.stages.map((s) => s.name).join(" → ") || "No stages"}
        href={`/dashboard/services/operating/${graph.service.id}#journey`}
        onNavigate={onNavigate}
      />
    );
  }
  if (nodeId === "process") {
    const sop = graph.processes[0]?.sop;
    return (
      <Detail
        title={sop?.title ?? "Process & SOP"}
        body={
          sop
            ? `${sop.steps.length} steps · ${sop.steps.filter((s) => s.qaCheckpoint).length} QA checkpoints`
            : "No SOP linked"
        }
        href={`/dashboard/services/operating/${graph.service.id}#process`}
        onNavigate={onNavigate}
      />
    );
  }
  if (nodeId === "systems") {
    const systems = graph.processes.flatMap((p) => p.systems);
    return (
      <Detail
        title={`${systems.length} systems · ${graph.fulfilment.cases.length} cases`}
        body={
          systems.map((s) => s.name).join(" · ") +
          (graph.fulfilment.breachCount ? ` · ${graph.fulfilment.breachCount} breaches` : "")
        }
        href="/dashboard/fulfilment/cases"
        onNavigate={onNavigate}
      />
    );
  }
  return (
    <Detail
      title={`${graph.quality.scorecards.length} scorecards · ${graph.quality.capas.length} CAPAs`}
      body={`${graph.quality.reviewCount} reviews · ${graph.quality.defects.length} defects`}
      href="/dashboard/quality/capa"
      onNavigate={onNavigate}
    />
  );
}

function Detail({
  title,
  body,
  href,
  onNavigate,
}: {
  title: string;
  body: string;
  href: string;
  onNavigate: (href: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-cream">{title}</p>
        <p className="truncate text-[11px] text-white/45">{body}</p>
      </div>
      <button
        type="button"
        onClick={() => onNavigate(href)}
        className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-[var(--gpssa-green)]"
      >
        Open <ArrowRight size={12} />
      </button>
    </div>
  );
}
