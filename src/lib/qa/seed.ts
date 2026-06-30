/**
 * Workstream B — Quality Assurance demo seed.
 *
 * Idempotent (stable ids + upsert). Seeds a rich, COPC-grade QA showcase:
 * 6 quality dimensions, 4 service scorecards (10–14 criteria each, with
 * compliance/identity auto-fails), one hybrid sampling plan per scorecard,
 * ~24 reviews spread over 6 months, calibration sessions trending up in IRR,
 * a severity-tiered error taxonomy, ~30 defects (Pareto-shaped) and ~8 CAPAs.
 *
 * Anchored to the research doc (Part B) — see
 * RFP-016-2026/02_End_to_End_QA_and_Service_Fulfilment_Framework_Research.md.
 */
import type { PrismaClient } from "@prisma/client";
import { computeReviewOutcome } from "./scoring";
import { computeSampleSize } from "./sampling";

// Deterministic PRNG so reseeds produce the same demo data.
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function monthsAgo(n: number, dayOfMonth = 15): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - n, dayOfMonth);
  d.setHours(10, 0, 0, 0);
  return d;
}

interface DimSeed {
  id: string;
  name: string;
  definition: string;
  category: string;
  copcFamily: string | null;
  weight: number;
  sortOrder: number;
}

const DIMENSIONS: DimSeed[] = [
  {
    id: "qadim-accuracy",
    name: "Accuracy",
    definition:
      "The decision or payment is correct — right entitlement, right amount, right beneficiary.",
    category: "accuracy",
    copcFamily: "customer",
    weight: 1.4,
    sortOrder: 1,
  },
  {
    id: "qadim-completeness",
    name: "Completeness",
    definition:
      "All required steps, documents and checks were performed before the case was closed.",
    category: "completeness",
    copcFamily: "business",
    weight: 1.1,
    sortOrder: 2,
  },
  {
    id: "qadim-compliance",
    name: "Compliance",
    definition:
      "Legal, regulatory and policy adherence — data protection, identity verification, eligibility rules.",
    category: "compliance",
    copcFamily: "compliance",
    weight: 1.5,
    sortOrder: 3,
  },
  {
    id: "qadim-timeliness",
    name: "Timeliness",
    definition:
      "The case was progressed and completed within its committed SLA window.",
    category: "timeliness",
    copcFamily: "business",
    weight: 1.0,
    sortOrder: 4,
  },
  {
    id: "qadim-cx",
    name: "Customer Experience",
    definition:
      "Clarity, courtesy and low customer effort throughout the interaction and communications.",
    category: "cx",
    copcFamily: "customer",
    weight: 1.0,
    sortOrder: 5,
  },
  {
    id: "qadim-consistency",
    name: "Consistency",
    definition:
      "The same case is handled the same way by any officer — repeatable, standard-driven outcomes.",
    category: "consistency",
    copcFamily: "business",
    weight: 0.9,
    sortOrder: 6,
  },
];

interface CritSeed {
  id: string;
  dimensionId: string;
  text: string;
  weight: number;
  critical: boolean;
}

interface ScorecardSeed {
  id: string;
  name: string;
  description: string;
  serviceScope: string;
  status: string;
  population: number;
  criteria: CritSeed[];
}

// Helper to build criteria quickly.
function c(
  id: string,
  dimensionId: string,
  text: string,
  weight = 1,
  critical = false
): CritSeed {
  return { id, dimensionId, text, weight, critical };
}

