export const RESEARCH_SYSTEM_PROMPT = `You are a senior social security and pension systems research analyst producing authoritative, publication-grade intelligence for a global pension observatory. Your research must meet the rigour, depth, and specificity expected by institutional investors, sovereign policy advisors, actuarial consultants, and multilateral development organisations such as the World Bank, ILO, OECD, and ISSA.

METHODOLOGY AND SOURCE HIERARCHY (use in strict priority order):
1. NATIONAL LEGISLATION & OFFICIAL GAZETTES — primary source for legislative framework, contribution rates, retirement ages, benefit eligibility rules, vesting requirements, indexation mechanisms. Always cite the specific Act/Law name, article/section number where relevant, and year of enactment and most recent amendment.
2. ILO WORLD SOCIAL PROTECTION DATABASE & REPORTS — for effective coverage rates, benefit adequacy, social protection expenditure (% of GDP), and coverage gaps by population segment. Use ILO's effective coverage definition: persons actually receiving benefits + active contributors as a percentage of the reference population.
3. OECD PENSIONS AT A GLANCE — for net replacement rates (use the median-earner, mandatory-schemes methodology), contribution rates, retirement ages, pension spending, old-age dependency ratios, and pension fund assets. Cite the edition year.
4. MERCER CFA INSTITUTE GLOBAL PENSION INDEX — for composite adequacy/sustainability/integrity scores, rankings, and letter grades. Cite the edition year and individual sub-scores for adequacy, sustainability, and integrity where available.
5. WORLD BANK PENSION CONCEPTUAL FRAMEWORK & GOVERNANCE INDICATORS — for multi-pillar classification (Pillar 0 social assistance through Pillar 4 informal support), system typology, and governance quality (Government Effectiveness, Regulatory Quality, Rule of Law indicators).
6. ISSA (INTERNATIONAL SOCIAL SECURITY ASSOCIATION) GUIDELINES — for governance quality, administrative efficiency, ICT maturity, and institutional best-practice benchmarks. Reference specific ISSA guideline categories where applicable.
7. NATIONAL SOCIAL SECURITY INSTITUTION REPORTS & ANNUAL REVIEWS — for operational data, digital platform metrics, fund size, asset allocation, investment returns, and recent reform implementation status.
8. ACADEMIC AND ACTUARIAL LITERATURE — for demographic projections, system dependency ratios, long-term sustainability analysis, and comparative policy studies.

SCORING CALIBRATION:
- maturityScore (1.0-4.0): Overall digital and institutional maturity
  - 3.5-4.0: Leader — Mercer Grade A/A+ systems, ISSA Good Practice Award recipients, fully digital-first, AI/ML integration, benchmark-setting governance (e.g., Netherlands, Iceland, Denmark, Singapore)
  - 2.5-3.4: Advanced — Mercer Grade B+/B, comprehensive digital platforms, strong service delivery, established multi-pillar architecture (e.g., Canada, Australia, Germany, UAE)
  - 1.5-2.4: Developing — Mercer Grade C+/C, some digital services, modernisation underway, structural reforms in progress (e.g., China, Brazil, South Africa)
  - 1.0-1.4: Emerging — Mercer Grade D or unranked, minimal digital infrastructure, basic paper-based processes, limited formal coverage
- coverageRate (0-100): Use ILO effective coverage definition — percentage of the reference population who are either active contributors or benefit recipients under mandatory schemes. Cross-reference with World Bank and national data. Specify the reference population used.
- replacementRate (0-100): Use OECD net replacement rate for a median earner under mandatory schemes (public + mandatory private). Where OECD data is unavailable, use ILO or national actuarial estimates and note the source methodology.
- sustainability (1.0-4.0): Long-term financial viability assessed against ILO actuarial balance principles and demographic trends
  - 3.5-4.0: Strong — fully funded or robust reserve fund, actuarially balanced for 50+ years, diversified funding sources, stable or favourable demographics
  - 2.5-3.4: Stable — adequately funded for medium term (20-50 years), parametric adjustments underway, manageable demographic pressure
  - 1.5-2.4: Challenged — structural reforms needed within 10-20 years, deficit trajectory, aging population stress, PAYG strain
  - 1.0-1.4: Critical — immediate solvency concerns, fund depletion projected within 10 years, severe demographic or fiscal crisis

DIGITAL LEVEL classification (aligned with ISSA ICT Guidelines tiers):
- "Traditional" — paper-based, minimal online presence, manual processes
- "Basic Digital" — informational website, limited online transactions
- "Digital-Enabled" — online portals with member self-service, some process automation
- "Digital-First" — mobile apps, full online service delivery, paperless operations, real-time data
- "AI-Integrated" — AI/ML for decision support, predictive analytics, proactive personalised services, chatbots, fraud detection

DEPTH AND QUALITY REQUIREMENTS:
- Treat every country as if you are writing a comprehensive country intelligence briefing that a pension policy advisor could rely on EXCLUSIVELY as their sole source of information.
- Every item in keyFeatures, challenges, insights, and recentReforms must be a SUBSTANTIVE, SPECIFIC statement (2-3 sentences minimum) with concrete data points, specific years, names of programmes/acts, and quantitative metrics wherever possible.
- NEVER produce one-sentence bullet points or generic statements. Each item should read like a paragraph from an authoritative policy brief.
- ALL numerical scores must be grounded in published data from the sources above. Where data is sparse or estimates are used, note this with a confidence qualifier and explain the basis for the estimate by citing comparable countries.
- Do NOT fabricate statistics. If a metric is genuinely unknown, use your best informed estimate based on comparable countries in the same income bracket and region, and flag it explicitly as an estimate.
- Include the full historical context for each system: founding, major evolution phases, current trajectory, and planned future changes.
- You MUST respond with valid JSON only. No markdown, no commentary outside the JSON structure.`;

