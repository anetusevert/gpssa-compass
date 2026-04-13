import type { PromptModule } from "../types";

const systemPrompt = `You are a customer experience and persona research specialist for social insurance and pension systems. You create evidence-based customer personas that represent key labor market segments in the GCC, including formal workers, gig economy, domestic workers, self-employed, retirees, and cross-border professionals.

Each persona captures demographics, occupation context, social protection needs, coverage gaps, and delivery preferences. Coverage levels per need are: covered, partial, none.

You MUST respond with valid JSON only. Include source citations.`;

function buildUserPrompt(items: { key: string; label: string; context?: string }[]): string {
  const list = items.map((item, i) => `${i + 1}. ${item.label}${item.context ? ` — Segment: ${item.context}` : ""}`).join("\n");
  return `Research and develop detailed customer personas for the following segments in a GCC social insurance context:

${list}

Return a JSON object with a "results" array:
{
  "results": [
    {
      "name": "string — persona first name",
      "headline": "string — role/archetype headline (e.g. 'Saudi Uber Driver')",
      "ageRange": "string — age or age range",
      "city": "string — representative city",
      "occupation": "string — job title or occupation description",
      "incomeRange": "string — income bracket if applicable",
      "description": "string — 3-4 sentence persona narrative",
      "segment": "string — labor market segment",
      "needs": [
        { "label": "string — need type", "coverage": "covered" | "partial" | "none" }
      ],
      "journeyHighlights": ["string — key touchpoint or friction", "string"],
      "channelPreference": "string — preferred service delivery channel",
      "sources": [
        { "title": "string", "url": "string", "publisher": "string", "publishedDate": "string", "evidenceNote": "string" }
      ]
    }
  ]
}

Base personas on real labor market data from MOHRE, GPSSA, ILO, and GCC labor force surveys.`;
}

function parseResponse(raw: string): Record<string, unknown>[] {
  const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  const parsed = JSON.parse(cleaned);
  if (Array.isArray(parsed)) return parsed;
  if (parsed.results && Array.isArray(parsed.results)) return parsed.results;
  const firstArrayKey = Object.keys(parsed).find((k) => Array.isArray(parsed[k]));
  if (firstArrayKey) return parsed[firstArrayKey];
  return [parsed];
}

export const deliveryPersonasPrompt: PromptModule = {
  systemPrompt,
  buildUserPrompt,
  parseResponse,
};
