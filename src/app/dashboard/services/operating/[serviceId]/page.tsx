"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Cpu,
  GitBranch,
  ShieldCheck,
  Star,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageFrame, TileScroll } from "@/components/ui/PageFrame";
import { OperatingSpine } from "@/components/spine/OperatingSpine";
import type { SpineGraphPayload } from "@/lib/spine/types";

export default function ServiceOperatingBlueprintPage() {
  const params = useParams();
  const serviceId = String(params.serviceId ?? "");
  const [graph, setGraph] = useState<SpineGraphPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId) return;
    setLoading(true);
    fetch(`/api/spine/${serviceId}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to load blueprint");
        return r.json();
      })
      .then((g) => {
        setGraph(g);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [serviceId]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !graph) {
    return (
      <div className="px-6 py-10 text-center">
        <p className="text-[13px] text-white/45">{error ?? "Blueprint not found"}</p>
        <Link
          href="/dashboard/services/operating"
          className="mt-3 inline-flex items-center gap-1 text-[12px] text-[var(--gpssa-green)]"
        >
          <ArrowLeft size={12} /> Back to blueprints
        </Link>
      </div>
    );
  }

  const systems = graph.processes.flatMap((p) => p.systems);
  const sop = graph.processes[0]?.sop;

  return (
    <PageFrame
      header={
        <div className="px-6 pt-2 pb-2">
          <Link
            href="/dashboard/services/operating"
            className="mb-2 inline-flex items-center gap-1 text-[11px] text-white/40 hover:text-cream"
          >
            <ArrowLeft size={12} /> All blueprints
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--gpssa-green)]">
                Service operating blueprint
              </p>
              <h1 className="font-playfair text-xl font-bold text-cream sm:text-2xl">
                {graph.service.name}
              </h1>
            </div>
            {graph.isGoldPath && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[11px] text-amber-100">
                <Star size={12} className="text-amber-300" />
                Gold path
              </span>
            )}
          </div>
        </div>
      }
    >
      <div className="flex h-full min-h-0 flex-col gap-3 px-6 pb-4">
      <OperatingSpine
        className="min-h-0 flex-[0.9]"
        initialServiceId={serviceId}
        lockService
        variant="embedded"
      />
      <TileScroll className="min-h-0 flex-1">

      <div className="mb-4 flex flex-wrap gap-2">
        {graph.deepLinks.map((d) => (
          <Link
            key={d.href}
            href={d.href}
            className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-white/55 hover:border-[var(--gpssa-green)]/30 hover:text-cream"
          >
            {d.label}
            <ArrowRight size={11} />
          </Link>
        ))}
      </div>

      <div className="space-y-5">
        <Section id="episode" icon={Workflow} title="1 · Episode" blurb="Customer life event that triggers the service.">
          {graph.episode ? (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <h3 className="text-[13px] font-semibold text-cream">{graph.episode.name}</h3>
              <p className="mt-1 text-[12px] text-white/45">{graph.episode.description}</p>
            </div>
          ) : (
            <Empty>No episode seeded for this service.</Empty>
          )}
        </Section>

        <Section id="journey" icon={GitBranch} title="2 · Journey" blurb="Stages the organisation and customer move through.">
          {graph.stages.length === 0 ? (
            <Empty>No journey stages.</Empty>
          ) : (
            <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {graph.stages.map((s, i) => (
                <li
                  key={s.id}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
                >
                  <span className="text-[10px] font-bold text-[var(--gpssa-green)]">{i + 1}</span>
                  <p className="mt-0.5 text-[12px] font-medium text-cream">{s.name}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-white/30">{s.actor}</p>
                  {s.outcome && <p className="mt-1 text-[11px] text-white/40">{s.outcome}</p>}
                </li>
              ))}
            </ol>
          )}
        </Section>

        <Section
          id="process"
          icon={ClipboardList}
          title="3 · Process & SOP"
          blurb="How back office should run it — with QA checkpoints."
        >
          {graph.processes.length === 0 ? (
            <Empty>No operating process.</Empty>
          ) : (
            <div className="space-y-3">
              {graph.processes.map((p) => (
                <div key={p.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="text-[13px] font-semibold text-cream">{p.name}</h3>
                    {p.ownerHint && <Badge variant="gray" size="sm">Owner: {p.ownerHint}</Badge>}
                  </div>
                  {p.description && <p className="mb-3 text-[12px] text-white/40">{p.description}</p>}
                  {p.sop ? (
                    <>
                      <p className="mb-2 text-[11px] text-white/50">
                        {p.sop.title} · v{p.sop.version}
                      </p>
                      <ul className="space-y-2">
                        {p.sop.steps.map((st) => (
                          <li
                            key={st.id}
                            className="flex gap-3 rounded-lg border border-white/[0.04] bg-black/20 px-3 py-2"
                          >
                            <span className="mt-0.5 text-[11px] font-bold text-white/30">
                              {st.sortOrder + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[12px] font-medium text-cream">{st.title}</span>
                                {st.qaCheckpoint && (
                                  <span className="inline-flex items-center gap-1 rounded bg-[var(--gpssa-green)]/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--gpssa-green)]">
                                    <CheckCircle2 size={10} /> QA checkpoint
                                  </span>
                                )}
                              </div>
                              {st.instruction && (
                                <p className="mt-0.5 text-[11px] text-white/40">{st.instruction}</p>
                              )}
                              {st.checkpointNote && (
                                <p className="mt-0.5 text-[11px] text-amber-200/70">{st.checkpointNote}</p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <Empty>No SOP linked.</Empty>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section
          id="systems"
          icon={Cpu}
          title="4 · Systems & Fulfilment"
          blurb="Where work sits — inventory systems, SLAs, cases. Not live integration."
        >
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <h3 className="mb-2 text-[12px] font-semibold text-cream">Systems</h3>
              {systems.length === 0 ? (
                <Empty>No systems linked.</Empty>
              ) : (
                <ul className="space-y-1.5">
                  {systems.map((s) => (
                    <li key={`${s.id}-${s.role}`} className="flex items-center justify-between text-[12px]">
                      <span className="text-cream">
                        {s.name}{" "}
                        <span className="text-white/30">({s.code})</span>
                      </span>
                      <Badge variant="blue" size="sm">
                        {s.role}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-[12px] font-semibold text-cream">Cases & SLAs</h3>
                <Link
                  href="/dashboard/fulfilment/cases"
                  className="text-[11px] text-[var(--gpssa-green)]"
                >
                  Case board →
                </Link>
              </div>
              {graph.fulfilment.slas.map((s) => (
                <p key={s.id} className="mb-2 text-[11px] text-white/45">
                  SLA: {s.name} · {s.tier} · {s.targetHours}h
                </p>
              ))}
              {graph.fulfilment.cases.length === 0 ? (
                <Empty>No cases.</Empty>
              ) : (
                <ul className="space-y-1.5">
                  {graph.fulfilment.cases.map((c) => (
                    <li
                      key={c.id}
                      className="flex flex-wrap items-center justify-between gap-2 text-[12px]"
                    >
                      <span className="font-mono text-cream">{c.caseRef}</span>
                      <div className="flex gap-1">
                        <Badge variant="gray" size="sm">
                          {c.status}
                        </Badge>
                        {(c.breached || c.breachRiskLevel !== "low") && (
                          <Badge variant="red" size="sm">
                            {c.breached ? "breached" : c.breachRiskLevel}
                          </Badge>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {graph.fulfilment.breachCount > 0 && (
                <p className="mt-2 text-[11px] text-red-300/80">
                  {graph.fulfilment.breachCount} breach record(s) ·{" "}
                  <Link href="/dashboard/fulfilment/breach" className="underline">
                    Breach board
                  </Link>
                </p>
              )}
            </div>
          </div>
        </Section>

        <Section
          id="qa"
          icon={ShieldCheck}
          title="5 · QA & Improvement"
          blurb="Assure the work and close the loop — not software/technical QA."
        >
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-[12px] font-semibold text-cream">Scorecards</h3>
                <Link href="/dashboard/quality/scorecards" className="text-[11px] text-[var(--gpssa-green)]">
                  Open →
                </Link>
              </div>
              {graph.quality.scorecards.length === 0 ? (
                <Empty>None</Empty>
              ) : (
                graph.quality.scorecards.map((s) => (
                  <p key={s.id} className="text-[12px] text-cream">
                    {s.name}{" "}
                    <span className="text-white/35">({s.status})</span>
                  </p>
                ))
              )}
              <p className="mt-2 text-[11px] text-white/40">{graph.quality.reviewCount} reviews</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <h3 className="mb-2 text-[12px] font-semibold text-cream">Defects</h3>
              {graph.quality.defects.length === 0 ? (
                <Empty>None</Empty>
              ) : (
                graph.quality.defects.map((d) => (
                  <p key={d.id} className="mb-1 text-[12px] text-cream">
                    {d.severity} · {d.status}
                    {d.caseRef ? ` · ${d.caseRef}` : ""}
                  </p>
                ))
              )}
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-[12px] font-semibold text-cream">CAPAs</h3>
                <Link href="/dashboard/quality/capa" className="text-[11px] text-[var(--gpssa-green)]">
                  Open →
                </Link>
              </div>
              {graph.quality.capas.length === 0 ? (
                <Empty>None</Empty>
              ) : (
                graph.quality.capas.map((c) => (
                  <p key={c.id} className="mb-1 text-[12px] text-cream">
                    {c.title}{" "}
                    <span className="text-white/35">({c.status})</span>
                  </p>
                ))
              )}
            </div>
          </div>
          {sop && (
            <p className="mt-3 text-[11px] text-white/35">
              SOP embeds {sop.steps.filter((s) => s.qaCheckpoint).length} agent-style QA checkpoints —
              call-center pattern for back-office assurance.
            </p>
          )}
        </Section>
      </div>
      </TileScroll>
      </div>
    </PageFrame>
  );
}

function Section({
  id,
  icon: Icon,
  title,
  blurb,
  children,
}: {
  id: string;
  icon: LucideIcon;
  title: string;
  blurb: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-4">
      <div className="mb-2 flex items-end gap-2">
        <Icon size={14} className="mb-0.5 text-[var(--gpssa-green)]" />
        <div>
          <h2 className="text-[14px] font-semibold text-cream">{title}</h2>
          <p className="text-[11px] text-white/35">{blurb}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] italic text-white/30">{children}</p>;
}
