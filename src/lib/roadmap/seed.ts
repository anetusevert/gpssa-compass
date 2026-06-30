import type { PrismaClient } from "@prisma/client";
import {
  rice,
  wsjf,
  IMPACT_NUM,
  EFFORT_NUM,
} from "@/lib/opportunity/prioritise";

/**
 * Idempotently seed the Roadmap & Governance showcase module.
 *
 * Sources: RFP #GPSSA-016-2026 §2.3 (two-workstream phase plan),
 * Research Part C (prioritisation: RICE / WSJF / MoSCoW) and
 * Part E (federated CoE operating model, tiered governance routines,
 * sector-wide RACI, capability transfer).
 *
 * Stable ids (rmp-*, rmi-*, gov-*, raci-*, cap-*, opp-*) keep the seed
 * re-runnable: every record is upserted by primary key.
 */
export async function seedRoadmapGovernance(prisma: PrismaClient): Promise<{
  phases: number;
  initiatives: number;
  opportunities: number;
  forums: number;
  raci: number;
  capability: number;
}> {
  // ──────────────────────────────────────────────────────────────────────
  // 1. RFP §2.3 phase plan — Workstream A (6) + Workstream B (5).
  //    Week bands stored as "Week N" strings (consistent across the set).
  // ──────────────────────────────────────────────────────────────────────
  const phases: Array<{
    id: string;
    name: string;
    workstream: "A" | "B";
    startWeek: number;
    endWeek: number;
    description: string;
    objectives: string[];
    sortOrder: number;
  }> = [
    // Workstream A — Product & Service Roadmap
    {
      id: "rmp-A1",
      name: "P1 · Current-State Diagnostic",
      workstream: "A",
      startWeek: 1,
      endWeek: 4,
      description:
        "Baseline the current product and service estate, channels, and operating data.",
      objectives: [
        "Service & product inventory baselined",
        "Channel maturity assessed",
        "Pain-point heatmap produced",
      ],
      sortOrder: 1,
    },
    {
      id: "rmp-A2",
      name: "P2 · Customer & Service Performance Review",
      workstream: "A",
      startWeek: 2,
      endWeek: 5,
      description:
        "Voice-of-customer, segment analysis and service performance benchmarking.",
      objectives: [
        "VoC & persona insights synthesised",
        "Performance benchmarked vs peers",
        "Segment coverage gaps mapped",
      ],
      sortOrder: 2,
    },
    {
      id: "rmp-A3",
      name: "P3 · Opportunity Identification",
      workstream: "A",
      startWeek: 6,
      endWeek: 10,
      description:
        "Generate the opportunity longlist across enhancement, new-product and innovation categories.",
      objectives: [
        "Opportunity longlist created",
        "Concept sheets for top ideas",
        "Cross-entity bundles explored",
      ],
      sortOrder: 3,
    },
    {
      id: "rmp-A4",
      name: "P4 · Prioritization & Sequencing",
      workstream: "A",
      startWeek: 9,
      endWeek: 14,
      description:
        "Score the backlog (RICE / WSJF / MoSCoW) and sequence into waves.",
      objectives: [
        "Backlog scored (RICE & WSJF)",
        "MoSCoW scope agreed",
        "Wave sequencing locked",
      ],
      sortOrder: 4,
    },
    {
      id: "rmp-A5",
      name: "P5 · Roadmap Development",
      workstream: "A",
      startWeek: 13,
      endWeek: 17,
      description:
        "Build the multi-horizon roadmap with benefits cases and dependencies.",
      objectives: [
        "12-month roadmap drafted",
        "Benefits cases attached",
        "Dependencies resolved",
      ],
      sortOrder: 5,
    },
    {
      id: "rmp-A6",
      name: "P6 · Operating Model, Governance & Finalize",
      workstream: "A",
      startWeek: 16,
      endWeek: 20,
      description:
        "Define the operating model & governance and finalise the roadmap for handover.",
      objectives: [
        "Federated CoE model defined",
        "Governance rhythm stood up",
        "Roadmap signed off",
      ],
      sortOrder: 6,
    },
    // Workstream B — QA & Service Fulfilment Framework
    {
      id: "rmp-B1",
      name: "P1 · Current-State Discovery",
      workstream: "B",
      startWeek: 1,
      endWeek: 3,
      description:
        "Discover the quality, fulfilment and breach baseline across the sector.",
      objectives: [
        "Quality baseline captured",
        "Breach & TAT data gathered",
        "Stakeholder map agreed",
      ],
      sortOrder: 7,
    },
    {
      id: "rmp-B2",
      name: "P2 · QA Framework Design",
      workstream: "B",
      startWeek: 4,
      endWeek: 9,
      description:
        "Design scorecards, sampling, error taxonomy and KPI/KQI catalogue.",
      objectives: [
        "QA scorecards designed",
        "Sampling plans defined",
        "Error taxonomy built",
      ],
      sortOrder: 8,
    },
    {
      id: "rmp-B3",
      name: "P3 · Pilot Deployment",
      workstream: "B",
      startWeek: 10,
      endWeek: 14,
      description:
        "Pilot the framework on a focus service, calibrate and prove the model.",
      objectives: [
        "Pilot service instrumented",
        "Calibration sessions run",
        "Pilot results validated",
      ],
      sortOrder: 9,
    },
    {
      id: "rmp-B4",
      name: "P4 · Full Sector Deployment",
      workstream: "B",
      startWeek: 15,
      endWeek: 17,
      description: "Roll the proven framework out across the full pension sector.",
      objectives: [
        "Sector-wide rollout",
        "OLA / SLA hand-offs live",
        "Dashboards in production",
      ],
      sortOrder: 10,
    },
    {
      id: "rmp-B5",
      name: "P5 · Capability Transfer & Handover",
      workstream: "B",
      startWeek: 18,
      endWeek: 20,
      description:
        "Train-the-trainer, playbooks and sustainment metrics so gains hold after handover.",
      objectives: [
        "Train-the-trainer complete",
        "Playbooks embedded",
        "Sustainment metrics live",
      ],
      sortOrder: 11,
    },
  ];

  for (const p of phases) {
    const data = {
      name: p.name,
      description: p.description,
      workstream: p.workstream,
      startDate: `Week ${p.startWeek}`,
      endDate: `Week ${p.endWeek}`,
      objectives: JSON.stringify(p.objectives),
      sortOrder: p.sortOrder,
    };
    await prisma.roadmapPhase.upsert({
      where: { id: p.id },
      update: data,
      create: { id: p.id, ...data },
    });
  }

  // ──────────────────────────────────────────────────────────────────────
  // 2. Initiatives — 2-4 per phase.
  // ──────────────────────────────────────────────────────────────────────
  const initiatives: Array<{
    id: string;
    phaseId: string;
    title: string;
    owner: string;
    status: string;
    estimatedImpact: string;
    dependencies: string[];
    sortOrder: number;
  }> = [
    // A1
    { id: "rmi-A1-1", phaseId: "rmp-A1", title: "Service & product inventory", owner: "Strategy PMO", status: "completed", estimatedImpact: "Foundational baseline", dependencies: [], sortOrder: 1 },
    { id: "rmi-A1-2", phaseId: "rmp-A1", title: "Channel maturity assessment", owner: "Digital Lead", status: "completed", estimatedImpact: "Channel gap map", dependencies: ["rmi-A1-1"], sortOrder: 2 },
    { id: "rmi-A1-3", phaseId: "rmp-A1", title: "Operating-data extract", owner: "Data Office", status: "in-progress", estimatedImpact: "Quant baseline", dependencies: [], sortOrder: 3 },
    // A2
    { id: "rmi-A2-1", phaseId: "rmp-A2", title: "Voice-of-customer synthesis", owner: "CX Lead", status: "in-progress", estimatedImpact: "Customer insight", dependencies: ["rmi-A1-3"], sortOrder: 1 },
    { id: "rmi-A2-2", phaseId: "rmp-A2", title: "Peer performance benchmark", owner: "Benchmark Team", status: "planned", estimatedImpact: "Target setting", dependencies: [], sortOrder: 2 },
    { id: "rmi-A2-3", phaseId: "rmp-A2", title: "Segment coverage analysis", owner: "Product Strategy", status: "planned", estimatedImpact: "Coverage gaps", dependencies: ["rmi-A2-1"], sortOrder: 3 },
    // A3
    { id: "rmi-A3-1", phaseId: "rmp-A3", title: "Opportunity longlist workshops", owner: "Innovation Lead", status: "planned", estimatedImpact: "Idea pipeline", dependencies: ["rmi-A2-3"], sortOrder: 1 },
    { id: "rmi-A3-2", phaseId: "rmp-A3", title: "Concept-sheet drafting", owner: "Product Strategy", status: "planned", estimatedImpact: "Decision-ready concepts", dependencies: ["rmi-A3-1"], sortOrder: 2 },
    { id: "rmi-A3-3", phaseId: "rmp-A3", title: "Cross-entity bundle scan", owner: "Partnerships", status: "planned", estimatedImpact: "Ecosystem value", dependencies: [], sortOrder: 3 },
    // A4
    { id: "rmi-A4-1", phaseId: "rmp-A4", title: "RICE / WSJF scoring", owner: "Strategy PMO", status: "planned", estimatedImpact: "Objective ranking", dependencies: ["rmi-A3-2"], sortOrder: 1 },
    { id: "rmi-A4-2", phaseId: "rmp-A4", title: "MoSCoW scope agreement", owner: "Exec Sponsor", status: "planned", estimatedImpact: "Scope discipline", dependencies: ["rmi-A4-1"], sortOrder: 2 },
    { id: "rmi-A4-3", phaseId: "rmp-A4", title: "Wave sequencing", owner: "Strategy PMO", status: "planned", estimatedImpact: "Delivery sequence", dependencies: ["rmi-A4-2"], sortOrder: 3 },
    // A5
    { id: "rmi-A5-1", phaseId: "rmp-A5", title: "Roadmap assembly", owner: "Strategy PMO", status: "planned", estimatedImpact: "12-month plan", dependencies: ["rmi-A4-3"], sortOrder: 1 },
    { id: "rmi-A5-2", phaseId: "rmp-A5", title: "Benefits-case attachment", owner: "Finance BP", status: "planned", estimatedImpact: "Value tracking", dependencies: ["rmi-A5-1"], sortOrder: 2 },
    { id: "rmi-A5-3", phaseId: "rmp-A5", title: "Dependency resolution", owner: "Delivery Lead", status: "planned", estimatedImpact: "De-risked plan", dependencies: ["rmi-A5-1"], sortOrder: 3 },
    // A6
    { id: "rmi-A6-1", phaseId: "rmp-A6", title: "Federated CoE design", owner: "COO", status: "planned", estimatedImpact: "Operating model", dependencies: ["rmi-A5-1"], sortOrder: 1 },
    { id: "rmi-A6-2", phaseId: "rmp-A6", title: "Governance rhythm stand-up", owner: "Quality Council", status: "planned", estimatedImpact: "Decision cadence", dependencies: ["rmi-A6-1"], sortOrder: 2 },
    { id: "rmi-A6-3", phaseId: "rmp-A6", title: "Roadmap sign-off", owner: "Exec Sponsor", status: "planned", estimatedImpact: "Mandate to deliver", dependencies: ["rmi-A6-2"], sortOrder: 3 },
    // B1
    { id: "rmi-B1-1", phaseId: "rmp-B1", title: "Quality baseline capture", owner: "QA Lead", status: "in-progress", estimatedImpact: "Quality baseline", dependencies: [], sortOrder: 1 },
    { id: "rmi-B1-2", phaseId: "rmp-B1", title: "Breach & TAT data pull", owner: "Ops Analytics", status: "in-progress", estimatedImpact: "Fulfilment baseline", dependencies: [], sortOrder: 2 },
    { id: "rmi-B1-3", phaseId: "rmp-B1", title: "Stakeholder mapping", owner: "Change Lead", status: "planned", estimatedImpact: "Engagement plan", dependencies: [], sortOrder: 3 },
    // B2
    { id: "rmi-B2-1", phaseId: "rmp-B2", title: "QA scorecard design", owner: "QA Lead", status: "planned", estimatedImpact: "COPC-aligned scorecards", dependencies: ["rmi-B1-1"], sortOrder: 1 },
    { id: "rmi-B2-2", phaseId: "rmp-B2", title: "Sampling plan definition", owner: "QA Analyst", status: "planned", estimatedImpact: "Statistical rigour", dependencies: ["rmi-B2-1"], sortOrder: 2 },
    { id: "rmi-B2-3", phaseId: "rmp-B2", title: "Error taxonomy & KPI/KQI catalogue", owner: "Quality CoE", status: "planned", estimatedImpact: "Single source of truth", dependencies: ["rmi-B2-1"], sortOrder: 3 },
    // B3
    { id: "rmi-B3-1", phaseId: "rmp-B3", title: "Pilot instrumentation", owner: "QA Lead", status: "planned", estimatedImpact: "Live measurement", dependencies: ["rmi-B2-3"], sortOrder: 1 },
    { id: "rmi-B3-2", phaseId: "rmp-B3", title: "Calibration sessions", owner: "Quality CoE", status: "planned", estimatedImpact: "Rater reliability", dependencies: ["rmi-B3-1"], sortOrder: 2 },
    { id: "rmi-B3-3", phaseId: "rmp-B3", title: "Pilot results validation", owner: "Exec Sponsor", status: "planned", estimatedImpact: "Proof of model", dependencies: ["rmi-B3-2"], sortOrder: 3 },
    // B4
    { id: "rmi-B4-1", phaseId: "rmp-B4", title: "Sector-wide rollout", owner: "Quality Council", status: "planned", estimatedImpact: "Full coverage", dependencies: ["rmi-B3-3"], sortOrder: 1 },
    { id: "rmi-B4-2", phaseId: "rmp-B4", title: "SLA / OLA hand-off activation", owner: "Ops Managers", status: "planned", estimatedImpact: "Breach reduction", dependencies: ["rmi-B4-1"], sortOrder: 2 },
    { id: "rmi-B4-3", phaseId: "rmp-B4", title: "Production dashboards", owner: "Data Office", status: "planned", estimatedImpact: "Management visibility", dependencies: ["rmi-B4-1"], sortOrder: 3 },
    // B5
    { id: "rmi-B5-1", phaseId: "rmp-B5", title: "Train-the-trainer programme", owner: "Master Trainer", status: "planned", estimatedImpact: "Internal capability", dependencies: ["rmi-B4-1"], sortOrder: 1 },
    { id: "rmi-B5-2", phaseId: "rmp-B5", title: "Playbook embedding", owner: "Quality CoE", status: "planned", estimatedImpact: "Sustained gains", dependencies: ["rmi-B5-1"], sortOrder: 2 },
    { id: "rmi-B5-3", phaseId: "rmp-B5", title: "Sustainment-metric handover", owner: "Quality Council", status: "planned", estimatedImpact: "Gains hold post-handover", dependencies: ["rmi-B5-2"], sortOrder: 3 },
  ];

  for (const i of initiatives) {
    const data = {
      phaseId: i.phaseId,
      title: i.title,
      owner: i.owner,
      status: i.status,
      estimatedImpact: i.estimatedImpact,
      dependencies: JSON.stringify(i.dependencies),
      sortOrder: i.sortOrder,
    };
    await prisma.roadmapInitiative.upsert({
      where: { id: i.id },
      update: data,
      create: { id: i.id, ...data },
    });
  }

  // ──────────────────────────────────────────────────────────────────────
  // 3. Opportunity backlog — ~10 across the RFP categories, each scored
  //    with RICE and WSJF via the shared prioritise helper.
  // ──────────────────────────────────────────────────────────────────────
  const opportunities: Array<{
    id: string;
    title: string;
    category: string;
    description: string;
    impact: "low" | "medium" | "high";
    effort: "low" | "medium" | "high";
    strategicFit: number;
    feasibility: number;
    status: string;
    sourceSection: string;
    // RICE inputs
    reach: number;
    confidence: number;
    // WSJF inputs
    userValue: number;
    timeCriticality: number;
    riskReduction: number;
    jobSize: number;
    sortOrder: number;
  }> = [
    {
      id: "opp-001",
      title: "End-of-Service self-service portal",
      category: "Existing service enhancement",
      description:
        "Straight-through online end-of-service settlement with status tracking, removing branch dependency.",
      impact: "high", effort: "medium", strategicFit: 0.9, feasibility: 0.8,
      status: "identified", sourceSection: "Part C — Fulfilment",
      reach: 42000, confidence: 0.8, userValue: 9, timeCriticality: 8, riskReduction: 6, jobSize: 5, sortOrder: 1,
    },
    {
      id: "opp-002",
      title: "Proactive breach-risk alerting",
      category: "Supportive / internal product",
      description:
        "Amber/red breach-risk engine on open cases feeding the tiered governance huddles.",
      impact: "high", effort: "low", strategicFit: 0.85, feasibility: 0.9,
      status: "identified", sourceSection: "Part C — Breach reduction",
      reach: 18000, confidence: 0.85, userValue: 8, timeCriticality: 9, riskReduction: 9, jobSize: 3, sortOrder: 2,
    },
    {
      id: "opp-003",
      title: "Gig & self-employed savings product",
      category: "New external product",
      description:
        "Voluntary, flexible-contribution savings scheme extending coverage to the gig and self-employed segment.",
      impact: "high", effort: "high", strategicFit: 0.95, feasibility: 0.55,
      status: "identified", sourceSection: "Roadmap — Innovation",
      reach: 120000, confidence: 0.55, userValue: 9, timeCriticality: 6, riskReduction: 5, jobSize: 9, sortOrder: 3,
    },
    {
      id: "opp-004",
      title: "Unified omni-channel case tracker",
      category: "Existing service enhancement",
      description:
        "One case-status view across app, web, contact-centre and branch with consistent SLAs.",
      impact: "medium", effort: "medium", strategicFit: 0.8, feasibility: 0.75,
      status: "identified", sourceSection: "Part C — Fulfilment",
      reach: 60000, confidence: 0.7, userValue: 7, timeCriticality: 6, riskReduction: 5, jobSize: 5, sortOrder: 4,
    },
    {
      id: "opp-005",
      title: "AI complaint-theme triage",
      category: "Innovation",
      description:
        "NLP clustering of complaints into themes that feed the corrective-action backlog automatically.",
      impact: "medium", effort: "medium", strategicFit: 0.75, feasibility: 0.7,
      status: "identified", sourceSection: "Part D — VoC",
      reach: 25000, confidence: 0.65, userValue: 6, timeCriticality: 5, riskReduction: 6, jobSize: 4, sortOrder: 5,
    },
    {
      id: "opp-006",
      title: "Cross-entity benefits bundle",
      category: "Cross-entity bundle",
      description:
        "Bundled pension + health + housing entitlement view in partnership with sister entities.",
      impact: "high", effort: "high", strategicFit: 0.9, feasibility: 0.5,
      status: "identified", sourceSection: "Roadmap — Bundles",
      reach: 90000, confidence: 0.5, userValue: 8, timeCriticality: 5, riskReduction: 4, jobSize: 8, sortOrder: 6,
    },
    {
      id: "opp-007",
      title: "Retirement-planning simulator",
      category: "New external product",
      description:
        "Interactive benefit-projection simulator helping members plan contributions and retirement timing.",
      impact: "medium", effort: "low", strategicFit: 0.7, feasibility: 0.85,
      status: "identified", sourceSection: "Roadmap — Innovation",
      reach: 75000, confidence: 0.75, userValue: 6, timeCriticality: 4, riskReduction: 3, jobSize: 3, sortOrder: 7,
    },
    {
      id: "opp-008",
      title: "QA scorecard automation",
      category: "Supportive / internal product",
      description:
        "Digital QA scorecards with auto-fail rules and calibration tracking for the Quality CoE.",
      impact: "medium", effort: "medium", strategicFit: 0.8, feasibility: 0.8,
      status: "identified", sourceSection: "Part B — QA",
      reach: 1200, confidence: 0.8, userValue: 7, timeCriticality: 6, riskReduction: 7, jobSize: 4, sortOrder: 8,
    },
    {
      id: "opp-009",
      title: "Employer self-service onboarding",
      category: "Existing service enhancement",
      description:
        "Bulk employer registration and contribution-file upload with validation and instant feedback.",
      impact: "medium", effort: "medium", strategicFit: 0.75, feasibility: 0.75,
      status: "identified", sourceSection: "Part C — Fulfilment",
      reach: 8000, confidence: 0.7, userValue: 6, timeCriticality: 5, riskReduction: 4, jobSize: 5, sortOrder: 9,
    },
    {
      id: "opp-010",
      title: "Predictive workforce-capacity model",
      category: "Innovation",
      description:
        "Forecast case inflow vs capacity to pre-empt backlog build-up across the sector.",
      impact: "low", effort: "high", strategicFit: 0.6, feasibility: 0.5,
      status: "identified", sourceSection: "Part D — Capacity",
      reach: 1500, confidence: 0.5, userValue: 5, timeCriticality: 4, riskReduction: 5, jobSize: 8, sortOrder: 10,
    },
  ];

  for (const o of opportunities) {
    const riceScore = rice({
      reach: o.reach,
      impact: IMPACT_NUM[o.impact],
      confidence: o.confidence,
      effort: EFFORT_NUM[o.effort],
    });
    const wsjfScore = wsjf({
      userValue: o.userValue,
      timeCriticality: o.timeCriticality,
      riskReduction: o.riskReduction,
      jobSize: o.jobSize,
    });
    const data = {
      title: o.title,
      category: o.category,
      description: o.description,
      impact: o.impact,
      effort: o.effort,
      strategicFit: o.strategicFit,
      feasibility: o.feasibility,
      status: o.status,
      sourceSection: o.sourceSection,
      riceScore,
      wsjfScore,
    };
    await prisma.opportunity.upsert({
      where: { id: o.id },
      update: data,
      create: { id: o.id, ...data },
    });
  }

  // Concept sheets for the top 3 by RICE.
  const topByRice = [...opportunities]
    .map((o) => ({
      id: o.id,
      title: o.title,
      score: rice({
        reach: o.reach,
        impact: IMPACT_NUM[o.impact],
        confidence: o.confidence,
        effort: EFFORT_NUM[o.effort],
      }),
      category: o.category,
      description: o.description,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  for (const t of topByRice) {
    const content = JSON.stringify({
      problem: `Current state for "${t.title}" relies on fragmented, manual touch-points.`,
      proposition: t.description,
      targetSegment: t.category,
      keyFeatures: [
        "Digital-first journey",
        "SLA-backed with breach alerting",
        "Measured against the KPI/KQI catalogue",
      ],
      successMetrics: [
        "Turnaround time reduced",
        "First-time-right rate up",
        "CSAT / NPS uplift",
      ],
      estimatedBenefit: "Material reduction in cost-to-serve and breach exposure.",
    });
    await prisma.conceptSheet.upsert({
      where: { opportunityId: t.id },
      update: { content },
      create: { id: `cs-${t.id}`, opportunityId: t.id, content },
    });
  }

  // ──────────────────────────────────────────────────────────────────────
  // 4. Governance forums — tiered daily-management rhythm (Part E1).
  // ──────────────────────────────────────────────────────────────────────
  const forums: Array<{
    id: string;
    name: string;
    tier: number;
    cadence: string;
    purpose: string;
    attendees: string;
    owner: string;
    sortOrder: number;
  }> = [
    { id: "gov-tier1", name: "Front-line Daily Huddle", tier: 1, cadence: "daily", purpose: "Today's volume, case aging and immediate blockers.", attendees: "Front-line team, Team Lead", owner: "Team Lead", sortOrder: 1 },
    { id: "gov-tier1b", name: "Queue Health Stand-up", tier: 1, cadence: "daily", purpose: "Queue balancing and same-day escalations.", attendees: "Supervisors, Workflow Coordinator", owner: "Supervisor", sortOrder: 2 },
    { id: "gov-tier2", name: "Supervisor Daily Review", tier: 2, cadence: "daily", purpose: "Queue health, SLA risk and escalations from Tier 1.", attendees: "Supervisors, QA Analyst", owner: "Operations Supervisor", sortOrder: 3 },
    { id: "gov-tier2b", name: "Weekly Operations Review", tier: 2, cadence: "weekly", purpose: "Cross-queue performance, breach trends and corrective actions.", attendees: "Ops Managers, QA Lead, CX Lead", owner: "Operations Manager", sortOrder: 4 },
    { id: "gov-tier3", name: "Continuous-Improvement / Quality Council", tier: 3, cadence: "monthly", purpose: "Owns the CAPA backlog, prioritises improvements (WSJF), governs PDCA/DMAIC.", attendees: "Quality CoE, Process Owners, Ops Managers", owner: "Head of Quality", sortOrder: 5 },
    { id: "gov-tier3b", name: "Monthly Business Review (MBR)", tier: 3, cadence: "monthly", purpose: "KPI/KQI performance vs target and benefits realisation.", attendees: "Department Heads, Finance BP, PMO", owner: "COO", sortOrder: 6 },
    { id: "gov-tier4", name: "Executive Steering Committee", tier: 4, cadence: "monthly", purpose: "Strategic KQIs, escalated decisions and roadmap governance.", attendees: "Executive Team, Sponsor", owner: "Director General", sortOrder: 7 },
    { id: "gov-tier4b", name: "Quarterly Business Review (QBR)", tier: 4, cadence: "quarterly", purpose: "Roadmap re-sequencing, sustainment review and target re-setting.", attendees: "Executive Team, Quality Council, PMO", owner: "Director General", sortOrder: 8 },
  ];

  for (const f of forums) {
    const data = {
      name: f.name,
      tier: f.tier,
      cadence: f.cadence,
      purpose: f.purpose,
      attendees: f.attendees,
      owner: f.owner,
      sortOrder: f.sortOrder,
    };
    await prisma.governanceForum.upsert({
      where: { id: f.id },
      update: data,
      create: { id: f.id, ...data },
    });
  }

  // ──────────────────────────────────────────────────────────────────────
  // 5. Sector-wide RACI — exactly ONE 'A' per (processArea + activity).
  //    Teams: Front-Line · Specialist · QA CoE · Ops Mgmt · Compliance
  // ──────────────────────────────────────────────────────────────────────
  type Role = "R" | "A" | "S" | "C" | "I";
  const raciRows: Array<{
    processArea: string;
    activity: string;
    roles: Partial<Record<string, Role>>; // team -> role
  }> = [
    // End of Service
    { processArea: "End of Service", activity: "Intake & eligibility check", roles: { "Front-Line": "R", "Specialist": "C", "QA CoE": "I", "Ops Mgmt": "A", "Compliance": "I" } },
    { processArea: "End of Service", activity: "Settlement calculation", roles: { "Front-Line": "S", "Specialist": "R", "QA CoE": "C", "Ops Mgmt": "A", "Compliance": "C" } },
    { processArea: "End of Service", activity: "Payment authorisation", roles: { "Front-Line": "I", "Specialist": "S", "QA CoE": "I", "Ops Mgmt": "R", "Compliance": "A" } },
    { processArea: "End of Service", activity: "Member notification", roles: { "Front-Line": "A", "Specialist": "I", "QA CoE": "I", "Ops Mgmt": "C", "Compliance": "I" } },
    // Quality Assurance
    { processArea: "Quality Assurance", activity: "Scorecard design", roles: { "Front-Line": "I", "Specialist": "C", "QA CoE": "A", "Ops Mgmt": "C", "Compliance": "C" } },
    { processArea: "Quality Assurance", activity: "Case sampling & review", roles: { "Front-Line": "I", "Specialist": "S", "QA CoE": "R", "Ops Mgmt": "A", "Compliance": "I" } },
    { processArea: "Quality Assurance", activity: "Calibration session", roles: { "Front-Line": "C", "Specialist": "R", "QA CoE": "A", "Ops Mgmt": "C", "Compliance": "I" } },
    { processArea: "Quality Assurance", activity: "Corrective-action sign-off", roles: { "Front-Line": "I", "Specialist": "C", "QA CoE": "R", "Ops Mgmt": "A", "Compliance": "C" } },
    // Breach Management
    { processArea: "Breach Management", activity: "Breach-risk detection", roles: { "Front-Line": "R", "Specialist": "C", "QA CoE": "I", "Ops Mgmt": "A", "Compliance": "I" } },
    { processArea: "Breach Management", activity: "Escalation & triage", roles: { "Front-Line": "S", "Specialist": "R", "QA CoE": "I", "Ops Mgmt": "A", "Compliance": "C" } },
    { processArea: "Breach Management", activity: "Root-cause analysis", roles: { "Front-Line": "C", "Specialist": "R", "QA CoE": "A", "Ops Mgmt": "C", "Compliance": "I" } },
    { processArea: "Breach Management", activity: "Regulator reporting", roles: { "Front-Line": "I", "Specialist": "I", "QA CoE": "C", "Ops Mgmt": "S", "Compliance": "A" } },
    // Member Onboarding
    { processArea: "Member Onboarding", activity: "Registration validation", roles: { "Front-Line": "R", "Specialist": "C", "QA CoE": "I", "Ops Mgmt": "A", "Compliance": "C" } },
    { processArea: "Member Onboarding", activity: "Contribution-file processing", roles: { "Front-Line": "S", "Specialist": "R", "QA CoE": "I", "Ops Mgmt": "A", "Compliance": "I" } },
    { processArea: "Member Onboarding", activity: "Welcome & channel activation", roles: { "Front-Line": "A", "Specialist": "I", "QA CoE": "I", "Ops Mgmt": "C", "Compliance": "I" } },
    { processArea: "Member Onboarding", activity: "Data-quality audit", roles: { "Front-Line": "I", "Specialist": "C", "QA CoE": "A", "Ops Mgmt": "C", "Compliance": "S" } },
  ];

  // Flatten to per-team RaciEntry rows with deterministic ids.
  let raciCount = 0;
  for (let r = 0; r < raciRows.length; r++) {
    const row = raciRows[r];
    let teamIdx = 0;
    for (const [team, role] of Object.entries(row.roles)) {
      if (!role) {
        teamIdx++;
        continue;
      }
      const id = `raci-${r + 1}-${teamIdx + 1}`;
      const data = {
        processArea: row.processArea,
        activity: row.activity,
        team,
        role,
        sortOrder: r * 10 + teamIdx,
      };
      await prisma.raciEntry.upsert({
        where: { id },
        update: data,
        create: { id, ...data },
      });
      raciCount++;
      teamIdx++;
    }
  }

  // ──────────────────────────────────────────────────────────────────────
  // 6. Capability-transfer items (Part E4).
  // ──────────────────────────────────────────────────────────────────────
  const capability: Array<{
    id: string;
    item: string;
    mechanism: string;
    phase: string;
    owner: string;
    status: string;
    sustainmentMetric: string;
    sortOrder: number;
  }> = [
    { id: "cap-01", item: "QA reviewer certification", mechanism: "train-the-trainer", phase: "P5 Handover", owner: "Master Trainer", status: "planned", sustainmentMetric: "Certified internal reviewers ≥ 12", sortOrder: 1 },
    { id: "cap-02", item: "Calibration facilitator coaching", mechanism: "coaching", phase: "P5 Handover", owner: "Quality CoE", status: "planned", sustainmentMetric: "Inter-rater reliability ≥ 90%", sortOrder: 2 },
    { id: "cap-03", item: "Breach-management playbook", mechanism: "playbook", phase: "P4 Deployment", owner: "Ops Managers", status: "in-progress", sustainmentMetric: "Playbook adherence ≥ 95%", sortOrder: 3 },
    { id: "cap-04", item: "Daily-management leader standard work", mechanism: "playbook", phase: "P4 Deployment", owner: "Quality Council", status: "in-progress", sustainmentMetric: "Huddle attendance ≥ 90%", sortOrder: 4 },
    { id: "cap-05", item: "Root-cause (5-Why / DMAIC) coaching", mechanism: "coaching", phase: "P5 Handover", owner: "Master Trainer", status: "planned", sustainmentMetric: "RCA closure rate ≥ 80%", sortOrder: 5 },
    { id: "cap-06", item: "Scorecard administration handover", mechanism: "train-the-trainer", phase: "P5 Handover", owner: "Quality CoE", status: "planned", sustainmentMetric: "Scorecards self-administered 100%", sortOrder: 6 },
    { id: "cap-07", item: "Sustainment-metric dashboard", mechanism: "sustainment-metric", phase: "P5 Handover", owner: "Data Office", status: "planned", sustainmentMetric: "6 months of held metrics", sortOrder: 7 },
    { id: "cap-08", item: "Escalation-trigger thresholds", mechanism: "sustainment-metric", phase: "P5 Handover", owner: "Quality Council", status: "planned", sustainmentMetric: "Triggers fire within 24h of drop", sortOrder: 8 },
    { id: "cap-09", item: "Roadmap governance playbook", mechanism: "playbook", phase: "P6 Finalize", owner: "Strategy PMO", status: "planned", sustainmentMetric: "QBR held every quarter", sortOrder: 9 },
    { id: "cap-10", item: "VoC analyst capability transfer", mechanism: "train-the-trainer", phase: "P5 Handover", owner: "CX Lead", status: "planned", sustainmentMetric: "VoC reporting self-run 100%", sortOrder: 10 },
  ];

  for (const c of capability) {
    const data = {
      item: c.item,
      mechanism: c.mechanism,
      phase: c.phase,
      owner: c.owner,
      status: c.status,
      sustainmentMetric: c.sustainmentMetric,
      sortOrder: c.sortOrder,
    };
    await prisma.capabilityTransferItem.upsert({
      where: { id: c.id },
      update: data,
      create: { id: c.id, ...data },
    });
  }

  return {
    phases: phases.length,
    initiatives: initiatives.length,
    opportunities: opportunities.length,
    forums: forums.length,
    raci: raciCount,
    capability: capability.length,
  };
}
