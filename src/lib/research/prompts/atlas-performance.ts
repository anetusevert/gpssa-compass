import type { PromptModule } from "../types";
import { parseJsonResponse } from "../types";

const systemPrompt = `You are a senior social security and pension systems research analyst producing publication-grade PERFORMANCE & MATURITY metrics for a global pension observatory. This module focuses exclusively on quantitative comparative metrics for benchmarking.

METHODOLOGY AND SOURCE HIERARCHY:
1. ILO WORLD SOCIAL PROTECTION DATABASE — for effective coverage rates, social protection expenditure (% of GDP).
2. OECD PENSIONS AT A GLANCE — for net replacement rates (median earner, mandatory schemes), pension fund assets.
3. MERCER CFA INSTITUTE GLOBAL PENSION INDEX — for composite adequacy/sustainability/integrity scores, ranks, grades.
4. UN WORLD POPULATION PROSPECTS — for old-age dependency ratios.
5. ISSA & WORLD BANK GOVTECH — for digital maturity classification.

SCORING CALIBRATION:
- maturityScore (1.0-4.0): Overall digital and institutional maturity
  - 3.5-4.0 Leader (Mercer A/A+, ISSA Good Practice Award)
  - 2.5-3.4 Advanced (Mercer B+/B)
  - 1.5-2.4 Developing (Mercer C+/C)
  - 1.0-1.4 Emerging (Mercer D or unranked)
- coverageRate (0-100): ILO effective coverage = active contributors + benefit recipients / reference population
- replacementRate (0-100): OECD net replacement rate for median earner under mandatory schemes
- sustainability (1.0-4.0): per ILO actuarial balance principles
- digitalLevel: Traditional / Basic Digital / Digital-Enabled / Digital-First / AI-Integrated (per ISSA ICT Guidelines tiers)

DEPTH & QUALITY REQUIREMENTS:
- Every numerical score must be grounded in published data. Cross-reference at least two independent sources.
- Never fabricate. Where estimates are necessary, flag them with a confidence qualifier and basis.
- Respond with valid JSON only. No markdown.`;

function buildUserPrompt(items: { key: string; label: string }[]): string {
  const list = items.map((item, i) => `${i + 1}. ${item.label} (${item.key})`).join("\n");
  const singular = items.length === 1;

  return `Conduct quantitative PERFORMANCE & MATURITY benchmarking for the social security / pension system${singular ? "" : "s"} of the following ${singular ? "country" : "countries"}.

${list}

Return a JSON object: { "results": [ ... ] }. Each result must follow this schema EXACTLY:

{
  "iso3": "string — three-letter ISO 3166-1 alpha-3 code",
  "countryName": "string — exact country name as provided",
  "maturityScore": number (1.0-4.0, calibrated against Mercer grades),
  "maturityLabel": "Emerging" | "Developing" | "Advanced" | "Leader",
  "coverageRate": number (0-100, ILO effective coverage),
  "replacementRate": number (0-100, OECD net replacement rate methodology),
  "sustainability": number (1.0-4.0, ILO actuarial balance principles),
  "digitalLevel": "Traditional" | "Basic Digital" | "Digital-Enabled" | "Digital-First" | "AI-Integrated",
  "internationalRankings": {
    "mercerIndex": "string or null — edition year, rank, grade, sub-scores (adequacy/sustainability/integrity)",
    "oecdAdequacy": "string or null — OECD net replacement rate with methodology + year",
    "worldBankCoverage": "string or null — World Bank pension assessment, coverage data, or GovTech maturity index with year"
  },
  "socialProtectionExpenditure": "string — total social protection % of GDP with breakdown if available, source + year",
  "dependencyRatio": "string — old-age dependency ratio (65+/15-64) current and projected, system dependency ratio, source + year",
  "pensionFundAssets": "string — total pension fund assets as % of GDP and absolute amount with source + year",
  "dataSources": [
    { "title": "string", "url": "string", "publisher": "string", "publishedDate": "string", "evidenceNote": "string" }
  ]
}

Cross-reference every metric with at least two independent sources. Where data gaps exist, return null and note the gap in dataSources.`;
}

export const atlasPerformancePrompt: PromptModule = {
  systemPrompt,
  buildUserPrompt,
  parseResponse: parseJsonResponse,
};
