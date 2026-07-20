"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarRange } from "lucide-react";
import { fadeRise } from "@/lib/motion";
import { PageFrame } from "@/components/ui/PageFrame";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { GanttTimeline, type GanttPhase } from "@/components/roadmap/GanttTimeline";

interface Initiative {
  id: string;
  title: string;
  owner: string | null;
  status: string;
  estimatedImpact: string | null;
  dependencies: string | null;
}

interface Phase {
  id: string;
  name: string;
  description: string | null;
  workstream: string | null;
  startDate: string | null;
  endDate: string | null;
  objectives: string | null;
  initiatives: Initiative[];
}

function parseWeek(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const m = value.match(/\d+/);
  return m ? parseInt(m[0], 10) : fallback;
}

const statusVariant: Record<string, "green" | "gold" | "gray"> = {
  completed: "green",
  "in-progress": "gold",
  planned: "gray",
};

function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
      <p className="text-[9px] uppercase tracking-[0.16em] text-white/40">{label}</p>
      <p className="text-sm font-semibold text-cream">{value}</p>
    </div>
  );
}

export default function RoadmapPage() {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/roadmap")
      .then((r) => r.json())
      .then((data) => setPhases(Array.isArray(data) ? data : []))
      .catch(() => setPhases([]))
      .finally(() => setLoading(false));
  }, []);

  const ganttPhases: GanttPhase[] = phases.map((p) => ({
    id: p.id,
    name: p.name,
    workstream: p.workstream,
    startWeek: parseWeek(p.startDate, 1),
    endWeek: parseWeek(p.endDate, parseWeek(p.startDate, 1) + 1),
    initiativeCount: p.initiatives?.length ?? 0,
  }));

  const totalInitiatives = phases.reduce(
    (sum, p) => sum + (p.initiatives?.length ?? 0),
    0
  );
  const selected = phases.find((p) => p.id === selectedId) ?? null;
  const selectedObjectives: string[] = selected?.objectives
    ? safeArray(selected.objectives)
    : [];

  return (
    <PageFrame
      header={
        <div className="flex items-center justify-between gap-3 pb-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <CalendarRange size={16} className="shrink-0 text-gold" />
            <h1 className="truncate font-playfair text-sm font-semibold text-cream sm:text-base">
              12-Month Roadmap
            </h1>
            <span className="hidden text-[11px] text-white/40 md:inline">
              Click a phase for its initiatives
            </span>
          </div>
          {!loading && phases.length > 0 && (
            <div className="hidden items-stretch gap-2 sm:flex">
              <StatChip label="Phases" value={phases.length} />
              <StatChip label="Initiatives" value={totalInitiatives} />
              <StatChip label="Weeks" value={20} />
            </div>
          )}
        </div>
      }
    >
      {loading ? (
        <div className="flex h-full items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : phases.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title="No roadmap phases yet"
          description="Seed the Roadmap & Governance module to populate the timeline."
        />
      ) : (
        <motion.div
          variants={fadeRise}
          initial="hidden"
          animate="show"
          className="glass-card h-full min-h-0 overflow-auto p-6"
        >
          <div className="min-w-[720px]">
            <GanttTimeline phases={ganttPhases} onSelect={setSelectedId} />
          </div>
        </motion.div>
      )}

      <Modal
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.name}
        description={selected?.description ?? undefined}
        size="lg"
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={selected.workstream === "A" ? "gold" : "green"} size="sm">
                Workstream {selected.workstream}
              </Badge>
              <Badge variant="gray" size="sm">
                {selected.startDate} – {selected.endDate}
              </Badge>
            </div>

            {selectedObjectives.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-muted">
                  Objectives
                </p>
                <ul className="space-y-1">
                  {selectedObjectives.map((o) => (
                    <li key={o} className="flex items-start gap-2 text-sm text-cream">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-muted">
                Initiatives ({selected.initiatives.length})
              </p>
              <div className="space-y-2">
                {selected.initiatives.map((init) => (
                  <div
                    key={init.id}
                    className="rounded-xl border border-border bg-navy-light/40 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-cream">{init.title}</p>
                      <Badge
                        variant={statusVariant[init.status] ?? "gray"}
                        size="sm"
                        dot
                      >
                        {init.status}
                      </Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-muted">
                      {init.owner && <span>Owner: {init.owner}</span>}
                      {init.estimatedImpact && (
                        <span>Impact: {init.estimatedImpact}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </PageFrame>
  );
}

function safeArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return value ? [value] : [];
  }
}
