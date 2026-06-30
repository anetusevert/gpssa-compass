/**
 * Case aging & breach-risk early-warning. Risk is computed relative to "now"
 * at request time (never persisted) so the demo board always looks live:
 * amber at ≥70% of SLA elapsed, red at ≥90%, breached past 100%.
 */

export type RiskLevel = "green" | "amber" | "red" | "breached";

export interface Aging {
  ageHours: number;
  ageDays: number;
  pctElapsed: number; // 0..>100
  riskLevel: RiskLevel;
  hoursToBreach: number; // negative if already breached
}

export function agingFor(
  openedAt: Date | string,
  dueAt: Date | string | null | undefined,
  now: Date = new Date()
): Aging {
  const opened = new Date(openedAt).getTime();
  const nowMs = now.getTime();
  const ageHours = Math.max(0, (nowMs - opened) / 36e5);
  const ageDays = Math.round((ageHours / 24) * 10) / 10;

  if (!dueAt) {
    return { ageHours, ageDays, pctElapsed: 0, riskLevel: "green", hoursToBreach: Infinity };
  }

  const due = new Date(dueAt).getTime();
  const totalWindow = Math.max(1, (due - opened) / 36e5);
  const pctElapsed = Math.round(((nowMs - opened) / 36e5 / totalWindow) * 1000) / 10;
  const hoursToBreach = Math.round(((due - nowMs) / 36e5) * 10) / 10;

  let riskLevel: RiskLevel = "green";
  if (pctElapsed >= 100) riskLevel = "breached";
  else if (pctElapsed >= 90) riskLevel = "red";
  else if (pctElapsed >= 70) riskLevel = "amber";

  return { ageHours, ageDays, pctElapsed, riskLevel, hoursToBreach };
}

/** Aging bucket for backlog views. */
export function agingBucket(ageDays: number): string {
  if (ageDays <= 10) return "0–10 days";
  if (ageDays <= 20) return "11–20 days";
  if (ageDays <= 30) return "21–30 days";
  return ">30 days";
}

export const RISK_COLOR: Record<RiskLevel, string> = {
  green: "var(--gpssa-green)",
  amber: "var(--amber)",
  red: "var(--rose)",
  breached: "var(--rose)",
};
