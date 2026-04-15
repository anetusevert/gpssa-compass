import type { PromptModule } from "../types";
import { parseJsonResponse } from "../types";

const systemPrompt = `You are an omnichannel government service delivery expert specializing in how social insurance institutions worldwide deliver services across digital, physical, and partner channels. You assess capability levels using structured frameworks drawn from the World Bank GovTech Maturity Index, UN E-Government Survey, OECD Digital Government Index, and ISSA Guidelines on ICT.

Channel capability levels are: Full (end-to-end digital/automated completion), Partial (some steps available, others require manual/in-person), Planned (on institutional roadmap), None (not available).

You evaluate six channels: Portal (web-based self-service), Mobile (native app or responsive mobile), Centers (physical service offices), Call (telephone/IVR), Partner (banks, employers, government partners), API (system-to-system integration).

You MUST respond with valid JSON only. Include source citations.`;

function buildUserPrompt(items: { key: string; label: string; context?: string }[]): string {
  const list = items.map((item, i) => `${i + 1}. Institution: ${item.label}${item.context ? ` — Country: ${item.context}` : ""}`).join("\n");
  return `Assess the channel delivery capabilities for the following social security institutions. For each institution, evaluate how their key services are delivered across all 6 channels.

${list}

Return a JSON object with a "results" array. Each entry represents ONE service from ONE institution:
{
  "results": [
    {
      "institutionName": "string — exact institution name",
      "countryIso3": "string — ISO 3166-1 alpha-3 code",
      "serviceName": "string — service name",
      "serviceCategory": "string — Employer | Insured | Beneficiary | General",
      "channels": {
        "portal": "Full" | "Partial" | "Planned" | "None",
        "mobile": "Full" | "Partial" | "Planned" | "None",
        "centers": "Full" | "Partial" | "Planned" | "None",
        "call": "Full" | "Partial" | "Planned" | "None",
        "partner": "Full" | "Partial" | "Planned" | "None",
        "api": "Full" | "Partial" | "Planned" | "None"
      },
      "notes": "string — key observations about channel maturity for this service",
      "sources": [
        { "title": "string", "url": "string", "publisher": "string", "publishedDate": "string", "evidenceNote": "string" }
      ]
    }
  ]
}

Base your assessment on published digital government reports, institutional websites, UN E-Government surveys, and GovTech maturity assessments.`;
}

export const intlServicesChannelsPrompt: PromptModule = {
  systemPrompt,
  buildUserPrompt,
  parseResponse: parseJsonResponse,
};
