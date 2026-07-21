"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { Loader2, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import type { SpineGraphPayload, SpineNodeId } from "@/lib/spine/types";
import type { CatalogueEpisode, Workspace, WorkspaceEpisode } from "./workspace-types";

const TITLES: Record<SpineNodeId, string> = {
  episode: "Eligible episodes",
  journey: "Journeys for this path",
  process: "Existing process",
  systems: "Systems & fulfilment",
  qa: "QA & improvement",
};

const CATEGORY_LABEL: Record<string, string> = {
  join: "Join & register",
  contribute: "Contribute",
  records: "Records & evidence",
  claim: "Claim benefits",
  "end-of-service": "End of service",
  survivor: "Survivor",
  disability: "Disability",
  mobility: "Mobility / GCC",
  family: "Family events",
  employer: "Employer ops",
};

export function SpineBrowseModal({
  isOpen,
  onClose,
  node,
  graph,
  workspace,
  personaKey = null,
  busy,
  onAction,
  onOpenWizardProcess,
}: {
  isOpen: boolean;
  onClose: () => void;
  node: SpineNodeId;
  graph: SpineGraphPayload | null;
  workspace: Workspace | null;
  personaKey?: string | null;
  busy: boolean;
  onAction: (action: string, payload?: Record<string, unknown>) => Promise<void>;
  onOpenWizardProcess: () => void;
}) {
  const lensKey = personaKey ?? workspace?.personaKey ?? null;
  const eligible: WorkspaceEpisode[] =
    workspace?.eligibleEpisodes ?? workspace?.episodes ?? [];
  const catalogue = workspace?.catalogueEpisodes ?? [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={TITLES[node]} size="2xl">
      <div className="relative max-h-[55vh] min-h-[240px] overflow-y-auto pr-1">
        {busy && (
          <div className="absolute right-0 top-0 z-10">
            <Loader2 size={14} className="animate-spin text-white/40" />
          </div>
        )}
        {node === "episode" && (
          <EpisodeBrowse
            workspace={workspace}
            eligible={eligible}
            catalogue={catalogue}
            personaKey={lensKey}
            busy={busy}
            onAction={onAction}
          />
        )}
        {node === "journey" && (
          <JourneyBrowse
            graph={graph}
            workspace={workspace}
            busy={busy}
            onAction={onAction}
          />
        )}
        {node === "process" && (
          <ProcessBrowse graph={graph} onOpenWizardProcess={onOpenWizardProcess} />
        )}
        {node === "systems" && <SystemsBrowse graph={graph} workspace={workspace} />}
        {node === "qa" && <QaBrowse graph={graph} />}
      </div>
    </Modal>
  );
}

function EpisodeBrowse({
  workspace,
  eligible,
  catalogue,
  personaKey,
  busy,
  onAction,
}: {
  workspace: Workspace | null;
  eligible: WorkspaceEpisode[];
  catalogue: CatalogueEpisode[];
  personaKey: string | null;
  busy: boolean;
  onAction: (action: string, payload?: Record<string, unknown>) => Promise<void>;
}) {
  const [category, setCategory] = useState<string>("all");
  const activeId = eligible.find((e) => e.isActive)?.id ?? null;
  const profileHref = personaKey
    ? `/dashboard/delivery/personas?persona=${personaKey}`
    : "/dashboard/delivery/personas";

  const categories = useMemo(() => {
    const ids = Array.from(new Set(catalogue.map((c) => c.category)));
    return ids;
  }, [catalogue]);

  const filteredCatalogue = useMemo(() => {
    if (category === "all") return catalogue;
    return catalogue.filter((c) => c.category === category);
  }, [catalogue, category]);

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2">
        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
          Customer lens
        </p>
        <p className="text-[13px] text-cream">{workspace?.persona?.name ?? "Not set"}</p>
        <p className="mt-0.5 text-[10px] text-white/35">
          {catalogue.length} ready episodes in the catalogue
          {eligible.length ? ` · ${eligible.length} already on this service` : ""}
        </p>
        <Link
          href={profileHref}
          className="mt-1 inline-block text-[11px] text-[var(--gpssa-green)]"
        >
          Open profile →
        </Link>
      </div>

      {eligible.length > 0 && (
        <div>
          <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
            On this service
          </p>
          <ul className="space-y-1.5">
            {eligible.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    onAction("activate-episode", {
                      episodeId: e.id,
                      ...(personaKey ? { personaKey } : {}),
                    })
                  }
                  className={`w-full rounded-lg border px-3 py-2 text-left text-[12px] transition ${
                    e.id === activeId
                      ? "border-[var(--gpssa-green)]/50 bg-[var(--gpssa-green)]/10 text-cream"
                      : "border-white/[0.06] text-white/60 hover:border-white/20"
                  }`}
                >
                  {e.id === activeId ? "● " : ""}
                  {e.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
            Catalogue — choose or set up
          </p>
          <div className="flex max-w-full flex-wrap gap-1">
            <CatChip active={category === "all"} onClick={() => setCategory("all")}>
              All ({catalogue.length})
            </CatChip>
            {categories.map((c) => (
              <CatChip key={c} active={category === c} onClick={() => setCategory(c)}>
                {CATEGORY_LABEL[c] ?? c}
              </CatChip>
            ))}
          </div>
        </div>
        <ul className="space-y-1.5">
          {filteredCatalogue.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                disabled={busy || e.alreadyOnService}
                onClick={() =>
                  onAction("activate-library", {
                    libraryId: e.id,
                    ...(personaKey ? { personaKey } : {}),
                  })
                }
                className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                  e.alreadyOnService
                    ? "border-[var(--gpssa-green)]/25 bg-[var(--gpssa-green)]/5 text-white/45"
                    : "border-white/[0.06] text-white/70 hover:border-[var(--gpssa-green)]/40 hover:bg-[var(--gpssa-green)]/5"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[12px] font-medium text-cream">{e.name}</p>
                  <span className="shrink-0 text-[9px] uppercase tracking-[0.12em] text-white/30">
                    {e.alreadyOnService ? "On service" : "Set up"}
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-[10px] text-white/35">{e.description}</p>
                <p className="mt-1 text-[9px] text-white/30">
                  {CATEGORY_LABEL[e.category] ?? e.category} · {e.stageCount} journey stages
                </p>
              </button>
            </li>
          ))}
          {!filteredCatalogue.length && (
            <p className="text-[12px] text-white/35">
              No catalogue episodes for this filter — try another category
            </p>
          )}
        </ul>
      </div>
    </div>
  );
}

function CatChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-2 py-0.5 text-[9px] font-semibold transition ${
        active
          ? "bg-[var(--gpssa-green)]/20 text-[var(--gpssa-green)]"
          : "bg-white/[0.04] text-white/40 hover:text-white/70"
      }`}
    >
      {children}
    </button>
  );
}

function JourneyBrowse({
  graph,
  workspace,
  busy,
  onAction,
}: {
  graph: SpineGraphPayload | null;
  workspace: Workspace | null;
  busy: boolean;
  onAction: (action: string, payload?: Record<string, unknown>) => Promise<void>;
}) {
  const existing = (workspace?.journeyCandidates ?? []).filter(
    (c) => c.source === "gold" || c.id.startsWith("existing-")
  );
  const setupNew = (workspace?.journeyCandidates ?? []).filter(
    (c) => c.source !== "gold" && !c.id.startsWith("existing-")
  );

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
        <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
          Applied on this episode
        </p>
        <ol className="space-y-1.5">
          {(graph?.stages ?? []).map((s, i) => (
            <li key={s.id} className="flex gap-2 text-[12px]">
              <span className="font-bold text-[var(--gpssa-green)]">{i + 1}</span>
              <span className="text-cream">{s.name}</span>
            </li>
          ))}
          {!graph?.stages.length && (
            <p className="text-[12px] text-white/35">No journey applied yet</p>
          )}
        </ol>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
            Choose existing
          </p>
          <ul className="space-y-1.5">
            {existing.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    onAction("apply-journey", {
                      stages: c.stages.map((s) => ({
                        name: s.name,
                        actor: s.actor,
                        outcome: s.outcome ?? undefined,
                      })),
                      source: c.source,
                    })
                  }
                  className="w-full rounded-lg border border-white/[0.06] px-3 py-2 text-left transition hover:border-[var(--gpssa-green)]/40"
                >
                  <p className="text-[12px] font-medium text-cream">{c.label}</p>
                  <p className="text-[10px] text-white/35">{c.stages.length} stages</p>
                </button>
              </li>
            ))}
            {!existing.length && (
              <p className="text-[12px] text-white/35">None saved yet</p>
            )}
          </ul>
        </div>
        <div>
          <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
            Ready journeys ({setupNew.length})
          </p>
          <ul className="max-h-[280px] space-y-1.5 overflow-y-auto pr-0.5">
            {setupNew.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    onAction("apply-journey", {
                      stages: c.stages.map((s) => ({
                        name: s.name,
                        actor: s.actor,
                        outcome: s.outcome ?? undefined,
                      })),
                      source: c.source,
                    })
                  }
                  className="w-full rounded-lg border border-[var(--gpssa-green)]/25 bg-[var(--gpssa-green)]/5 px-3 py-2 text-left transition hover:border-[var(--gpssa-green)]/50"
                >
                  <p className="text-[12px] font-medium text-cream">{c.label}</p>
                  <p className="text-[10px] text-white/35">
                    {c.stages.length} stages ·{" "}
                    {c.source === "persona"
                      ? "research journey"
                      : c.source === "library"
                        ? "catalogue"
                        : c.source}
                  </p>
                </button>
              </li>
            ))}
            {!setupNew.length && (
              <p className="text-[12px] text-white/35">
                Set persona + episode for candidates
              </p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ProcessBrowse({
  graph,
  onOpenWizardProcess,
}: {
  graph: SpineGraphPayload | null;
  onOpenWizardProcess: () => void;
}) {
  const sop = graph?.processes[0]?.sop ?? null;
  return (
    <div className="space-y-3">
      {sop ? (
        <ul className="space-y-1">
          <li className="text-[13px] font-medium text-cream">
            {sop.title} · v{sop.version}
          </li>
          {sop.steps.map((st) => (
            <li key={st.id} className="text-[12px] text-white/55">
              {st.sortOrder + 1}. {st.title}
              {st.qaCheckpoint ? " · QA" : ""}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[12px] text-white/35">No SOP applied yet</p>
      )}
      <button
        type="button"
        onClick={onOpenWizardProcess}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--gpssa-green)]/40 bg-[var(--gpssa-green)]/15 px-3 py-1.5 text-[12px] font-semibold text-[var(--gpssa-green)]"
      >
        <Sparkles size={12} /> Draft in wizard
      </button>
    </div>
  );
}

function SystemsBrowse({
  graph,
  workspace,
}: {
  graph: SpineGraphPayload | null;
  workspace: Workspace | null;
}) {
  const linked = graph?.processes.flatMap((p) => p.systems) ?? [];
  const systems = linked.length ? linked : workspace?.systems ?? [];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
          Systems
        </p>
        <ul className="space-y-1">
          {systems.map((s) => (
            <li key={s.id} className="flex justify-between text-[12px]">
              <span className="text-cream">{s.name}</span>
              <span className="text-white/35">
                {(s as { role?: string }).role ?? s.kind}
              </span>
            </li>
          ))}
          {!systems.length && <p className="text-[12px] text-white/35">None linked</p>}
        </ul>
      </div>
      <div>
        <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
          Cases
        </p>
        <ul className="space-y-1">
          {(graph?.fulfilment.cases ?? []).slice(0, 8).map((c) => (
            <li key={c.id} className="flex justify-between text-[11px]">
              <span className="font-mono text-cream">{c.caseRef}</span>
              <span className={c.breached ? "text-red-300" : "text-white/40"}>{c.status}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex gap-3">
          <Link href="/dashboard/fulfilment/cases" className="text-[11px] text-[var(--gpssa-green)]">
            Cases →
          </Link>
          <Link href="/dashboard/fulfilment/sla" className="text-[11px] text-[var(--gpssa-green)]">
            SLA →
          </Link>
        </div>
      </div>
    </div>
  );
}

function QaBrowse({ graph }: { graph: SpineGraphPayload | null }) {
  const checkpoints =
    graph?.processes[0]?.sop?.steps.filter((s) => s.qaCheckpoint).map((s) => s.title) ?? [];
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div>
        <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
          Scorecards
        </p>
        {(graph?.quality.scorecards ?? []).map((s) => (
          <p key={s.id} className="text-[12px] text-cream">
            {s.name}
          </p>
        ))}
        {!graph?.quality.scorecards.length && (
          <p className="text-[12px] text-white/35">None</p>
        )}
      </div>
      <div>
        <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
          Checkpoints
        </p>
        {checkpoints.map((t) => (
          <p key={t} className="truncate text-[11px] text-cream">
            · {t}
          </p>
        ))}
        {!checkpoints.length && <p className="text-[12px] text-white/35">None</p>}
      </div>
      <div>
        <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
          CAPAs
        </p>
        {(graph?.quality.capas ?? []).map((c) => (
          <p key={c.id} className="truncate text-[11px] text-cream">
            {c.title}
          </p>
        ))}
        {!graph?.quality.capas.length && <p className="text-[12px] text-white/35">None</p>}
        <div className="mt-2 flex flex-col gap-1">
          <Link href="/dashboard/quality/scorecards" className="text-[11px] text-[var(--gpssa-green)]">
            Scorecards →
          </Link>
          <Link href="/dashboard/quality/capa" className="text-[11px] text-[var(--gpssa-green)]">
            CAPA →
          </Link>
        </div>
      </div>
    </div>
  );
}
