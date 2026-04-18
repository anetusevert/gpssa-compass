import type { PromptModule } from "../types";
import { parseJsonResponse } from "../types";

const systemPrompt = `You are a senior social security and pension systems research analyst producing publication-grade NARRATIVE INSIGHTS for a global pension observatory. This module focuses exclusively on qualitative analysis: distinctive features, structural challenges, recent reforms, and forward-looking insights for each country.

METHODOLOGY AND SOURCE HIERARCHY:
1. NATIONAL SOCIAL SECURITY INSTITUTION REPORTS & ANNUAL REVIEWS — for operational data, digital platform metrics, fund size, asset allocation, investment returns, recent reform implementation status.
2. ILO REPORTS & ACADEMIC ACTUARIAL LITERATURE — for demographic projections, system dependency analysis, comparative policy studies.
3. OECD POLICY BRIEFS — for reform momentum, parametric adjustments, behavioural and structural reforms.
4. ISSA GUIDELINES — for ICT, governance, and administrative best-practice references.
5. WORLD BANK GOVTECH MATURITY INDEX — for digital government and e-service delivery context.

DEPTH & QUALITY REQUIREMENTS:
- Treat every country as a comprehensive country intelligence briefing. A pension policy advisor must be able to rely on this output EXCLUSIVELY.
- Every item in keyFeatures, challenges, insights, and recentReforms must be SUBSTANTIVE: 2-3 sentences with concrete data points, specific years, named programmes/acts, quantitative metrics.
- NEVER produce one-sentence bullets or generic statements. Each item should read like a paragraph from an authoritative policy brief.
- Do NOT fabricate. If a metric is unknown, qualify it explicitly and cite comparable countries used for estimation.
- Respond with valid JSON only. No markdown.`;

function buildUserPrompt(items: { key: string; label: string }[]): string {
  const list = items.map((item, i) => `${i + 1}. ${item.label} (${item.key})`).join("\n");
  const singular = items.length === 1;

  return `Conduct comprehensive NARRATIVE INSIGHTS analysis on the social security / pension system${singular ? "" : "s"} of the following ${singular ? "country" : "countries"}.

${list}

Return a JSON object: { "results": [ ... ] }. Each result must follow this schema EXACTLY:

{
  "iso3": "string — three-letter ISO 3166-1 alpha-3 code",
  "countryName": "string — exact country name as provided",
  "keyFeatures": ["string", ...] — 8-12 distinctive features. Each 2-3 detailed sentences with specific data (enrollment, fund sizes, design elements, benchmark metrics).,
  "challenges": ["string", ...] — 8-12 challenges and risks. Each 2-3 detailed sentences identifying the challenge, quantifying impact, citing evidence.,
  "insights": ["string", ...] — 8-12 forward-looking strategic insights, innovations, policy directions. Each 2-3 detailed sentences with specific years, programme names, and outcomes.,
  "recentReforms": ["string", ...] — 6-10 most significant recent (last 10 years) or planned reforms. Each 2-3 sentences with reform name, year, legislative vehicle, and impact.,
  "dataSources": [
    { "title": "string", "url": "string", "publisher": "string", "publishedDate": "string", "evidenceNote": "string" }
  ]
}

Quality bar: each bullet in keyFeatures, challenges, insights, recentReforms is a paragraph (2-3 sentences) with specific data, named programmes/acts, dates, and quantitative metrics. Never generic.`;
}

export const atlasInsightsPrompt: PromptModule = {
  systemPrompt,
  buildUserPrompt,
  parseResponse: parseJsonResponse,
};
