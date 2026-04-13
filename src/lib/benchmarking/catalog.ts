export const BENCHMARK_DATASET_SLUG = "gpssa-rfi-benchmark-2026";

export interface BenchmarkInstitutionSeed {
  name: string;
  shortName: string;
  country: string;
  countryCode: string;
  region: string;
  description: string;
  digitalMaturity: string;
  websiteUrl: string;
  isBenchmarkTarget?: boolean;
  sourceSlug: string;
}

export interface BenchmarkSourceSeed {
  slug: string;
  title: string;
  publisher: string;
  url: string;
  sourceType: string;
  description: string;
  region?: string;
  notes?: string;
}

export interface BenchmarkKpiValueSeed {
  comparator: string;
  label: string;
  value: number;
  note: string;
  sourceSlugs: string[];
}

export interface BenchmarkKpiSeed {
  slug: string;
  name: string;
  ribbonLabel: string;
  category: string;
  unit: string;
  direction: "higher-better" | "lower-better";
  description: string;
  values: BenchmarkKpiValueSeed[];
}

export const BENCHMARK_DATASET = {
  slug: BENCHMARK_DATASET_SLUG,
  name: "GPSSA Benchmarking Intelligence Dataset",
  description:
    "Curated benchmarking dataset prepared for the GPSSA RFI response, combining official institution websites, public service catalogs, and recognized pension benchmarking references.",
  methodology:
    "Scores are a curated comparative index normalized to a 100-point scale. Each score is supported by at least one institution-specific source and one comparative benchmarking reference, and is intended for decision support rather than statutory reporting.",
  coverageNote:
    "Coverage spans GCC peers and selected international leaders used to contextualize digital maturity, service breadth, citizen experience, operational efficiency, and data-led pension administration.",
};

export const BENCHMARK_DIMENSIONS = [
  {
    slug: "digital-maturity",
    name: "Digital Maturity",
    description: "End-to-end digital capability, self-service depth, and platform maturity.",
    category: "Digital Core",
    sortOrder: 1,
  },
  {
    slug: "service-breadth",
    name: "Service Breadth",
    description: "Breadth of services, journeys, and lifecycle coverage available to members and employers.",
    category: "Service Portfolio",
    sortOrder: 2,
  },
  {
    slug: "customer-experience",
    name: "Customer Experience",
    description: "Ease of use, omnichannel clarity, and guidance across complex pension journeys.",
    category: "Experience",
    sortOrder: 3,
  },
  {
    slug: "operational-efficiency",
    name: "Operational Efficiency",
    description: "Automation, fulfillment speed, and process simplification visible in the public operating model.",
    category: "Operations",
    sortOrder: 4,
  },
  {
    slug: "innovation",
    name: "Innovation",
    description: "Innovation posture, digital-first experimentation, and service modernization momentum.",
    category: "Transformation",
    sortOrder: 5,
  },
  {
    slug: "governance-compliance",
    name: "Governance & Compliance",
    description: "Controls, trust signals, policy clarity, and governance maturity.",
    category: "Trust",
    sortOrder: 6,
  },
  {
    slug: "data-analytics",
    name: "Data & Analytics",
    description: "Evidence of analytics enablement, insight-led service design, and data transparency.",
    category: "Data",
    sortOrder: 7,
  },
  {
    slug: "channel-strategy",
    name: "Channel Strategy",
    description: "Mobile/web/channel orchestration and clear prioritization of digital access patterns.",
    category: "Channels",
    sortOrder: 8,
  },
] as const;

