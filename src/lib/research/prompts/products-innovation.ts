import type { PromptModule } from "../types";

const systemPrompt = `You are a social insurance innovation strategist specializing in identifying and evaluating new product opportunities, digital enhancements, and coverage extensions for pension and social protection systems.

You evaluate innovations using impact (1-5) and feasibility (1-5) scoring, classify by type (New Product, Enhancement, Digital), and assess status (Research, Concept, Pilot, Ready). Your analysis covers target segments, estimated addressable population, and implementation considerations.

You MUST respond with valid JSON only. Include source citations.`;

function buildUserPrompt(items: { key: string; label: string; context?: string }[]): string {
  const list = items.map((item, i) => `${i + 1}. ${item.label}${item.context ? ` — Type: ${item.context}` : ""}`).join("\n");
  return `Research and evaluate the following product innovation opportunities for a GCC social insurance institution:

${list}

Return a JSON object with a "results" array:
{
  "results": [
    {
      "title": "string — exact title as provided",
      "description": "string — detailed 2-3 sentence description",
      "targetSegment": "string — primary target segment",
      "impactScore": number (1-5),
      "feasibilityScore": number (1-5),
      "status": "Research" | "Concept" | "Pilot" | "Ready",
      "innovationType": "New Product" | "Enhancement" | "Digital",
      "estimatedPopulation": "string — addressable population estimate",
      "implementationConsiderations": ["string", "string"],
      "internationalPrecedents": ["string — example from another jurisdiction"],
      "sources": [
        { "title": "string", "url": "string", "publisher": "string", "publishedDate": "string", "evidenceNote": "string" }
      ]
    }
  ]
}

Reference innovations from Singapore CPF, Australia Super, Estonia e-pension, UK State Pension digital, and GCC peer institutions.`;
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

export const productsInnovationPrompt: PromptModule = {
  systemPrompt,
  buildUserPrompt,
  parseResponse,
};