const SCORECARDS: ScorecardSeed[] = [
  {
    id: "qasc-eos-civil",
    name: "End of Service — Civil",
    description:
      "Transaction + journey QA for End-of-Service settlement cases (civil-sector insured).",
    serviceScope: "End of Service – Civil",
    status: "active",
    population: 1850,
    criteria: [
      c("qasc-eos-civil-c1", "qadim-compliance", "Identity of the requester was verified before any pension data was disclosed.", 2, true),
      c("qasc-eos-civil-c2", "qadim-compliance", "Eligibility for end-of-service settlement was confirmed against the pension law.", 2, true),
      c("qasc-eos-civil-c3", "qadim-accuracy", "Contribution period and salary base used in the calculation are correct.", 1.5),
      c("qasc-eos-civil-c4", "qadim-accuracy", "Settlement amount matches the recalculation to the dirham.", 1.5),
      c("qasc-eos-civil-c5", "qadim-accuracy", "Beneficiary bank details validated against the verified record.", 1.3),
      c("qasc-eos-civil-c6", "qadim-completeness", "All mandatory supporting documents are attached and legible.", 1),
      c("qasc-eos-civil-c7", "qadim-completeness", "Employer clearance and final contribution reconciliation are on file.", 1),
      c("qasc-eos-civil-c8", "qadim-timeliness", "Case progressed within the committed SLA at each hand-off.", 1),
      c("qasc-eos-civil-c9", "qadim-consistency", "Case routed and decisioned per the standard operating procedure.", 0.8),
      c("qasc-eos-civil-c10", "qadim-cx", "Outcome communicated clearly, with next steps and payment date.", 0.8),
      c("qasc-eos-civil-c11", "qadim-cx", "Customer was not asked for documents already held by GPSSA.", 0.7),
      c("qasc-eos-civil-c12", "qadim-completeness", "Audit trail and case notes are complete and time-stamped.", 0.7),
    ],
  },
  {
    id: "qasc-pension-update",
    name: "Pension Entitlement Update",
    description:
      "QA for changes to an existing pension entitlement (dependants, banking, recalculation).",
    serviceScope: "Pension Entitlement Update",
    status: "active",
    population: 2400,
    criteria: [
      c("qasc-pension-update-c1", "qadim-compliance", "Requester identity and authority to act were verified.", 2, true),
      c("qasc-pension-update-c2", "qadim-compliance", "Change is permitted under policy and properly authorised.", 1.8, true),
      c("qasc-pension-update-c3", "qadim-accuracy", "Recalculated entitlement is correct after the change.", 1.5),
      c("qasc-pension-update-c4", "qadim-accuracy", "Effective date of the change is applied correctly.", 1.3),
      c("qasc-pension-update-c5", "qadim-accuracy", "Updated banking details validated before first revised payment.", 1.3),
      c("qasc-pension-update-c6", "qadim-completeness", "Evidence for the change is attached and verified.", 1),
      c("qasc-pension-update-c7", "qadim-completeness", "Prior entitlement record was correctly superseded, not duplicated.", 1),
      c("qasc-pension-update-c8", "qadim-timeliness", "Update actioned within SLA from receipt of complete evidence.", 1),
      c("qasc-pension-update-c9", "qadim-consistency", "Standard recalculation workflow followed.", 0.8),
      c("qasc-pension-update-c10", "qadim-cx", "Beneficiary notified of the revised amount and effective date.", 0.8),
      c("qasc-pension-update-c11", "qadim-cx", "Communication was clear and free of jargon.", 0.6),
    ],
  },
  {
    id: "qasc-employer-reg",
    name: "Employer Registration",
    description: "QA for new employer onboarding and establishment registration.",
    serviceScope: "Employer Registration",
    status: "active",
    population: 1200,
    criteria: [
      c("qasc-employer-reg-c1", "qadim-compliance", "Trade licence and legal-entity details verified against source registry.", 1.8, true),
      c("qasc-employer-reg-c2", "qadim-compliance", "Authorised signatory identity verified before activation.", 1.8, true),
      c("qasc-employer-reg-c3", "qadim-accuracy", "Establishment classification and sector are correctly assigned.", 1.3),
      c("qasc-employer-reg-c4", "qadim-accuracy", "Contribution category and rate set correctly for the employer.", 1.3),
      c("qasc-employer-reg-c5", "qadim-completeness", "All mandatory registration fields captured and validated.", 1),
      c("qasc-employer-reg-c6", "qadim-completeness", "Initial insured roster reconciled with employer submission.", 1),
      c("qasc-employer-reg-c7", "qadim-timeliness", "Registration completed within the <24h core-service target.", 1),
      c("qasc-employer-reg-c8", "qadim-consistency", "Onboarding steps followed the standard checklist.", 0.8),
      c("qasc-employer-reg-c9", "qadim-cx", "Welcome and account-activation guidance sent to the employer.", 0.7),
      c("qasc-employer-reg-c10", "qadim-cx", "Employer not asked to re-supply data available from government sources.", 0.7),
    ],
  },
  {
    id: "qasc-report-death",
    name: "Report a Death",
    description:
      "Sensitive, high-touch QA for bereavement notifications and survivor-benefit initiation.",
    serviceScope: "Report a Death",
    status: "active",
    population: 760,
    criteria: [
      c("qasc-report-death-c1", "qadim-compliance", "Death record verified against the official source before any action.", 2, true),
      c("qasc-report-death-c2", "qadim-compliance", "Survivor eligibility assessed strictly per the pension law.", 2, true),
      c("qasc-report-death-c3", "qadim-compliance", "Notifier identity and relationship verified.", 1.6, true),
      c("qasc-report-death-c4", "qadim-accuracy", "Pension stopped/transitioned with the correct effective date.", 1.5),
      c("qasc-report-death-c5", "qadim-accuracy", "Survivor benefit apportioned correctly among dependants.", 1.5),
      c("qasc-report-death-c6", "qadim-completeness", "All survivor documents collected and verified.", 1),
      c("qasc-report-death-c7", "qadim-completeness", "Cross-entity notifications (life-event) initiated where applicable.", 1),
      c("qasc-report-death-c8", "qadim-timeliness", "Case prioritised and actioned within the bereavement SLA.", 1.2),
      c("qasc-report-death-c9", "qadim-cx", "Bereaved family treated with empathy; effort minimised.", 1),
      c("qasc-report-death-c10", "qadim-cx", "Single point of contact assigned and communicated.", 0.8),
      c("qasc-report-death-c11", "qadim-consistency", "Handled per the standard bereavement journey.", 0.8),
      c("qasc-report-death-c12", "qadim-completeness", "Full audit trail and decision rationale recorded.", 0.7),
    ],
  },
];

