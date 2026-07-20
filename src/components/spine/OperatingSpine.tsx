"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, GitBranch, Loader2, Star, Wand2 } from "lucide-react";
import { useEngagementStore } from "@/lib/engagement/store";
import { emphasizedNodes, PHASE_SPINE_ACCENT } from "@/lib/spine/conductor";
import type { SpineDraft } from "@/lib/spine/generate";
import type { SpineGraphPayload, SpineNodeId, SpineServiceListItem } from "@/lib/spine/types";
import { EASE } from "@/lib/motion";
import { SpineSetupWizard, type WizardStep } from "./SpineSetupWizard";
import { SpineNodeGate } from "./SpineNodeGate";
import { SpineBrowseModal } from "./SpineBrowseModal";
import type { LibraryPayload, Workspace } from "./workspace-types";

const SpineOrbCanvas = dynamic(() => import("@/components/home/SpineOrbCanvas"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gradient-to-b from-[var(--gpssa-green)]/5 to-transparent" />
  ),
});

const NODE_ORDER: SpineNodeId[] = ["episode", "journey", "process", "systems", "qa"];
const SHORT: Record<SpineNodeId, string> = {
  episode: "Episode",
  journey: "Journey",
  process: "Process",
  systems: "Systems",
  qa: "QA",
};

/** Which wizard step a node's Set up path opens. */
export const NODE_TO_STEP: Record<SpineNodeId, WizardStep> = {
  episode: "persona",
  journey: "journey",
  process: "process",
  systems: "process",
  qa: "review",
};

/** Which planet lights up while the wizard is on a given step. */
const STEP_TO_NODE: Record<WizardStep, SpineNodeId> = {
  persona: "episode",
  episode: "episode",
  journey: "journey",
  process: "process",
  review: "qa",
};

function existingSummary(
  node: SpineNodeId,
  graph: SpineGraphPayload | null,
  workspace: Workspace | null
): string {
  if (!graph) return "Loading…";
  if (node === "episode") {
    const n = workspace?.episodes.length ?? 0;
    return n ? `${n} episode${n === 1 ? "" : "s"}` : "None yet";
  }
  if (node === "journey") {
    const n = graph.stages.length;
    return n ? `${n} stages` : "No journey yet";
  }
  if (node === "process") {
    const sop = graph.processes[0]?.sop;
    return sop ? `${sop.steps.length} SOP steps` : "No SOP yet";
  }
  if (node === "systems") {
    const n = graph.fulfilment.cases.length;
    return `${n} cases · ${graph.fulfilment.breachCount} breached`;
  }
  return `${graph.quality.scorecards.length} scorecards · ${graph.quality.capas.length} CAPAs`;
}

