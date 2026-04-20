import type { PromptModule } from "../types";
import { parseJsonResponse } from "../types";

const systemPrompt = `You are an international social-security delivery-channel analyst. For any given country you research the principal social-security / pension institution's customer-facing delivery channels (online portal, mobile app, branch network, call centre, partner ecosystem, public APIs, agent network, kiosks, social-media support).

For each channel you assess:
- channelType: "Digital — Web", "Digital — Mobile", "Branch", "Call Centre", "Partner / Agent", "API", "Field / Outreach", "Social"
- maturity (0-100): completeness, reliability, UX quality, automation
- servicesAvailable / servicesTotal: how many of the institution's services are deliverable through this channel
- status: Active | Pilot | Planned | Deprecated
- capabilities, strengths, gaps, benchmarkComparison (vs leading peers like Singapore CPF, Estonia, Korea NPS, Netherlands SVB, Australia Centrelink)

You ground every assessment in the institution's annual report, ISSA Country Profile, World Bank GovTech Maturity Index, OECD Pensions at a Glance, IMF Financial Inclusion data, the institution's website, and credible news.

You MUST respond with valid JSON only. Include source citations.`;

function buildUserPrompt(items: { key: string; label: string; context?: string }[]): string {
  const list = items.map((item, i) => `${i + 1}. ${item.label}${item.context ? ` (${item.context})` : ""}`).join("\n");
  return `Research the principal social-security / pension institution delivery channels for the following countries. Identify 5-8 channels per country. Treat each country as ONE country profile (one institution, multiple channels).

${list}

Return a JSON object with a "results" array. One entry per channel:
{
  "results": [
    {
      "countryIso3": "string — ISO-3166 alpha-3",
      "countryName": "string",
      "institutionName": "string — principal institution (e.g. CPF Board, GOSI, NPS, ATP)",
      "name": "string — channel name (e.g. CPF Mobile App, Centrelink Express Plus)",
      "channelType": "Digital — Web" | "Digital — Mobile" | "Branch" | "Call Centre" | "Partner / Agent" | "API" | "Field / Outreach" | "Social",
      "maturity": number (0-100),
      "servicesAvailable": number,
      "servicesTotal": number,
      "status": "Active" | "Pilot" | "Planned" | "Deprecated",
      "capabilities": "string — partner-level 1-2 sentences on what the channel does",
      "strengths": "string — 1-2 sentences",
      "gaps": "string — 1-2 sentences",
      "benchmarkComparison": "string — how this compares vs the global frontier (CPF, Estonia, NPS, etc.)",
      "sources": [
        { "title": "string", "url": "string", "publisher": "string", "publishedDate": "string", "evidenceNote": "string" }
      ]
    }
  ]
}`;
}

export const intlDeliveryChannelsPrompt: PromptModule = {
  systemPrompt,
  buildUserPrompt,
  parseResponse: parseJsonResponse,
};
