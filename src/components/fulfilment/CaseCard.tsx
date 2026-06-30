"use client";

import { Clock, User2, GripVertical } from "lucide-react";
import { PRIORITY_LABEL } from "@/lib/fulfilment/triage";
import { RiskDot, RiskBar } from "./RiskDot";
import type { FulfilmentCase } from "./types";

const PRIORITY_BADGE: Record<string, string> = {
  P1: "bg-rose-500/15 text-rose-300 border-rose-500/25",
  P2: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  P3: "bg-adl-blue/15 text-adl-blue border-adl-blue/25",
  P4: "bg-gpssa-green/15 text-gpssa-green border-gpssa-green/25",
  P5: "bg-gray-muted/15 text-gray-muted border-gray-muted/25",
};

const SEGMENT_LABEL: Record<string, string> = {
  "straight-through": "Straight-through",
  "manual-review": "Manual review",
  specialist: "Specialist",
};

function formatBreach(hoursToBreach: number, resolved: boolean): string {
  if (resolved) return "Resolved";
  if (hoursToBreach < 0) {
    const over = Math.abs(hoursToBreach);
    return over >= 24 ? `${(over / 24).toFixed(1)}d over` : `${over.toFixed(0)}h over`;
  }
  if (hoursToBreach < 24) return `${hoursToBreach.toFixed(0)}h to breach`;
  return `${(hoursToBreach / 24).toFixed(1)}d to breach`;
}

interface CaseCardProps {
  c: FulfilmentCase;
  onClick?: () => void;
  dragHandleProps?: Record<string, unknown>;
  isDragging?: boolean;
}

export function CaseCard({ c, onClick, dragHandleProps, isDragging }: CaseCardProps) {
  const resolved = c.status === "resolved";
  return (
    <div
      onClick={onClick}
      className={`group rounded-xl border bg-white/[0.03] border-white/[0.07] p-3 transition-all ${
        onClick ? "cursor-pointer hover:bg-white/[0.06] hover:border-white/[0.14]" : ""
      } ${isDragging ? "opacity-60 ring-1 ring-gpssa-green/40" : ""}`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <RiskDot riskLevel={resolved ? "green" : c.riskLevel} size={9} pulse />
          <span className="text-[11px] font-semibold text-cream tabular-nums truncate">
            {c.caseRef}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span
            className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold border ${
              PRIORITY_BADGE[c.priority] ?? PRIORITY_BADGE.P3
            }`}
            title={PRIORITY_LABEL[c.priority]}
          >
            {c.priority} · {PRIORITY_LABEL[c.priority]}
          </span>
          {dragHandleProps && (
            <span
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing text-gray-muted hover:text-cream touch-none"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical size={13} />
            </span>
          )}
        </div>
      </div>

      <p className="text-[11px] text-cream/90 leading-snug mb-1.5 line-clamp-1">
        {c.serviceName}
      </p>

      <div className="flex items-center gap-2 text-[9px] text-gray-muted mb-2">
        <span className="px-1.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
          {SEGMENT_LABEL[c.segment] ?? c.segment}
        </span>
        <span className="flex items-center gap-1 truncate">
          <User2 size={9} />
          {c.owner ?? "Unassigned"}
        </span>
      </div>

      {!resolved && <RiskBar pctElapsed={c.pctElapsed} riskLevel={c.riskLevel} />}

      <div className="flex items-center justify-between mt-1.5 text-[9px] text-gray-muted">
        <span className="flex items-center gap-1">
          <Clock size={9} />
          {c.ageDays}d old
        </span>
        <span
          className={
            !resolved && c.hoursToBreach < 0
              ? "text-rose-300 font-medium"
              : !resolved && c.riskLevel === "amber"
              ? "text-amber-300"
              : "text-gray-muted"
          }
        >
          {formatBreach(c.hoursToBreach, resolved)}
        </span>
      </div>
    </div>
  );
}

export { PRIORITY_BADGE, SEGMENT_LABEL };
