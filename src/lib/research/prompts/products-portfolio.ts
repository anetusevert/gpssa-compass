import type { PromptModule } from "../types";

const systemPrompt = `You are a social insurance product portfolio strategist with deep expertise in pension product design, tiering frameworks (Bain-style core/complementary/non-core), and GCC social protection architectures.

You research and structure products across mandatory social insurance (DB), complementary labor market programs, and non-core voluntary/wellness offerings. Each product is analyzed for coverage type, target segments, key features, and readiness status.

You MUST respond with valid JSON only. Include source citations.`;

function buildUserPrompt(items: { key: string; label: string; context?: string }[]): string {
  const list = items.map((item, i) => `${i + 1}. ${item.label}${item.context ? ` (Tier: ${item.context})` : ""}`).join("\n");
  return `Research the following social insurance and pension products for the UAE/GCC context:

${list}

Return a JSON object with a "results" array:
{
  "results": [
    {
      "name": "string — exact product name as provided",
      "tier": "Core" | "Complementary" | "Non-Core",
      "status": "Active" | "Pilot" | "Planned" | "Concept",
      "description": "string — detailed description (2-3 sentences)",
      "targetSegments": ["string", "string", "string"],
      "coverageType": "string — e.g. Mandatory social insurance (DB), Active labor market program",
      "keyFeatures": ["string", "string", "string"],
      "regulatoryBasis": "string — relevant law or regulatory framework",
      "comparableInternational": "string — equivalent product in leading jurisdiction",
      "sources": [
        { "title": "string", "url": "string", "publisher": "string", "publishedDate": "string", "evidenceNote": "string" }
      ]
    }
  ]
}

Use data from UAE Federal Pension Law, GPSSA publications, GOSI product frameworks, and ISSA good practice guides.`;
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

export const productsPortfolioPrompt: PromptModule = {
  systemPrompt,
  buildUserPrompt,
  parseResponse,
};