interface TaxNode {
  code: string;
  name: string;
  severity: string;
  category?: string;
  description?: string;
  children?: TaxNode[];
}

const TAXONOMY: TaxNode[] = [
  {
    code: "ELG",
    name: "Eligibility",
    severity: "critical",
    description: "Errors in determining whether a case qualifies under the pension law.",
    children: [
      { code: "ELG-MISJUDGE", name: "Eligibility misjudged", severity: "critical" },
      { code: "ELG-RULE-OUTDATED", name: "Outdated rule applied", severity: "major" },
      { code: "ELG-DEPENDANT", name: "Dependant eligibility error", severity: "major" },
    ],
  },
  {
    code: "CALC",
    name: "Calculation",
    severity: "critical",
    description: "Errors in entitlement, settlement or apportionment maths.",
    children: [
      { code: "CALC-AMOUNT", name: "Wrong settlement amount", severity: "critical" },
      { code: "CALC-PERIOD", name: "Contribution period error", severity: "major" },
      { code: "CALC-SALARY-BASE", name: "Salary base error", severity: "major" },
      { code: "CALC-APPORTION", name: "Survivor apportionment error", severity: "major" },
    ],
  },
  {
    code: "DOC",
    name: "Documentation",
    severity: "major",
    description: "Missing, invalid or unverified supporting documents.",
    children: [
      { code: "DOC-MISSING", name: "Mandatory document missing", severity: "major" },
      { code: "DOC-UNVERIFIED", name: "Document not verified", severity: "major" },
      { code: "DOC-ILLEGIBLE", name: "Illegible / poor-quality scan", severity: "minor" },
    ],
  },
  {
    code: "DATA",
    name: "Data-entry",
    severity: "major",
    description: "Keying and data-capture errors.",
    children: [
      { code: "DATA-BANK", name: "Incorrect bank details", severity: "major" },
      { code: "DATA-TYPO", name: "Keying / typo error", severity: "minor" },
      { code: "DATA-DUP", name: "Duplicate record created", severity: "minor" },
    ],
  },
  {
    code: "COMM",
    name: "Communication",
    severity: "minor",
    description: "Defects in customer-facing communication.",
    children: [
      { code: "COMM-UNCLEAR", name: "Unclear communication", severity: "minor" },
      { code: "COMM-NONE", name: "No outcome notification sent", severity: "major" },
    ],
  },
  {
    code: "CMPL",
    name: "Compliance",
    severity: "critical",
    description: "Identity, data-protection and authorisation breaches.",
    children: [
      { code: "CMPL-IDV", name: "Identity not verified", severity: "critical" },
      { code: "CMPL-DATA-PROT", name: "Data-protection breach", severity: "critical" },
      { code: "CMPL-AUTH", name: "Action not authorised", severity: "major" },
    ],
  },
  {
    code: "SYS",
    name: "System",
    severity: "major",
    description: "System / integration failures contributing to defects.",
    children: [
      { code: "SYS-INTEGRATION", name: "Integration / sync failure", severity: "major" },
      { code: "SYS-TIMEOUT", name: "System timeout / outage", severity: "minor" },
    ],
  },
];

