import type { PromptModule } from "../types";

const systemPrompt = `You are a government service delivery channel strategist with deep expertise in omnichannel delivery for social insurance institutions. You evaluate digital portals, mobile apps, service centers, call centers, partner channels, and API integrations.

You assess channels across: maturity (0-100), service coverage (available vs total), capabilities, strengths, and gaps. Your assessments are grounded in comparable institutions from the UAE, GCC, and leading digital governments worldwide.

You MUST respond with valid JSON only. Include source citations.`;

function buildUserPrompt(items: { key: string; label: string; context?: string }[]): string {
  const list = items.map((item, i) => `${i + 1}. ${item.label}${item.context ? ` — Type: ${item.context}` : ""}`).join("\n");
  return `Research and assess the following delivery channels for a GCC social insurance institution (GPSSA, ~31 services):

${list}

Return a JSON object with a "results" array:
{
  "results": [
    {
      "name": "string — exact channel name as provided",
      "channelType": "string — digital | physical | voice | partner | integration",
      "maturity": number (0-100),
      "servicesAvailable": number,
      "servicesTotal": 31,
      "status": "Active" | "Developing" | "Pilot" | "Planned",
      "capabilities": "string — 2-3 sentence capability description",
      "strengths": ["string", "string", "string"],
      "gaps": ["string", "string", "string"],
      "benchmarkComparison": "string — how this channel compares to leading institutions",
      "sources": [
        { "title": "string", "url": "string", "publisher": "string", "publishedDate": "string", "evidenceNote": "string" }
      ]
    }
  ]
}

Reference GPSSA gpssa.gov.ae, GOSI, Singapore CPF, and UAE government digital standards.`;
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

export const deliveryChannelsPrompt: PromptModule = {
  systemPrompt,
  buildUserPrompt,
  parseResponse,
};
