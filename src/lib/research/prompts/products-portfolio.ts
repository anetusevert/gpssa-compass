import type { PromptModule } from "../types";
import { parseJsonResponse } from "../types";
import { STANDARDS_ALIGNMENT_FIELD_INSTRUCTION } from "../standards-instruction";

const systemPrompt = `You are a UAE social insurance product portfolio strategist with deep expertise in UAE Federal Pension Law No. 7 of 1999 (and the 2023 unemployment-insurance and end-of-service amendments), GPSSA's mandate, and the Core / Complementary / Non-Core tiering framework used by leading social-security institutions.

You research products for the General Pension and Social Security Authority of the United Arab Emirates (GPSSA), not GOSI, not Saudi Arabia. Always use Emirati / Expat segment vocabulary; never use "Saudi" / "Non-Saudi" labels.

Tiers:
- Core: mandatory statutory schemes (DB pension for nationals, occupational hazard, end-of-service / DEWS, GCC unified extension, military scheme).
- Complementary: active labor-market programs (placement, vocational rehabilitation, return-to-work, household resilience pilots).
- Non-Core: voluntary / wellness offerings (additional voluntary contributions, retiree health top-ups, financial wellness programs, digital savings).

You ground every product in the actual UAE statutory text, GPSSA circulars (gpssa.gov.ae), MOHRE / Ministry of Family policy, the DEWS regulatory framework, and ISSA / ILO good-practice benchmarks. You name a "comparableInternational" peer (e.g. CPF, GOSI, K-NPS) for benchmarking.

You MUST respond with valid JSON only. Include source citations.`;

function buildUserPrompt(items: { key: string; label: string; context?: string }[]): string {
  const list = items.map((item, i) => `${i + 1}. ${item.label}${item.context ? ` (Tier: ${item.context})` : ""}`).join("\n");
  return `Research the following UAE GPSSA social insurance and pension products. Use UAE-specific evidence (UAE Federal Pension Law, GPSSA circulars, MOHRE policy, DEWS rulebook, Cabinet Resolutions). Use Emirati / Expat segment vocabulary throughout — never Saudi labels.

${list}

Return a JSON object with a "results" array. One entry per product:
{
  "results": [
    {
      "name": "string — exact product name as provided",
      "tier": "Core" | "Complementary" | "Non-Core",
      "status": "Active" | "Pilot" | "Planned" | "Concept",
      "description": "string — substantive 2-3 sentence partner-level description of what the product does and who it serves",
      "targetSegments": ["string — Emirati / Expat segment label", "string", "string"],
      "coverageType": "string — e.g. Mandatory social insurance (DB), Active labor market program, Voluntary defined contribution",
      "keyFeatures": ["string", "string", "string"],
      "regulatoryBasis": "string — UAE Federal Pension Law article number, Cabinet Resolution, or DEWS rule citation",
      "comparableInternational": "string — equivalent product in a leading peer institution (e.g. CPF Singapore, NPS Korea, ATP Denmark)",
      "sources": [
        { "title": "string", "url": "string", "publisher": "string", "publishedDate": "string", "evidenceNote": "string" }
      ]
    }
  ]
}

Authoritative UAE sources to draw from: UAE Federal Pension Law No. 7 of 1999 and 2023 amendments, GPSSA annual reports and circulars, MOHRE labor regulations, DEWS scheme documentation, GCC Unified Pension Extension rules, UAE military pension framework, ISSA Country Profile (UAE), ILO World Social Protection Report.
${STANDARDS_ALIGNMENT_FIELD_INSTRUCTION}`;
}

export const productsPortfolioPrompt: PromptModule = {
  systemPrompt,
  buildUserPrompt,
  parseResponse: parseJsonResponse,
};
