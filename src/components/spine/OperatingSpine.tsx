"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  GitBranch,
  Loader2,
  Play,
  Star,
  Wand2,
} from "lucide-react";
import { useEngagementStore } from "@/lib/engagement/store";
import { emphasizedNodes, PHASE_SPINE_ACCENT } from "@/lib/spine/conductor";
import type { SpineDraft } from "@/lib/spine/generate";
import type { SpineGraphPayload, SpineNodeId, SpineServiceListItem } from "@/lib/spine/types";
import { EASE } from "@/lib/motion";
import { Modal } from "@/components/ui/Modal";
import { SpineSetupWizard, type WizardStep } from "./SpineSetupWizard";
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

/** Which wizard step a node's Set up button opens. */
const NODE_TO_STEP: Record<SpineNodeId, WizardStep> = {
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

export function OperatingSpine({
  className = "",
  initialServiceId,
  lockService = false,
  variant = "hero",
}: {
  className?: string;
  initialServiceId?: string;
  lockService?: boolean;
  variant?: "hero" | "embedded";
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
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<WizardStep>("persona");
  const [switcherOpen, setSwitcherOpen] = useState(false);

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

  // Deep-link: /dashboard?node=qa selects a planet (used by the SpineRibbon).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const node = new URLSearchParams(window.location.search).get("node");
    if (node && NODE_ORDER.includes(node as SpineNodeId)) {
      setSelected(node as SpineNodeId);
    }
  }, []);

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

  function openWizard(step: WizardStep) {
    setWizardStep(step);
    setWizardOpen(true);
  }

  // While the wizard is open, its current step lights the matching planet.
  const litSelection = wizardOpen ? STEP_TO_NODE[wizardStep] : selected;

  if (loading) {
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

  const currentService = services.find((s) => s.id === serviceId);

  return (
    <section
      className={`relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent ${className}`}
      data-tour="compass-operating-spine"
    >
      {/* Header — one slim row */}
      <div className="flex shrink-0 items-center justify-between gap-2 px-3 py-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <GitBranch size={12} className="shrink-0 text-[var(--gpssa-green)]" />
          <span className="hidden text-[9px] font-semibold uppercase tracking-[0.22em] text-[var(--gpssa-green)] sm:block">
            Operating spine
          </span>
          {/* Service pill — opens the switcher */}
          <button
            type="button"
            onClick={() => !lockService && setSwitcherOpen(true)}
            disabled={lockService}
            className={`flex min-w-0 items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] text-cream transition ${
              lockService ? "" : "hover:border-[var(--gpssa-green)]/40"
            }`}
          >
            {graph.isGoldPath && <Star size={10} className="shrink-0 text-amber-300" />}
            <span className="truncate">{currentService?.name ?? graph.service.name}</span>
            {!lockService && <ChevronDown size={11} className="shrink-0 text-white/40" />}
          </button>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => openWizard(NODE_TO_STEP[selected])}
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

      {/* Planet stage — each orb sits directly above its label column */}
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
                onClick={() => setSelected(id)}
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

      {/* Status strip — compact per-node status, one primary action */}
      <div className="min-h-0 flex-1 border-t border-white/[0.05] px-3 py-2 sm:px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="flex h-full min-h-0 flex-col"
          >
            <NodeStatus
              node={selected}
              graph={graph}
              workspace={workspace}
              onSetup={() => openWizard(NODE_TO_STEP[selected])}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Service switcher */}
      <Modal
        isOpen={switcherOpen}
        onClose={() => setSwitcherOpen(false)}
        title="Choose a service"
        size="lg"
      >
        <div className="space-y-1.5">
          {services.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setServiceId(s.id);
                setSwitcherOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition ${
                s.id === serviceId
                  ? "border-[var(--gpssa-green)]/50 bg-[var(--gpssa-green)]/10"
                  : "border-white/[0.07] bg-white/[0.02] hover:border-white/20"
              }`}
            >
              <span className="flex min-w-0 items-center gap-2">
                {s.isGoldPath && <Star size={12} className="shrink-0 text-amber-300" />}
                <span className="truncate text-[13px] text-cream">{s.name}</span>
              </span>
              <span className="shrink-0 text-[10px] uppercase tracking-wider text-white/35">
                {s.litNodes.length}/5 lit
              </span>
            </button>
          ))}
        </div>
      </Modal>

      {/* Setup wizard */}
      <SpineSetupWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        initialStep={wizardStep}
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
        onStepChange={setWizardStep}
      />
    </section>
  );
}

/* ── Compact node status ─────────────────────────────────── */

function NodeStatus({
  node,
  graph,
  workspace,
  onSetup,
}: {
  node: SpineNodeId;
  graph: SpineGraphPayload;
  workspace: Workspace | null;
  onSetup: () => void;
}) {
  const activeEpisode = workspace?.episodes.find((e) => e.isActive) ?? null;
  const sop = graph.processes[0]?.sop ?? null;
  const linkedSystems = graph.processes.flatMap((p) => p.systems);

  const facts: { label: string; value: string }[] =
    node === "episode"
      ? [
          { label: "Active", value: activeEpisode?.name ?? "Not set" },
          { label: "Persona", value: workspace?.persona?.name ?? "Not set" },
        ]
      : node === "journey"
        ? [
            { label: "Stages", value: graph.stages.length ? `${graph.stages.length}` : "Not set" },
            {
              label: "First",
              value: graph.stages[0]?.name ?? "—",
            },
          ]
        : node === "process"
          ? [
              { label: "SOP", value: sop ? `${sop.title} · v${sop.version}` : "Not drafted" },
              { label: "Steps", value: sop ? `${sop.steps.length}` : "—" },
            ]
          : node === "systems"
            ? [
                { label: "Systems", value: `${linkedSystems.length || workspace?.systems.length || 0}` },
                {
                  label: "Cases",
                  value: `${graph.fulfilment.cases.length} · ${graph.fulfilment.breachCount} breached`,
                },
              ]
            : [
                { label: "Scorecards", value: `${graph.quality.scorecards.length}` },
                { label: "CAPAs", value: `${graph.quality.capas.length}` },
              ];

  const links: { label: string; href: string }[] =
    node === "systems"
      ? [
          { label: "Case board", href: "/dashboard/fulfilment/cases" },
          { label: "SLA", href: "/dashboard/fulfilment/sla" },
        ]
      : node === "qa"
        ? [
            { label: "Scorecards", href: "/dashboard/quality/scorecards" },
            { label: "CAPA", href: "/dashboard/quality/capa" },
          ]
        : node === "journey"
          ? [{ label: "Personas", href: "/dashboard/delivery/personas" }]
          : [];

  return (
    <div className="flex h-full min-h-0 items-center gap-3">
      <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
        {facts.map((f) => (
          <div
            key={f.label}
            className="min-w-0 rounded-xl border border-white/[0.05] bg-black/20 px-3 py-2"
          >
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
              {f.label}
            </p>
            <p className="truncate text-[12px] text-cream">{f.value}</p>
          </div>
        ))}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <button
          type="button"
          onClick={onSetup}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--gpssa-green)] px-3 py-1.5 text-[11px] font-semibold text-[#071322] transition hover:brightness-110"
        >
          <Play size={11} /> {SHORT[node]} setup
        </button>
        <div className="flex gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[10px] text-white/40 transition hover:text-[var(--gpssa-green)]"
            >
              {l.label} →
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