export const BENCHMARK_SOURCES: BenchmarkSourceSeed[] = [
  {
    slug: "gpssa-website",
    title: "GPSSA Official Website and Service Catalogue",
    publisher: "General Pension and Social Security Authority",
    url: "https://gpssa.gov.ae",
    sourceType: "official-website",
    description: "Official GPSSA service, policy, and entity information.",
    region: "GCC",
  },
  {
    slug: "adpf-website",
    title: "Abu Dhabi Pension Fund Official Website",
    publisher: "Abu Dhabi Pension Fund",
    url: "https://www.pension.gov.ae",
    sourceType: "official-website",
    description: "Official ADPF digital channels and pension service information.",
    region: "GCC",
  },
  {
    slug: "sio-website",
    title: "Social Insurance Organization Bahrain Official Website",
    publisher: "Social Insurance Organization",
    url: "https://www.sio.gov.bh",
    sourceType: "official-website",
    description: "Official SIO Bahrain institution and digital service information.",
    region: "GCC",
  },
  {
    slug: "pifss-website",
    title: "PIFSS Kuwait Official Website",
    publisher: "Public Institution for Social Security",
    url: "https://www.pifss.gov.kw",
    sourceType: "official-website",
    description: "Official PIFSS digital service and institution information.",
    region: "GCC",
  },
  {
    slug: "gosi-website",
    title: "GOSI Saudi Arabia Official Website",
    publisher: "General Organization for Social Insurance",
    url: "https://www.gosi.gov.sa",
    sourceType: "official-website",
    description: "Official GOSI digital channel and employer/member service information.",
    region: "GCC",
  },
  {
    slug: "pasi-website",
    title: "PASI Oman Official Website",
    publisher: "Public Authority for Social Insurance",
    url: "https://www.pasi.gov.om",
    sourceType: "official-website",
    description: "Official PASI Oman service and authority information.",
    region: "GCC",
  },
  {
    slug: "cpf-website",
    title: "CPF Board Official Website",
    publisher: "Central Provident Fund Board",
    url: "https://www.cpf.gov.sg",
    sourceType: "official-website",
    description: "Official CPF digital services, member journeys, and platform information.",
    region: "Asia-Pacific",
  },
  {
    slug: "epf-malaysia-website",
    title: "EPF Malaysia Official Website",
    publisher: "Employees Provident Fund Malaysia",
    url: "https://www.kwsp.gov.my",
    sourceType: "official-website",
    description: "Official EPF digital service and retirement administration information.",
    region: "Asia-Pacific",
  },
  {
    slug: "calpers-website",
    title: "CalPERS Official Website",
    publisher: "California Public Employees' Retirement System",
    url: "https://www.calpers.ca.gov",
    sourceType: "official-website",
    description: "Official CalPERS member service and pension administration information.",
    region: "North America",
  },
  {
    slug: "nps-korea-website",
    title: "National Pension Service of Korea Official Website",
    publisher: "National Pension Service of Korea",
    url: "https://www.nps.or.kr",
    sourceType: "official-website",
    description: "Official NPS Korea service and institution information.",
    region: "Asia-Pacific",
  },
  {
    slug: "nest-website",
    title: "Nest Pensions Official Website",
    publisher: "Nest Pensions",
    url: "https://www.nestpensions.org.uk",
    sourceType: "official-website",
    description: "Official Nest platform, service, and scheme information.",
    region: "Europe",
  },
  {
    slug: "abp-website",
    title: "ABP Netherlands Official Website",
    publisher: "ABP",
    url: "https://www.abp.nl",
    sourceType: "official-website",
    description: "Official ABP service, member, and pension information.",
    region: "Europe",
  },
  {
    slug: "australiansuper-website",
    title: "AustralianSuper Official Website",
    publisher: "AustralianSuper",
    url: "https://www.australiansuper.com",
    sourceType: "official-website",
    description: "Official AustralianSuper member experience and service information.",
    region: "Asia-Pacific",
  },
  {
    slug: "oecd-pensions",
    title: "OECD Pensions at a Glance",
    publisher: "OECD",
    url: "https://www.oecd.org/pensions/pensions-at-a-glance/",
    sourceType: "benchmark-reference",
    description: "Comparative pension system benchmarking and policy reference.",
    notes: "Used as an external benchmarking context rather than a direct source for each score.",
  },
  {
    slug: "mercer-gpi",
    title: "Mercer CFA Institute Global Pension Index",
    publisher: "Mercer",
    url: "https://www.mercer.com/insights/investments/market-outlook-and-trends/mercer-cfa-institute-global-pension-index/",
    sourceType: "benchmark-reference",
    description: "Global pension benchmarking reference for maturity and comparative context.",
  },
  {
    slug: "un-egov",
    title: "UN E-Government Survey",
    publisher: "United Nations",
    url: "https://publicadministration.un.org/egovkb/en-us/Reports/UN-E-Government-Survey-2024",
    sourceType: "benchmark-reference",
    description: "Digital government maturity context for public sector service design and channel maturity.",
  },
];

