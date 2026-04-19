/**
 * Structured catalog of the GPSSA Product & Service Development Roadmap RFI
 * (RFI No. GPSSA-RFI-02-2026, Dubai, 2026).
 *
 * Hand-derived from `Request for Information 2.pdf`. This is the middle column
 * of the Mandate ↔ RFI ↔ App Pillars alignment board, and is also used by the
 * MandateBasisChip drawer to surface RFI cross-references on existing pillar
 * pages.
 *
 * `relatedScreens` uses pathnames so the alignment board can link directly into
 * the right destination screen.
 */

export type RfiKind = "objective" | "workstream" | "deliverable" | "area-of-focus";

export interface RfiSection {
  id: string;
  sectionRef: string;
  title: string;
  body: string;
  kind: RfiKind;
  relatedScreens: string[];
  relatedPillars: ("mandate" | "atlas" | "services" | "products" | "delivery" | "international")[];
}

export const RFI_REFERENCE = {
  number: "GPSSA-RFI-02-2026",
  title: "Product & Service Development Roadmap",
  city: "Dubai",
  year: 2026,
  contact: "procurement@GPSSA.gov.ae",
} as const;

export const RFI_SECTIONS: RfiSection[] = [
  // ── 2.B Key Objectives ───────────────────────────────────────────────────
  {
    id: "obj-portfolio-assessment",
    sectionRef: "2.B-1",
    title: "Assess current service & product portfolio",
    body: "Assess GPSSA's current service portfolio, product portfolio, and relevant completed initiatives from both customer and operational perspectives.",
    kind: "objective",
    relatedPillars: ["services", "products"],
    relatedScreens: [
      "/dashboard/services/catalog",
      "/dashboard/products/portfolio",
    ],
  },
  {
    id: "obj-performance-review",
    sectionRef: "2.B-2",
    title: "Review customer & service performance indicators",
    body: "Review available customer and service performance indicators, including Customer Pulse, CSAT, DSAT, NPS, complaint themes, service fulfillment timelines, and SLA performance.",
    kind: "objective",
    relatedPillars: ["delivery", "services"],
    relatedScreens: [
      "/dashboard/delivery/channels",
      "/dashboard/services/channels",
    ],
  },
  {
    id: "obj-opportunity-categorisation",
    sectionRef: "2.B-3",
    title: "Identify & categorise opportunities",
    body: "Identify and categorize opportunities across existing service enhancements, new external-facing products, supportive/internal products, innovation opportunities, and cross-entity service bundles.",
    kind: "objective",
    relatedPillars: ["services", "products"],
    relatedScreens: [
      "/dashboard/services/catalog",
      "/dashboard/products/portfolio",
      "/dashboard/products/segments",
    ],
  },
  {
    id: "obj-roadmap",
    sectionRef: "2.B-4",
    title: "Develop a structured 12-month roadmap",
    body: "Develop a structured and prioritized one-year roadmap that balances customer impact, internal efficiency, strategic alignment, and implementation feasibility.",
    kind: "objective",
    relatedPillars: ["services", "products", "delivery"],
    relatedScreens: ["/dashboard/products/portfolio", "/dashboard/delivery/models"],
  },
  {
    id: "obj-prioritisation-governance",
    sectionRef: "2.B-5",
    title: "Recommend prioritisation, governance & KPI framework",
    body: "Recommend a practical prioritization model, governance approach, review cadence, and KPI framework for the Product & Service Development function.",
    kind: "objective",
    relatedPillars: ["mandate", "delivery"],
    relatedScreens: ["/dashboard/mandate/governance", "/dashboard/delivery/models"],
  },
  {
    id: "obj-concept-sheets",
    sectionRef: "2.B-6",
    title: "Provide top initiative concept sheets",
    body: "Provide concept sheets and clear rationale for the highest-value opportunities recommended for GPSSA.",
    kind: "objective",
    relatedPillars: ["products", "services"],
    relatedScreens: ["/dashboard/products/portfolio"],
  },

  // ── 2.C In-Scope Workstreams ─────────────────────────────────────────────
  {
    id: "ws-current-state",
    sectionRef: "2.C-1",
    title: "Current-State Diagnostic",
    body: "Review GPSSA's current services, products, key journeys, completed enhancement initiatives, internal operational model, existing issues, and major pain points.",
    kind: "workstream",
    relatedPillars: ["services", "delivery", "products"],
    relatedScreens: [
      "/dashboard/services/catalog",
      "/dashboard/products/portfolio",
      "/dashboard/delivery/personas",
    ],
  },
  {
    id: "ws-performance-review",
    sectionRef: "2.C-2",
    title: "Customer & Service Performance Review",
    body: "Assess available service quality and customer-experience indicators such as Customer Pulse, CSAT, DSAT, NPS, complaints, repeat contacts, SLA, and average fulfillment time.",
    kind: "workstream",
    relatedPillars: ["delivery"],
    relatedScreens: ["/dashboard/delivery/channels", "/dashboard/services/channels"],
  },
  {
    id: "ws-opportunity-id",
    sectionRef: "2.C-3",
    title: "Opportunity Identification",
    body: "Identify opportunities to enhance existing services, launch new products, introduce supportive/internal products, simplify journeys, and explore cross-entity bundles and innovation ideas.",
    kind: "workstream",
    relatedPillars: ["services", "products"],
    relatedScreens: ["/dashboard/services/catalog", "/dashboard/products/portfolio"],
  },
  {
    id: "ws-prioritisation",
    sectionRef: "2.C-4",
    title: "Prioritization and Sequencing",
    body: "Develop a practical model to rank opportunities by impact, effort, strategic fit, operational value, and feasibility, including quick wins and longer-term items.",
    kind: "workstream",
    relatedPillars: ["products", "delivery"],
    relatedScreens: ["/dashboard/products/portfolio", "/dashboard/delivery/models"],
  },
  {
    id: "ws-roadmap",
    sectionRef: "2.C-5",
    title: "Roadmap Development",
    body: "Prepare a 12-month roadmap with phases, objectives, dependencies, estimated impact, and indicative sequencing.",
    kind: "workstream",
    relatedPillars: ["products", "services"],
    relatedScreens: ["/dashboard/products/portfolio"],
  },
  {
    id: "ws-operating-model",
    sectionRef: "2.C-6",
    title: "Operating Model and Governance",
    body: "Define the governance approach, stakeholder engagement model, review cadence, KPI ownership, and benefit-realization mechanism for the roadmap.",
    kind: "workstream",
    relatedPillars: ["mandate", "delivery"],
    relatedScreens: ["/dashboard/mandate/governance", "/dashboard/delivery/models"],
  },

  // ── 2.D Expected Deliverables ────────────────────────────────────────────
  {
    id: "del-diagnostic-report",
    sectionRef: "2.D-1",
    title: "Diagnostic Report",
    body: "Current-state assessment covering services, products, operations, pain points, and completed initiatives.",
    kind: "deliverable",
    relatedPillars: ["services", "products"],
    relatedScreens: ["/dashboard/services/catalog", "/dashboard/products/portfolio"],
  },
  {
    id: "del-benefits-realisation",
    sectionRef: "2.D-2",
    title: "Benefits Realization Review",
    body: "Assessment of what has been delivered, current impact, gaps, and required optimization areas.",
    kind: "deliverable",
    relatedPillars: ["delivery", "products"],
    relatedScreens: ["/dashboard/delivery/models", "/dashboard/products/portfolio"],
  },
  {
    id: "del-pain-points",
    sectionRef: "2.D-3",
    title: "Customer & Operational Pain-Point Assessment",
    body: "Analysis of service, journey, and operational pain points linked to KPI performance.",
    kind: "deliverable",
    relatedPillars: ["delivery", "services"],
    relatedScreens: ["/dashboard/delivery/personas", "/dashboard/services/catalog"],
  },
  {
    id: "del-opportunity-backlog",
    sectionRef: "2.D-4",
    title: "Opportunity Backlog",
    body: "Categorized list of improvement, product, supportive, innovation, and cross-entity opportunities.",
    kind: "deliverable",
    relatedPillars: ["products", "services"],
    relatedScreens: ["/dashboard/products/portfolio", "/dashboard/services/catalog"],
  },
  {
    id: "del-prioritisation-framework",
    sectionRef: "2.D-5",
    title: "Prioritization Framework",
    body: "Scoring approach with criteria, weightings, and rationale.",
    kind: "deliverable",
    relatedPillars: ["products"],
    relatedScreens: ["/dashboard/products/portfolio"],
  },
  {
    id: "del-12m-roadmap",
    sectionRef: "2.D-6",
    title: "12-Month Roadmap",
    body: "Phased roadmap with initiatives, sequencing, dependencies, and expected business value.",
    kind: "deliverable",
    relatedPillars: ["products", "services"],
    relatedScreens: ["/dashboard/products/portfolio"],
  },
  {
    id: "del-concept-sheets",
    sectionRef: "2.D-7",
    title: "Top Initiative Concept Sheets",
    body: "Short concept notes for the most important recommended initiatives.",
    kind: "deliverable",
    relatedPillars: ["products"],
    relatedScreens: ["/dashboard/products/portfolio"],
  },
  {
    id: "del-governance-kpi",
    sectionRef: "2.D-8",
    title: "Governance and KPI Framework",
    body: "Recommended governance model, review cadence, KPI ownership, and benefit-tracking approach.",
    kind: "deliverable",
    relatedPillars: ["mandate", "delivery"],
    relatedScreens: ["/dashboard/mandate/governance", "/dashboard/delivery/models"],
  },
  {
    id: "del-exec-presentation",
    sectionRef: "2.D-9",
    title: "Executive Presentation",
    body: "Leadership-ready presentation summarizing findings, recommendations, and proposed roadmap.",
    kind: "deliverable",
    relatedPillars: ["mandate", "products"],
    relatedScreens: ["/dashboard/mandate", "/dashboard/products/portfolio"],
  },

  // ── 2.E Areas of Focus ───────────────────────────────────────────────────
  {
    id: "aof-service-enhancement",
    sectionRef: "2.E-1",
    title: "Existing service enhancement & journey simplification",
    body: "Existing service enhancement roadmap and journey simplification opportunities.",
    kind: "area-of-focus",
    relatedPillars: ["services", "delivery"],
    relatedScreens: ["/dashboard/services/catalog", "/dashboard/delivery/personas"],
  },
  {
    id: "aof-new-products",
    sectionRef: "2.E-2",
    title: "New value-creating products",
    body: "New products that create additional value for GPSSA customers, employers, pensioners, insured members, and beneficiaries.",
    kind: "area-of-focus",
    relatedPillars: ["products"],
    relatedScreens: ["/dashboard/products/portfolio", "/dashboard/products/segments"],
  },
  {
    id: "aof-process-optimisation",
    sectionRef: "2.E-3",
    title: "Process optimisation & operational efficiency",
    body: "Optimize processes that improve service delivery, monitoring, service intelligence, compliance, decision support, or operational efficiency.",
    kind: "area-of-focus",
    relatedPillars: ["delivery", "mandate"],
    relatedScreens: ["/dashboard/delivery/models", "/dashboard/mandate/governance"],
  },
  {
    id: "aof-cross-entity-bundles",
    sectionRef: "2.E-4",
    title: "Cross-entity service bundles",
    body: "New service bundles and joined-up service opportunities with relevant external stakeholders where beneficial.",
    kind: "area-of-focus",
    relatedPillars: ["services", "products"],
    relatedScreens: ["/dashboard/services/channels", "/dashboard/products/portfolio"],
  },
  {
    id: "aof-fulfilment-timelines",
    sectionRef: "2.E-5",
    title: "Reduce fulfillment timelines & rework",
    body: "Reduction of service fulfillment timelines, service effort, exception handling, rework, repeat contact, and avoidable complaints.",
    kind: "area-of-focus",
    relatedPillars: ["delivery", "services"],
    relatedScreens: ["/dashboard/delivery/channels", "/dashboard/services/catalog"],
  },
  {
    id: "aof-tdra-alignment",
    sectionRef: "2.E-6",
    title: "TDRA-aligned customer & service measures",
    body: "Alignment of recommendations with customer and service performance measures such as Customer Pulse, TDRA-aligned service quality expectations, CSAT, DSAT, NPS, and SLA-related indicators.",
    kind: "area-of-focus",
    relatedPillars: ["delivery", "international"],
    relatedScreens: ["/dashboard/delivery/channels", "/dashboard/atlas/benchmarking"],
  },
];

export const RFI_KIND_LABELS: Record<RfiKind, string> = {
  objective: "Key Objective",
  workstream: "In-Scope Workstream",
  deliverable: "Expected Deliverable",
  "area-of-focus": "Area of Focus",
};

export const RFI_KIND_ACCENT: Record<RfiKind, string> = {
  objective: "rgba(0,168,107,0.85)",
  workstream: "rgba(72,153,255,0.85)",
  deliverable: "rgba(231,176,46,0.85)",
  "area-of-focus": "rgba(202,99,213,0.85)",
};

export function getRfiSectionsByPillar(pillar: RfiSection["relatedPillars"][number]): RfiSection[] {
  return RFI_SECTIONS.filter((s) => s.relatedPillars.includes(pillar));
}

export function getRfiSectionsByScreen(screenPath: string): RfiSection[] {
  return RFI_SECTIONS.filter((s) => s.relatedScreens.includes(screenPath));
}
