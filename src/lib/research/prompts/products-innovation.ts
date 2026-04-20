import type { PromptModule } from "../types";
import { parseJsonResponse } from "../types";

const systemPrompt = `You are a UAE social-insurance product innovation strategist with deep expertise in emerging-product design for pension and social-protection institutions. You evaluate new product ideas for the UAE General Pension and Social Security Authority (GPSSA), grounded in:
- Gaps in current GPSSA coverage (informal workers, gig economy, household caregivers, self-employed Emiratis)
- International peer innovations (Singapore CPF Lifestyle, ATP Denmark digital-first onboarding, Korea NPS gig-worker enrolment, Estonia X-Road pension API, Chile DC top-up tooling)
- UAE Vision 2031, GPSSA strategic roadmap, MOHRE labor-market reforms
- Behavioural economics and digital-product patterns (auto-enrolment, nudges, parametric insurance, micro-pensions, embedded finance)

For each innovation idea you assess:
- impactScore (0-100): expected benefit to coverage, equity, replacement-rate adequacy, or sustainability
- feasibilityScore (0-100): regulatory, operational, and political feasibility within a 24-month horizon
- innovationType: "digital", "product", "ecosystem", "regulatory", "experience"
- estimatedPopulation: how many UAE residents this could reach in steady state

You MUST respond with valid JSON only. Include source citations.`;

function buildUserPrompt(items: { key: string; label: string; context?: string }[]): string {
  const list = items.map((item, i) => `${i + 1}. ${item.label}${item.context ? ` — Focus: ${item.context}` : ""}`).join("\n");
  return `Research and structure the following UAE GPSSA product-innovation themes. For each theme propose ONE concrete, partner-level innovation idea (not a category) with quantified impact / feasibility scores and an Emirati / Expat target segment.

${list}

Return a JSON object with a "results" array. One entry per innovation idea:
{
  "results": [
    {
      "title": "string — concise innovation name (e.g. 'Auto-enrolment Pension Wallet for Gig Workers')",
      "description": "string — partner-level 2-3 sentence description: what it is, who it serves, why it works for the UAE",
      "targetSegment": "string — Emirati / Expat segment label (e.g. Expat — Domestic Workers, National — Self-Employed)",
      "impactScore": number (0-100),
      "feasibilityScore": number (0-100),
      "status": "identified" | "exploring" | "piloting" | "scaling",
      "innovationType": "digital" | "product" | "ecosystem" | "regulatory" | "experience",
      "estimatedPopulation": "string — addressable population (e.g. ~750k expat domestic workers)",
      "sources": [
        { "title": "string", "url": "string", "publisher": "string", "publishedDate": "string", "evidenceNote": "string" }
      ]
    }
  ]
}

Authoritative sources to draw from: UAE Vision 2031, GPSSA strategic plan, MOHRE labor-market reforms, ISSA Innovation Awards, World Bank Innovate to Pension report, OECD Pensions at a Glance innovation chapter, peer institution annual reports (CPF Singapore, ATP Denmark, NPS Korea, Chile AFP), behavioural-economics literature (Thaler, Madrian).`;
}

export const productsInnovationPrompt: PromptModule = {
  systemPrompt,
  buildUserPrompt,
  parseResponse: parseJsonResponse,
};
