import { prisma } from "@/lib/db";
import { COUNTRIES } from "@/lib/countries/catalog";
import type { ScreenType } from "./types";

interface DispatchItem {
  key: string;
  label: string;
  context?: string;
}

async function getItemsForScreen(screenType: ScreenType): Promise<DispatchItem[]> {
  switch (screenType) {
    case "atlas-worldmap":
    case "atlas-system":
    case "atlas-performance":
    case "atlas-insights": {
      const statusField =
        screenType === "atlas-system"
          ? "systemStatus"
          : screenType === "atlas-performance"
            ? "performanceStatus"
            : screenType === "atlas-insights"
              ? "insightsStatus"
              : "researchStatus";

      // Ensure full catalog is upserted before dispatching
      const total = await prisma.country.count();
      if (total === 0) {
        for (const c of COUNTRIES) {
          await prisma.country.upsert({
            where: { iso3: c.iso3 },
            update: {},
            create: { iso3: c.iso3, iso2: c.iso2, name: c.name, flag: c.flag, region: c.region, subRegion: c.subRegion },
          });
        }
      }

      const countries = await prisma.country.findMany({
        where: { [statusField]: { in: ["pending", "failed"] } } as Record<string, unknown>,
        select: { iso3: true, name: true },
        orderBy: { name: "asc" },
      });
      return countries.map((c) => ({ key: c.iso3, label: c.name }));
    }

    case "atlas-benchmarking": {
      const institutions = await prisma.institution.findMany({
        select: { id: true, name: true, country: true },
        orderBy: { name: "asc" },
      });
      if (institutions.length > 0) {
        return institutions.map((i) => ({ key: i.id, label: i.name, context: i.country }));
      }
      return [
        { key: "gpssa", label: "General Pension and Social Security Authority (GPSSA)", context: "UAE" },
        { key: "gosi", label: "General Organization for Social Insurance (GOSI)", context: "Saudi Arabia" },
        { key: "sio", label: "Social Insurance Organization (SIO)", context: "Bahrain" },
        { key: "pifss", label: "Public Institution for Social Security (PIFSS)", context: "Kuwait" },
        { key: "cpf", label: "Central Provident Fund (CPF)", context: "Singapore" },
        { key: "superannuation", label: "Australian Super System", context: "Australia" },
      ];
    }

    case "services-catalog":
    case "services-channels": {
      const total = await prisma.country.count();
      if (total === 0) {
        for (const c of COUNTRIES) {
          await prisma.country.upsert({
            where: { iso3: c.iso3 },
            update: {},
            create: { iso3: c.iso3, iso2: c.iso2, name: c.name, flag: c.flag, region: c.region, subRegion: c.subRegion },
          });
        }
      }
      const allCountries = await prisma.country.findMany({
        select: { iso3: true, name: true },
        orderBy: { name: "asc" },
      });

      // Pending = country has 0 completed InternationalService records yet.
      // Avoids re-spending tokens on already-researched countries.
      const completedRows = await prisma.internationalService.groupBy({
        by: ["countryIso3"],
        where: { researchStatus: "completed" },
        _count: { _all: true },
      });
      const completedSet = new Set(completedRows.map((r) => r.countryIso3));
      const pending = allCountries.filter((c) => !completedSet.has(c.iso3));

      const target = pending.length > 0 ? pending : allCountries;
      return target.map((c) => ({ key: c.iso3, label: c.name }));
    }

    case "products-portfolio": {
      const products = await prisma.product.findMany({
        where: { researchStatus: { in: ["pending", "failed"] } },
        select: { id: true, name: true, tier: true },
        orderBy: { name: "asc" },
      });
      if (products.length > 0) {
        return products.map((p) => ({ key: p.id, label: p.name, context: p.tier }));
      }
      return DEFAULT_PRODUCTS.map((p) => ({ key: p.name, label: p.name, context: p.tier }));
    }

    case "products-segments": {
      return DEFAULT_SEGMENTS.map((s) => ({
        key: `${s.segment}::${s.coverageType}`,
        label: s.segment,
        context: s.coverageType,
      }));
    }

    case "delivery-channels": {
      const channels = await prisma.deliveryChannel.findMany({
        where: { researchStatus: { in: ["pending", "failed"] } },
        select: { id: true, name: true, channelType: true },
        orderBy: { name: "asc" },
      });
      if (channels.length > 0) {
        return channels.map((c) => ({ key: c.id, label: c.name, context: c.channelType }));
      }
      return DEFAULT_CHANNELS.map((c) => ({ key: c.name, label: c.name, context: c.type }));
    }

    case "delivery-personas": {
      const personas = await prisma.customerPersona.findMany({
        where: { researchStatus: { in: ["pending", "failed"] } },
        select: { id: true, name: true, segment: true },
        orderBy: { name: "asc" },
      });
      if (personas.length > 0) {
        return personas.map((p) => ({ key: p.id, label: p.name, context: p.segment ?? undefined }));
      }
      return DEFAULT_PERSONAS.map((p) => ({ key: p.name, label: p.name, context: p.segment }));
    }

    case "delivery-models": {
      const models = await prisma.deliveryModel.findMany({
        where: { researchStatus: { in: ["pending", "failed"] } },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      });
      if (models.length > 0) {
        return models.map((m) => ({ key: m.id, label: m.name }));
      }
      return DEFAULT_DELIVERY_MODELS.map((m) => ({ key: m.name, label: m.name, context: m.focus }));
    }

    case "intl-services-catalog":
    case "intl-services-channels":
    case "intl-products-portfolio": {
      const institutions = await prisma.institution.findMany({
        select: { id: true, name: true, country: true, countryCode: true },
        orderBy: { name: "asc" },
      });
      if (institutions.length > 0) {
        return institutions.map((i) => ({ key: i.id, label: i.name, context: i.country }));
      }
      return DEFAULT_INTL_INSTITUTIONS.map((i) => ({ key: i.key, label: i.label, context: i.country }));
    }

    case "intl-products-segments": {
      return DEFAULT_INTL_COUNTRIES.map((c) => ({ key: c.iso3, label: c.name, context: c.region }));
    }

    case "ilo-standards": {
      return DEFAULT_ILO_STANDARDS.map((s) => ({ key: s.code, label: s.title, context: s.category }));
    }

    default:
      return [];
  }
}

