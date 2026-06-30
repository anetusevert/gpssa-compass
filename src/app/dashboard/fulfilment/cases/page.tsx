"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  LayoutGrid,
  Inbox,
  AlertTriangle,
  AlarmClockOff,
  Gauge,
  Filter,
  RefreshCw,
} from "lucide-react";
import { SectionTabs } from "@/components/ui/SectionTabs";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { CaseCard } from "@/components/fulfilment/CaseCard";
import { RiskDot } from "@/components/fulfilment/RiskDot";
import type { FulfilmentCase, CaseStatus } from "@/components/fulfilment/types";
import { PRIORITY_LABEL } from "@/lib/fulfilment/triage";

const EASE = [0.16, 1, 0.3, 1] as const;

const STATUS_COLUMNS: { id: CaseStatus; label: string; accent: string }[] = [
  { id: "open", label: "Open", accent: "border-adl-blue/30" },
  { id: "in-progress", label: "In Progress", accent: "border-gold/30" },
  { id: "on-hold", label: "On Hold", accent: "border-gray-muted/30" },
  { id: "resolved", label: "Resolved", accent: "border-gpssa-green/30" },
];

const PRIORITY_COLUMNS = ["P1", "P2", "P3", "P4", "P5"] as const;

const fulfilmentTabs = [
  { id: "cases", label: "Case Board", href: "/dashboard/fulfilment/cases", icon: LayoutGrid },
  { id: "sla", label: "SLA / OLA", href: "/dashboard/fulfilment/sla", icon: Filter },
  { id: "breach", label: "Breach & Aging", href: "/dashboard/fulfilment/breach", icon: AlarmClockOff },
  { id: "analytics", label: "Analytics", href: "/dashboard/fulfilment/analytics", icon: Gauge },
];

