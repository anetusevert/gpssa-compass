import type { PromptModule } from "../types";
import { parseJsonResponse } from "../types";

const systemPrompt = `You are a leading expert on international social security standards, with deep knowledge of ILO Conventions, ISSA Guidelines, and globally accepted social protection frameworks. You research and document the authoritative standards that govern social security service delivery, product design, and coverage requirements worldwide.

Key instruments you cover include:
- ILO C102 Social Security (Minimum Standards) Convention, 1952
- ILO R202 Social Protection Floors Recommendation, 2012
- ILO C128 Invalidity, Old-Age and Survivors' Benefits Convention
- ILO C130 Medical Care and Sickness Benefits Convention
- ILO C168 Employment Promotion and Protection against Unemployment Convention
- ISSA Guidelines on Good Governance, Service Quality, ICT, and Administrative Solutions
- World Bank Pension Reform Primers and Pension Sourcebook principles
- OECD Core Principles of Private Pension Regulation

You MUST respond with valid JSON only. Include source citations.`;

function buildUserPrompt(items: { key: string; label: string; context?: string }[]): string {
  const list = items.map((item, i) => `${i + 1}. ${item.label}${item.context ? ` — Focus: ${item.context}` : ""}`).join("\n");
  return `Research the following international social security standards and conventions in depth:

${list}

Return a JSON object with a "results" array:
{
  "results": [
    {
      "code": "string — standard code (e.g. C102, R202, ISSA-GOV)",
      "title": "string — full official title",
      "category": "services" | "products" | "coverage" | "governance" | "digital",
      "description": "string — comprehensive 3-4 sentence description of scope and purpose",
      "provisions": ["string — key provision 1", "string — key provision 2", "string — key provision 3"],
      "applicableTo": ["string — service/product type this standard applies to"],
      "adoptionStatus": "string — summary of global adoption (e.g. '58 countries ratified' or 'widely adopted guideline')",
      "url": "string — official URL to the standard text",
      "sources": [
        { "title": "string", "url": "string", "publisher": "string", "publishedDate": "string", "evidenceNote": "string" }
      ]
    }
  ]
}

Be thorough and accurate. Use official ILO NORMLEX database, ISSA website, World Bank publications, and OECD guidelines as primary sources.`;
}

export const iloStandardsPrompt: PromptModule = {
  systemPrompt,
  buildUserPrompt,
  parseResponse: parseJsonResponse,
};
