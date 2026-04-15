import type { PromptModule } from "../types";
import { parseJsonResponse } from "../types";

const systemPrompt = `You are a world-class social security service design researcher with deep expertise in comparative government service delivery across all continents. You research and document the complete service catalogs of national pension and social insurance institutions, covering registration, contribution, benefit, and support services.

Your analysis draws from ILO Social Security (Minimum Standards) Convention C102, ILO R202 Social Protection Floors, ISSA Guidelines on Service Quality, the World Bank's Pension Sourcebook, OECD pension reviews, and institution-specific published service charters.

For each service you document: the service name and category, a clear description, which user types access it, the digital readiness level (0-100), maturity assessment (Basic/Developing/Competent/Advanced/Leading), key strengths, pain points observed, and which ILO conventions/standards it aligns with.

You MUST respond with valid JSON only. Include source citations for every claim.`;

function buildUserPrompt(items: { key: string; label: string; context?: string }[]): string {
  const list = items.map((item, i) => `${i + 1}. Institution: ${item.label}${item.context ? ` — Country: ${item.context}` : ""}`).join("\n");
  return `Research the complete service catalog for the following social security institutions. For each institution, identify ALL services they offer to employers, insured persons, beneficiaries, and the public.

${list}

Return a JSON object with a "results" array. Each entry represents ONE service from ONE institution:
{
  "results": [
    {
      "institutionName": "string — exact institution name",
      "countryIso3": "string — ISO 3166-1 alpha-3 code",
      "serviceName": "string — name of the service",
      "category": "string — Employer | Insured | Beneficiary | Agent/Guardian | Cross-Border | Military | General",
      "description": "string — detailed 2-3 sentence description",
      "userTypes": ["string"] — who accesses this service,
      "digitalReadiness": number (0-100),
      "maturityLevel": "Basic" | "Developing" | "Competent" | "Advanced" | "Leading",
      "strengths": ["string", "string"],
      "painPoints": ["string", "string"],
      "iloAlignment": "string — which ILO conventions/standards this service relates to (e.g. C102 Part V, R202)",
      "channelCapabilities": {
        "portal": "Full" | "Partial" | "Planned" | "None",
        "mobile": "Full" | "Partial" | "Planned" | "None",
        "centers": "Full" | "Partial" | "Planned" | "None",
        "call": "Full" | "Partial" | "Planned" | "None",
        "partner": "Full" | "Partial" | "Planned" | "None",
        "api": "Full" | "Partial" | "Planned" | "None"
      },
      "sources": [
        { "title": "string", "url": "string", "publisher": "string", "publishedDate": "string", "evidenceNote": "string" }
      ]
    }
  ]
}

Research deeply — use official government websites, ISSA country profiles, ILO World Social Protection Database, institutional annual reports, and digital government assessments. Aim for 15-30 services per institution to provide a comprehensive catalog.`;
}

export const intlServicesCatalogPrompt: PromptModule = {
  systemPrompt,
  buildUserPrompt,
  parseResponse: parseJsonResponse,
};
