import type { RiskLevel } from "@/lib/fulfilment/aging";

export type CaseStatus = "open" | "in-progress" | "on-hold" | "resolved";

export interface FulfilmentCase {
  id: string;
  caseRef: string;
  serviceName: string | null;
  segment: string;
  impact: string;
  urgency: string;
  priority: string;
  status: CaseStatus;
  owner: string | null;
  openedAt: string;
  dueAt: string | null;
  resolvedAt: string | null;
  slaId: string | null;
  slaName: string | null;
  slaTier: string | null;
  slaTargetHours: number | null;
  // Live aging (recomputed server-side at request time)
  ageDays: number;
  ageHours: number;
  pctElapsed: number;
  riskLevel: RiskLevel;
  hoursToBreach: number;
  bucket: string;
}
