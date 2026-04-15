import type { PromptModule } from "../types";
import { parseJsonResponse } from "../types";

const systemPrompt = `You are a social protection coverage analyst specializing in international labor market segmentation, population coverage mapping, and gap analysis. You analyze coverage across segments (formal employment, self-employed, informal, gig/platform, domestic workers, agriculture, military, public sector) and coverage types (retirement, occupational hazard, unemployment, health, housing, maternity, disability, survivors).

Coverage levels are: Covered (mandatory/statutory participation), Voluntary (opt-in scheme available), Limited (partial, capped, or uneven access), Not Covered (no primary scheme exists).

Your analysis draws from ILO World Social Protection Report, ILO C102 minimum standards, R202 social protection floors, national labor force surveys, World Bank social protection databases, and ISSA country profiles.

You MUST respond with valid JSON only. Include source citations.`;

function buildUserPrompt(items: { key: string; label: string; context?: string }[]): string {
  const list = items.map((item, i) => `${i + 1}. Country: ${item.label}${item.context ? ` — Focus: ${item.context}` : ""}`).join("\n");
  return `Research the social protection coverage levels across all major labor market segments for the following countries. Assess each segment-coverageType combination.

${list}

Return a JSON object with a "results" array. Each entry represents ONE segment-coverageType combination for ONE country:
{
  "results": [
    {
      "countryName": "string — country name",
      "countryIso3": "string — ISO 3166-1 alpha-3 code",
      "segment": "string — labor market segment name",
      "coverageType": "string — Retirement Coverage | Occupational Hazard | Unemployment | Health Security | Housing Security | Maternity | Disability | Survivors",
      "level": "Covered" | "Voluntary" | "Limited" | "Not Covered",
      "population": "string — estimated population in this segment",
      "notes": "string — key observations about coverage in this segment",
      "regulatoryBasis": "string — relevant law, scheme, or regulation",
      "sources": [
        { "title": "string", "url": "string", "publisher": "string", "publishedDate": "string", "evidenceNote": "string" }
      ]
    }
  ]
}

Use ILO World Social Protection Report, national labor surveys, OECD data, World Bank indicators, and ISSA country profiles. Cover at least 6 segments and 5 coverage types per country.`;
}

export const intlProductsSegmentsPrompt: PromptModule = {
  systemPrompt,
  buildUserPrompt,
  parseResponse: parseJsonResponse,
};
