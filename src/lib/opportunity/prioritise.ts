/**
 * Opportunity prioritisation scoring — RICE and WSJF (SAFe).
 *   RICE  = (Reach × Impact × Confidence) / Effort
 *   WSJF  = Cost of Delay / Job Size,  CoD = UserValue + TimeCriticality + RiskReduction
 */

export interface RiceInput {
  reach: number; // people / period
  impact: number; // 0.25, 0.5, 1, 2, 3
  confidence: number; // 0..1
  effort: number; // person-weeks (>0)
}

export function rice({ reach, impact, confidence, effort }: RiceInput): number {
  if (!effort || effort <= 0) return 0;
  return Math.round(((reach * impact * confidence) / effort) * 10) / 10;
}

export interface WsjfInput {
  userValue: number; // 1..10
  timeCriticality: number; // 1..10
  riskReduction: number; // 1..10
  jobSize: number; // 1..10 (>0)
}

export function wsjf({ userValue, timeCriticality, riskReduction, jobSize }: WsjfInput): number {
  if (!jobSize || jobSize <= 0) return 0;
  const cod = userValue + timeCriticality + riskReduction;
  return Math.round((cod / jobSize) * 100) / 100;
}

/** Map the existing low/medium/high impact & effort strings to numeric for quick scoring. */
export const IMPACT_NUM: Record<string, number> = { low: 0.5, medium: 1, high: 2 };
export const EFFORT_NUM: Record<string, number> = { low: 2, medium: 5, high: 10 };
