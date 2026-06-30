/**
 * Case triage — ITIL impact × urgency → priority (P1..P5), plus reference
 * SLA target hours per priority. Targets are illustrative and meant to be
 * calibrated per GPSSA service.
 */

type Level = "low" | "medium" | "high";

const MATRIX: Record<Level, Record<Level, string>> = {
  // [urgency][impact]
  high: { high: "P1", medium: "P2", low: "P3" },
  medium: { high: "P2", medium: "P3", low: "P4" },
  low: { high: "P3", medium: "P4", low: "P5" },
};

export function priorityFor(impact: string, urgency: string): string {
  const i = (impact as Level) in MATRIX.high ? (impact as Level) : "medium";
  const u = (urgency as Level) in MATRIX ? (urgency as Level) : "medium";
  return MATRIX[u][i];
}

/** Reference resolution target (hours) per priority — calibrate per service. */
export const PRIORITY_TARGET_HOURS: Record<string, number> = {
  P1: 4,
  P2: 8,
  P3: 24,
  P4: 72,
  P5: 168,
};

export const PRIORITY_LABEL: Record<string, string> = {
  P1: "Critical",
  P2: "High",
  P3: "Medium",
  P4: "Low",
  P5: "Planning",
};