export async function createScreenResearchJob(
  agentConfigId: string,
  model?: string
): Promise<string> {
  const agent = await prisma.agentConfig.findUnique({ where: { id: agentConfigId } });
  if (!agent || !agent.targetScreen) {
    throw new Error("Agent not found or has no targetScreen assigned");
  }

  const screenType = agent.targetScreen as ScreenType;
  const items = await getItemsForScreen(screenType);

  if (items.length === 0) {
    throw new Error(`No items to research for screen: ${screenType}`);
  }

  const job = await prisma.researchJob.create({
    data: {
      type: screenType,
      status: "running",
      totalItems: items.length,
      model: model ?? agent.model,
      batchSize: (screenType === "atlas-worldmap" || screenType === "services-catalog" || screenType === "services-channels") ? 1 : Math.min(5, items.length),
      concurrency: 5,
      agentConfigId,
      startedAt: new Date(),
      items: {
        create: items.map((item) => ({
          itemKey: item.key,
          itemLabel: item.label,
          itemContext: item.context ?? null,
          status: "pending",
        })),
      },
    },
  });

  return job.id;
}

const DEFAULT_SERVICES = [
  { name: "Registration of an Insured", category: "Employer" },
  { name: "Employers Registration", category: "Employer" },
  { name: "Contribution Payment", category: "Employer" },
  { name: "Salary Certificate", category: "Employer" },
  { name: "Merge Service Period — Civil", category: "Insured" },
  { name: "Purchase of Service Years", category: "Insured" },
  { name: "Pension Advisory Service", category: "Insured" },
  { name: "Pension Calculation", category: "Insured" },
  { name: "Beneficiary Registration", category: "Beneficiary" },
  { name: "Report a Death", category: "Beneficiary" },
  { name: "Agent Enrollment", category: "Agent/Guardian" },
  { name: "Registration of GCC Nationals", category: "GCC" },
  { name: "End of Service — GCC Nationals", category: "GCC" },
  { name: "End of Service — Military", category: "Military" },
  { name: "Generate Certificates", category: "General" },
  { name: "Submit Complaint", category: "General" },
  { name: "Submit Inquiry / Suggestion", category: "General" },
];

const DEFAULT_PRODUCTS = [
  { name: "Retirement / Pension Coverage", tier: "Core" },
  { name: "Occupational Hazard Insurance", tier: "Core" },
  { name: "Unemployment Insurance (DEWS)", tier: "Core" },
  { name: "Placement Services", tier: "Complementary" },
  { name: "Rehabilitation Programs", tier: "Complementary" },
  { name: "Stay-at-Home Support", tier: "Complementary" },
  { name: "Old-Age Healthcare", tier: "Non-Core" },
  { name: "Savings & Investment Products", tier: "Non-Core" },
  { name: "Credit & Debt Counseling", tier: "Non-Core" },
  { name: "Financial Literacy Programs", tier: "Non-Core" },
];