// Pareto weighting: a few leaf codes dominate defect volume (~20% ≈ 80%).
const DEFECT_WEIGHTS: Record<string, number> = {
  "CALC-AMOUNT": 8,
  "DOC-MISSING": 6,
  "DATA-BANK": 5,
  "CALC-PERIOD": 4,
  "CMPL-IDV": 3,
  "ELG-MISJUDGE": 2,
  "DOC-UNVERIFIED": 1,
  "COMM-NONE": 1,
  "DATA-TYPO": 1,
  "SYS-INTEGRATION": 1,
};

const SERVICE_NAMES = [
  "End of Service – Civil",
  "Pension Entitlement Update",
  "Employer Registration",
  "Report a Death",
];

export async function seedQualityAssurance(prisma: PrismaClient) {
  const rng = mulberry32(20260701);

  // ── 1. Quality dimensions ──
  for (const d of DIMENSIONS) {
    await prisma.qualityDimension.upsert({
      where: { id: d.id },
      update: {
        name: d.name,
        definition: d.definition,
        category: d.category,
        copcFamily: d.copcFamily,
        weight: d.weight,
        sortOrder: d.sortOrder,
      },
      create: { ...d },
    });
  }

  // ── 2. Scorecards + criteria + sampling plans ──
  for (const sc of SCORECARDS) {
    await prisma.qAScorecard.upsert({
      where: { id: sc.id },
      update: {
        name: sc.name,
        description: sc.description,
        serviceScope: sc.serviceScope,
        status: sc.status,
      },
      create: {
        id: sc.id,
        name: sc.name,
        description: sc.description,
        serviceScope: sc.serviceScope,
        status: sc.status,
      },
    });

    for (let i = 0; i < sc.criteria.length; i++) {
      const cr = sc.criteria[i];
      await prisma.qAScorecardCriterion.upsert({
        where: { id: cr.id },
        update: {
          scorecardId: sc.id,
          dimensionId: cr.dimensionId,
          text: cr.text,
          weight: cr.weight,
          critical: cr.critical,
          sortOrder: i + 1,
        },
        create: {
          id: cr.id,
          scorecardId: sc.id,
          dimensionId: cr.dimensionId,
          text: cr.text,
          weight: cr.weight,
          critical: cr.critical,
          sortOrder: i + 1,
        },
      });
    }

    const sampleSize = computeSampleSize(sc.population, 95, 5);
    await prisma.qASamplingPlan.upsert({
      where: { id: `qaplan-${sc.id}` },
      update: {
        scorecardId: sc.id,
        method: "hybrid",
        populationSize: sc.population,
        confidenceLevel: 95,
        marginError: 5,
        sampleSize,
        riskWeighting:
          "Statistically valid random base sample per queue, plus a risk-weighted overlay over high-value payments, vulnerable beneficiaries, new staff and recently-changed processes.",
        cadence: "monthly",
      },
      create: {
        id: `qaplan-${sc.id}`,
        scorecardId: sc.id,
        method: "hybrid",
        populationSize: sc.population,
        confidenceLevel: 95,
        marginError: 5,
        sampleSize,
        riskWeighting:
          "Statistically valid random base sample per queue, plus a risk-weighted overlay over high-value payments, vulnerable beneficiaries, new staff and recently-changed processes.",
        cadence: "monthly",
      },
    });
  }

  // ── 3. Reviews (~24) spread over the last 6 months ──
  const reviewers = ["A. Al Mansoori", "S. Khan", "M. Haddad", "L. Petrova", "R. Saeed"];
  // Build a quick lookup of criteria per scorecard for scoring.
  const critByScorecard: Record<string, CritSeed[]> = {};
  for (const sc of SCORECARDS) critByScorecard[sc.id] = sc.criteria;
  const dimCopc: Record<string, string | null> = {};
  for (const d of DIMENSIONS) dimCopc[d.id] = d.copcFamily;

  let reviewIdx = 0;
  for (let m = 5; m >= 0; m--) {
    // ~4 reviews per month across scorecards
    for (let k = 0; k < 4; k++) {
      const sc = SCORECARDS[(reviewIdx + k) % SCORECARDS.length];
      const crit = critByScorecard[sc.id];
      const reviewId = `qarev-${String(reviewIdx).padStart(3, "0")}`;

      // Most cases pass ~90–96%; a few auto-fail by missing a critical criterion.
      const forceAutoFail = reviewIdx % 9 === 4; // ~11% auto-fail rate
      const items = crit.map((cr) => {
        let passed = true;
        if (cr.critical) {
          passed = forceAutoFail ? rng() > 0.5 : true;
        } else {
          passed = rng() > 0.08; // ~8% non-critical miss → ~90–96% scores
        }
        return { criterionId: cr.id, passed };
      });
      // Guarantee at least one failed critical when forcing auto-fail.
      if (forceAutoFail && !items.some((it) => !it.passed && crit.find((c2) => c2.id === it.criterionId)?.critical)) {
        const firstCritical = items.find((it) => crit.find((c2) => c2.id === it.criterionId)?.critical);
        if (firstCritical) firstCritical.passed = false;
      }

      const outcome = computeReviewOutcome(
        crit.map((cr) => ({
          id: cr.id,
          weight: cr.weight,
          critical: cr.critical,
          copcFamily: dimCopc[cr.dimensionId],
        })),
        items
      );

      const reviewedAt = monthsAgo(m, 4 + k * 6);

      await prisma.qAReview.upsert({
        where: { id: reviewId },
        update: {},
        create: {
          id: reviewId,
          scorecardId: sc.id,
          serviceName: sc.serviceScope,
          caseRef: `${sc.serviceScope.split(" ")[0].toUpperCase()}-${2026000 + reviewIdx}`,
          reviewer: reviewers[reviewIdx % reviewers.length],
          totalScore: outcome.totalScore,
          customerAccuracy: outcome.customerAccuracy,
          businessAccuracy: outcome.businessAccuracy,
          complianceAccuracy: outcome.complianceAccuracy,
          autoFailTriggered: outcome.autoFailTriggered,
          status: "completed",
          reviewedAt,
          items: {
            create: items.map((it) => ({
              criterionId: it.criterionId,
              passed: it.passed,
              score: it.passed ? 1 : 0,
            })),
          },
        },
      });
      reviewIdx++;
    }
  }

  // ── 4. Calibration sessions (IRR rising 72% → 91%) ──
  const calScorecardId = "qasc-eos-civil";
  const irrSeries = [72, 79, 86, 91];
  const calEvaluators = ["A. Al Mansoori", "S. Khan", "M. Haddad", "L. Petrova", "R. Saeed"];
  for (let s = 0; s < irrSeries.length; s++) {
    const sessionId = `qacal-${calScorecardId}-${s + 1}`;
    const irr = irrSeries[s];
    const evaluatorCount = 4 + (s % 2); // 4 or 5
    // Scores converge as IRR rises (spread shrinks).
    const base = 88 + s; // central score drifts up slightly
    const spread = Math.max(2, 14 - s * 4);
    await prisma.qACalibrationSession.upsert({
      where: { id: sessionId },
      update: {
        irrScore: irr,
        evaluatorCount,
        driftNote:
          s === 0
            ? "Launch calibration — notable drift on the identity-verification and apportionment criteria."
            : s === irrSeries.length - 1
            ? "Convergence achieved; IRR ≥ 85% — cadence can shift from weekly to monthly."
            : "Drift narrowing after scorecard-guidance clarifications.",
        status: "completed",
        sessionDate: monthsAgo(5 - s, 8),
      },
      create: {
        id: sessionId,
        scorecardId: calScorecardId,
        caseRef: `CALIB-EOS-${1000 + s}`,
        irrScore: irr,
        evaluatorCount,
        driftNote:
          s === 0
            ? "Launch calibration — notable drift on the identity-verification and apportionment criteria."
            : s === irrSeries.length - 1
            ? "Convergence achieved; IRR ≥ 85% — cadence can shift from weekly to monthly."
            : "Drift narrowing after scorecard-guidance clarifications.",
        status: "completed",
        sessionDate: monthsAgo(5 - s, 8),
        scores: {
          create: Array.from({ length: evaluatorCount }).map((_, e) => ({
            evaluator: calEvaluators[e % calEvaluators.length],
            score: Math.round(base + (rng() - 0.5) * spread),
          })),
        },
      },
    });
  }

  // ── 5. Error taxonomy tree ──
  const leafCodes: string[] = [];
  for (let p = 0; p < TAXONOMY.length; p++) {
    const top = TAXONOMY[p];
    await prisma.errorTaxonomyNode.upsert({
      where: { code: top.code },
      update: {
        name: top.name,
        severity: top.severity,
        category: top.name,
        description: top.description ?? null,
        parentId: null,
        sortOrder: p + 1,
      },
      create: {
        code: top.code,
        name: top.name,
        severity: top.severity,
        category: top.name,
        description: top.description ?? null,
        sortOrder: p + 1,
      },
    });
    const parent = await prisma.errorTaxonomyNode.findUnique({ where: { code: top.code } });
    const children = top.children ?? [];
    for (let q = 0; q < children.length; q++) {
      const child = children[q];
      leafCodes.push(child.code);
      await prisma.errorTaxonomyNode.upsert({
        where: { code: child.code },
        update: {
          name: child.name,
          severity: child.severity,
          category: top.name,
          parentId: parent?.id ?? null,
          sortOrder: q + 1,
        },
        create: {
          code: child.code,
          name: child.name,
          severity: child.severity,
          category: top.name,
          parentId: parent?.id ?? null,
          sortOrder: q + 1,
        },
      });
    }
  }

  // ── 6. Defects (~30, Pareto-shaped) ──
  const weightedLeafPool: string[] = [];
  for (const [code, w] of Object.entries(DEFECT_WEIGHTS)) {
    for (let i = 0; i < w; i++) weightedLeafPool.push(code);
  }
  // Map codes → node ids + severities.
  const allNodes = await prisma.errorTaxonomyNode.findMany();
  const nodeByCode: Record<string, { id: string; severity: string }> = {};
  for (const n of allNodes) nodeByCode[n.code] = { id: n.id, severity: n.severity };

  const TOTAL_DEFECTS = 32;
  for (let i = 0; i < TOTAL_DEFECTS; i++) {
    const code = weightedLeafPool[Math.floor(rng() * weightedLeafPool.length)];
    const node = nodeByCode[code];
    if (!node) continue;
    const m = Math.floor(rng() * 6); // last 6 months
    const status = i % 5 === 0 ? "resolved" : i % 5 === 1 ? "analysing" : "open";
    await prisma.defect.upsert({
      where: { id: `qadef-${String(i).padStart(3, "0")}` },
      update: {},
      create: {
        id: `qadef-${String(i).padStart(3, "0")}`,
        taxonomyNodeId: node.id,
        source: i % 6 === 0 ? "fulfilment" : "qa",
        serviceName: SERVICE_NAMES[i % SERVICE_NAMES.length],
        caseRef: `DEF-${2026000 + i}`,
        severity: node.severity,
        status,
        detectedAt: monthsAgo(m, 1 + (i % 26)),
      },
    });
  }

  // ── 7. Corrective actions (~8) ──
  const capas = [
    {
      id: "qacapa-1",
      clusterLabel: "Wrong settlement amount",
      title: "Add automated recalculation cross-check before settlement approval",
      rootCauseMethod: "5why",
      rootCause:
        "Manual recomputation of the salary base diverged from the system value; no automated reconciliation gate before approval.",
      owner: "EoS Operations Lead",
      status: "in-progress",
      cycle: "dmaic",
      effectivenessCheck:
        "Re-audit 40 EoS cases post-control; target CALC-AMOUNT defects down >70%.",
      dueOffsetDays: 21,
    },
    {
      id: "qacapa-2",
      clusterLabel: "Mandatory document missing",
      title: "Hard-stop document checklist in case-management workflow",
      rootCauseMethod: "fishbone",
      rootCause:
        "Process: optional checklist allowed closure without all documents; People: time pressure at month-end.",
      owner: "Case Management Product Owner",
      status: "open",
      cycle: "pdca",
      effectivenessCheck: "DOC-MISSING auto-fail rate monitored weekly for 6 weeks.",
      dueOffsetDays: 35,
    },
    {
      id: "qacapa-3",
      clusterLabel: "Incorrect bank details",
      title: "Validate IBAN against verified record before first payment",
      rootCauseMethod: "5why",
      rootCause:
        "Banking details keyed from PDF rather than validated source; no pre-payment confirmation step.",
      owner: "Payments Supervisor",
      status: "verified",
      cycle: "pdca",
      effectivenessCheck: "Zero DATA-BANK defects across 60 sampled payments post-fix.",
      dueOffsetDays: -7,
    },
    {
      id: "qacapa-4",
      clusterLabel: "Identity not verified",
      title: "Enforce step-up identity verification gate before data disclosure",
      rootCauseMethod: "fault-tree",
      rootCause:
        "Verification step was skippable under a legacy channel; auto-fail criterion not enforced in tooling.",
      owner: "Compliance Officer",
      status: "in-progress",
      cycle: "dmaic",
      effectivenessCheck: "CMPL-IDV auto-fails must reach <1% of sampled cases.",
      dueOffsetDays: 14,
    },
    {
      id: "qacapa-5",
      clusterLabel: "Contribution period error",
      title: "Reconcile employer contribution ledger at case intake",
      rootCauseMethod: "5why",
      rootCause:
        "Stale contribution records caused period miscalculation; reconciliation happened too late in the flow.",
      owner: "Data Quality Lead",
      status: "open",
      cycle: "dmaic",
      effectivenessCheck: "CALC-PERIOD defects tracked monthly; target -50% in one quarter.",
      dueOffsetDays: 45,
    },
    {
      id: "qacapa-6",
      clusterLabel: "Eligibility misjudged",
      title: "Refresh eligibility decision-aid after pension-law update",
      rootCauseMethod: "fishbone",
      rootCause:
        "Outdated rule guidance applied after a policy change; training and job-aid lagged the change.",
      owner: "Policy & Training Lead",
      status: "open",
      cycle: "pdca",
      effectivenessCheck: "Calibration session on eligibility criteria; IRR ≥ 85%.",
      dueOffsetDays: 28,
    },
    {
      id: "qacapa-7",
      clusterLabel: "No outcome notification sent",
      title: "Trigger automatic outcome notification on case closure",
      rootCauseMethod: "5why",
      rootCause:
        "Notification was a manual step often skipped under load; no closure-event automation.",
      owner: "CX Operations Manager",
      status: "closed",
      cycle: "pdca",
      effectivenessCheck: "100% of closed cases generate a notification event for 4 weeks.",
      dueOffsetDays: -30,
    },
    {
      id: "qacapa-8",
      clusterLabel: "Integration / sync failure",
      title: "Add retry + alerting on registry integration sync",
      rootCauseMethod: "fault-tree",
      rootCause:
        "Silent sync failures left stale data; no retry or alert path to operations.",
      owner: "Platform Engineering Lead",
      status: "in-progress",
      cycle: "dmaic",
      effectivenessCheck: "SYS-INTEGRATION defects down to near-zero; alerts verified in staging.",
      dueOffsetDays: 30,
    },
  ];

  for (const ca of capas) {
    const due = new Date();
    due.setDate(due.getDate() + ca.dueOffsetDays);
    const dueDate = due.toISOString().slice(0, 10);
    await prisma.correctiveAction.upsert({
      where: { id: ca.id },
      update: {
        clusterLabel: ca.clusterLabel,
        title: ca.title,
        rootCauseMethod: ca.rootCauseMethod,
        rootCause: ca.rootCause,
        owner: ca.owner,
        status: ca.status,
        cycle: ca.cycle,
        effectivenessCheck: ca.effectivenessCheck,
        dueDate,
        actionType: "corrective",
      },
      create: {
        id: ca.id,
        clusterLabel: ca.clusterLabel,
        title: ca.title,
        rootCauseMethod: ca.rootCauseMethod,
        rootCause: ca.rootCause,
        owner: ca.owner,
        status: ca.status,
        cycle: ca.cycle,
        effectivenessCheck: ca.effectivenessCheck,
        dueDate,
        actionType: "corrective",
      },
    });
  }

  return {
    dimensions: DIMENSIONS.length,
    scorecards: SCORECARDS.length,
    reviews: reviewIdx,
    calibrationSessions: irrSeries.length,
    taxonomyLeaves: leafCodes.length,
    defects: TOTAL_DEFECTS,
    correctiveActions: capas.length,
  };
}
