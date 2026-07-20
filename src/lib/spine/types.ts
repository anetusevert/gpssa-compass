export type SpineNodeId =
  | "episode"
  | "journey"
  | "process"
  | "systems"
  | "qa";

export interface SpineNodeLit {
  id: SpineNodeId;
  label: string;
  lit: boolean;
  count: number;
  summary: string;
}

export interface SpineServiceListItem {
  id: string;
  name: string;
  category: string;
  isGoldPath: boolean;
  litNodes: SpineNodeId[];
  counts: {
    episodes: number;
    stages: number;
    sopSteps: number;
    systems: number;
    openCases: number;
    openCapas: number;
  };
}

export interface SpineGraphPayload {
  service: { id: string; name: string; category: string; description: string | null };
  isGoldPath: boolean;
  nodes: SpineNodeLit[];
  edges: { from: SpineNodeId; to: SpineNodeId; lit: boolean }[];
  episode: { id: string; name: string; description: string | null } | null;
  stages: {
    id: string;
    name: string;
    actor: string;
    outcome: string | null;
    sortOrder: number;
  }[];
  processes: {
    id: string;
    name: string;
    description: string | null;
    ownerHint: string | null;
    sop: {
      id: string;
      title: string;
      version: string;
      steps: {
        id: string;
        title: string;
        instruction: string | null;
        qaCheckpoint: boolean;
        checkpointNote: string | null;
        sortOrder: number;
      }[];
    } | null;
    systems: { id: string; code: string; name: string; kind: string; role: string }[];
  }[];
  fulfilment: {
    slas: { id: string; name: string; tier: string; targetHours: number }[];
    cases: {
      id: string;
      caseRef: string;
      status: string;
      breachRiskLevel: string;
      breached: boolean;
      owner: string | null;
    }[];
    breachCount: number;
  };
  quality: {
    scorecards: { id: string; name: string; status: string }[];
    reviewCount: number;
    defects: { id: string; severity: string; status: string; caseRef: string | null }[];
    capas: { id: string; title: string; status: string; owner: string | null }[];
  };
  deepLinks: { label: string; href: string }[];
}