const DEFAULT_SEGMENTS = [
  { segment: "Saudi — Formal employment", coverageType: "Retirement Coverage" },
  { segment: "Saudi — Formal employment", coverageType: "Occupational Hazard" },
  { segment: "Saudi — Formal employment", coverageType: "Unemployment" },
  { segment: "Saudi — Self-employed", coverageType: "Retirement Coverage" },
  { segment: "Saudi — Self-employed", coverageType: "Health Security" },
  { segment: "Saudi — Informal employment", coverageType: "Retirement Coverage" },
  { segment: "Non-Saudi — Formal employment", coverageType: "Retirement Coverage" },
  { segment: "Non-Saudi — Formal employment", coverageType: "Occupational Hazard" },
  { segment: "Non-Saudi — Others", coverageType: "Retirement Coverage" },
];

const DEFAULT_CHANNELS = [
  { name: "Digital Portal", type: "digital" },
  { name: "Mobile Application", type: "digital" },
  { name: "Service Centers", type: "physical" },
  { name: "Call Center", type: "voice" },
  { name: "Partner Channels", type: "partner" },
  { name: "API / Integration", type: "integration" },
];

const DEFAULT_PERSONAS = [
  { name: "Khaled", segment: "Gig worker" },
  { name: "Bassam", segment: "Long-tenure expat" },
  { name: "Fatima", segment: "Self-employed artisan" },
  { name: "Ahmed", segment: "Rural agriculture" },
  { name: "Sara", segment: "Sports professional" },
  { name: "Omar", segment: "GCC cross-border" },
  { name: "Maria", segment: "Domestic worker" },
  { name: "Rashid", segment: "Public sector retiree" },
];

const DEFAULT_DELIVERY_MODELS = [
  { name: "Direct Digital", focus: "Tech-savvy segments" },
  { name: "In-Person Assisted", focus: "Complex cases" },
  { name: "Partnership Ecosystem", focus: "Third-party networks" },
  { name: "Outreach & Awareness", focus: "Proactive engagement" },
];

const DEFAULT_INTL_INSTITUTIONS = [
  { key: "gosi", label: "General Organization for Social Insurance (GOSI)", country: "Saudi Arabia" },
  { key: "sio", label: "Social Insurance Organization (SIO)", country: "Bahrain" },
  { key: "pifss", label: "Public Institution for Social Security (PIFSS)", country: "Kuwait" },
  { key: "pasi", label: "Public Authority for Social Insurance (PASI)", country: "Oman" },
  { key: "grsia", label: "General Retirement & Social Insurance Authority (GRSIA)", country: "Qatar" },
  { key: "cpf", label: "Central Provident Fund (CPF)", country: "Singapore" },
  { key: "superannuation", label: "Australian Prudential Regulation Authority (APRA Super)", country: "Australia" },
  { key: "dwp", label: "Department for Work and Pensions (DWP)", country: "United Kingdom" },
  { key: "skais", label: "Social Insurance Board (SKAIS)", country: "Estonia" },
  { key: "bpjs", label: "BPJS Ketenagakerjaan", country: "Indonesia" },
];

const DEFAULT_INTL_COUNTRIES = [
  { iso3: "SAU", name: "Saudi Arabia", region: "GCC" },
  { iso3: "BHR", name: "Bahrain", region: "GCC" },
  { iso3: "KWT", name: "Kuwait", region: "GCC" },
  { iso3: "OMN", name: "Oman", region: "GCC" },
  { iso3: "QAT", name: "Qatar", region: "GCC" },
  { iso3: "SGP", name: "Singapore", region: "Asia-Pacific" },
  { iso3: "AUS", name: "Australia", region: "Asia-Pacific" },
  { iso3: "GBR", name: "United Kingdom", region: "Europe" },
  { iso3: "EST", name: "Estonia", region: "Europe" },
  { iso3: "IDN", name: "Indonesia", region: "Asia-Pacific" },
];

const DEFAULT_ILO_STANDARDS = [
  { code: "C102", title: "Social Security (Minimum Standards) Convention, 1952", category: "coverage" },
  { code: "R202", title: "Social Protection Floors Recommendation, 2012", category: "coverage" },
  { code: "C128", title: "Invalidity, Old-Age and Survivors' Benefits Convention, 1967", category: "products" },
  { code: "C130", title: "Medical Care and Sickness Benefits Convention, 1969", category: "products" },
  { code: "C168", title: "Employment Promotion and Protection against Unemployment Convention, 1988", category: "products" },
  { code: "C121", title: "Employment Injury Benefits Convention, 1964", category: "products" },
  { code: "C183", title: "Maternity Protection Convention, 2000", category: "products" },
  { code: "ISSA-GOV", title: "ISSA Guidelines on Good Governance", category: "governance" },
  { code: "ISSA-SQ", title: "ISSA Guidelines on Service Quality", category: "services" },
  { code: "ISSA-ICT", title: "ISSA Guidelines on Information and Communication Technology", category: "digital" },
  { code: "ISSA-AS", title: "ISSA Guidelines on Administrative Solutions", category: "services" },
  { code: "WB-PENSION", title: "World Bank Pension Sourcebook Principles", category: "products" },
];
