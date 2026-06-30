import type { PrismaClient } from "@prisma/client";
import { priorityFor } from "./triage";
import { agingFor } from "./aging";

/**
 * Idempotent seed for the Service Fulfilment & Breach Reduction workstream.
 *
 * Cases are positioned RELATIVE TO NOW (computed at seed time) so that a live
 * `agingFor(openedAt, dueAt, new Date())` at request time yields a healthy
 * spread across green / amber / red / breached. As wall-clock time advances the
 * board visibly ages without any re-seed (the API recomputes risk live).
 *
 * Stable ids (e.g. `sla-eos-gold`, `case-000123`) make this upsert-safe.
 */

const H = 36e5; // ms per hour

type SlaSeed = {
  id: string;
  serviceName: string;
  name: string;
  tier: "gold" | "silver" | "bronze" | "standard";
  type: "sla" | "ola";
  targetHours: number;
  underpinsSlaId?: string;
  direction?: string;
  description?: string;
};

// ── Customer SLAs (tiered, service-based) + internal OLAs that underpin them ──
const SLAS: SlaSeed[] = [
  // End of Service
  {
    id: "sla-eos-gold",
    serviceName: "End of Service",
    name: "End of Service — Gold (priority members)",
    tier: "gold",
    type: "sla",
    targetHours: 24,
    description:
      "Settlement of end-of-service gratuity for priority / high-value members within one working day.",
  },
  {
    id: "sla-eos-standard",
    serviceName: "End of Service",
    name: "End of Service — Standard",
    tier: "standard",
    type: "sla",
    targetHours: 72,
    description:
      "Standard end-of-service settlement, aligned to GPSSA's published <24h core-service ambition with buffer for manual review.",
  },
  // Pension Entitlement Update
  {
    id: "sla-pension-silver",
    serviceName: "Pension Entitlement Update",
    name: "Pension Entitlement Update — Silver",
    tier: "silver",
    type: "sla",
    targetHours: 48,
    description: "Recalculation and update of an active pension entitlement.",
  },
  // Employer Registration
  {
    id: "sla-employer-gold",
    serviceName: "Employer Registration",
    name: "Employer Registration — Gold",
    tier: "gold",
    type: "sla",
    targetHours: 24,
    description: "Onboarding and registration of a new contributing employer.",
  },
  // Report a Death (bereavement — fastest tier)
  {
    id: "sla-death-gold",
    serviceName: "Report a Death",
    name: "Report a Death — Gold (bereavement)",
    tier: "gold",
    type: "sla",
    targetHours: 12,
    description:
      "Compassionate, expedited handling of a reported death and survivor-benefit initiation.",
  },
  // Benefit Exchange
  {
    id: "sla-exchange-bronze",
    serviceName: "Benefit Exchange",
    name: "Benefit / Service Exchange — Bronze",
    tier: "bronze",
    type: "sla",
    targetHours: 120,
    description:
      "Cross-entity service-credit exchange and reconciliation between authorities.",
  },
  // ── Internal OLAs (back-to-back commitments that underpin the SLAs) ──
  {
    id: "ola-eligibility-check",
    serviceName: "Eligibility & Records",
    name: "OLA — Eligibility & records verification",
    tier: "standard",
    type: "ola",
    targetHours: 8,
    underpinsSlaId: "sla-eos-gold",
    direction: "Records team → End of Service",
    description:
      "Records team confirms service history and eligibility so EoS settlement is not blocked.",
  },
  {
    id: "ola-finance-disbursement",
    serviceName: "Finance",
    name: "OLA — Finance disbursement readiness",
    tier: "standard",
    type: "ola",
    targetHours: 6,
    underpinsSlaId: "sla-eos-standard",
    direction: "Finance → End of Service",
    description:
      "Finance confirms payment instruction and beneficiary bank validation ahead of settlement.",
  },
  {
    id: "ola-actuarial-recalc",
    serviceName: "Actuarial",
    name: "OLA — Actuarial recalculation",
    tier: "standard",
    type: "ola",
    targetHours: 16,
    underpinsSlaId: "sla-pension-silver",
    direction: "Actuarial → Pension Entitlement Update",
    description:
      "Actuarial team returns the recomputed entitlement figure underpinning the pension-update SLA.",
  },
  {
    id: "ola-survivor-verification",
    serviceName: "Survivor Benefits",
    name: "OLA — Survivor verification",
    tier: "standard",
    type: "ola",
    targetHours: 4,
    underpinsSlaId: "sla-death-gold",
    direction: "Survivor Benefits → Report a Death",
    description:
      "Survivor-benefits unit verifies beneficiaries within 4h to protect the bereavement SLA.",
  },
];

