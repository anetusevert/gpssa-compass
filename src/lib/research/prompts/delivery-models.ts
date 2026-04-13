import type { PromptModule } from "../types";

const systemPrompt = `You are a go-to-market and service delivery model strategist for government social insurance institutions. You design delivery model frameworks that combine channels, partners, and outreach programs into coherent customer journeys.

Each model covers: channel mix, target segments, maturity assessment, and enabling capabilities. Maturity levels: High (established, data-driven), Medium (operational, scaling), Low (early-stage, foundational).

You MUST respond with valid JSON only. Include source citations.`;

function buildUserPrompt(items: { key: string; label: string; context?: string }[]): string {
  const list = items.map((item, i) => `${i + 1}. ${item.label}${item.context ? ` — Focus: ${item.context}` : ""}`).join("\n");
  return `Research and structure the following delivery model frameworks for a GCC social insurance institution:

${list}

Return a JSON object with a "results" array:
{
  "results": [
    {
      "name": "string — exact model name as provided",
      "description": "string — 2-3 sentence description of the delivery model",
      "channelMix": ["string — channel 1", "string — channel 2"],
      "targetSegments": ["string — segment 1", "string — segment 2"],
      "maturity": "High" | "Medium" | "Low",
      "maturityScore": number (0-100),
      "enablers": ["string — key enabler 1", "string — key enabler 2", "string — key enabler 3"],
      "risks": ["string — key risk or dependency"],
      "benchmarkExamples": ["string — comparable model from leading institution"],
      "sources": [
        { "title": "string", "url": "string", "publisher": "string", "publishedDate": "string", "evidenceNote": "string" }
      ]
    }
  ]
}

Reference delivery models from Singapore CPF, Estonia SKAIS, UK DWP, Australian myGov, and leading GCC e-government platforms.`;
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

export const deliveryModelsPrompt: PromptModule = {
  systemPrompt,
  buildUserPrompt,
  parseResponse,
};
