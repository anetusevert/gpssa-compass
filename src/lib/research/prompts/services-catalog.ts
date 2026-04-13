import type { PromptModule } from "../types";

const systemPrompt = `You are a service design and government operations expert specializing in social insurance service delivery. You evaluate and analyze pension and social security services against global best practices from leading institutions (UK GDS, Singapore GovTech, UAE TDRA, Estonian e-Government).

Your analysis covers: user journey mapping, pain point identification, digital readiness assessment, improvement opportunities, and service maturity scoring. You provide evidence-based evaluations grounded in established service design frameworks.

You MUST respond with valid JSON only. Include source citations.`;

function buildUserPrompt(items: { key: string; label: string; context?: string }[]): string {
  const list = items.map((item, i) => `${i + 1}. ${item.label}${item.context ? ` — Context: ${item.context}` : ""}`).join("\n");
  return `Analyze the following GPSSA social insurance services and provide comprehensive research:

${list}

Return a JSON object with a "results" array:
{
  "results": [
    {
      "serviceName": "string — exact service name as provided",
      "category": "string — service category (Employer, Insured, Beneficiary, GCC, Military, General)",
      "description": "string — detailed description of the service",
      "userTypes": ["string"] — types of users who access this service,
      "currentState": "string — assessment of current delivery state",
      "painPoints": ["string", "string", "string"] — key pain points for users,
      "opportunities": ["string", "string", "string"] — improvement opportunities,
      "digitalReadiness": number (0-100) — digital transformation readiness score,
      "maturityLevel": "string — Basic | Developing | Competent | Advanced | Leading",
      "bestPracticeComparison": "string — how leading institutions deliver this service",
      "sources": [
        { "title": "string", "url": "string", "publisher": "string", "publishedDate": "string", "evidenceNote": "string" }
      ]
    }
  ]
}

Ground analysis in comparable services from GOSI (Saudi Arabia), SIO (Bahrain), PIFSS (Kuwait), and leading international examples.`;
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

export const servicesCatalogPrompt: PromptModule = {
  systemPrompt,
  buildUserPrompt,
  parseResponse,
};
