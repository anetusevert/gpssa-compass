/**
 * Structured catalog of RFP No. GPSSA-016-2026 —
 * Product & Service Development Roadmap and Quality Assurance Framework
 * (Abu Dhabi, June 2026).
 *
 * Powers the Mandate ↔ RFP ↔ App alignment board and MandateBasisChip
 * cross-references on pillar pages.
 *
 * `relatedScreens` use pathnames so the board can deep-link into live modules.
 */

export type RfiKind = "objective" | "workstream" | "deliverable" | "area-of-focus";

export type RfiPillar =
  | "mandate"
  | "atlas"
  | "services"
  | "products"
  | "delivery"
  | "international"
  | "quality"
  | "fulfilment"
  | "performance"
  | "planning";

export interface RfiSection {
  id: string;
  sectionRef: string;
  title: string;
  body: string;
  kind: RfiKind;
  relatedScreens: string[];
  relatedPillars: RfiPillar[];
}

/** Display metadata for the procurement instrument (kept as RFI_* for import stability). */
export const RFI_REFERENCE = {
  number: "GPSSA-016-2026",
  title: "Product & Service Development Roadmap and Quality Assurance Framework",
  city: "Abu Dhabi",
  year: 2026,
  contact: "procurement@GPSSA.gov.ae",
  shortTitle: "Roadmap & QA Framework",
} as const;