const SLA_BY_ID = new Map(SLAS.map((s) => [s.id, s]));

// Owners pool (realistic GPSSA-style team names).
const OWNERS = [
  "Amna Al Suwaidi",
  "Khalid Rashed",
  "Maryam Al Hosani",
  "Sultan Al Marri",
  "Fatima Al Zaabi",
  "Omar Belhoul",
  "Noura Al Kaabi",
  "Hassan Al Mazrouei",
  "Latifa Al Nuaimi",
  "Yousef Al Ali",
];

type Impact = "low" | "medium" | "high";
type Urgency = "low" | "medium" | "high";
type Segment = "straight-through" | "manual-review" | "specialist";
type Status = "open" | "in-progress" | "on-hold" | "resolved";

interface CaseRecipe {
  serviceName: string;
  slaId: string;
  prefix: string; // for caseRef
  impact: Impact;
  urgency: Urgency;
  segment: Segment;
}

// Maps a service to the building blocks for a realistic case ref + routing.
const SERVICE_RECIPES: CaseRecipe[] = [
  { serviceName: "End of Service", slaId: "sla-eos-gold", prefix: "EOS", impact: "high", urgency: "high", segment: "manual-review" },
  { serviceName: "End of Service", slaId: "sla-eos-standard", prefix: "EOS", impact: "medium", urgency: "medium", segment: "straight-through" },
  { serviceName: "Pension Entitlement Update", slaId: "sla-pension-silver", prefix: "PEN", impact: "medium", urgency: "medium", segment: "manual-review" },
  { serviceName: "Employer Registration", slaId: "sla-employer-gold", prefix: "EMP", impact: "low", urgency: "medium", segment: "straight-through" },
  { serviceName: "Report a Death", slaId: "sla-death-gold", prefix: "DTH", impact: "high", urgency: "high", segment: "specialist" },
  { serviceName: "Benefit Exchange", slaId: "sla-exchange-bronze", prefix: "BEX", impact: "medium", urgency: "low", segment: "specialist" },
];

/**
 * Aging profile presets. Each defines (relative to now) how long ago the case
 * opened and how far in the future (negative = past) the SLA is due, so the
 * live risk recomputation lands the case in the intended bucket.
 *
 * pctElapsed thresholds: amber ≥70, red ≥90, breached ≥100.
 */
type AgeProfile = {
  // fraction of the SLA window already elapsed (drives risk colour)
  pctElapsed: number;
  status: Status;
  resolvedLate?: boolean;
};

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

