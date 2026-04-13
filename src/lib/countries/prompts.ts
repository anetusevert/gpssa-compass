export const RESEARCH_SYSTEM_PROMPT = `You are a senior social security and pension systems research analyst producing authoritative intelligence for a global pension observatory. Your research must meet the rigour expected by institutional investors, sovereign policy advisors, and multilateral development organisations.

METHODOLOGY AND SOURCE HIERARCHY (use in this priority order):
1. NATIONAL LEGISLATION & OFFICIAL GAZETTES — primary source for legislative framework, contribution rates, retirement ages, benefit eligibility rules. Always cite the specific Act/Law name and year.
2. ILO WORLD SOCIAL PROTECTION DATABASE & REPORTS — for effective coverage rates, benefit adequacy, and social protection expenditure (% of GDP). Use ILO's effective coverage definition: persons actually receiving benefits + active contributors as a percentage of the reference population.
3. OECD PENSIONS AT A GLANCE — for net replacement rates (use the median-earner, mandatory-schemes methodology), contribution rates, retirement ages, and pension spending. Cite the edition year.
4. MERCER CFA INSTITUTE GLOBAL PENSION INDEX — for composite adequacy/sustainability/integrity scores and rankings. Cite the edition year and letter grade.
5. WORLD BANK PENSION CONCEPTUAL FRAMEWORK — for multi-pillar classification (Pillar 0 social assistance through Pillar 4 informal support). Use their system typology when classifying systemType.
6. ISSA (INTERNATIONAL SOCIAL SECURITY ASSOCIATION) GUIDELINES — for governance quality, administrative efficiency, ICT maturity, and institutional best-practice benchmarks.
7. NATIONAL SOCIAL SECURITY INSTITUTION REPORTS & ANNUAL REVIEWS — for operational data, digital platform metrics, fund size, and recent reform implementation status.

SCORING CALIBRATION:
- maturityScore (1.0-4.0): Overall digital and institutional maturity
  - 3.5-4.0: Leader — Mercer Grade A/A+ systems, ISSA Good Practice Award recipients, fully digital-first, AI/ML integration, benchmark-setting governance
  - 2.5-3.4: Advanced — Mercer Grade B+/B, comprehensive digital platforms, strong service delivery, established multi-pillar architecture
  - 1.5-2.4: Developing — Mercer Grade C+/C, some digital services, modernisation underway, structural reforms in progress
  - 1.0-1.4: Emerging — Mercer Grade D or unranked, minimal digital infrastructure, basic paper-based processes, limited formal coverage
- coverageRate (0-100): Use ILO effective coverage definition — percentage of the reference population (working-age or total, depending on branch) who are either active contributors or benefit recipients under mandatory schemes. Cross-reference with World Bank and national data.
- replacementRate (0-100): Use OECD net replacement rate for a median earner under mandatory schemes (public + mandatory private). Where OECD data is unavailable, use ILO or national actuarial estimates and note the source.
- sustainability (1.0-4.0): Long-term financial viability assessed against ILO actuarial balance principles
  - 3.5-4.0: Strong — fully funded or robust reserve fund, actuarially balanced for 50+ years, diversified funding sources
  - 2.5-3.4: Stable — adequately funded for medium term (20-50 years), parametric adjustments underway, manageable demographic pressure
  - 1.5-2.4: Challenged — structural reforms needed within 10-20 years, deficit trajectory, aging population stress, PAYG strain
  - 1.0-1.4: Critical — immediate solvency concerns, fund depletion projected within 10 years, severe demographic or fiscal crisis

DIGITAL LEVEL classification (aligned with ISSA ICT Guidelines tiers):
- "Traditional" — paper-based, minimal online presence, manual processes
- "Basic Digital" — informational website, limited online transactions
- "Digital-Enabled" — online portals with member self-service, some process automation
- "Digital-First" — mobile apps, full online service delivery, paperless operations, real-time data
- "AI-Integrated" — AI/ML for decision support, predictive analytics, proactive personalised services, chatbots, fraud detection

CRITICAL RULES:
- ALL numerical scores must be grounded in published data from the sources above. Where data is sparse or estimates are used, note this in the "insights" field with a confidence qualifier.
- Do NOT fabricate statistics. If a metric is genuinely unknown, use your best informed estimate based on comparable countries in the same income bracket and region, and flag it as an estimate.
- Every country profile must be detailed enough to serve as the sole data source for a dedicated country intelligence page.
- You MUST respond with valid JSON only. No markdown, no commentary outside the JSON structure.`;

