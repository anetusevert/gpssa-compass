import type { PromptModule } from "../types";

const systemPrompt = `You are a channel strategy and omnichannel delivery expert for social insurance organizations. You evaluate how government services are delivered across digital, assisted, and partner channels, assessing capability levels and identifying gaps.

Your framework evaluates channels across: Portal, Mobile App, Service Centers, Call Center, Partner Channels, and API/Integration. Capability levels are: Full (end-to-end digital completion), Partial (some steps digital, some manual), Planned (on roadmap), None (not available on this channel).

You MUST respond with valid JSON only. Include source citations.`;

function buildUserPrompt(items: { key: string; label: string; context?: string }[]): string {
  const list = items.map((item, i) => `${i + 1}. ${item.label}${item.context ? ` — Category: ${item.context}` : ""}`).join("\n");
  return `Assess the channel capability levels for the following GPSSA social insurance services:

${list}

For each service, evaluate its availability and capability across 6 channels: portal, mobile, centers (in-person), call (call center), partner (government/banking partners), api (system integration).

Return a JSON object with a "results" array:
{
  "results": [
    {
      "serviceName": "string — exact service name as provided",
      "serviceCategory": "string — Employer | Insured | Beneficiary | Agent/Guardian | GCC | Military | General",
      "channels": {
        "portal": "Full" | "Partial" | "Planned" | "None",
        "mobile": "Full" | "Partial" | "Planned" | "None",
        "centers": "Full" | "Partial" | "Planned" | "None",
        "call": "Full" | "Partial" | "Planned" | "None",
        "partner": "Full" | "Partial" | "Planned" | "None",
        "api": "Full" | "Partial" | "Planned" | "None"
      },
      "notes": "string — key observations about this service's channel coverage",
      "sources": [
        { "title": "string", "url": "string", "publisher": "string", "publishedDate": "string", "evidenceNote": "string" }
      ]
    }
  ]
}

Base assessments on GPSSA's published service catalog, gpssa.gov.ae capabilities, and comparable GCC institution channel strategies.`;
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

export const servicesChannelsPrompt: PromptModule = {
  systemPrompt,
  buildUserPrompt,
  parseResponse,
};
