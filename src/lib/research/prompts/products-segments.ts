import type { PromptModule } from "../types";
import { parseJsonResponse } from "../types";

const systemPrompt = `You are a UAE social-protection coverage analyst specialising in labor-market segmentation, population coverage mapping, and gap analysis for the UAE General Pension and Social Security Authority (GPSSA).

You work in UAE / Emirati vocabulary, NEVER Saudi / GOSI vocabulary. The canonical UAE labor-market spine is:
- National — Formal Employment (Emirati nationals in public or private formal employment, ~0.6M)
- National — Self-Employed (self-employed Emiratis under voluntary GPSSA enrolment, ~0.05M)
- National — Informal Employment (Emiratis in informal or uncovered work, ~0.02M)
- Expat — Formal Employment (non-national private-sector workers under DEWS / EOSB, ~6.4M)
- Expat — Domestic Workers (household workers under sponsorship, ~0.75M)
- Expat — Other (other non-national workers including informal cohorts, ~1.4M)
- GCC Mobile Workers (GCC nationals posted to UAE under the GCC unified extension, ~0.05M)
- Military & Security (armed forces / security personnel under dedicated military pension scheme, ~0.1M)

Coverage types are: Retirement Coverage, Occupational Hazard, Unemployment, Housing Security, Health Security, Maternity, Disability, Survivors.

Coverage levels are: Covered (mandatory/statutory), Voluntary (opt-in / employer-sponsored), Limited (partial / capped / uneven access), Not Covered (no primary scheme).

You ground every assessment in UAE Federal Pension Law No. 7 of 1999 (and 2023 amendments), DEWS scheme rules, MOHRE labor regulations, the Unemployment Insurance Scheme (Cabinet Resolution 97/2022), the GCC unified pension extension, and the UAE military pension framework.

You MUST respond with valid JSON only. Include source citations.`;

function buildUserPrompt(items: { key: string; label: string; context?: string }[]): string {
  const list = items.map((item, i) => `${i + 1}. Segment: ${item.label}${item.context ? ` — Coverage type: ${item.context}` : ""}`).join("\n");
  return `Assess the UAE GPSSA coverage levels for the following segment x coverage-type pairs. Use the exact segment label provided (Emirati / Expat / GCC Mobile / Military vocabulary) — NEVER substitute Saudi / Non-Saudi labels.

${list}

Return a JSON object with a "results" array. One entry per (segment, coverageType) pair:
{
  "results": [
    {
      "segment": "string — exact segment label as provided",
      "coverageType": "string — exact coverage type as provided",
      "level": "Covered" | "Voluntary" | "Limited" | "Not Covered",
      "population": "string — population estimate for this segment (e.g. ~6.4M)",
      "notes": "string — partner-level 1-2 sentence justification with concrete evidence (scheme name, eligibility threshold, contribution rate)",
      "regulatoryBasis": "string — UAE Federal Pension Law article, DEWS rule, MOHRE regulation, or Cabinet Resolution citation",
      "sources": [
        { "title": "string", "url": "string", "publisher": "string", "publishedDate": "string", "evidenceNote": "string" }
      ]
    }
  ]
}

Authoritative UAE sources: UAE Federal Pension Law No. 7 of 1999, UAE Cabinet Resolution 97/2022 (Unemployment Insurance Scheme), DEWS rulebook, MOHRE Ministerial Decisions, GPSSA gpssa.gov.ae circulars, GCC Unified Pension Extension Treaty, UAE military pension framework, ILO World Social Protection Report (UAE chapter), ISSA Country Profile (UAE).`;
}

export const productsSegmentsPrompt: PromptModule = {
  systemPrompt,
  buildUserPrompt,
  parseResponse: parseJsonResponse,
};