/* ── Droppable column ── */
function Column({
  id,
  children,
  isOver,
}: {
  id: string;
  children: React.ReactNode;
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[230px] rounded-2xl border bg-white/[0.015] transition-colors ${
        isOver ? "border-gpssa-green/40 bg-gpssa-green/[0.04]" : "border-white/[0.06]"
      } flex flex-col`}
    >
      {children}
    </div>
  );
}

/* ── Draggable wrapper for a case card ── */
function DraggableCase({ c }: { c: FulfilmentCase }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: c.id,
    data: { case: c },
  });
  return (
    <div ref={setNodeRef}>
      <CaseCard
        c={c}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export default function CaseBoardPage() {
  const [cases, setCases] = useState<FulfilmentCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [groupBy, setGroupBy] = useState<"status" | "priority">("status");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const load = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const res = await fetch("/api/fulfilment/cases", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setCases(data);
      }
    } catch {
      /* keep last good state */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Subtle live refresh so aging advances.
    const t = setInterval(() => load(), 25000);
    return () => clearInterval(t);
  }, [load]);

  const services = useMemo(
    () => Array.from(new Set(cases.map((c) => c.serviceName).filter(Boolean))) as string[],
    [cases]
  );

  const filtered = useMemo(
    () =>
      serviceFilter === "all"
        ? cases
        : cases.filter((c) => c.serviceName === serviceFilter),
    [cases, serviceFilter]
  );

  const openCount = filtered.filter((c) => c.status !== "resolved").length;
  const atRisk = filtered.filter(
    (c) => c.status !== "resolved" && (c.riskLevel === "amber" || c.riskLevel === "red")
  ).length;
  const breachedCount = filtered.filter(
    (c) => c.status !== "resolved" && c.riskLevel === "breached"
  ).length;
  const avgPriority = useMemo(() => {
    const open = filtered.filter((c) => c.status !== "resolved");
    if (open.length === 0) return "—";
    const avg =
      open.reduce((sum, c) => sum + Number(c.priority.replace("P", "")), 0) / open.length;
    return `P${Math.round(avg)}`;
  }, [filtered]);

  const columns = useMemo(() => {
    if (groupBy === "status") {
      return STATUS_COLUMNS.map((col) => ({
        id: col.id,
        label: col.label,
        accent: col.accent,
        cases: filtered.filter((c) => c.status === col.id),
      }));
    }
    return PRIORITY_COLUMNS.map((p) => ({
      id: p,
      label: `${p} · ${PRIORITY_LABEL[p]}`,
      accent: "border-white/[0.06]",
      cases: filtered.filter((c) => c.priority === p),
    }));
  }, [filtered, groupBy]);

  const activeCase = useMemo(
    () => cases.find((c) => c.id === activeId) ?? null,
    [cases, activeId]
  );

  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(String(e.active.id));
  };

  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveId(null);
    setOverId(null);
    const { active, over } = e;
    if (!over) return;
    // Only the status grouping supports moving (changes case.status).
    if (groupBy !== "status") return;
    const newStatus = String(over.id) as CaseStatus;
    const moved = cases.find((c) => c.id === String(active.id));
    if (!moved || moved.status === newStatus) return;

    // Optimistic update.
    const prev = cases;
    setCases((cs) =>
      cs.map((c) => (c.id === moved.id ? { ...c, status: newStatus } : c))
    );

    try {
      const res = await fetch(`/api/fulfilment/cases/${moved.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("patch failed");
      // Refresh to pick up resolvedAt / live risk recompute.
      load();
    } catch {
      setCases(prev); // rollback
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header strip */}
      <div className="shrink-0 flex items-center gap-3 px-5 py-2 border-b border-white/[0.06]">
        <h1 className="font-playfair text-base font-semibold text-cream shrink-0">
          Case Board
        </h1>
        <div className="h-4 w-px bg-white/10" />
        <div className="hidden md:block">
          <SectionTabs items={fulfilmentTabs} pillar="products" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* Group-by toggle */}
          <div className="flex items-center gap-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08] p-0.5">
            {(["status", "priority"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGroupBy(g)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-medium capitalize transition-colors ${
                  groupBy === g
                    ? "bg-gpssa-green/15 text-gpssa-green"
                    : "text-gray-muted hover:text-cream"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          {/* Service filter */}
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] text-cream focus:outline-none focus:border-gpssa-green/30"
          >
            <option value="all">All services</option>
            {services.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            onClick={() => load(true)}
            className="p-1.5 rounded-lg text-gray-muted hover:text-cream hover:bg-white/[0.05] transition-colors"
            title="Refresh"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* StatCards strip */}
      <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-2 px-5 py-2.5 border-b border-white/[0.05]">
        <MiniStat icon={Inbox} label="Open cases" value={openCount} tone="blue" />
        <MiniStat icon={AlertTriangle} label="At risk" value={atRisk} tone="amber" />
        <MiniStat icon={AlarmClockOff} label="Breached" value={breachedCount} tone="rose" />
        <MiniStat icon={Gauge} label="Avg priority" value={avgPriority} tone="muted" />
      </div>

      {/* Legend */}
      <div className="shrink-0 flex items-center gap-4 px-5 py-1.5 border-b border-white/[0.04] text-[9px] text-gray-muted">
        <span className="flex items-center gap-1">
          <RiskDot riskLevel="green" size={8} /> On track
        </span>
        <span className="flex items-center gap-1">
          <RiskDot riskLevel="amber" size={8} /> At risk (≥70%)
        </span>
        <span className="flex items-center gap-1">
          <RiskDot riskLevel="red" size={8} /> Critical (≥90%)
        </span>
        <span className="flex items-center gap-1">
          <RiskDot riskLevel="breached" size={8} /> Breached
        </span>
        {groupBy === "status" && (
          <span className="ml-auto italic">Drag a card between columns to update status →</span>
        )}
      </div>

      {/* Board */}
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden px-5 py-3">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={(e) => setOverId(e.over ? String(e.over.id) : null)}
          onDragEnd={handleDragEnd}
          onDragCancel={() => {
            setActiveId(null);
            setOverId(null);
          }}
        >
          <div className="flex gap-3 h-full min-h-0">
            {columns.map((col) => (
              <Column key={col.id} id={col.id} isOver={overId === col.id && groupBy === "status"}>
                <div className={`shrink-0 flex items-center justify-between px-3 py-2 border-b ${col.accent}`}>
                  <span className="text-[11px] font-semibold text-cream">{col.label}</span>
                  <span className="text-[10px] text-gray-muted tabular-nums px-1.5 py-0.5 rounded-md bg-white/[0.05]">
                    {col.cases.length}
                  </span>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-2 space-y-2">
                  {col.cases.map((c) => (
                    <DraggableCase key={c.id} c={c} />
                  ))}
                  {col.cases.length === 0 && (
                    <div className="text-center py-6 text-[10px] text-gray-muted/60">
                      No cases
                    </div>
                  )}
                </div>
              </Column>
            ))}
          </div>

          <DragOverlay>
            {activeCase ? (
              <div className="w-[230px] rotate-2">
                <CaseCard c={activeCase} isDragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Inbox;
  label: string;
  value: string | number;
  tone: "blue" | "amber" | "rose" | "muted";
}) {
  const toneColor = {
    blue: "text-adl-blue",
    amber: "text-amber-300",
    rose: "text-rose-300",
    muted: "text-gray-muted",
  }[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="flex items-center gap-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2"
    >
      <div className="p-1.5 rounded-lg bg-white/[0.05]">
        <Icon size={15} className={toneColor} />
      </div>
      <div>
        <p className="text-base font-bold text-cream font-playfair leading-none tabular-nums">
          {value}
        </p>
        <p className="text-[9px] text-gray-muted uppercase tracking-wide mt-0.5">
          {label}
        </p>
      </div>
    </motion.div>
  );
}
