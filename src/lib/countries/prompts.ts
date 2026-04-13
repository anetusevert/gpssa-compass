export const RESEARCH_SYSTEM_PROMPT = `You are a senior social security and pension systems research analyst with deep expertise in global pension frameworks, digital government transformation, and social insurance policy.

Your task is to provide structured, factual research on the social security and pension systems of specific countries. For each country, return accurate, well-sourced data based on your knowledge.

SCORING GUIDELINES:
- maturityScore (1.0-4.0): Overall digital and institutional maturity
  - 1.0-1.5: Emerging — minimal digital infrastructure, basic paper-based processes
  - 1.5-2.5: Developing — some digital services, modernization underway
  - 2.5-3.5: Advanced — comprehensive digital platform, strong service delivery
  - 3.5-4.0: Leader — world-class digital-first, AI/ML integration, benchmark setter
- coverageRate (0-100): Percentage of working-age population covered by social security
- replacementRate (0-100): Pension income as percentage of pre-retirement earnings
- sustainability (1.0-4.0): Long-term financial sustainability of the pension system
  - 1.0-1.5: Critical — immediate solvency concerns
  - 1.5-2.5: Challenged — structural reforms needed
  - 2.5-3.5: Stable — funded adequately for medium term
  - 3.5-4.0: Strong — robust reserves, diversified funding

DIGITAL LEVEL classification:
- "Traditional" — paper-based, minimal online presence
- "Basic Digital" — website with information, limited transactions
- "Digital-Enabled" — online portals, some digital services
- "Digital-First" — mobile apps, full online service delivery
- "AI-Integrated" — AI/ML, predictive analytics, proactive services

You MUST respond with valid JSON only. No markdown, no commentary outside the JSON array.`;

export function buildUserPrompt(countryNames: string[]): string {
  const list = countryNames.map((n, i) => `${i + 1}. ${n}`).join("\n");

  return `Research the social security and pension systems for the following countries and return a JSON array with one object per country:

${list}

Return EXACTLY this JSON structure for each country (as an array):
[
  {
    "countryName": "string — exact country name as provided above",
    "institution": "string — name of the primary social security / pension institution",
    "systemType": "string — e.g. Defined Benefit, Defined Contribution, Hybrid, Provident Fund, PAYG, NDC",
    "yearEstablished": number or null,
    "maturityScore": number (1.0-4.0),
    "maturityLabel": "Emerging" | "Developing" | "Advanced" | "Leader",
    "coverageRate": number (0-100),
    "replacementRate": number (0-100),
    "sustainability": number (1.0-4.0),
    "digitalLevel": "Traditional" | "Basic Digital" | "Digital-Enabled" | "Digital-First" | "AI-Integrated",
    "keyFeatures": ["string", "string", "string"] — 3-5 distinctive features,
    "challenges": ["string", "string", "string"] — 3-5 current challenges,
    "insights": ["string", "string", "string"] — 3-5 recent innovations or notable developments
  }
]

Be precise with numerical scores. Use real-world data from OECD, ISSA, World Bank, Mercer Global Pension Index, and national sources. If data is limited for a country, provide your best informed estimate and note the uncertainty in the insights.`;
}

export interface CountryResearchResult {
  countryName: string;
  institution: string | null;
  systemType: string | null;
  yearEstablished: number | null;
  maturityScore: number | null;
  maturityLabel: string | null;
  coverageRate: number | null;
  replacementRate: number | null;
  sustainability: number | null;
  digitalLevel: string | null;
  keyFeatures: string[];
  challenges: string[];
  insights: string[];
}

export function parseResearchResponse(raw: string): CountryResearchResult[] {
  const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

  const parsed = JSON.parse(cleaned);
  const arr = Array.isArray(parsed) ? parsed : [parsed];

  return arr.map((item: Record<string, unknown>) => ({
    countryName: String(item.countryName ?? ""),
    institution: item.institution ? String(item.institution) : null,
    systemType: item.systemType ? String(item.systemType) : null,
    yearEstablished: typeof item.yearEstablished === "number" ? item.yearEstablished : null,
    maturityScore: typeof item.maturityScore === "number" ? item.maturityScore : null,
    maturityLabel: item.maturityLabel ? String(item.maturityLabel) : null,
    coverageRate: typeof item.coverageRate === "number" ? item.coverageRate : null,
    replacementRate: typeof item.replacementRate === "number" ? item.replacementRate : null,
    sustainability: typeof item.sustainability === "number" ? item.sustainability : null,
    digitalLevel: item.digitalLevel ? String(item.digitalLevel) : null,
    keyFeatures: Array.isArray(item.keyFeatures) ? item.keyFeatures.map(String) : [],
    challenges: Array.isArray(item.challenges) ? item.challenges.map(String) : [],
    insights: Array.isArray(item.insights) ? item.insights.map(String) : [],
  }));
}
