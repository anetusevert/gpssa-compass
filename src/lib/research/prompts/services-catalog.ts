import type { PromptModule } from "../types";
import { parseJsonResponse } from "../types";
import { STANDARDS_ALIGNMENT_FIELD_INSTRUCTION } from "../standards-instruction";

const systemPrompt = `You are a world-class social security and pension service design expert. You research and analyze the full service catalog of any country's social security / pension institution with publication-grade thoroughness.

Your analysis covers: institutional structure, service categorization, user journey mapping, pain point identification, digital readiness assessment, maturity scoring, ILO/ISSA alignment, and international best-practice comparison.

You MUST respond with valid JSON only. No markdown, no commentary — just the JSON object.`;

function buildUserPrompt(items: { key: string; label: string; context?: string }[]): string {
  const item = items[0];
  const iso3 = item.key;
  const countryName = item.label;

  return `Research the complete social security and pension service catalog for ${countryName} (${iso3}).

Identify the PRIMARY social security / pension institution in this country and catalog ALL of its services across every category: registration, contributions, pensions, benefits, employer services, digital services, complaints, certificates, etc.

Return a JSON object with a "results" array. Each element represents one service offered by the institution:
{
  "results": [
    {
      "countryIso3": "${iso3}",
      "institutionName": "string — full official name of the primary social security institution",
      "serviceName": "string — name of the specific service",
      "category": "string — service category: Registration | Contributions | Pensions | Benefits | Employer | Insured | Beneficiary | Digital | Complaints | Certificates | General",
      "description": "string — 2-3 sentence description of what the service does and who it serves",
      "userTypes": ["string"] — e.g. ["Employers", "Insured Persons", "Retirees", "Beneficiaries"],
      "digitalReadiness": number (0-100) — how digitally mature this specific service is,
      "maturityLevel": "Basic | Developing | Competent | Advanced | Leading",
      "currentState": "string — brief assessment of current delivery quality",
      "painPoints": ["string", "string", "string"] — key friction points for users,
      "opportunities": ["string", "string", "string"] — improvement opportunities,
      "strengths": ["string", "string"] — what works well,
      "iloAlignment": "string — relevant ILO/ISSA convention or guideline alignment",
      "bestPracticeComparison": "string — how leading institutions (Singapore CPF, Estonia, UK DWP) deliver this service better or similarly",
      "channelCapabilities": {
        "portal": "Full | Partial | Planned | None",
        "mobile": "Full | Partial | Planned | None",
        "centers": "Full | Partial | Planned | None",
        "call": "Full | Partial | Planned | None",
        "partner": "Full | Partial | Planned | None",
        "api": "Full | Partial | Planned | None"
      },
      "sources": [
        { "title": "string", "url": "string", "publisher": "string", "publishedDate": "string", "evidenceNote": "string" }
      ]
    }
  ]
}

Aim for 5-15 services per country depending on institution size. Cover ALL major service categories. Be thorough and evidence-based.
${STANDARDS_ALIGNMENT_FIELD_INSTRUCTION}`;
}

export const servicesCatalogPrompt: PromptModule = {
  systemPrompt,
  buildUserPrompt,
  parseResponse: parseJsonResponse,
};