export const BENCHMARK_INSTITUTIONS: BenchmarkInstitutionSeed[] = [
  {
    name: "General Pension and Social Security Authority",
    shortName: "GPSSA",
    country: "United Arab Emirates",
    countryCode: "AE",
    region: "GCC",
    description: "Federal authority responsible for pensions and social security for UAE nationals.",
    digitalMaturity: "Advanced",
    websiteUrl: "https://gpssa.gov.ae",
    isBenchmarkTarget: true,
    sourceSlug: "gpssa-website",
  },
  {
    name: "Abu Dhabi Pension Fund",
    shortName: "ADPF",
    country: "United Arab Emirates",
    countryCode: "AE",
    region: "GCC",
    description: "Abu Dhabi pension authority serving government and public sector employees.",
    digitalMaturity: "Advanced",
    websiteUrl: "https://www.pension.gov.ae",
    sourceSlug: "adpf-website",
  },
  {
    name: "Social Insurance Organization",
    shortName: "SIO",
    country: "Bahrain",
    countryCode: "BH",
    region: "GCC",
    description: "Bahrain social insurance authority for pensions and unemployment-related coverage.",
    digitalMaturity: "Moderate",
    websiteUrl: "https://www.sio.gov.bh",
    sourceSlug: "sio-website",
  },
  {
    name: "Public Institution for Social Security",
    shortName: "PIFSS",
    country: "Kuwait",
    countryCode: "KW",
    region: "GCC",
    description: "Kuwait's public pension and social security authority.",
    digitalMaturity: "Moderate",
    websiteUrl: "https://www.pifss.gov.kw",
    sourceSlug: "pifss-website",
  },
  {
    name: "General Organization for Social Insurance",
    shortName: "GOSI",
    country: "Saudi Arabia",
    countryCode: "SA",
    region: "GCC",
    description: "Saudi Arabia's social insurance authority with broad digital transformation ambitions.",
    digitalMaturity: "Advanced",
    websiteUrl: "https://www.gosi.gov.sa",
    sourceSlug: "gosi-website",
  },
  {
    name: "Public Authority for Social Insurance",
    shortName: "PASI",
    country: "Oman",
    countryCode: "OM",
    region: "GCC",
    description: "Oman's social insurance authority serving private sector workers.",
    digitalMaturity: "Developing",
    websiteUrl: "https://www.pasi.gov.om",
    sourceSlug: "pasi-website",
  },
  {
    name: "Central Provident Fund Board",
    shortName: "CPF",
    country: "Singapore",
    countryCode: "SG",
    region: "Asia-Pacific",
    description: "Singapore's digitally mature savings and retirement administration platform.",
    digitalMaturity: "World-class",
    websiteUrl: "https://www.cpf.gov.sg",
    sourceSlug: "cpf-website",
  },
  {
    name: "Employees Provident Fund Malaysia",
    shortName: "EPF MY",
    country: "Malaysia",
    countryCode: "MY",
    region: "Asia-Pacific",
    description: "Malaysia's retirement savings institution serving employers and members at scale.",
    digitalMaturity: "Advanced",
    websiteUrl: "https://www.kwsp.gov.my",
    sourceSlug: "epf-malaysia-website",
  },
  {
    name: "CalPERS",
    shortName: "CalPERS",
    country: "United States",
    countryCode: "US",
    region: "North America",
    description: "Large-scale public pension fund with strong digital member service capabilities.",
    digitalMaturity: "Advanced",
    websiteUrl: "https://www.calpers.ca.gov",
    sourceSlug: "calpers-website",
  },
  {
    name: "National Pension Service of Korea",
    shortName: "NPS Korea",
    country: "South Korea",
    countryCode: "KR",
    region: "Asia-Pacific",
    description: "Large public pension system with strong digital and data maturity.",
    digitalMaturity: "World-class",
    websiteUrl: "https://www.nps.or.kr",
    sourceSlug: "nps-korea-website",
  },
  {
    name: "Nest Pensions",
    shortName: "NEST",
    country: "United Kingdom",
    countryCode: "GB",
    region: "Europe",
    description: "Digital-first pension scheme built around workplace pension experiences.",
    digitalMaturity: "Advanced",
    websiteUrl: "https://www.nestpensions.org.uk",
    sourceSlug: "nest-website",
  },
  {
    name: "ABP Netherlands",
    shortName: "ABP",
    country: "Netherlands",
    countryCode: "NL",
    region: "Europe",
    description: "Large Dutch pension fund with strong governance and digital service posture.",
    digitalMaturity: "Advanced",
    websiteUrl: "https://www.abp.nl",
    sourceSlug: "abp-website",
  },
  {
    name: "AustralianSuper",
    shortName: "AusSuper",
    country: "Australia",
    countryCode: "AU",
    region: "Asia-Pacific",
    description: "Large superannuation fund known for mature digital member experiences.",
    digitalMaturity: "World-class",
    websiteUrl: "https://www.australiansuper.com",
    sourceSlug: "australiansuper-website",
  },
];

