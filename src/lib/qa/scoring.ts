/**
 * Quality Assurance scoring — COPC 3-metric model.
 *
 * A QA review scores a case against a scorecard's criteria. Instead of a single
 * blended number we report THREE parallel accuracy metrics (COPC CX Standard):
 * Customer-critical, Business-critical and Compliance-critical accuracy, plus a
 * weighted non-critical score for coaching. Any failed `critical` criterion is
 * an auto-fail for the whole case.
 */

export interface ScoringCriterion {
  id: string;
  weight: number;
  critical: boolean;
  /** COPC family of the underlying dimension: customer | business | compliance */
  copcFamily?: string | null;
}

export interface ScoringItem {
  criterionId: string;
  passed: boolean;
}

export interface ReviewOutcome {
  totalScore: number; // weighted % across non-auto-failed criteria
  customerAccuracy: boolean;
  businessAccuracy: boolean;
  complianceAccuracy: boolean;
  autoFailTriggered: boolean;
}

export function computeReviewOutcome(
  criteria: ScoringCriterion[],
  items: ScoringItem[]
): ReviewOutcome {
  const passedById = new Map(items.map((i) => [i.criterionId, i.passed]));

  let weightSum = 0;
  let weightedPass = 0;
  let autoFail = false;
  const family = { customer: true, business: true, compliance: true };

  for (const c of criteria) {
    const passed = passedById.get(c.id) ?? true;
    weightSum += c.weight;
    if (passed) weightedPass += c.weight;

    if (c.critical && !passed) {
      autoFail = true;
      const fam = (c.copcFamily ?? "business") as keyof typeof family;
      if (fam in family) family[fam] = false;
    }
  }

  const totalScore = autoFail
    ? 0
    : weightSum > 0
    ? Math.round((weightedPass / weightSum) * 1000) / 10
    : 0;

  return {
    totalScore,
    customerAccuracy: family.customer,
    businessAccuracy: family.business,
    complianceAccuracy: family.compliance,
    autoFailTriggered: autoFail,
  };
}

/** Aggregate the three COPC accuracy rates across a set of reviews (% free of error). */
export function aggregateAccuracy(
  reviews: {
    customerAccuracy: boolean;
    businessAccuracy: boolean;
    complianceAccuracy: boolean;
  }[]
) {
  const n = reviews.length || 1;
  const pct = (k: "customerAccuracy" | "businessAccuracy" | "complianceAccuracy") =>
    Math.round((reviews.filter((r) => r[k]).length / n) * 1000) / 10;
  return {
    customer: pct("customerAccuracy"),
    business: pct("businessAccuracy"),
    compliance: pct("complianceAccuracy"),
    count: reviews.length,
  };
}
