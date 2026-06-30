"use client";

import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;
const TOTAL_WEEKS = 20;

export interface GanttPhase {
  id: string;
  name: string;
  workstream: "A" | "B" | string | null;
  startWeek: number;
  endWeek: number;
  initiativeCount: number;
}

interface GanttTimelineProps {
  phases: GanttPhase[];
  onSelect?: (id: string) => void;
}

const WORKSTREAM_META: Record<
  string,
  { label: string; bar: string; ring: string }
> = {
  A: {
    label: "Workstream A · Product & Service Roadmap",
    bar: "bg-gold/80 hover:bg-gold border-gold",
    ring: "bg-gold",
  },
  B: {
    label: "Workstream B · QA & Service Fulfilment",
    bar: "bg-teal-400/80 hover:bg-teal-400 border-teal-400",
    ring: "bg-teal-400",
  },
};

function Lane({
  phases,
  ws,
  onSelect,
}: {
  phases: GanttPhase[];
  ws: "A" | "B";
  onSelect?: (id: string) => void;
}) {
  const meta = WORKSTREAM_META[ws];
  const lanePhases = phases.filter((p) => p.workstream === ws);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${meta.ring}`} />
        <span className="text-xs font-medium uppercase tracking-wide text-gray-muted">
          {meta.label}
        </span>
      </div>

      <div className="space-y-1.5">
        {lanePhases.map((p, idx) => {
          const start = Math.max(1, p.startWeek);
          const end = Math.min(TOTAL_WEEKS, p.endWeek);
          const span = Math.max(1, end - start + 1);
          return (
            <div
              key={p.id}
              className="grid items-center gap-px"
              style={{
                gridTemplateColumns: `repeat(${TOTAL_WEEKS}, minmax(0, 1fr))`,
              }}
            >
              <motion.button
                initial={{ opacity: 0, scaleX: 0.6 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.05, ease: EASE }}
                onClick={() => onSelect?.(p.id)}
                style={{
                  gridColumnStart: start,
                  gridColumnEnd: `span ${span}`,
                  transformOrigin: "left",
                }}
                className={`group flex h-9 items-center justify-between gap-2 rounded-lg border px-2.5 text-left text-white shadow-sm transition-colors ${meta.bar}`}
              >
                <span className="truncate text-xs font-medium">{p.name}</span>
                <span className="shrink-0 rounded-full bg-black/20 px-1.5 py-0.5 text-[10px] font-semibold">
                  {p.initiativeCount}
                </span>
              </motion.button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function GanttTimeline({ phases, onSelect }: GanttTimelineProps) {
  return (
    <div className="space-y-5">
      {/* Week header */}
      <div
        className="grid gap-px text-center"
        style={{
          gridTemplateColumns: `repeat(${TOTAL_WEEKS}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1).map((w) => (
          <div
            key={w}
            className="border-b border-white/5 pb-1 text-[10px] text-gray-muted"
          >
            {w}
          </div>
        ))}
      </div>

      <Lane phases={phases} ws="A" onSelect={onSelect} />
      <Lane phases={phases} ws="B" onSelect={onSelect} />

      <p className="pt-1 text-[11px] text-gray-muted">
        Week bands across a 20-week engagement (RFP §2.3). Click any phase to see
        its initiatives.
      </p>
    </div>
  );
}
