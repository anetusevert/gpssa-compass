import type { PrismaClient } from "@prisma/client";

/**
 * Seed the Performance & Voice-of-Customer module (MG3) + Benefits Realisation
 * (MG4) with rich, benchmark-anchored demo data.
 *
 * Anchored to RFP-016-2026 Part D (KPI↔KQI, VoC) and Part F benchmarks:
 *  - KQIs = citizen-facing service-quality commitments (service charter).
 *  - KPIs = operational/process metrics that FEED the KQIs (parentId link).
 *  - CSAT avg ~78, good >80, financial-services ~83, pension peers ~87–94.
 *  - NPS banking ~41–44 (used cautiously in government).
 *  - FCR ~70–75%, top 85%+.
 *  - GPSSA Ma'ashi: 95% core services on-time (<24h); call-centre 35→6 min.
 *
 * Idempotent: every row uses a stable id and upsert, so re-running is safe.
 */

const MONTHS = ["2025-08", "2025-09", "2025-10", "2025-11", "2025-12", "2026-01"];

// ── KQIs — citizen-facing service-quality commitments ──────────────────────
interface KqiSeed {
  id: string;
  name: string;
  description: string;
  unit: string;
  target: string;
  perspective: string;
  timing: string;
  tier: string;
  direction: string;
}

const KQIS: KqiSeed[] = [
  {
    id: "kqi-eos-sla",
    name: "% End-of-Service cases completed within 20 working days",
    description:
      "Citizen-facing commitment: end-to-end EoS (request → entitlement → payment) cleared within the charter SLA.",
    unit: "%",
    target: "95",
    perspective: "customer",
    timing: "lagging",
    tier: "strategic",
    direction: "higher-better",
  },
  {
    id: "kqi-core-sla",
    name: "% core services completed on-time (<24h)",
    description:
      "Employer registration, insured registration and certificates fulfilled within the Ma'ashi <24h commitment (95% baseline).",
    unit: "%",
    target: "95",
    perspective: "customer",
    timing: "lagging",
    tier: "strategic",
    direction: "higher-better",
  },
  {
    id: "kqi-fcr",
    name: "% contact-centre queries resolved first time",
    description:
      "Share of contact-centre interactions fully resolved on first contact, with no repeat within 7 days.",
    unit: "%",
    target: "85",
    perspective: "customer",
    timing: "lagging",
    tier: "tactical",
    direction: "higher-better",
  },
  {
    id: "kqi-compliance-accuracy",
    name: "Compliance-critical accuracy %",
    description:
      "COPC compliance-critical metric: % of cases free of any compliance-critical error. The non-negotiable KQI.",
    unit: "%",
    target: "99.5",
    perspective: "process",
    timing: "lagging",
    tier: "strategic",
    direction: "higher-better",
  },
  {
    id: "kqi-disbursement-accuracy",
    name: "Pension disbursement accuracy %",
    description:
      "% of pension disbursements paid to the right beneficiary, in the right amount, on the right date.",
    unit: "%",
    target: "99.8",
    perspective: "financial",
    timing: "lagging",
    tier: "strategic",
    direction: "higher-better",
  },
  {
    id: "kqi-satisfaction",
    name: "Member service satisfaction (CSAT) %",
    description:
      "After-session satisfaction across all services (Ma'ashi after-session survey), targeting the pension-peer band 87–94%.",
    unit: "%",
    target: "90",
    perspective: "customer",
    timing: "lagging",
    tier: "tactical",
    direction: "higher-better",
  },
];

// ── KPIs — operational/process metrics that feed the KQIs ──────────────────
interface KpiSeed {
  id: string;
  name: string;
  description: string;
  unit: string;
  target: string;
  perspective: string;
  timing: string;
  tier: string;
  direction: string;
  parentId: string | null;
  frequency: string;
}

