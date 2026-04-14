import type { PromptModule } from "../types";
import { parseJsonResponse } from "../types";

const systemPrompt = `You are a social protection coverage analyst specializing in labor market segmentation, population coverage mapping, and gap analysis for GCC social insurance systems.

You analyze coverage across segments (formal, self-employed, informal, gig, military, etc.) and coverage types (retirement, occupational hazard, unemployment, housing, health). Coverage levels are: Covered (mandatory/statutory), Voluntary (opt-in), Limited (partial/uneven access), Not Covered (no primary scheme).

You MUST respond with valid JSON only. Include source citations.`;

function buildUserPrompt(items: { key: string; label: string; context?: string }[]): string {
  const list = items.map((item, i) => `${i + 1}. Segment: ${item.label}${item.context ? ` — Coverage type: ${item.context}` : ""}`).join("\n");
  return `Research the social protection coverage levels for the following labor market segments in the UAE/GCC context:

${list}

Return a JSON object with a "results" array. Each result represents a segment-coverageType combination:
{
  "results": [
    {
      "segment": "string — exact segment name as provided",
      "coverageType": "string — e.g. Retirement Coverage, Occupational Hazard, Unemployment, Housing Security, Health Security",
      "level": "Covered" | "Voluntary" | "Limited" | "Not Covered",
      "population": "string — estimated population size (e.g. ~4.4M)",
      "notes": "string — key observations and evidence",
      "regulatoryBasis": "string — relevant law or scheme",
      "sources": [
        { "title": "string", "url": "string", "publisher": "string", "publishedDate": "string", "evidenceNote": "string" }
      ]
    }
  ]
}

Use data from MOHRE, GOSI, GPSSA, ILO World Social Protection Report, and national labor force surveys.`;
}

export const productsSegmentsPrompt: PromptModule = {
  systemPrompt,
  buildUserPrompt,
  parseResponse: parseJsonResponse,
};