export const RFI_SECTIONS: RfiSection[] = [
  // ── 1.3 Project Objectives ───────────────────────────────────────────────
  {
    id: "obj-assess-environment",
    sectionRef: "§1.3-1",
    title: "Assess the current environment",
    body: "Assess the current service, product, operational, fulfilment and control environment across the Pension Sector.",
    kind: "objective",
    relatedPillars: ["services", "products", "delivery", "fulfilment", "quality"],
    relatedScreens: [
      "/dashboard/services/catalog",
      "/dashboard/products/portfolio",
      "/dashboard/fulfilment/cases",
      "/dashboard/quality/framework",
    ],
  },
  {
    id: "obj-benefits-realisation",
    sectionRef: "§1.3-2",
    title: "Validate benefits & remaining gaps",
    body: "Validate the benefits realized from completed initiatives and identify remaining gaps, risks and optimization opportunities.",
    kind: "objective",
    relatedPillars: ["performance", "planning", "services"],
    relatedScreens: [
      "/dashboard/performance/benefits",
      "/dashboard/planning/backlog",
      "/dashboard/services/catalog",
    ],
  },
  {
    id: "obj-qa-fulfilment-framework",
    sectionRef: "§1.3-3",
    title: "Design end-to-end QA & fulfilment framework",
    body: "Design an integrated end-to-end quality assurance and service fulfilment improvement framework across the Pension Sector.",
    kind: "objective",
    relatedPillars: ["quality", "fulfilment"],
    relatedScreens: [
      "/dashboard/quality/framework",
      "/dashboard/quality/scorecards",
      "/dashboard/fulfilment/sla",
      "/dashboard/fulfilment/breach",
    ],
  },
  {
    id: "obj-prioritise-opportunities",
    sectionRef: "§1.3-4",
    title: "Identify & prioritise opportunities",
    body: "Identify and prioritize opportunities across existing service enhancements, new products, supportive/internal products, innovation opportunities and cross-entity service bundles.",
    kind: "objective",
    relatedPillars: ["services", "products", "planning"],
    relatedScreens: [
      "/dashboard/services/catalog",
      "/dashboard/products/portfolio",
      "/dashboard/planning/backlog",
    ],
  },
  {
    id: "obj-12m-roadmap",
    sectionRef: "§1.3-5",
    title: "Develop a practical 12-month roadmap",
    body: "Develop a practical 12-month Product & Service Development Roadmap aligned to customer, service and operational outcomes.",
    kind: "objective",
    relatedPillars: ["planning", "services", "products"],
    relatedScreens: ["/dashboard/planning", "/dashboard/planning/backlog"],
  },
  {
    id: "obj-governance-capability",
    sectionRef: "§1.3-6",
    title: "Define governance, KPI/KQI & capability transfer",
    body: "Define governance, KPI/KQI, operating model, implementation roadmap and capability transfer requirements for sustainable execution.",
    kind: "objective",
    relatedPillars: ["planning", "performance", "mandate"],
    relatedScreens: [
      "/dashboard/planning/governance",
      "/dashboard/planning/operating-model",
      "/dashboard/performance/catalogue",
      "/dashboard/performance/dashboards",
    ],
  },

  // ── 2.3 Workstream A — Product & Service Development Roadmap ─────────────
  {
    id: "ws-a1-diagnostic",
    sectionRef: "§2.3-A1",
    title: "A1 · Current-State Diagnostic (Wks 1–4)",
    body: "Workstream A Phase 1: current-state diagnostic covering services, products, completed initiatives, operating model, case management, controls, governance, roles, reporting, SLA/OLA and system-enabled workflows.",
    kind: "workstream",
    relatedPillars: ["services", "products", "delivery", "fulfilment", "mandate"],
    relatedScreens: [
      "/dashboard/services/catalog",
      "/dashboard/products/portfolio",
      "/dashboard/delivery/personas",
      "/dashboard/fulfilment/cases",
    ],
  },
  {
    id: "ws-a2-performance",
    sectionRef: "§2.3-A2",
    title: "A2 · Customer & Service Performance Review (Wks 2–5)",
    body: "Workstream A Phase 2: customer and operational performance review using Customer Pulse, CSAT, DSAT, NPS, complaint themes, repeat contacts, breaches, backlog, rework and fulfilment timelines.",
    kind: "workstream",
    relatedPillars: ["performance", "fulfilment", "delivery"],
    relatedScreens: [
      "/dashboard/performance/voc",
      "/dashboard/performance/dashboards",
      "/dashboard/fulfilment/analytics",
      "/dashboard/fulfilment/breach",
    ],
  },
  {
    id: "ws-a3-opportunity",
    sectionRef: "§2.3-A3",
    title: "A3 · Opportunity Identification (Wks 6–10)",
    body: "Workstream A Phase 3: opportunity identification across service enhancements, new external products, supportive/internal products, innovation and cross-entity bundles.",
    kind: "workstream",
    relatedPillars: ["planning", "services", "products"],
    relatedScreens: ["/dashboard/planning/backlog", "/dashboard/products/portfolio"],
  },
  {
    id: "ws-a4-prioritisation",
    sectionRef: "§2.3-A4",
    title: "A4 · Prioritization & Sequencing (Wks 9–14)",
    body: "Workstream A Phase 4: prioritization framework, ranked opportunity backlog and top initiative concept sheets.",
    kind: "workstream",
    relatedPillars: ["planning", "products"],
    relatedScreens: ["/dashboard/planning/backlog", "/dashboard/planning"],
  },
  {
    id: "ws-a5-roadmap",
    sectionRef: "§2.3-A5",
    title: "A5 · Roadmap Development (Wks 13–17)",
    body: "Workstream A Phase 5: develop the prioritised 12-month Product & Service Development Roadmap with phases, dependencies and expected value.",
    kind: "workstream",
    relatedPillars: ["planning"],
    relatedScreens: ["/dashboard/planning"],
  },
  {
    id: "ws-a6-operating-model",
    sectionRef: "§2.3-A6",
    title: "A6 · Operating Model, Governance & Finalize (Wks 16–20)",
    body: "Workstream A Phase 6: operating model, governance forums, management routines, sector-wide RACI and finalisation of the roadmap for handover.",
    kind: "workstream",
    relatedPillars: ["planning", "mandate"],
    relatedScreens: [
      "/dashboard/planning/operating-model",
      "/dashboard/planning/governance",
      "/dashboard/mandate/governance",
    ],
  },

  // ── 2.3 Workstream B — End-to-End Quality Assurance Framework ────────────
  {
    id: "ws-b1-discovery",
    sectionRef: "§2.3-B1",
    title: "B1 · Current-State Discovery (Wks 1–3)",
    body: "Workstream B Phase 1: discover current quality, fulfilment and control practices across the Pension Sector.",
    kind: "workstream",
    relatedPillars: ["quality", "fulfilment"],
    relatedScreens: [
      "/dashboard/quality/framework",
      "/dashboard/fulfilment/cases",
      "/dashboard/fulfilment/sla",
    ],
  },
  {
    id: "ws-b2-qa-design",
    sectionRef: "§2.3-B2",
    title: "B2 · QA Framework Design (Wks 4–9)",
    body: "Workstream B Phase 2: design the end-to-end QA framework — dimensions, policy, review methodology, scorecards, sampling, scoring, calibration, error taxonomy, CAPA and governance.",
    kind: "workstream",
    relatedPillars: ["quality"],
    relatedScreens: [
      "/dashboard/quality/framework",
      "/dashboard/quality/scorecards",
      "/dashboard/quality/reviews",
      "/dashboard/quality/calibration",
      "/dashboard/quality/taxonomy",
      "/dashboard/quality/capa",
    ],
  },
  {
    id: "ws-b3-pilot",
    sectionRef: "§2.3-B3",
    title: "B3 · Pilot Deployment (Wks 10–14)",
    body: "Workstream B Phase 3: pilot the QA and fulfilment model in selected services before sector-wide rollout.",
    kind: "workstream",
    relatedPillars: ["quality", "fulfilment", "planning"],
    relatedScreens: [
      "/dashboard/quality/reviews",
      "/dashboard/fulfilment/cases",
      "/dashboard/planning",
    ],
  },
  {
    id: "ws-b4-sector-deploy",
    sectionRef: "§2.3-B4",
    title: "B4 · Full Sector Deployment (Wks 15–17)",
    body: "Workstream B Phase 4: full Pension Sector deployment of QA scoring, fulfilment controls and breach-reduction measures.",
    kind: "workstream",
    relatedPillars: ["quality", "fulfilment", "performance"],
    relatedScreens: [
      "/dashboard/quality/scorecards",
      "/dashboard/fulfilment/breach",
      "/dashboard/fulfilment/analytics",
      "/dashboard/performance/dashboards",
    ],
  },
  {
    id: "ws-b5-capability-transfer",
    sectionRef: "§2.3-B5",
    title: "B5 · Capability Transfer & Handover (Wks 18–20)",
    body: "Workstream B Phase 5: capability transfer, training and handover so GPSSA embeds and sustains the target model.",
    kind: "workstream",
    relatedPillars: ["planning", "quality", "mandate"],
    relatedScreens: [
      "/dashboard/planning/operating-model",
      "/dashboard/planning/governance",
      "/dashboard/quality/framework",
    ],
  },

  // ── 2.2 Expected Outcomes (deliverables) ─────────────────────────────────
  {
    id: "del-diagnostic-benefits",
    sectionRef: "§2.2-1",
    title: "Evidence-based diagnostic & benefits realisation view",
    body: "An evidence-based diagnostic and benefits realisation view covering current services, products, operations, fulfilment performance and quality gaps.",
    kind: "deliverable",
    relatedPillars: ["services", "products", "fulfilment", "quality", "performance"],
    relatedScreens: [
      "/dashboard/services/catalog",
      "/dashboard/performance/benefits",
      "/dashboard/fulfilment/analytics",
    ],
  },
  {
    id: "del-qa-fulfilment-blueprint",
    sectionRef: "§2.2-2",
    title: "QA Framework & fulfilment improvement blueprint",
    body: "A comprehensive end-to-end Quality Assurance Framework and service fulfilment improvement blueprint for the Pension Sector.",
    kind: "deliverable",
    relatedPillars: ["quality", "fulfilment"],
    relatedScreens: [
      "/dashboard/quality/framework",
      "/dashboard/fulfilment/sla",
      "/dashboard/fulfilment/breach",
    ],
  },
  {
    id: "del-backlog-roadmap",
    sectionRef: "§2.2-3",
    title: "Opportunity backlog & 12-month roadmap",
    body: "A structured opportunity backlog and prioritised 12-month Product & Service Development Roadmap.",
    kind: "deliverable",
    relatedPillars: ["planning"],
    relatedScreens: ["/dashboard/planning/backlog", "/dashboard/planning"],
  },
  {
    id: "del-case-sla-breach",
    sectionRef: "§2.2-4",
    title: "Case classification, SLA/OLA & breach management",
    body: "Standardized case classification, SLA/OLA methodology, breach management and governance approach.",
    kind: "deliverable",
    relatedPillars: ["fulfilment"],
    relatedScreens: [
      "/dashboard/fulfilment/cases",
      "/dashboard/fulfilment/sla",
      "/dashboard/fulfilment/breach",
    ],
  },
  {
    id: "del-kpi-kqi-raci",
    sectionRef: "§2.2-5",
    title: "KPI/KQI framework, operating model & RACI",
    body: "Defined KPI/KQI framework, dashboard requirements, operating model and RACI for sustainable ownership.",
    kind: "deliverable",
    relatedPillars: ["performance", "planning"],
    relatedScreens: [
      "/dashboard/performance/catalogue",
      "/dashboard/performance/dashboards",
      "/dashboard/planning/governance",
      "/dashboard/planning/operating-model",
    ],
  },
  {
    id: "del-pilot-capability-transfer",
    sectionRef: "§2.2-6",
    title: "Phased implementation, pilot & capability transfer",
    body: "A phased implementation, pilot and capability transfer plan that enables GPSSA to embed and sustain the target model.",
    kind: "deliverable",
    relatedPillars: ["planning", "quality"],
    relatedScreens: ["/dashboard/planning", "/dashboard/planning/operating-model"],
  },
  {
    id: "del-exec-briefing",
    sectionRef: "§2.2-7",
    title: "Leadership-ready operating picture",
    body: "Compass Executive Briefing and command surface — the live operating system the project team runs and leaves with GPSSA.",
    kind: "deliverable",
    relatedPillars: ["mandate", "atlas", "planning"],
    relatedScreens: ["/dashboard", "/dashboard/mandate", "/dashboard/atlas"],
  },

  // ── 1.4 / 2.1 Areas of focus (pain points & requirements) ────────────────
  {
    id: "aof-fulfilment-pain",
    sectionRef: "§1.4",
    title: "Fulfilment & operational quality pain points",
    body: "Address case breaches, backlog, rework, exception handling complexity, inconsistent fulfilment, limited management visibility and fragmented governance.",
    kind: "area-of-focus",
    relatedPillars: ["fulfilment", "quality", "performance"],
    relatedScreens: [
      "/dashboard/fulfilment/breach",
      "/dashboard/fulfilment/cases",
      "/dashboard/quality/capa",
      "/dashboard/performance/voc",
    ],
  },
  {
    id: "aof-measurable-improvement",
    sectionRef: "§1.4",
    title: "Measurable CX & SLA improvement",
    body: "Support measurable improvement in Customer Pulse, CSAT, DSAT, NPS, SLA compliance, fulfilment turnaround time, quality consistency and operational accountability.",
    kind: "area-of-focus",
    relatedPillars: ["performance", "fulfilment", "quality"],
    relatedScreens: [
      "/dashboard/performance/voc",
      "/dashboard/fulfilment/sla",
      "/dashboard/quality/scorecards",
    ],
  },
  {
    id: "aof-service-catalogue",
    sectionRef: "§2.4",
    title: "GPSSA service catalogue (~35 services)",
    body: "Engagement covers GPSSA’s current service list (registration, EOS, certificates, advisory, complaints, GCC coordination, etc.) and any services added during the engagement.",
    kind: "area-of-focus",
    relatedPillars: ["services", "delivery"],
    relatedScreens: [
      "/dashboard/services/catalog",
      "/dashboard/services/channels",
      "/dashboard/delivery/channels",
    ],
  },
  {
    id: "aof-breach-reduction",
    sectionRef: "§2.1",
    title: "Breach-reduction & early-warning controls",
    body: "Case classification, prioritisation, triage, ageing controls, early-warning triggers, escalation thresholds, differentiated SLA/OLA treatment and breach management.",
    kind: "area-of-focus",
    relatedPillars: ["fulfilment"],
    relatedScreens: [
      "/dashboard/fulfilment/cases",
      "/dashboard/fulfilment/sla",
      "/dashboard/fulfilment/breach",
      "/dashboard/fulfilment/analytics",
    ],
  },
  {
    id: "aof-global-benchmark",
    sectionRef: "§1.3",
    title: "Global benchmark quality ambition",
    body: "Recommendations and operating picture set against peer social-security authorities — Atlas and benchmarking inform the bar for product and service excellence.",
    kind: "area-of-focus",
    relatedPillars: ["atlas", "international", "services"],
    relatedScreens: ["/dashboard/atlas", "/dashboard/atlas/benchmarking"],
  },
];

export const RFI_KIND_LABELS: Record<RfiKind, string> = {
  objective: "Project Objective",
  workstream: "Workstream Phase",
  deliverable: "Expected Outcome",
  "area-of-focus": "Area of Focus",
};

export const RFI_KIND_ACCENT: Record<RfiKind, string> = {
  objective: "rgba(0,168,107,0.85)",
  workstream: "rgba(72,153,255,0.85)",
  deliverable: "rgba(231,176,46,0.85)",
  "area-of-focus": "rgba(202,99,213,0.85)",
};

export function getRfiSectionsByPillar(pillar: RfiPillar): RfiSection[] {
  return RFI_SECTIONS.filter((s) => s.relatedPillars.includes(pillar));
}

export function getRfiSectionsByScreen(screenPath: string): RfiSection[] {
  return RFI_SECTIONS.filter((s) => s.relatedScreens.includes(screenPath));
}