const KPIS: KpiSeed[] = [
  {
    id: "kpi-claims-keyed",
    name: "Claims keyed per agent per day",
    description: "Throughput of EoS claims captured per case-officer per working day.",
    unit: "/day",
    target: "32",
    perspective: "process",
    timing: "leading",
    tier: "operational",
    direction: "higher-better",
    parentId: "kqi-eos-sla",
    frequency: "daily",
  },
  {
    id: "kpi-eos-ftr",
    name: "EoS first-time-right %",
    description: "% of EoS cases processed correctly first time, with no rework loop.",
    unit: "%",
    target: "92",
    perspective: "process",
    timing: "leading",
    tier: "operational",
    direction: "higher-better",
    parentId: "kqi-eos-sla",
    frequency: "weekly",
  },
  {
    id: "kpi-eos-backlog",
    name: "EoS WIP aged >20 days",
    description: "Count of in-progress EoS cases older than the 20-day SLA threshold (leading breach indicator).",
    unit: "cases",
    target: "40",
    perspective: "process",
    timing: "leading",
    tier: "operational",
    direction: "lower-better",
    parentId: "kqi-eos-sla",
    frequency: "daily",
  },
  {
    id: "kpi-system-uptime",
    name: "Core platform uptime %",
    description: "Availability of the Ma'ashi core-services platform during business hours.",
    unit: "%",
    target: "99.9",
    perspective: "capacity",
    timing: "leading",
    tier: "operational",
    direction: "higher-better",
    parentId: "kqi-core-sla",
    frequency: "daily",
  },
  {
    id: "kpi-auto-stp",
    name: "Straight-through-processing %",
    description: "% of core-service transactions completed automatically with no manual handling.",
    unit: "%",
    target: "70",
    perspective: "process",
    timing: "leading",
    tier: "operational",
    direction: "higher-better",
    parentId: "kqi-core-sla",
    frequency: "weekly",
  },
  {
    id: "kpi-docs-indexed",
    name: "Documents indexed per day",
    description: "Volume of incoming documents classified and indexed into the case system each day.",
    unit: "/day",
    target: "1800",
    perspective: "process",
    timing: "leading",
    tier: "operational",
    direction: "higher-better",
    parentId: "kqi-core-sla",
    frequency: "daily",
  },
  {
    id: "kpi-aht",
    name: "Average handle time (AHT)",
    description: "Mean contact-centre handle time per interaction. Paired with FCR as an anti-gaming shadow metric.",
    unit: "min",
    target: "6",
    perspective: "process",
    timing: "leading",
    tier: "operational",
    direction: "lower-better",
    parentId: "kqi-fcr",
    frequency: "daily",
  },
  {
    id: "kpi-call-answer",
    name: "Calls answered within 60s %",
    description: "Share of contact-centre calls answered within 60 seconds (response-time KPI; 35→6 min programme).",
    unit: "%",
    target: "90",
    perspective: "process",
    timing: "leading",
    tier: "operational",
    direction: "higher-better",
    parentId: "kqi-fcr",
    frequency: "daily",
  },
  {
    id: "kpi-repeat-contact",
    name: "Repeat-contact rate %",
    description: "% of resolved interactions that generate a repeat contact within 7 days (inverse of FCR quality).",
    unit: "%",
    target: "12",
    perspective: "customer",
    timing: "lagging",
    tier: "operational",
    direction: "lower-better",
    parentId: "kqi-fcr",
    frequency: "weekly",
  },
  {
    id: "kpi-auto-fail",
    name: "QA auto-fail rate %",
    description: "% of QA-reviewed cases triggering a compliance/security auto-fail. Well-run teams run <1%.",
    unit: "%",
    target: "1",
    perspective: "process",
    timing: "lagging",
    tier: "operational",
    direction: "lower-better",
    parentId: "kqi-compliance-accuracy",
    frequency: "monthly",
  },
  {
    id: "kpi-identity-verify",
    name: "Identity-verification compliance %",
    description: "% of pension-data disclosures preceded by a verified identity check (compliance auto-fail driver).",
    unit: "%",
    target: "100",
    perspective: "process",
    timing: "leading",
    tier: "operational",
    direction: "higher-better",
    parentId: "kqi-compliance-accuracy",
    frequency: "weekly",
  },
  {
    id: "kpi-calc-error",
    name: "Benefit calculation error rate %",
    description: "% of disbursements with a calculation defect detected in QA or post-payment review.",
    unit: "%",
    target: "0.3",
    perspective: "process",
    timing: "lagging",
    tier: "operational",
    direction: "lower-better",
    parentId: "kqi-disbursement-accuracy",
    frequency: "monthly",
  },
];

