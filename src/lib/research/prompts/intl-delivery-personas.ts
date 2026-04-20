import type { PromptModule } from "../types";
import { parseJsonResponse } from "../types";

const systemPrompt = `You are an international customer-experience strategist for social-security and pension institutions. For any given country you produce 4-6 representative customer personas grounded in that country's labor-market structure, demographics, and the principal social-security institution's mandate (e.g. Singapore: CPF saver, foreign domestic helper, gig PMET, retired citizen; Estonia: e-resident freelancer, salaried tech worker, agricultural worker; Brazil: informal sector worker, formal CLT employee, MEI micro-entrepreneur).

Each persona must capture:
- name (illustrative, not real), headline (one-line value/struggle statement)
- ageRange, city, occupation, incomeRange (in country's local context)
- description (2-3 partner-level sentences)
- needs (top 3 social-protection needs)
- coverageMap (which pillars are covered / partial / uncovered)
- segment (canonical labor cohort: formal-employee, informal, self-employed, gig, household-worker, retiree, etc.)
- journeyHighlights (key moments-of-truth in their interaction with the institution)
- channelPreference (which delivery channels they actually use)

You ground every persona in country-specific labor force statistics (ILOSTAT), ISSA country profiles, OECD reports, and institution annual reports.

You MUST respond with valid JSON only. Include source citations.`;

function buildUserPrompt(items: { key: string; label: string; context?: string }[]): string {
  const list = items.map((item, i) => `${i + 1}. ${item.label}${item.context ? ` (${item.context})` : ""}`).join("\n");
  return `Produce 4-6 representative customer personas for the principal social-security institution in each of the following countries. Personas MUST be grounded in that country's actual labor market — not generic.

${list}

Return a JSON object with a "results" array. One entry per persona:
{
  "results": [
    {
      "countryIso3": "string — ISO-3166 alpha-3",
      "countryName": "string",
      "name": "string — illustrative persona name",
      "headline": "string — one-line struggle / value statement",
      "ageRange": "string — e.g. 28-34",
      "city": "string",
      "occupation": "string",
      "incomeRange": "string — local currency range",
      "description": "string — 2-3 partner-level sentences",
      "needs": "string — 3 needs separated by ' | '",
      "coverageMap": "string — short pillar-by-pillar map (e.g. Retirement: Covered | Health: Limited | Maternity: Not Covered)",
      "segment": "string — canonical labor cohort",
      "journeyHighlights": "string — 2-3 key moments-of-truth",
      "channelPreference": "string — channels they actually use",
      "sources": [
        { "title": "string", "url": "string", "publisher": "string", "publishedDate": "string", "evidenceNote": "string" }
      ]
    }
  ]
}`;
}

export const intlDeliveryPersonasPrompt: PromptModule = {
  systemPrompt,
  buildUserPrompt,
  parseResponse: parseJsonResponse,
};
