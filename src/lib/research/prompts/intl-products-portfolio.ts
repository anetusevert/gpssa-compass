import type { PromptModule } from "../types";
import { parseJsonResponse } from "../types";

const systemPrompt = `You are a global social protection product strategist with deep expertise in pension product architecture, social insurance design, and ILO/ISSA frameworks. You research and structure product portfolios across mandatory social insurance, complementary programs, and non-core voluntary offerings for institutions worldwide.

Your framework uses the Bain-style tiering: Core (mandatory statutory schemes), Complementary (active labor market programs, rehabilitation, family support), and Non-Core (voluntary savings, wellness, financial literacy). Products are assessed for status (Active/Pilot/Planned/Concept), coverage type, target segments, key features, regulatory basis, and ILO alignment.

You draw from ILO C102 (minimum standards), ILO R202 (social protection floors), World Bank pension databases, OECD Pensions at a Glance, Mercer Global Pension Index, ISSA country profiles, and national pension legislation.

You MUST respond with valid JSON only. Include source citations.`;

function buildUserPrompt(items: { key: string; label: string; context?: string }[]): string {
  const list = items.map((item, i) => `${i + 1}. Institution: ${item.label}${item.context ? ` — Country: ${item.context}` : ""}`).join("\n");
  return `Research the complete product portfolio for the following social security institutions. Identify ALL social protection products/schemes they administer, organized by tier.

${list}

Return a JSON object with a "results" array. Each entry represents ONE product from ONE institution:
{
  "results": [
    {
      "institutionName": "string — exact institution name",
      "countryIso3": "string — ISO 3166-1 alpha-3 code",
      "name": "string — product/scheme name",
      "tier": "Core" | "Complementary" | "Non-Core",
      "status": "Active" | "Pilot" | "Planned" | "Concept",
      "description": "string — detailed 2-3 sentence description",
      "targetSegments": ["string", "string"],
      "coverageType": "string — e.g. Mandatory DB pension, Unemployment insurance, Voluntary DC",
      "keyFeatures": ["string", "string", "string"],
      "regulatoryBasis": "string — the law or regulation governing this product",
      "iloAlignment": "string — ILO convention coverage (e.g. C102 Part V Old-Age, R202 Basic income security)",
      "sources": [
        { "title": "string", "url": "string", "publisher": "string", "publishedDate": "string", "evidenceNote": "string" }
      ]
    }
  ]
}

Research deeply using national pension legislation, ISSA country profiles, ILO World Social Protection Database, and institutional annual reports. Aim for 8-15 products per institution.`;
}

export const intlProductsPortfolioPrompt: PromptModule = {
  systemPrompt,
  buildUserPrompt,
  parseResponse: parseJsonResponse,
};
