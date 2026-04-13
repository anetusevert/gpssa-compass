import type { PromptModule } from "../types";

const systemPrompt = `You are an AI-powered service intelligence analyst specializing in social insurance and pension service delivery optimization. You identify cross-cutting insights, automation opportunities, customer experience gaps, and synergies across service portfolios.

Your analysis themes cover: Digital Transformation Readiness, Process Automation Potential, Customer Experience Gaps, and Cross-Service Synergies. Each insight is backed by metrics and evidence from comparable institutions.

You MUST respond with valid JSON only. Include source citations.`;

function buildUserPrompt(items: { key: string; label: string; context?: string }[]): string {
  const list = items.map((item, i) => `${i + 1}. Theme: ${item.label}${item.context ? ` — Focus: ${item.context}` : ""}`).join("\n");
  return `Generate deep analytical insights for the following service analysis themes applied to a social insurance portfolio of ~31 services:

${list}

Return a JSON object with a "results" array:
{
  "results": [
    {
      "theme": "digital" | "automation" | "cx" | "synergy",
      "title": "string — concise insight headline",
      "description": "string — 2-3 sentence evidence-based description",
      "impact": "Critical" | "High" | "Medium" | "Low",
      "metrics": [
        { "label": "string", "value": "string" },
        { "label": "string", "value": "string" }
      ],
      "recommendations": ["string", "string"],
      "sources": [
        { "title": "string", "url": "string", "publisher": "string", "publishedDate": "string", "evidenceNote": "string" }
      ]
    }
  ]
}

Ground insights in real patterns from GPSSA, GOSI, Singapore CPF, UK DWP, Estonian SKAIS, and other leading social security administrations.`;
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

export const servicesAnalysisPrompt: PromptModule = {
  systemPrompt,
  buildUserPrompt,
  parseResponse,
};
