/**
 * Engagement playbook — RFP GPSSA-016-2026 phase → screens map.
 * Powers Home Engagement Mode, Focus sidebar, and Next Action bars.
 */

export type EngagementPhaseId =
  | "discover"
  | "evidence"
  | "shape"
  | "lock"
  | "handover";

export type ProjectJob = "diagnose" | "decide" | "design";

export interface PlaybookScreen {
  href: string;
  label: string;
  why: string;
  ownerHint: string;
  job: ProjectJob;
}

export interface EngagementPhase {
  id: EngagementPhaseId;
  label: string;
  weeks: string;
  rfpRefs: string;
  summary: string;
  /** What the team does this phase */
  what: string;
  /** How to use Compass this week */
  how: string;
  /** Why it matters for the RFP / handover */
  value: string;
  /** Accent for morph stage */
  accent: string;
  screens: PlaybookScreen[];
}

export const PROJECT_JOBS: { id: ProjectJob; label: string; blurb: string }[] = [
  {
    id: "diagnose",
    label: "Diagnose the estate",
    blurb: "Catalogue, channels, mandate/RFP anchors, known gaps.",
  },
  {
    id: "decide",
    label: "Decide the roadmap",
    blurb: "Opportunities → ranked backlog → 12-month plan with owners.",
  },
  {
    id: "design",
    label: "Design / pilot QA & fulfilment",
    blurb: "Scorecards, cases, SLA/breach, then handover.",
  },
];

