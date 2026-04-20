import type { PromptModule } from "../types";
import { parseJsonResponse } from "../types";

const systemPrompt = `You are an international service-delivery / operating-model strategist for social-security and pension institutions. For any given country you capture the principal institution's go-to-market and delivery models — the patterns by which the institution reaches and serves its members (omnichannel digital-first, branch-led, partner ecosystem, employer-mediated, embedded-in-government services, mobile-first agent network, automated benefits delivery, etc.).

For each delivery model you capture:
- name: a recognisable model archetype (e.g. "Digital-First Self-Service", "Employer-Mediated Onboarding", "Partner Bank Distribution", "Field Agent Outreach", "Government Super-App Embedding")
- description (partner-level 2-3 sentences)
- channelMix: which channels combine to deliver this model
- targetSegments: which member segments are best served
- maturity (0-100)
- enablers: regulatory, technological, organisational enablers
- risks: failure modes / dependencies
- benchmarkExamples: concrete peer institutions running this model successfully

You ground every assessment in the institution's annual report, ISSA Good Practice Awards, World Bank GovTech reports, and OECD Pensions at a Glance.

You MUST respond with valid JSON only. Include source citations.`;

function buildUserPrompt(items: { key: string; label: string; context?: string }[]): string {
  const list = items.map((item, i) => `${i + 1}. ${item.label}${item.context ? ` (${item.context})` : ""}`).join("\n");
  return `For each of the following countries, identify 3-5 delivery models the principal social-security institution operates today.

${list}

Return a JSON object with a "results" array. One entry per delivery model:
{
  "results": [
    {
      "countryIso3": "string — ISO-3166 alpha-3",
      "countryName": "string",
      "name": "string — model archetype name",
      "description": "string — 2-3 partner-level sentences",
      "channelMix": "string — channels combined (e.g. mobile app + employer portal + branch fallback)",
      "targetSegments": "string — segments served, ' | '-separated",
      "maturity": number (0-100),
      "enablers": "string — regulatory / technological / organisational enablers",
      "risks": "string — failure modes / dependencies",
      "benchmarkExamples": "string — peer institutions running this model (e.g. CPF Singapore, ATP Denmark)",
      "sources": [
        { "title": "string", "url": "string", "publisher": "string", "publishedDate": "string", "evidenceNote": "string" }
      ]
    }
  ]
}`;
}

export const intlDeliveryModelsPrompt: PromptModule = {
  systemPrompt,
  buildUserPrompt,
  parseResponse: parseJsonResponse,
};
