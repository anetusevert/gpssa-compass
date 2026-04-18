import type { PromptModule } from "../types";
import { parseJsonResponse } from "../types";

const systemPrompt = `You are a senior social security and pension systems research analyst producing publication-grade SYSTEM ARCHITECTURE intelligence for a global pension observatory. This module focuses exclusively on the institutional and legislative architecture of each country's pension and social security system.

METHODOLOGY AND SOURCE HIERARCHY (use in strict priority order):
1. NATIONAL LEGISLATION & OFFICIAL GAZETTES — primary source for legislative framework, contribution rates, retirement ages, benefit eligibility, vesting, indexation. Always cite Act/Law name, article/section, year of enactment and most recent amendment.
2. ILO WORLD SOCIAL PROTECTION DATABASE & REPORTS — for ILO Convention C102 branch coverage and ratifications.
3. WORLD BANK PENSION CONCEPTUAL FRAMEWORK — for multi-pillar classification (Pillar 0 social assistance through Pillar 4 informal support) and system typology.
4. ISSA GUIDELINES — for governance and ICT institutional best-practice references.
5. NATIONAL SOCIAL SECURITY INSTITUTION REPORTS & ANNUAL REVIEWS — for fund governance, board composition, and operational architecture.

DEPTH & QUALITY REQUIREMENTS:
- Treat every country as a comprehensive country intelligence briefing that a pension policy advisor could rely on EXCLUSIVELY.
- Each field must be SUBSTANTIVE and SPECIFIC: cite specific Act/Law names, article numbers, ratification years, contribution percentages, retirement ages with scheduled increases.
- Do NOT fabricate. If a fact is unknown, mark it as null and note in dataSources.
- Respond with valid JSON only. No markdown.`;

function buildUserPrompt(items: { key: string; label: string }[]): string {
  const list = items.map((item, i) => `${i + 1}. ${item.label} (${item.key})`).join("\n");
  const singular = items.length === 1;

  return `Conduct comprehensive SYSTEM ARCHITECTURE research on the social security / pension system${singular ? "" : "s"} for the following ${singular ? "country" : "countries"}.

${list}

Return a JSON object: { "results": [ ... ] }. Each result must follow this schema EXACTLY:

{
  "iso3": "string — three-letter ISO 3166-1 alpha-3 country code",
  "countryName": "string — exact country name as provided",
  "institution": "string — full names of ALL primary social security / pension institutions, comma-separated",
  "systemType": "string — detailed multi-pillar description using World Bank terminology (Pillar 0 / 1 / 2 / 3 / 4)",
  "yearEstablished": number or null,
  "legislativeFramework": "string — comprehensive description of ALL key legislation, including original enacting laws, major amendments, most recent reforms; cite Act names, years, article references",
  "contributionRates": {
    "employee": "string — detailed employee rate with basis, ceiling, variations",
    "employer": "string — detailed employer rate with basis and ceiling",
    "government": "string — government subsidy/guarantee/co-financing or 'None'"
  },
  "retirementAge": {
    "male": "string — statutory/normal retirement age with any scheduled increases",
    "female": "string — statutory/normal retirement age with any scheduled increases",
    "early": "string — earliest possible retirement age with conditions, penalties, exceptions"
  },
  "benefitTypes": ["string", ...] — list ALL ILO Convention C102 branches provided (old-age, invalidity, survivors, sickness/health, maternity, employment injury, unemployment, family/child),
  "fundManagement": "string — governance structure, total fund size with year, asset allocation, return history, ESG/PRI policies, management model (government vs. independent board vs. private)",
  "vestingPeriod": "string — minimum contribution period across benefit types",
  "benefitCalculation": "string — detailed benefit formula/methodology",
  "indexationMechanism": "string — how pensions are adjusted (CPI/wages/sustainability factor); last adjustment example",
  "governanceQuality": "string — World Bank Government Effectiveness percentile, ISSA Good Governance compliance, audit standards, board composition",
  "iloConventionsRatified": "string — which ILO social security conventions are ratified with years, or 'None ratified'",
  "populationCovered": "string — detailed coverage breakdown (active contributors + pensioners + survivors with absolute numbers and rates)",
  "dataSources": [
    { "title": "string", "url": "string", "publisher": "string", "publishedDate": "string", "evidenceNote": "string" }
  ]
}

Quality bar: every field must be SUBSTANTIVE with specific data, named legislation, percentages, dates. Cross-reference at least two independent sources.`;
}

export const atlasSystemPrompt: PromptModule = {
  systemPrompt,
  buildUserPrompt,
  parseResponse: parseJsonResponse,
};
