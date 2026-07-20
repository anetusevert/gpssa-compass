import type { EngagementPhaseId } from "@/lib/engagement/playbook";
import type { SpineNodeId } from "./types";

/** Which spine nodes a project phase emphasises when Engagement Conductor is on. */
export const PHASE_SPINE_EMPHASIS: Record<EngagementPhaseId, SpineNodeId[]> = {
  discover: ["episode", "journey"],
  evidence: ["systems", "journey"],
  shape: ["process"],
  lock: ["qa", "process"],
  handover: ["episode", "journey", "process", "systems", "qa"],
};

export const PHASE_SPINE_ACCENT: Record<EngagementPhaseId, string> = {
  discover: "#00A86B",
  evidence: "#E76363",
  shape: "#E7B02E",
  lock: "#4899FF",
  handover: "#7DB9A4",
};

export function emphasizedNodes(
  phaseId: EngagementPhaseId | null,
  conducting: boolean
): Set<SpineNodeId> {
  if (!conducting || !phaseId) return new Set();
  return new Set(PHASE_SPINE_EMPHASIS[phaseId]);
}
