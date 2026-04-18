/**
 * Shared "standards alignment" instruction injected into every research
 * prompt so that every result emitted by every agent uses the canonical
 * Standards Library taxonomy.
 *
 * This is the keystone of Phase 8 — it ensures the research layer speaks
 * the same vocabulary as the UI ComparatorPicker, the StandardChips and
 * the Standards Browser, and lets the post-process writer create
 * `StandardCompliance` rows automatically.
 */

import { STANDARDS_CATALOG } from "@/lib/standards/catalog";

export const STANDARD_SLUGS = STANDARDS_CATALOG.map((s) => s.slug);

/** Append to every JSON-emitting prompt's schema. */
export const STANDARDS_ALIGNMENT_FIELD_INSTRUCTION = `

──────────────────────────────────────────────────────────────────────
STANDARDS ALIGNMENT — REQUIRED
──────────────────────────────────────────────────────────────────────
Every result object MUST also include:

  "standardsAlignment": [
    {
      "standardSlug": "string",   // one of: ${STANDARD_SLUGS.join(", ")}
      "score": number,            // 0-100 — how well this entity satisfies the standard
      "band": "string",           // one of: leading | advanced | competent | developing | basic
      "rationale": "string",      // 1-2 sentences citing the requirement that's met (or missed)
      "requirementSlugs": ["string"]  // optional — specific requirements covered
    }
  ]

Use the CANONICAL slugs above only. Pick the 2-5 most relevant standards
for this entity. If the entity does not meaningfully align to any
standard, return an empty array.

The slug taxonomy maps onto:
  - ilo-c102           → ILO Social Security (Minimum Standards) Convention
  - ilo-c128           → ILO Invalidity / Old-Age / Survivors' Benefits Convention
  - ilo-r202           → ILO Social Protection Floors Recommendation
  - issa-service-quality → ISSA Guidelines on Service Quality
  - issa-ict           → ISSA Guidelines on ICT
  - issa-good-governance → ISSA Guidelines on Good Governance
  - wb-govtech-maturity → World Bank GovTech Maturity Index
  - oecd-pensions-at-a-glance → OECD Pensions at a Glance indicators
  - mercer-cfa-gpi     → Mercer CFA Global Pension Index
  - un-egov-survey     → UN E-Government Development Index
`;

/**
 * Default standards likely to apply to an entity given its pillar.
 * Used as a hint — agents may still emit any subset of the canonical
 * slug list.
 */
export const DEFAULT_STANDARDS_BY_PILLAR: Record<string, string[]> = {
  services: ["issa-service-quality", "issa-ict", "ilo-c102", "ilo-r202"],
  channels: ["un-egov-survey", "issa-service-quality", "wb-govtech-maturity"],
  products: ["ilo-c102", "ilo-c128", "mercer-cfa-gpi", "oecd-pensions-at-a-glance"],
  segments: ["ilo-c102", "ilo-r202"],
  delivery: ["wb-govtech-maturity", "issa-good-governance", "issa-service-quality"],
  atlas:    ["ilo-c102", "wb-govtech-maturity", "mercer-cfa-gpi", "un-egov-survey"],
  international: ["ilo-c102", "issa-service-quality", "wb-govtech-maturity"],
};