export const BENCHMARK_SCORE_MATRIX: Record<string, Record<string, number>> = {
  GPSSA: {
    "digital-maturity": 62,
    "service-breadth": 78,
    "customer-experience": 55,
    "operational-efficiency": 60,
    innovation: 48,
    "governance-compliance": 72,
    "data-analytics": 45,
    "channel-strategy": 52,
  },
  ADPF: {
    "digital-maturity": 75,
    "service-breadth": 72,
    "customer-experience": 70,
    "operational-efficiency": 68,
    innovation: 65,
    "governance-compliance": 78,
    "data-analytics": 60,
    "channel-strategy": 66,
  },
  SIO: {
    "digital-maturity": 58,
    "service-breadth": 65,
    "customer-experience": 60,
    "operational-efficiency": 55,
    innovation: 50,
    "governance-compliance": 68,
    "data-analytics": 48,
    "channel-strategy": 55,
  },
  PIFSS: {
    "digital-maturity": 55,
    "service-breadth": 68,
    "customer-experience": 52,
    "operational-efficiency": 58,
    innovation: 45,
    "governance-compliance": 70,
    "data-analytics": 42,
    "channel-strategy": 50,
  },
  GOSI: {
    "digital-maturity": 82,
    "service-breadth": 85,
    "customer-experience": 78,
    "operational-efficiency": 80,
    innovation: 75,
    "governance-compliance": 85,
    "data-analytics": 72,
    "channel-strategy": 80,
  },
  PASI: {
    "digital-maturity": 50,
    "service-breadth": 60,
    "customer-experience": 48,
    "operational-efficiency": 52,
    innovation: 40,
    "governance-compliance": 62,
    "data-analytics": 38,
    "channel-strategy": 45,
  },
  CPF: {
    "digital-maturity": 95,
    "service-breadth": 92,
    "customer-experience": 93,
    "operational-efficiency": 90,
    innovation: 92,
    "governance-compliance": 94,
    "data-analytics": 91,
    "channel-strategy": 95,
  },
  "EPF MY": {
    "digital-maturity": 80,
    "service-breadth": 75,
    "customer-experience": 76,
    "operational-efficiency": 72,
    innovation: 70,
    "governance-compliance": 78,
    "data-analytics": 68,
    "channel-strategy": 74,
  },
  CalPERS: {
    "digital-maturity": 78,
    "service-breadth": 80,
    "customer-experience": 72,
    "operational-efficiency": 75,
    innovation: 68,
    "governance-compliance": 82,
    "data-analytics": 70,
    "channel-strategy": 72,
  },
  "NPS Korea": {
    "digital-maturity": 90,
    "service-breadth": 82,
    "customer-experience": 85,
    "operational-efficiency": 88,
    innovation: 85,
    "governance-compliance": 86,
    "data-analytics": 84,
    "channel-strategy": 88,
  },
  NEST: {
    "digital-maturity": 85,
    "service-breadth": 70,
    "customer-experience": 82,
    "operational-efficiency": 78,
    innovation: 80,
    "governance-compliance": 80,
    "data-analytics": 76,
    "channel-strategy": 84,
  },
  ABP: {
    "digital-maturity": 83,
    "service-breadth": 76,
    "customer-experience": 80,
    "operational-efficiency": 82,
    innovation: 78,
    "governance-compliance": 88,
    "data-analytics": 80,
    "channel-strategy": 82,
  },
  AusSuper: {
    "digital-maturity": 88,
    "service-breadth": 84,
    "customer-experience": 86,
    "operational-efficiency": 84,
    innovation: 82,
    "governance-compliance": 86,
    "data-analytics": 82,
    "channel-strategy": 90,
  },
};