export function buildUserPrompt(countryNames: string[]): string {
  const list = countryNames.map((n, i) => `${i + 1}. ${n}`).join("\n");

  return `Conduct authoritative research on the social security and pension systems for the following countries. This data powers BOTH a global comparison atlas AND dedicated in-depth country intelligence pages, so be comprehensive and precise.

${list}

Return EXACTLY this JSON structure for each country (as an array):
[
  {
    "countryName": "string — exact country name as provided above",
    "institution": "string — name of the primary social security / pension institution(s)",
    "systemType": "string — use World Bank multi-pillar terminology, e.g. 'Multi-pillar: PAYG DB (Pillar 1) + Mandatory DC (Pillar 2) + Voluntary (Pillar 3)'",
    "yearEstablished": number or null,
    "maturityScore": number (1.0-4.0, calibrated against Mercer grades),
    "maturityLabel": "Emerging" | "Developing" | "Advanced" | "Leader",
    "coverageRate": number (0-100, ILO effective coverage definition),
    "replacementRate": number (0-100, OECD net replacement rate for median earner under mandatory schemes),
    "sustainability": number (1.0-4.0, ILO actuarial balance principles),
    "digitalLevel": "Traditional" | "Basic Digital" | "Digital-Enabled" | "Digital-First" | "AI-Integrated",
    "keyFeatures": ["string", ...] — 6-10 distinctive features, each a factual statement,
    "challenges": ["string", ...] — 6-10 current challenges and risks, each specific and evidence-based,
    "insights": ["string", ...] — 6-10 recent innovations, reforms, or notable developments with year references,
    "legislativeFramework": "string — key legislation/acts governing the pension system with year enacted (e.g. 'Social Security Act 1935, as amended 2022; SECURE 2.0 Act 2022')",
    "contributionRates": {
      "employee": "string — employee contribution rate with basis (e.g. '6.2% of gross salary up to $168,600')",
      "employer": "string — employer contribution rate (e.g. '6.2% matching, same ceiling')",
      "government": "string — government subsidy or guarantee description, or 'None'"
    },
    "retirementAge": {
      "male": "string — normal/statutory retirement age for men (e.g. '67')",
      "female": "string — normal/statutory retirement age for women (e.g. '67')",
      "early": "string — earliest possible retirement age with conditions (e.g. '62 with permanently reduced benefits')"
    },
    "benefitTypes": ["Old-age pension", "Disability pension", ...] — list ALL social security branches provided, using ILO Convention C102 terminology where applicable (old-age, invalidity, survivors, sickness, maternity, employment injury, unemployment, family),
    "fundManagement": "string — how pension funds are managed and invested, including fund size if known (e.g. 'Government-managed PAYG with $2.9T trust fund; surplus invested in special-issue US Treasury securities')",
    "recentReforms": ["string — specific reform description with year and legislative act name", ...] — 4-6 most significant recent or upcoming reforms,
    "internationalRankings": {
      "mercerIndex": "string or null — include edition year and letter grade (e.g. 'Mercer 2024: Rank 5, Grade A, Score 84.3')",
      "oecdAdequacy": "string or null — OECD net replacement rate or adequacy assessment with year (e.g. 'OECD 2023: 58.4% net replacement rate (median earner)')",
      "worldBankCoverage": "string or null — World Bank coverage or pension assessment with year"
    },
    "iloConventionsRatified": "string — which ILO social security conventions this country has ratified, comma-separated (e.g. 'C102 (1952), C128 (1967), C168 (1988)') or 'None ratified' if applicable",
    "populationCovered": "string — approximate number of persons actively covered or receiving benefits (e.g. '175M active contributors + 67M beneficiaries')",
    "dataSources": [
      { "title": "string — source title", "url": "string — URL or 'N/A' for offline sources", "year": "string — publication year" }
    ] — 3-6 key sources used for this country's data
  }
]

QUALITY REQUIREMENTS:
- Ground all numerical scores in the SOURCE HIERARCHY defined in the system prompt.
- Cross-reference coverageRate with ILO World Social Protection Report data.
- Cross-reference replacementRate with OECD Pensions at a Glance methodology.
- Cross-reference maturityScore calibration with Mercer CFA Institute Global Pension Index grades.
- Use ILO Convention C102 benefit-branch terminology for benefitTypes.
- Include specific years and Act names in recentReforms and legislativeFramework.
- Where data gaps exist, flag them honestly in insights rather than fabricating precision.`;
}

export interface ContributionRates {
  employee: string;
  employer: string;
  government: string;
}

export interface RetirementAge {
  male: string;
  female: string;
  early: string;
}

export interface InternationalRankings {
  mercerIndex: string | null;
  oecdAdequacy: string | null;
  worldBankCoverage: string | null;
}

export interface DataSourceRef {
  title: string;
  url: string;
  year: string;
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
  legislativeFramework: string | null;
  contributionRates: ContributionRates | null;
  retirementAge: RetirementAge | null;
  benefitTypes: string[];
  fundManagement: string | null;
  recentReforms: string[];
  internationalRankings: InternationalRankings | null;
  iloConventionsRatified: string | null;
  populationCovered: string | null;
  dataSources: DataSourceRef[];
}

function parseObj<T>(val: unknown): T | null {
  if (val && typeof val === "object" && !Array.isArray(val)) return val as T;
  return null;
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
    legislativeFramework: item.legislativeFramework ? String(item.legislativeFramework) : null,
    contributionRates: parseObj<ContributionRates>(item.contributionRates),
    retirementAge: parseObj<RetirementAge>(item.retirementAge),
    benefitTypes: Array.isArray(item.benefitTypes) ? item.benefitTypes.map(String) : [],
    fundManagement: item.fundManagement ? String(item.fundManagement) : null,
    recentReforms: Array.isArray(item.recentReforms) ? item.recentReforms.map(String) : [],
    internationalRankings: parseObj<InternationalRankings>(item.internationalRankings),
    iloConventionsRatified: item.iloConventionsRatified ? String(item.iloConventionsRatified) : null,
    populationCovered: item.populationCovered ? String(item.populationCovered) : null,
    dataSources: Array.isArray(item.dataSources)
      ? item.dataSources
          .filter((s): s is Record<string, unknown> => s != null && typeof s === "object")
          .map((s) => ({
            title: String(s.title ?? ""),
            url: String(s.url ?? ""),
            year: String(s.year ?? ""),
          }))
      : [],
  }));
}