// ── Measurement time-series helpers ────────────────────────────────────────
// Each entry: id of KPI/KQI → 6-month series of values (latest last).
interface SeriesSeed {
  refId: string;
  values: number[];
  target: number;
  comparator?: string;
}

const KPI_SERIES: SeriesSeed[] = [
  // KQIs
  { refId: "kqi-eos-sla", values: [88, 89, 91, 90, 93, 94], target: 95 },
  { refId: "kqi-eos-sla", values: [90, 90, 91, 92, 92, 93], target: 95, comparator: "GCC-avg" },
  { refId: "kqi-core-sla", values: [93, 94, 94, 95, 95, 96], target: 95 },
  { refId: "kqi-core-sla", values: [97, 97, 98, 98, 98, 99], target: 95, comparator: "global-best" },
  { refId: "kqi-fcr", values: [74, 76, 78, 79, 81, 83], target: 85 },
  { refId: "kqi-fcr", values: [85, 85, 86, 86, 87, 87], target: 85, comparator: "global-best" },
  { refId: "kqi-compliance-accuracy", values: [98.4, 98.7, 99.0, 99.1, 99.3, 99.4], target: 99.5 },
  { refId: "kqi-disbursement-accuracy", values: [99.4, 99.5, 99.6, 99.6, 99.7, 99.8], target: 99.8 },
  { refId: "kqi-satisfaction", values: [84, 85, 87, 88, 89, 90], target: 90 },
  { refId: "kqi-satisfaction", values: [90, 91, 92, 93, 93, 94], target: 90, comparator: "global-best" },
  // KPIs
  { refId: "kpi-claims-keyed", values: [24, 26, 27, 29, 30, 31], target: 32 },
  { refId: "kpi-eos-ftr", values: [82, 84, 86, 88, 89, 91], target: 92 },
  { refId: "kpi-eos-backlog", values: [120, 104, 88, 72, 58, 47], target: 40 },
  { refId: "kpi-system-uptime", values: [99.6, 99.7, 99.8, 99.8, 99.9, 99.9], target: 99.9 },
  { refId: "kpi-auto-stp", values: [48, 52, 57, 61, 65, 68], target: 70 },
  { refId: "kpi-docs-indexed", values: [1350, 1460, 1540, 1620, 1710, 1780], target: 1800 },
  { refId: "kpi-aht", values: [9.5, 8.7, 8.0, 7.4, 6.8, 6.2], target: 6 },
  { refId: "kpi-call-answer", values: [72, 78, 82, 85, 88, 90], target: 90 },
  { refId: "kpi-repeat-contact", values: [22, 20, 18, 16, 14, 13], target: 12 },
  { refId: "kpi-auto-fail", values: [4.2, 3.5, 2.8, 2.1, 1.6, 1.2], target: 1 },
  { refId: "kpi-identity-verify", values: [97, 98, 99, 99, 100, 100], target: 100 },
  { refId: "kpi-calc-error", values: [0.9, 0.7, 0.6, 0.5, 0.4, 0.3], target: 0.3 },
];

// ── CxMeasurement — VoC instruments ────────────────────────────────────────
interface CxSeed {
  metric: string; // csat | dsat | nps | ces | pulse | fcr | repeat-contact
  serviceName?: string;
  channel?: string;
  values: number[];
  driver?: string;
  sampleSize?: number;
}

const CX_SEEDS: CxSeed[] = [
  { metric: "csat", values: [85, 86, 88, 89, 90, 91], sampleSize: 4200, driver: "Ease & speed" },
  { metric: "csat", serviceName: "Apply for End Of Service - Civil", values: [82, 84, 85, 87, 88, 89], sampleSize: 1100, driver: "Clarity of status" },
  { metric: "csat", channel: "Mobile Application", values: [86, 88, 89, 90, 91, 92], sampleSize: 1600, driver: "Convenience" },
  { metric: "csat", channel: "Call Center", values: [80, 82, 84, 85, 86, 88], sampleSize: 900, driver: "Agent helpfulness" },
  { metric: "dsat", values: [9, 8, 7, 6, 6, 5], sampleSize: 4200, driver: "Document re-requests" },
  { metric: "nps", values: [30, 33, 36, 38, 41, 43], sampleSize: 3800, driver: "Overall trust" },
  { metric: "ces", values: [2.6, 2.4, 2.3, 2.1, 2.0, 1.9], sampleSize: 3500, driver: "Effort to complete" },
  { metric: "pulse", values: [78, 80, 82, 83, 85, 86], sampleSize: 5200, driver: "Always-on sentiment" },
  { metric: "fcr", values: [74, 76, 78, 79, 81, 83], sampleSize: 2600, driver: "First-contact resolution" },
  { metric: "repeat-contact", values: [22, 20, 18, 16, 14, 13], sampleSize: 2600, driver: "Repeat within 7 days" },
];