export async function seedFulfilment(prisma: PrismaClient): Promise<{
  slas: number;
  cases: number;
  breaches: number;
  snapshots: number;
}> {
  const now = Date.now();

  // 1. Upsert SLAs in two passes so OLA→SLA links resolve to existing rows.
  for (const s of SLAS.filter((x) => x.type === "sla")) {
    await prisma.sLADefinition.upsert({
      where: { id: s.id },
      update: {
        serviceName: s.serviceName,
        name: s.name,
        tier: s.tier,
        type: s.type,
        targetHours: s.targetHours,
        underpinsSlaId: null,
        direction: s.direction ?? null,
        description: s.description ?? null,
      },
      create: {
        id: s.id,
        serviceName: s.serviceName,
        name: s.name,
        tier: s.tier,
        type: s.type,
        targetHours: s.targetHours,
        direction: s.direction ?? null,
        description: s.description ?? null,
      },
    });
  }
  for (const s of SLAS.filter((x) => x.type === "ola")) {
    await prisma.sLADefinition.upsert({
      where: { id: s.id },
      update: {
        serviceName: s.serviceName,
        name: s.name,
        tier: s.tier,
        type: s.type,
        targetHours: s.targetHours,
        underpinsSlaId: s.underpinsSlaId ?? null,
        direction: s.direction ?? null,
        description: s.description ?? null,
      },
      create: {
        id: s.id,
        serviceName: s.serviceName,
        name: s.name,
        tier: s.tier,
        type: s.type,
        targetHours: s.targetHours,
        underpinsSlaId: s.underpinsSlaId ?? null,
        direction: s.direction ?? null,
        description: s.description ?? null,
      },
    });
  }

  // 2. Build ~50 cases with a deliberate spread of live aging.
  //    Cycle a profile pattern so green/amber/red/breached are all present.
  const PROFILES: AgeProfile[] = [
    { pctElapsed: 20, status: "open" },
    { pctElapsed: 35, status: "in-progress" },
    { pctElapsed: 55, status: "open" },
    { pctElapsed: 62, status: "in-progress" },
    { pctElapsed: 74, status: "in-progress" }, // amber
    { pctElapsed: 82, status: "open" }, // amber
    { pctElapsed: 88, status: "in-progress" }, // amber
    { pctElapsed: 93, status: "in-progress" }, // red
    { pctElapsed: 97, status: "open" }, // red
    { pctElapsed: 112, status: "in-progress" }, // breached (open, past due)
    { pctElapsed: 140, status: "on-hold" }, // breached
    { pctElapsed: 60, status: "resolved" }, // resolved on time
    { pctElapsed: 125, status: "resolved", resolvedLate: true }, // resolved late → breach
  ];

  const cases: {
    id: string;
    caseRef: string;
    serviceName: string;
    slaId: string;
    targetHours: number;
    segment: Segment;
    impact: Impact;
    urgency: Urgency;
    priority: string;
    status: Status;
    owner: string;
    openedAt: Date;
    dueAt: Date;
    resolvedAt: Date | null;
    breached: boolean;
    breachRiskLevel: string;
    profile: AgeProfile;
  }[] = [];

  const TOTAL = 52;
  let refCounter = 10401;
  for (let i = 0; i < TOTAL; i++) {
    const recipe = pick(SERVICE_RECIPES, i);
    const sla = SLA_BY_ID.get(recipe.slaId)!;
    const profile = pick(PROFILES, i);
    const targetHours = sla.targetHours;

    // Vary impact/urgency a little around the recipe baseline for realism.
    const impact = pick<Impact>(
      [recipe.impact, "medium", "high", recipe.impact],
      i
    );
    const urgency = pick<Urgency>(
      [recipe.urgency, "high", "medium", recipe.urgency],
      i + 1
    );
    const priority = priorityFor(impact, urgency);

    // Total window for THIS case = SLA target hours.
    const windowH = targetHours;
    const elapsedH = (profile.pctElapsed / 100) * windowH;
    const openedAt = new Date(now - elapsedH * H);
    const dueAt = new Date(openedAt.getTime() + windowH * H);

    let resolvedAt: Date | null = null;
    if (profile.status === "resolved") {
      // Resolved cases sit in the past; if "late" they resolved after dueAt.
      const resolveOffset = profile.resolvedLate
        ? windowH * 1.15 // after due
        : windowH * 0.65; // before due
      resolvedAt = new Date(openedAt.getTime() + resolveOffset * H);
    }

    const refCount = ++refCounter;
    const live = agingFor(openedAt, dueAt, new Date(now));
    const breached =
      profile.status === "resolved"
        ? Boolean(profile.resolvedLate)
        : live.riskLevel === "breached";

    cases.push({
      id: `case-${String(i + 1).padStart(6, "0")}`,
      caseRef: `GPSSA-${recipe.prefix}-${refCount}`,
      serviceName: recipe.serviceName,
      slaId: recipe.slaId,
      targetHours,
      segment: recipe.segment,
      impact,
      urgency,
      priority,
      status: profile.status,
      owner: pick(OWNERS, i),
      openedAt,
      dueAt,
      resolvedAt,
      breached,
      // Persist a nominal risk level (API recomputes live).
      breachRiskLevel:
        live.riskLevel === "breached" ? "red" : live.riskLevel,
      profile,
    });
  }

  for (const c of cases) {
    await prisma.serviceCase.upsert({
      where: { id: c.id },
      update: {
        serviceName: c.serviceName,
        caseRef: c.caseRef,
        segment: c.segment,
        impact: c.impact,
        urgency: c.urgency,
        priority: c.priority,
        status: c.status,
        owner: c.owner,
        openedAt: c.openedAt,
        slaId: c.slaId,
        dueAt: c.dueAt,
        resolvedAt: c.resolvedAt,
        breached: c.breached,
        breachRiskLevel: c.breachRiskLevel,
      },
      create: {
        id: c.id,
        serviceName: c.serviceName,
        caseRef: c.caseRef,
        segment: c.segment,
        impact: c.impact,
        urgency: c.urgency,
        priority: c.priority,
        status: c.status,
        owner: c.owner,
        openedAt: c.openedAt,
        slaId: c.slaId,
        dueAt: c.dueAt,
        resolvedAt: c.resolvedAt,
        breached: c.breached,
        breachRiskLevel: c.breachRiskLevel,
      },
    });
  }

  // 3. Breaches on past-due / resolved-late cases.
  const BREACH_REASONS = [
    "Eligibility verification stalled awaiting records hand-off",
    "Finance disbursement queued beyond OLA window",
    "Actuarial recalculation returned late",
    "Document completeness exception — missing beneficiary proof",
    "Inbound volume spike exhausted team capacity",
    "Specialist review backlog at >30 days",
    "System integration timeout on cross-entity exchange",
  ];
  const breachCases = cases.filter((c) => c.breached);
  let breachCount = 0;
  for (let i = 0; i < breachCases.length; i++) {
    const c = breachCases[i];
    const live = agingFor(c.openedAt, c.dueAt, new Date(now));
    // hoursOver: for resolved-late use resolvedAt vs dueAt, else live overrun.
    let hoursOver: number;
    if (c.resolvedAt) {
      hoursOver = Math.max(
        1,
        Math.round((c.resolvedAt.getTime() - c.dueAt.getTime()) / H)
      );
    } else {
      hoursOver = Math.max(1, Math.round(-live.hoursToBreach));
    }
    const escalationType =
      c.priority === "P1" || c.priority === "P2" || c.impact === "high"
        ? "hierarchical"
        : "functional";

    await prisma.breach.upsert({
      where: { id: `breach-${String(i + 1).padStart(4, "0")}` },
      update: {
        caseId: c.id,
        slaId: c.slaId,
        breachedAt: c.dueAt,
        hoursOver,
        reason: pick(BREACH_REASONS, i),
        escalationType,
        defectId: null,
      },
      create: {
        id: `breach-${String(i + 1).padStart(4, "0")}`,
        caseId: c.id,
        slaId: c.slaId,
        breachedAt: c.dueAt,
        hoursOver,
        reason: pick(BREACH_REASONS, i),
        escalationType,
        defectId: null,
      },
    });
    breachCount++;
    if (breachCount >= 12) break;
  }

  // 4. Fulfilment snapshots — a few services across ~6 months, trending right.
  const SNAPSHOT_SERVICES = [
    "End of Service",
    "Pension Entitlement Update",
    "Report a Death",
  ];
  const PERIODS = [
    "2026-01",
    "2026-02",
    "2026-03",
    "2026-04",
    "2026-05",
    "2026-06",
  ];

  let snapCount = 0;
  for (const serviceName of SNAPSHOT_SERVICES) {
    // Per-service starting points, all improving over the 6 periods.
    const base = {
      avgTat: serviceName === "Report a Death" ? 18 : 64,
      ftr: serviceName === "End of Service" ? 72 : 76,
      rework: 26,
      backlog: serviceName === "End of Service" ? 540 : 320,
      wip30: serviceName === "End of Service" ? 96 : 58,
      pce: 9,
      dpmo: 41000,
    };
    for (let p = 0; p < PERIODS.length; p++) {
      const t = p / (PERIODS.length - 1); // 0..1
      const avgTatHours = Math.round((base.avgTat * (1 - 0.45 * t)) * 10) / 10;
      const firstTimeRightPct =
        Math.round((base.ftr + (92 - base.ftr) * t) * 10) / 10;
      const reworkPct = Math.round((base.rework * (1 - 0.6 * t)) * 10) / 10;
      const backlogCount = Math.round(base.backlog * (1 - 0.55 * t));
      const wipOver30 = Math.round(base.wip30 * (1 - 0.5 * t));
      const pcePct = Math.round((base.pce + (24 - base.pce) * t) * 10) / 10;
      const dpmo = Math.round(base.dpmo * (1 - 0.62 * t));

      await prisma.fulfilmentSnapshot.upsert({
        where: {
          serviceName_period: { serviceName, period: PERIODS[p] },
        },
        update: {
          avgTatHours,
          firstTimeRightPct,
          reworkPct,
          backlogCount,
          wipOver30,
          pcePct,
          dpmo,
        },
        create: {
          serviceName,
          period: PERIODS[p],
          avgTatHours,
          firstTimeRightPct,
          reworkPct,
          backlogCount,
          wipOver30,
          pcePct,
          dpmo,
        },
      });
      snapCount++;
    }
  }

  return {
    slas: SLAS.length,
    cases: cases.length,
    breaches: breachCount,
    snapshots: snapCount,
  };
}