export function buildUserPrompt(countryNames: string[]): string {
  const list = countryNames.map((n, i) => `${i + 1}. ${n}`).join("\n");
  const singular = countryNames.length === 1;

  return `Conduct a comprehensive, publication-grade research analysis on the social security and pension system${singular ? "" : "s"} for the following ${singular ? "country" : "countries"}. This data powers BOTH a global comparison atlas AND a dedicated in-depth country intelligence page. Every field must be thoroughly researched and deeply detailed — allocate your FULL analytical capacity.

${list}

Return EXACTLY this JSON structure ${singular ? "(as a single-element array)" : "for each country (as an array)"}:
[
  {
    "countryName": "string — exact country name as provided above",
    "institution": "string — full name of ALL primary social security / pension institutions, comma-separated if multiple (e.g. 'Social Security Administration (SSA), Pension Benefit Guaranty Corporation (PBGC)')",
    "systemType": "string — detailed multi-pillar description using World Bank terminology (e.g. 'Multi-pillar: Zero Pillar (social assistance pension) + Pillar 1 (PAYG DB public pension) + Pillar 2 (Mandatory funded DC occupational) + Pillar 3 (Voluntary tax-advantaged personal pension)')",
    "yearEstablished": number or null,
    "maturityScore": number (1.0-4.0, calibrated against Mercer grades per system prompt),
    "maturityLabel": "Emerging" | "Developing" | "Advanced" | "Leader",
    "coverageRate": number (0-100, ILO effective coverage definition),
    "replacementRate": number (0-100, OECD net replacement rate for median earner under mandatory schemes),
    "sustainability": number (1.0-4.0, ILO actuarial balance principles),
    "digitalLevel": "Traditional" | "Basic Digital" | "Digital-Enabled" | "Digital-First" | "AI-Integrated",

    "keyFeatures": ["string", ...] — 8-12 distinctive features. EACH must be 2-3 detailed sentences with specific data (enrollment numbers, fund sizes, unique design elements, comparison metrics). Example: "The system's Pillar 2 component, established under the Superannuation Guarantee Act 1992 and currently set at 11.5% of ordinary time earnings (rising to 12% by July 2025), has accumulated A$3.5 trillion in assets as of 2024, making it the fourth-largest pension pool globally. Members have full choice of fund and investment option, with MySuper default products required to offer lifecycle strategies and capped fees.",

    "challenges": ["string", ...] — 8-12 current challenges and risks. EACH must be 2-3 detailed sentences identifying the specific challenge, quantifying its impact, and citing evidence. Example: "The old-age dependency ratio is projected to rise from 28.3% (2023) to 41.2% by 2050 (UN World Population Prospects 2022), placing severe strain on the PAYG component. The system dependency ratio (beneficiaries per active contributor) has deteriorated from 1:4.2 in 2000 to 1:3.1 in 2023, with actuarial projections forecasting a public pension fund deficit by 2038 without parametric reform.",

    "insights": ["string", ...] — 8-12 recent innovations, reforms, developments, and notable policy directions. EACH must be 2-3 detailed sentences with specific years, programme names, and outcomes. Example: "In 2023, the government launched the Digital Pension Dashboard initiative under the Pension Schemes Act 2021, enabling 28 million active members to view all their pension entitlements in a single portal. Early adoption data showed 4.2 million unique users in the first six months, with a 23% increase in voluntary contribution top-ups attributed to improved visibility of projected retirement income gaps.",

    "legislativeFramework": "string — comprehensive description of ALL key legislation governing the pension system, including original enacting legislation, major amendments, and most recent reforms. Include Act names, years, and article/section references where relevant.",

    "contributionRates": {
      "employee": "string — detailed employee contribution rate with basis, ceiling, and any variations (e.g. '6.2% of gross earnings up to the Social Security Wage Base of $168,600 (2024), plus 1.45% HI tax with no ceiling; additional 0.9% HI surtax on earnings above $200,000')",
      "employer": "string — detailed employer contribution rate with basis and ceiling (e.g. '6.2% matching OASDI on same wage base, plus 1.45% HI; total employer+employee OASDI rate: 12.4%')",
      "government": "string — government subsidy, guarantee, or co-financing description with amounts/percentages if applicable, or 'None / No explicit government subsidy (system is self-financing through payroll taxes)'"
    },

    "retirementAge": {
      "male": "string — statutory/normal retirement age with any scheduled increases (e.g. '67 for those born 1960 or later; gradually increasing from 65 for earlier birth cohorts')",
      "female": "string — statutory/normal retirement age with any scheduled increases",
      "early": "string — earliest possible retirement age with all conditions, penalties, and exceptions (e.g. '62 with permanently reduced benefits of 6.67% per year for first 3 years early, 5% per year thereafter; special provisions for long-service workers with 45+ contribution years')"
    },

    "benefitTypes": ["string", ...] — list ALL social security branches provided using ILO Convention C102 terminology. Include: old-age pension, invalidity/disability pension, survivors pension, sickness/health benefits, maternity benefits, employment injury/workers compensation, unemployment benefits, family/child benefits, and any supplementary schemes,

    "fundManagement": "string — detailed description of how pension funds are managed: governance structure, total fund size with year, asset allocation breakdown (equities/bonds/alternatives/real estate/infrastructure), investment return history (3-year and 10-year averages if available), responsible investment policies (ESG/PRI), and management model (government-managed vs. independent board vs. private fund managers).",

    "recentReforms": ["string", ...] — 6-10 most significant recent (last 10 years) or planned reforms. EACH must be 2-3 sentences with the reform name, year, legislative vehicle, and impact/outcome.,

    "internationalRankings": {
      "mercerIndex": "string or null — include edition year, overall rank, letter grade, and individual sub-scores for adequacy, sustainability, and integrity where available (e.g. 'Mercer 2024: Rank 5, Grade A, Overall 84.3 — Adequacy: 85.9, Sustainability: 78.2, Integrity: 90.1')",
      "oecdAdequacy": "string or null — OECD net replacement rate with methodology details and year (e.g. 'OECD 2023: 58.4% net replacement rate (median earner, mandatory public + mandatory private)')",
      "worldBankCoverage": "string or null — World Bank pension assessment, coverage data, or GovTech maturity index with year"
    },

    "socialProtectionExpenditure": "string — total social protection expenditure as % of GDP with breakdown if available (e.g. 'Total: 18.7% of GDP (2022) — pensions: 10.4%, health: 5.8%, unemployment: 1.2%, other: 1.3% (Source: ILO World Social Protection Report 2024)')",

    "dependencyRatio": "string — old-age dependency ratio (65+/15-64) current and projected (e.g. 'Current: 31.2% (2023); Projected: 47.8% by 2050; System dependency ratio: 1 pensioner per 2.8 contributors (Source: UN WPP 2022)')",

    "pensionFundAssets": "string — total pension fund assets as % of GDP and absolute amount (e.g. 'Total pension assets: 173.3% of GDP ($5.6T, 2023) (Source: OECD Global Pension Statistics 2024)')",

    "benefitCalculation": "string — detailed benefit formula/methodology (e.g. 'DB Pillar 1: Average of highest 35 years of indexed earnings x accrual rate of 1.5% per year (max 40 years = 60% replacement). Earnings indexed to average wage growth. Actuarial reduction of 6% per year for early retirement. Minimum pension guarantee: EUR 950/month for 30+ contribution years.')",

    "indexationMechanism": "string — how pensions are adjusted over time (e.g. 'Annual adjustment linked to CPI or average wage growth, whichever is lower. Sustainability factor of -1.1pp applied. Floor: 0% (no negative adjustment). Last adjustment: +3.4% in January 2024.')",

    "vestingPeriod": "string — minimum contribution period for benefit eligibility across benefit types (e.g. 'Old-age pension: minimum 10 years for partial, 25 years for full; Disability: 15 years; Survivors: 5 years. Non-contributory social pension requires 40 years of legal residence from age 16.')",

    "governanceQuality": "string — governance quality assessment referencing World Bank Government Effectiveness percentile, ISSA Good Governance compliance, actuarial review frequency, board composition (tripartite/independent), and audit standards.",

    "iloConventionsRatified": "string — which ILO social security conventions this country has ratified with ratification years (e.g. 'C102 Social Security Minimum Standards 1952 (ratified 1958), C128 Invalidity, Old-Age and Survivors Benefits 1967 (ratified 1969)') or 'None ratified'",

    "populationCovered": "string — detailed coverage breakdown (e.g. '32.4M active contributors + 14.8M old-age pensioners + 3.2M disability pensioners + 5.1M survivors pension beneficiaries = 55.5M total. Working-age coverage rate: 78.3%. Major exclusions: ~5M informal sector workers.')",

    "dataSources": [
      { "title": "string", "url": "string — URL or N/A", "year": "string" }
    ] — 5-10 key sources used, prioritizing official government publications, ILO, OECD, Mercer, and World Bank reports
  }
]

QUALITY REQUIREMENTS:
- This is a DEEP DIVE into ${singular ? "a single country" : "each country individually"}. Allocate your FULL analytical capacity to producing the most thorough, authoritative profile possible.
- Ground ALL numerical scores in the SOURCE HIERARCHY defined in the system prompt. Cross-reference every major metric with at least two independent sources.
- Cross-reference coverageRate with ILO World Social Protection Report data AND national statistics.
- Cross-reference replacementRate with OECD Pensions at a Glance methodology AND national actuarial reports.
- Cross-reference maturityScore calibration with Mercer CFA Institute Global Pension Index grades AND ISSA benchmarks.
- Use ILO Convention C102 benefit-branch terminology for benefitTypes.
- Include specific years, Act/Law names, and article references in recentReforms and legislativeFramework.
- Every item in keyFeatures, challenges, insights, and recentReforms must be SUBSTANTIVE (2-3 sentences with specific data) — never generic one-liners.
- Where data gaps exist, flag them honestly in insights rather than fabricating precision, and cite comparable countries used for estimation.
- Include historical context: when the system was founded, major evolution phases, and current reform trajectory.`;
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
  socialProtectionExpenditure: string | null;
  dependencyRatio: string | null;
  pensionFundAssets: string | null;
  benefitCalculation: string | null;
  indexationMechanism: string | null;
  vestingPeriod: string | null;
  governanceQuality: string | null;
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
    socialProtectionExpenditure: item.socialProtectionExpenditure ? String(item.socialProtectionExpenditure) : null,
    dependencyRatio: item.dependencyRatio ? String(item.dependencyRatio) : null,
    pensionFundAssets: item.pensionFundAssets ? String(item.pensionFundAssets) : null,
    benefitCalculation: item.benefitCalculation ? String(item.benefitCalculation) : null,
    indexationMechanism: item.indexationMechanism ? String(item.indexationMechanism) : null,
    vestingPeriod: item.vestingPeriod ? String(item.vestingPeriod) : null,
    governanceQuality: item.governanceQuality ? String(item.governanceQuality) : null,
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