export const ENGAGEMENT_PHASES: EngagementPhase[] = [
  {
    id: "discover",
    label: "Discover",
    weeks: "W1–4",
    rfpRefs: "A1 · B1",
    summary: "Current-state diagnostic across services, products, QA and fulfilment.",
    what: "Map today’s service estate, channels, QA practices and case reality — and write down what you still don’t know.",
    how: "Open Catalog → capture workshop notes → Channels → RFP Alignment. Stay on Focus nav; ignore the rest.",
    value: "A shared baseline the room trusts — every later opportunity and QA design hangs off this.",
    accent: "#00A86B",
    screens: [
      {
        href: "/dashboard/services/catalog",
        label: "Service Catalog",
        why: "Baseline the ~35-service estate and pain points.",
        ownerHint: "Service lead",
        job: "diagnose",
      },
      {
        href: "/dashboard/services/operating",
        label: "Operating Blueprint",
        why: "Prove one service end-to-end: episode → SOP → systems → QA.",
        ownerHint: "Service / QA lead",
        job: "diagnose",
      },
      {
        href: "/dashboard/services/channels",
        label: "Channel Capabilities",
        why: "Map where each service is delivered today.",
        ownerHint: "Channel owner",
        job: "diagnose",
      },
      {
        href: "/dashboard/mandate/rfi-alignment",
        label: "RFP Alignment",
        why: "Tie every finding to RFP GPSSA-016-2026.",
        ownerHint: "Engagement lead",
        job: "diagnose",
      },
      {
        href: "/dashboard/quality/framework",
        label: "QA Framework",
        why: "Discover current quality practices (B1).",
        ownerHint: "QA lead",
        job: "design",
      },
      {
        href: "/dashboard/fulfilment/cases",
        label: "Case Board",
        why: "See case classification and fulfilment reality.",
        ownerHint: "Ops lead",
        job: "design",
      },
    ],
  },
  {
    id: "evidence",
    label: "Evidence",
    weeks: "W2–5",
    rfpRefs: "A2",
    summary: "Customer and operational performance — breach, VoC, benefits gaps.",
    what: "Quantify performance: breaches, ageing, VoC themes and benefits gaps from past initiatives.",
    how: "Walk Breach → Analytics → VoC → Benefits. Treat gold seed as rehearsal until client extracts land.",
    value: "Evidence that sponsors cannot dismiss — the case for change before you propose solutions.",
    accent: "#E76363",
    screens: [
      {
        href: "/dashboard/fulfilment/breach",
        label: "Breach & Aging",
        why: "Quantify breaches and early-warning gaps.",
        ownerHint: "Ops lead",
        job: "diagnose",
      },
      {
        href: "/dashboard/fulfilment/analytics",
        label: "Fulfilment Analytics",
        why: "Backlog, rework, turnaround trends.",
        ownerHint: "Ops lead",
        job: "diagnose",
      },
      {
        href: "/dashboard/performance/voc",
        label: "Voice of Customer",
        why: "CSAT / DSAT / NPS / complaint themes.",
        ownerHint: "CX lead",
        job: "diagnose",
      },
      {
        href: "/dashboard/performance/benefits",
        label: "Benefits Realisation",
        why: "What past initiatives delivered — and what didn’t.",
        ownerHint: "PMO",
        job: "decide",
      },
    ],
  },
  {
    id: "shape",
    label: "Shape",
    weeks: "W6–14",
    rfpRefs: "A3–A4 · B2",
    summary: "Opportunities, prioritisation, and QA framework design.",
    what: "Turn gaps into a ranked opportunity backlog and co-design the QA scorecard model.",
    how: "Log opportunities with owner + RFP section → rank → open Scorecards / Reviews for B2 design.",
    value: "A defensible shortlist and a QA blueprint the sector can pilot — not a slide deck of ideas.",
    accent: "#E7B02E",
    screens: [
      {
        href: "/dashboard/planning/backlog",
        label: "Opportunity Backlog",
        why: "Capture and rank opportunities with owners.",
        ownerHint: "PMO",
        job: "decide",
      },
      {
        href: "/dashboard/products/portfolio",
        label: "Products Portfolio",
        why: "Link opportunities to product tiers.",
        ownerHint: "Product lead",
        job: "decide",
      },
      {
        href: "/dashboard/quality/scorecards",
        label: "QA Scorecards",
        why: "Co-design scoring dimensions (B2).",
        ownerHint: "QA lead",
        job: "design",
      },
      {
        href: "/dashboard/quality/reviews",
        label: "Reviews & Sampling",
        why: "Define review methodology before pilot.",
        ownerHint: "QA lead",
        job: "design",
      },
    ],
  },
  {
    id: "lock",
    label: "Lock",
    weeks: "W13–17",
    rfpRefs: "A5 · B3",
    summary: "Lock the 12-month roadmap and run the QA pilot.",
    what: "Freeze the 12-month roadmap and run QA / fulfilment controls on a named pilot set.",
    how: "Confirm roadmap phases → set pilot services on QA Framework → run Reviews and Case Board on that set.",
    value: "Proof the model works on real services before sector-wide rollout.",
    accent: "#4899FF",
    screens: [
      {
        href: "/dashboard/planning",
        label: "12-Month Roadmap",
        why: "Phases, dependencies, expected value.",
        ownerHint: "Engagement lead",
        job: "decide",
      },
      {
        href: "/dashboard/quality/reviews",
        label: "Pilot Reviews",
        why: "Execute QA reviews on the pilot service set.",
        ownerHint: "QA lead",
        job: "design",
      },
      {
        href: "/dashboard/fulfilment/cases",
        label: "Case Board",
        why: "Pilot fulfilment controls on selected services.",
        ownerHint: "Ops lead",
        job: "design",
      },
      {
        href: "/dashboard/fulfilment/sla",
        label: "SLA / OLA",
        why: "Confirm differentiated treatment before rollout.",
        ownerHint: "Ops lead",
        job: "design",
      },
    ],
  },
  {
    id: "handover",
    label: "Handover",
    weeks: "W16–20",
    rfpRefs: "A6 · B5",
    summary: "RACI, operating model, KPI/KQI, leave-behind operating picture.",
    what: "Hand GPSSA a living operating picture: RACI, operating model, KPI/KQI and the leave-behind briefing.",
    how: "Fill Governance & RACI → Operating Model → KPI catalogue → open Executive Briefing for sponsors.",
    value: "Capability transfer they can run without the project team — the engagement’s lasting asset.",
    accent: "#7DB9A4",
    screens: [
      {
        href: "/dashboard/planning/governance",
        label: "Governance & RACI",
        why: "Forums, routines, accountable owners.",
        ownerHint: "Engagement lead",
        job: "decide",
      },
      {
        href: "/dashboard/planning/operating-model",
        label: "Operating Model",
        why: "Capability transfer requirements.",
        ownerHint: "Engagement lead",
        job: "decide",
      },
      {
        href: "/dashboard/performance/catalogue",
        label: "KPI / KQI Catalogue",
        why: "Measures that sustain the target model.",
        ownerHint: "PMO",
        job: "decide",
      },
      {
        href: "/dashboard",
        label: "Home & Briefing",
        why: "Leave-behind operating picture for sponsors.",
        ownerHint: "Sponsor",
        job: "decide",
      },
    ],
  },
];