// ── ComplaintTheme — Pareto over the latest period ─────────────────────────
interface ComplaintSeed {
  theme: string;
  counts: number[]; // per month
  sentiment: string;
  serviceName?: string;
}

const COMPLAINT_SEEDS: ComplaintSeed[] = [
  { theme: "Document re-requests / repeated uploads", counts: [210, 198, 182, 170, 156, 142], sentiment: "negative" },
  { theme: "Unclear case status / lack of updates", counts: [180, 172, 160, 150, 138, 124], sentiment: "negative" },
  { theme: "Processing time too long", counts: [150, 142, 130, 120, 110, 98], sentiment: "negative", serviceName: "Apply for End Of Service - Civil" },
  { theme: "Call wait time", counts: [120, 104, 88, 70, 56, 44], sentiment: "negative", serviceName: "Submit Complaint, Inquiry, Suggestion" },
  { theme: "Conflicting information across channels", counts: [90, 86, 80, 74, 68, 60], sentiment: "negative" },
  { theme: "Payment amount queries", counts: [70, 66, 62, 58, 54, 50], sentiment: "neutral" },
  { theme: "Portal navigation difficulty", counts: [60, 55, 50, 46, 42, 38], sentiment: "neutral", serviceName: "Generate Certificates" },
  { theme: "Eligibility rules hard to understand", counts: [45, 43, 40, 38, 35, 32], sentiment: "neutral" },
];

// ── ComputedKqi — sector rollups / comparators ─────────────────────────────
interface ComputedKqiSeed {
  slug: string;
  name: string;
  kind: string;
  scope: string;
  value: number;
  unit: string;
  formula: string;
  payload: Record<string, unknown>;
}

const COMPUTED_KQIS: ComputedKqiSeed[] = [
  {
    slug: "sector-sla-attainment-avg",
    name: "Pension-peer SLA attainment (average)",
    kind: "avg",
    scope: "peer-group",
    value: 88,
    unit: "%",
    formula: "mean(on-time % across DWP, ESDC, Services Australia, CPF, GPSSA)",
    payload: { peers: { DWP: 96, ESDC: 86.6, "Services Australia": 43, CPF: 97, GPSSA: 95 } },
  },
  {
    slug: "sector-csat-bestpractice",
    name: "Pension-peer CSAT (best practice)",
    kind: "best-practice",
    scope: "global",
    value: 94,
    unit: "%",
    formula: "max(satisfaction across pension peers)",
    payload: { peers: { "DWP State Pension": 94, "CPF": 90, "Dubai Govt": 93.8 } },
  },
  {
    slug: "sector-fcr-avg",
    name: "Contact-centre FCR (industry average)",
    kind: "avg",
    scope: "global",
    value: 72,
    unit: "%",
    formula: "mean(first-contact-resolution across published contact-centre benchmarks)",
    payload: { band: "70–75% typical, 85%+ top quartile" },
  },
  {
    slug: "sector-nps-banking-avg",
    name: "Banking NPS (sector average)",
    kind: "avg",
    scope: "global",
    value: 42,
    unit: "score",
    formula: "mean(banking NPS benchmarks)",
    payload: { band: "41–44 banking", caveat: "Use cautiously in government context" },
  },
];

// ── BenefitsRealisation — baseline → target → actual ───────────────────────
interface BenefitSeed {
  id: string;
  title: string;
  metric: string;
  baseline: number;
  target: number;
  actual: number | null;
  unit: string;
  status: string;
  validatedBy?: string;
  note?: string;
  initiativeMatch?: string; // substring to match a RoadmapInitiative title
}

