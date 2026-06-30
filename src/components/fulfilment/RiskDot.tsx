"use client";

import { RISK_COLOR, type RiskLevel } from "@/lib/fulfilment/aging";

const LABEL: Record<RiskLevel, string> = {
  green: "On track",
  amber: "At risk",
  red: "Critical",
  breached: "Breached",
};

/** A small colored dot / pill reflecting live SLA-breach risk. */
export function RiskDot({
  riskLevel,
  size = 10,
  pulse = false,
}: {
  riskLevel: RiskLevel;
  size?: number;
  pulse?: boolean;
}) {
  const color = RISK_COLOR[riskLevel];
  return (
    <span
      className="relative inline-flex shrink-0"
      style={{ width: size, height: size }}
      title={LABEL[riskLevel]}
      aria-label={LABEL[riskLevel]}
    >
      {pulse && (riskLevel === "red" || riskLevel === "breached") && (
        <span
          className="absolute inset-0 rounded-full animate-ping"
          style={{ backgroundColor: color, opacity: 0.5 }}
        />
      )}
      <span
        className="relative rounded-full"
        style={{ width: size, height: size, backgroundColor: color }}
      />
    </span>
  );
}

/** Horizontal risk bar showing % of SLA window elapsed. */
export function RiskBar({
  pctElapsed,
  riskLevel,
}: {
  pctElapsed: number;
  riskLevel: RiskLevel;
}) {
  const color = RISK_COLOR[riskLevel];
  const width = Math.min(100, Math.max(2, pctElapsed));
  return (
    <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${width}%`, backgroundColor: color }}
      />
    </div>
  );
}

export { LABEL as RISK_LABEL };