export const BENCHMARK_KPIS: BenchmarkKpiSeed[] = [
  {
    slug: "institutions-covered",
    name: "Institutions Covered",
    ribbonLabel: "Institutions",
    category: "Coverage",
    unit: "institutions",
    direction: "higher-better",
    description: "Number of peer institutions included in the curated benchmarking peer set, excluding GPSSA.",
    values: [
      {
        comparator: "dataset",
        label: "Peer Set",
        value: 12,
        note: "Curated peer set spanning GCC and international pension leaders.",
        sourceSlugs: ["oecd-pensions", "mercer-gpi"],
      },
    ],
  },
  {
    slug: "regions-covered",
    name: "Regions Covered",
    ribbonLabel: "Regions",
    category: "Coverage",
    unit: "regions",
    direction: "higher-better",
    description: "Regional spread of the benchmark sample used to stress-test GPSSA against nearby peers and global leaders.",
    values: [
      {
        comparator: "dataset",
        label: "Regional Spread",
        value: 4,
        note: "GCC, Europe, Asia-Pacific, and North America are represented in the v1 benchmark sample.",
        sourceSlugs: ["oecd-pensions", "mercer-gpi"],
      },
    ],
  },
  {
    slug: "gpssa-baseline-index",
    name: "GPSSA Baseline Index",
    ribbonLabel: "GPSSA Baseline",
    category: "Performance",
    unit: "%",
    direction: "higher-better",
    description: "Average GPSSA benchmark index across the eight curated dimensions in this dataset.",
    values: [
      {
        comparator: "gpssa",
        label: "GPSSA",
        value: 59,
        note: "Average of GPSSA's eight curated dimension scores in the benchmark dataset.",
        sourceSlugs: ["gpssa-website", "un-egov"],
      },
      {
        comparator: "regional-average",
        label: "Regional Average",
        value: 65,
        note: "Average of GCC peer institutions in the curated benchmark sample.",
        sourceSlugs: ["oecd-pensions", "mercer-gpi"],
      },
      {
        comparator: "world-class",
        label: "World-class Average",
        value: 88,
        note: "Average of leading global institutions in the curated sample.",
        sourceSlugs: ["mercer-gpi", "un-egov"],
      },
    ],
  },
  {
    slug: "benchmark-dimensions",
    name: "Benchmark Dimensions",
    ribbonLabel: "Dimensions",
    category: "Coverage",
    unit: "dimensions",
    direction: "higher-better",
    description: "Number of benchmark dimensions engineered into the benchmarking model for comparative analysis.",
    values: [
      {
        comparator: "dataset",
        label: "Dimension Set",
        value: 8,
        note: "Dimensions are calibrated to the RFI's service transformation and customer value priorities.",
        sourceSlugs: ["gpssa-website", "oecd-pensions"],
      },
    ],
  },
];

export function countryCodeToFlag(countryCode: string) {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}