export function OperatingSpine({
  className = "",
  initialServiceId,
  lockService = false,
  variant = "hero",
  onSelectedNodeChange,
}: {
  className?: string;
  initialServiceId?: string;
  lockService?: boolean;
  variant?: "hero" | "embedded";
  onSelectedNodeChange?: (node: SpineNodeId) => void;
}) {
  const engagementOpen = useEngagementStore((s) => s.engagementOpen);
  const phaseId = useEngagementStore((s) => s.phaseId);
  const emphasis = useMemo(
    () => emphasizedNodes(phaseId, engagementOpen),
    [phaseId, engagementOpen]
  );
  const accent = engagementOpen ? PHASE_SPINE_ACCENT[phaseId] : null;

  const [services, setServices] = useState<SpineServiceListItem[]>([]);
  const [serviceId, setServiceId] = useState(initialServiceId ?? "");
  const [graph, setGraph] = useState<SpineGraphPayload | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [library, setLibrary] = useState<LibraryPayload | null>(null);
  const [selected, setSelected] = useState<SpineNodeId>("episode");
  const [hovered, setHovered] = useState<SpineNodeId | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<SpineDraft | null>(null);
  const [draftSource, setDraftSource] = useState<string | null>(null);

  const [gateOpen, setGateOpen] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardEntryStep, setWizardEntryStep] = useState<WizardStep>("persona");
  /** Live wizard step for planet lighting only — never fed back as entryStep. */
  const [wizardLitStep, setWizardLitStep] = useState<WizardStep | null>(null);

  const refresh = useCallback(async (id: string) => {
    const [g, w] = await Promise.all([
      fetch(`/api/spine/${id}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/spine/${id}/workspace`).then((r) => (r.ok ? r.json() : null)),
    ]);
    setGraph(g);
    setWorkspace(w);
  }, []);

  useEffect(() => {
    if (initialServiceId) setServiceId(initialServiceId);
  }, [initialServiceId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const node = new URLSearchParams(window.location.search).get("node");
    if (node && NODE_ORDER.includes(node as SpineNodeId)) {
      setSelected(node as SpineNodeId);
    }
  }, []);

  useEffect(() => {
    onSelectedNodeChange?.(selected);
  }, [selected, onSelectedNodeChange]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/spine/services").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/spine/library/episodes").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([rows, lib]) => {
        if (cancelled) return;
        const list = Array.isArray(rows) ? rows : [];
        setServices(list);
        setLibrary(lib);
        if (initialServiceId && list.some((s: SpineServiceListItem) => s.id === initialServiceId)) {
          setServiceId(initialServiceId);
        } else if (!lockService) {
          const gold = list.find((s: SpineServiceListItem) => s.isGoldPath) ?? list[0];
          if (gold) setServiceId(gold.id);
        }
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
    refresh(serviceId);
  }, [serviceId, refresh]);

  const workspaceAction = useCallback(
    async (action: string, payload: Record<string, unknown> = {}) => {
      if (!serviceId) return;
      setBusy(true);
      try {
        await fetch(`/api/spine/${serviceId}/workspace`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, ...payload }),
        });
        await refresh(serviceId);
      } finally {
        setBusy(false);
      }
    },
    [serviceId, refresh]
  );

  const runGenerate = useCallback(async () => {
    if (!serviceId) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/spine/${serviceId}/generate`, { method: "POST" });
      const data = await r.json();
      if (r.ok) {
        setDraft(data.draft);
        setDraftSource(data.source);
      }
    } finally {
      setBusy(false);
    }
  }, [serviceId]);

  const runApply = useCallback(async () => {
    if (!serviceId || !draft) return;
    setBusy(true);
    try {
      await fetch(`/api/spine/${serviceId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft }),
      });
      await refresh(serviceId);
    } finally {
      setBusy(false);
    }
  }, [serviceId, draft, refresh]);

  function openGateFor(node: SpineNodeId) {
    setSelected(node);
    setGateOpen(true);
  }

  function openWizard(step: WizardStep) {
    setWizardEntryStep(step);
    setWizardLitStep(step);
    setWizardOpen(true);
    setGateOpen(false);
    setBrowseOpen(false);
  }

  const litSelection =
    wizardOpen && wizardLitStep ? STEP_TO_NODE[wizardLitStep] : selected;

  // Never flip the whole spine back to loading while wizard/browse is open.
  if (loading && !graph) {
    return (
      <div
        className={`flex min-h-0 flex-1 items-center justify-center text-[12px] text-white/40 ${className}`}
      >
        <Loader2 size={16} className="mr-2 animate-spin" /> Spine
      </div>
    );
  }

  if (!graph || !services.length) {
    return (
      <div
        className={`rounded-2xl border border-dashed border-white/10 p-6 text-center text-[12px] text-white/40 ${className}`}
      >
        No spine data yet.
      </div>
    );
  }

  const serviceName = graph.service.name;
  const activeEpisode = workspace?.episodes.find((e) => e.isActive) ?? null;

  return (
    <section
      className={`relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent ${className}`}
      data-tour="compass-operating-spine"
    >
      {/* Header — no service switcher */}
      <div className="flex shrink-0 items-center justify-between gap-2 px-3 py-2 sm:px-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <GitBranch size={12} className="shrink-0 text-[var(--gpssa-green)]" />
            <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[var(--gpssa-green)]">
              Operating spine
            </span>
            {graph.isGoldPath && (
              <Star size={10} className="shrink-0 text-amber-300" aria-label="Gold path" />
            )}
          </div>
          <p className="mt-0.5 truncate pl-5 text-[11px] text-white/35">{serviceName}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => openGateFor(selected)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--gpssa-green)]/40 bg-[var(--gpssa-green)]/15 px-2.5 py-1.5 text-[11px] font-semibold text-[var(--gpssa-green)] transition hover:bg-[var(--gpssa-green)]/25"
          >
            <Wand2 size={11} /> Set up
          </button>
          <Link
            href={`/dashboard/services/operating/${serviceId}`}
            className="inline-flex items-center gap-1 rounded-lg bg-[var(--gpssa-green)]/90 px-2.5 py-1.5 text-[11px] font-semibold text-[#071322] transition hover:brightness-110"
            title="Open blueprint"
          >
            Blueprint <ArrowRight size={11} />
          </Link>
        </div>
      </div>

      {/* Planet stage */}
      <div className="relative shrink-0" style={{ height: variant === "hero" ? 172 : 132 }}>
        <div className="absolute inset-x-0 top-0" style={{ bottom: 40 }}>
          <SpineOrbCanvas
            selected={litSelection}
            hovered={hovered}
            emphasized={emphasis}
            conducting={engagementOpen}
            accent={accent}
          />
        </div>
        <div className="absolute inset-0 flex">
          {NODE_ORDER.map((id) => {
            const node = graph.nodes.find((n) => n.id === id)!;
            const emp = emphasis.has(id);
            const dim = engagementOpen && emphasis.size > 0 && !emp && litSelection !== id;
            const isSel = litSelection === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => openGateFor(id)}
                onMouseEnter={() => setHovered(id)}
                onMouseLeave={() => setHovered(null)}
                className="group flex w-1/5 flex-col items-center justify-end pb-2"
                style={{ opacity: dim ? 0.45 : 1 }}
              >
                <motion.span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] transition ${
                    isSel
                      ? "bg-[var(--gpssa-green)]/20 text-cream ring-1 ring-[var(--gpssa-green)]/40"
                      : "text-white/50 group-hover:text-white/80"
                  }`}
                >
                  {SHORT[id]}
                </motion.span>
                <span className="mt-0.5 text-[9px] tabular-nums text-white/30">
                  {node.lit ? node.count : "—"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quiet presence strip — no primary CTA */}
      <div className="min-h-0 flex-1 border-t border-white/[0.05] px-3 py-2 sm:px-4">
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: EASE }}
          className="flex h-full min-h-0 items-center gap-2"
        >
          <PresenceChip label="Active" value={activeEpisode?.name ?? "Not set"} />
          <PresenceChip label="Persona" value={workspace?.persona?.name ?? "Not set"} />
          <PresenceChip
            label="Journey"
            value={graph.stages.length ? `${graph.stages.length} stages` : "—"}
          />
          <p className="ml-auto hidden text-[10px] text-white/25 sm:block">
            Click a planet to view or set up
          </p>
        </motion.div>
      </div>

      <SpineNodeGate
        isOpen={gateOpen}
        onClose={() => setGateOpen(false)}
        node={selected}
        existingSummary={existingSummary(selected, graph, workspace)}
        onBrowse={() => {
          setGateOpen(false);
          setBrowseOpen(true);
        }}
        onSetup={() => openWizard(NODE_TO_STEP[selected])}
      />

      <SpineBrowseModal
        isOpen={browseOpen}
        onClose={() => setBrowseOpen(false)}
        node={selected}
        graph={graph}
        workspace={workspace}
        busy={busy}
        onAction={workspaceAction}
        onOpenWizardProcess={() => openWizard("process")}
      />

      <SpineSetupWizard
        isOpen={wizardOpen}
        onClose={() => {
          setWizardOpen(false);
          setWizardLitStep(null);
        }}
        entryStep={wizardEntryStep}
        serviceId={serviceId}
        serviceName={graph.service.name}
        graph={graph}
        workspace={workspace}
        library={library}
        busy={busy}
        draft={draft}
        draftSource={draftSource}
        setDraft={setDraft}
        onAction={workspaceAction}
        onGenerate={runGenerate}
        onApply={runApply}
        onStepChange={setWizardLitStep}
      />
    </section>
  );
}

function PresenceChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 flex-1 rounded-xl border border-white/[0.05] bg-black/20 px-2.5 py-1.5">
      <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-white/30">{label}</p>
      <p className="truncate text-[11px] text-cream">{value}</p>
    </div>
  );
}
