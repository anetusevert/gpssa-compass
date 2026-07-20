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
    screens: [
      {
        href: "/dashboard/services/catalog",
        label: "Service Catalog",
        why: "Baseline the ~35-service estate and pain points.",
        ownerHint: "Service lead",
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