const DEMO_PATH_PREFIXES = [
  "/dashboard/quality",
  "/dashboard/fulfilment",
  "/dashboard/performance",
  "/dashboard/planning",
  "/dashboard/services/operating",
] as const;

export function isDemoDataPath(pathname: string): boolean {
  return DEMO_PATH_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export function getPhase(id: EngagementPhaseId): EngagementPhase {
  return ENGAGEMENT_PHASES.find((p) => p.id === id) ?? ENGAGEMENT_PHASES[0];
}

export function getPhaseForPath(pathname: string): EngagementPhase | null {
  for (const phase of ENGAGEMENT_PHASES) {
    if (phase.screens.some((s) => s.href === pathname || (s.href !== "/dashboard" && pathname.startsWith(s.href)))) {
      return phase;
    }
  }
  return null;
}

export function getScreenMeta(pathname: string): PlaybookScreen | null {
  for (const phase of ENGAGEMENT_PHASES) {
    const hit = phase.screens.find(
      (s) => s.href === pathname || (s.href !== "/dashboard" && pathname.startsWith(`${s.href}/`))
    );
    if (hit) return hit;
  }
  return null;
}

/** Next screen in the same phase, or first screen of the following phase. */
export function getNextAction(pathname: string): {
  phase: EngagementPhase;
  current: PlaybookScreen | null;
  next: PlaybookScreen;
  label: string;
} | null {
  const phase = getPhaseForPath(pathname) ?? ENGAGEMENT_PHASES[0];
  const idx = phase.screens.findIndex(
    (s) => s.href === pathname || (s.href !== "/dashboard" && pathname.startsWith(s.href))
  );
  if (idx >= 0 && idx < phase.screens.length - 1) {
    const next = phase.screens[idx + 1];
    return {
      phase,
      current: phase.screens[idx],
      next,
      label: `Next in ${phase.label}: ${next.label}`,
    };
  }
  const phaseIdx = ENGAGEMENT_PHASES.findIndex((p) => p.id === phase.id);
  const following = ENGAGEMENT_PHASES[phaseIdx + 1];
  if (following?.screens[0]) {
    return {
      phase,
      current: idx >= 0 ? phase.screens[idx] : null,
      next: following.screens[0],
      label: `Advance to ${following.label}: ${following.screens[0].label}`,
    };
  }
  if (idx < 0 && phase.screens[0]) {
    return {
      phase,
      current: null,
      next: phase.screens[0],
      label: `Start ${phase.label}: ${phase.screens[0].label}`,
    };
  }
  return null;
}

export function focusHrefsForPhase(phaseId: EngagementPhaseId): Set<string> {
  const phase = getPhase(phaseId);
  return new Set(phase.screens.map((s) => s.href));
}

export const PLAYBOOK_ONE_LINER =
  "Catalogue → evidence → opportunities → roadmap → QA/fulfilment — tied to RFP GPSSA-016-2026.";

export const ENGAGEMENT_FIRST_KEY = "gpssa_engagement_first_v1";