const BENEFITS: BenefitSeed[] = [
  {
    id: "ben-core-completion",
    title: "Core-service completion time",
    metric: "Average end-to-end completion (hours)",
    baseline: 72,
    target: 24,
    actual: 18,
    unit: "h",
    status: "realised",
    validatedBy: "PMO / Quality CoE",
    note: "Ma'ashi core-services redesign beat the 24h target; sustained over the 6-month window.",
  },
  {
    id: "ben-employer-docs",
    title: "Required documents (Employer Registration)",
    metric: "Documents requested per registration",
    baseline: 6,
    target: 3,
    actual: 3,
    unit: "docs",
    status: "realised",
    validatedBy: "Service Design",
    note: "Pre-filled data from federal sources removed three document requests.",
  },
  {
    id: "ben-call-response",
    title: "Call-centre response time",
    metric: "Average time to answer (minutes)",
    baseline: 35,
    target: 8,
    actual: 6,
    unit: "min",
    status: "realised",
    validatedBy: "Contact Centre Ops",
    note: "Capacity uplift across 43,000+ calls cut response from 35 to ~6 minutes.",
  },
  {
    id: "ben-eos-sla",
    title: "End-of-Service SLA attainment",
    metric: "% EoS cases within 20 working days",
    baseline: 80,
    target: 95,
    actual: 94,
    unit: "%",
    status: "on-track",
    note: "Backlog clearance + first-time-right lift have closed most of the gap to target.",
  },
  {
    id: "ben-stp",
    title: "Straight-through processing rate",
    metric: "% transactions fully automated",
    baseline: 35,
    target: 70,
    actual: 68,
    unit: "%",
    status: "on-track",
    note: "Incremental STP-threshold raises; human-in-the-loop retained for consequential decisions.",
  },
  {
    id: "ben-auto-fail",
    title: "QA auto-fail rate",
    metric: "% reviewed cases triggering auto-fail",
    baseline: 5,
    target: 1,
    actual: 1.2,
    unit: "%",
    status: "at-risk",
    note: "Approaching <1% target; residual identity-verification slips on a single queue.",
  },
  {
    id: "ben-fcr",
    title: "First-contact resolution",
    metric: "% queries resolved first time",
    baseline: 65,
    target: 85,
    actual: 83,
    unit: "%",
    status: "on-track",
    note: "Knowledge-base alignment with portal changes is the remaining lever.",
  },
  {
    id: "ben-digital-adoption",
    title: "Digital channel adoption",
    metric: "% transactions via digital channels",
    baseline: 55,
    target: 80,
    actual: 64,
    unit: "%",
    status: "missed",
    note: "Adoption lagging target; partner/API channel rollout slipped, mobile parity incomplete.",
  },
];

export async function seedPerformance(prisma: PrismaClient): Promise<{
  kqis: number;
  kpis: number;
  measurements: number;
  cx: number;
  complaints: number;
  computed: number;
  benefits: number;
}> {
  // 1. KQIs (parents) first, then KPIs (children) so parentId resolves.
  for (const k of KQIS) {
    await prisma.kPI.upsert({
      where: { id: k.id },
      update: {
        name: k.name,
        description: k.description,
        unit: k.unit,
        target: k.target,
        kind: "kqi",
        timing: k.timing,
        perspective: k.perspective,
        tier: k.tier,
        direction: k.direction,
        pillar: "performance",
        parentId: null,
        category: "KQI",
      },
      create: {
        id: k.id,
        name: k.name,
        description: k.description,
        unit: k.unit,
        target: k.target,
        kind: "kqi",
        timing: k.timing,
        perspective: k.perspective,
        tier: k.tier,
        direction: k.direction,
        pillar: "performance",
        category: "KQI",
        frequency: "monthly",
      },
    });
  }

  for (const k of KPIS) {
    await prisma.kPI.upsert({
      where: { id: k.id },
      update: {
        name: k.name,
        description: k.description,
        unit: k.unit,
        target: k.target,
        kind: "kpi",
        timing: k.timing,
        perspective: k.perspective,
        tier: k.tier,
        direction: k.direction,
        parentId: k.parentId,
        pillar: "performance",
        category: "KPI",
        frequency: k.frequency,
      },
      create: {
        id: k.id,
        name: k.name,
        description: k.description,
        unit: k.unit,
        target: k.target,
        kind: "kpi",
        timing: k.timing,
        perspective: k.perspective,
        tier: k.tier,
        direction: k.direction,
        parentId: k.parentId,
        pillar: "performance",
        category: "KPI",
        frequency: k.frequency,
      },
    });
  }

  // 2. KpiMeasurement time-series (unique on kpiId+period+comparator).
  let measurements = 0;
  for (const s of KPI_SERIES) {
    const comparator = s.comparator ?? "GPSSA";
    for (let i = 0; i < MONTHS.length; i++) {
      const period = MONTHS[i];
      await prisma.kpiMeasurement.upsert({
        where: {
          kpiId_period_comparator: { kpiId: s.refId, period, comparator },
        },
        update: { value: s.values[i], target: s.target },
        create: {
          kpiId: s.refId,
          period,
          value: s.values[i],
          target: s.target,
          comparator,
        },
      });
      measurements++;
    }
  }

  // 3. CxMeasurement (no natural unique key → clear+recreate this module's rows).
  await prisma.cxMeasurement.deleteMany({});
  let cx = 0;
  for (const c of CX_SEEDS) {
    for (let i = 0; i < MONTHS.length; i++) {
      await prisma.cxMeasurement.create({
        data: {
          metric: c.metric,
          serviceName: c.serviceName ?? null,
          channel: c.channel ?? null,
          period: MONTHS[i],
          value: c.values[i],
          sampleSize: c.sampleSize ?? null,
          driver: c.driver ?? null,
        },
      });
      cx++;
    }
  }

  // 4. ComplaintTheme (Pareto) — clear+recreate.
  await prisma.complaintTheme.deleteMany({});
  let complaints = 0;
  for (const t of COMPLAINT_SEEDS) {
    for (let i = 0; i < MONTHS.length; i++) {
      await prisma.complaintTheme.create({
        data: {
          theme: t.theme,
          period: MONTHS[i],
          count: t.counts[i],
          sentiment: t.sentiment,
          serviceName: t.serviceName ?? null,
        },
      });
      complaints++;
    }
  }

  // 5. ComputedKqi rollups (unique slug).
  let computed = 0;
  for (const c of COMPUTED_KQIS) {
    await prisma.computedKqi.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        kind: c.kind,
        scope: c.scope,
        value: c.value,
        unit: c.unit,
        formula: c.formula,
        asOfDate: new Date(),
        payload: JSON.stringify(c.payload),
      },
      create: {
        slug: c.slug,
        name: c.name,
        kind: c.kind,
        scope: c.scope,
        value: c.value,
        unit: c.unit,
        formula: c.formula,
        asOfDate: new Date(),
        payload: JSON.stringify(c.payload),
      },
    });
    computed++;
  }

  // 6. BenefitsRealisation — link to seeded RoadmapInitiative when present.
  let benefits = 0;
  for (const b of BENEFITS) {
    let initiativeId: string | null = null;
    if (b.initiativeMatch) {
      const init = await prisma.roadmapInitiative.findFirst({
        where: { title: { contains: b.initiativeMatch, mode: "insensitive" } },
      });
      initiativeId = init?.id ?? null;
    }
    await prisma.benefitsRealisation.upsert({
      where: { id: b.id },
      update: {
        title: b.title,
        metric: b.metric,
        baseline: b.baseline,
        target: b.target,
        actual: b.actual,
        unit: b.unit,
        status: b.status,
        validatedBy: b.validatedBy ?? null,
        validatedAt: b.actual != null ? "2026-01-31" : null,
        note: b.note ?? null,
        initiativeId,
      },
      create: {
        id: b.id,
        title: b.title,
        metric: b.metric,
        baseline: b.baseline,
        target: b.target,
        actual: b.actual,
        unit: b.unit,
        status: b.status,
        validatedBy: b.validatedBy ?? null,
        validatedAt: b.actual != null ? "2026-01-31" : null,
        note: b.note ?? null,
        initiativeId,
      },
    });
    benefits++;
  }

  return {
    kqis: KQIS.length,
    kpis: KPIS.length,
    measurements,
    cx,
    complaints,
    computed,
    benefits,
  };
}
