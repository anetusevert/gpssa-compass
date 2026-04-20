import { prisma } from "@/lib/db";
import { COUNTRIES } from "@/lib/countries/catalog";
import { LABOR_SEGMENTS } from "@/lib/taxonomy/segments";
import type { ScreenType } from "./types";

// Coverage columns must mirror products/segments page COVERAGE_COLUMNS.
const COVERAGE_COLUMNS = [
  "Retirement Coverage",
  "Occupational Hazard",
  "Unemployment",
  "Housing Security",
  "Health Security",
  "Maternity",
  "Disability",
  "Survivors",
] as const;

// Labor-market spine for the GPSSA segment matrix. Cross-cutting cohorts
// (youth, gig, retirees, guardians) are excluded — they're surfaced via
// Personas, not the coverage matrix.
const MATRIX_SEGMENT_SLUGS = [
  "national-formal",
  "national-self-employed",
  "national-informal",
  "expat-formal",
  "expat-domestic",
  "expat-other",
  "gcc-mobile",
  "military-security",
] as const;

export interface DispatchItem {
  key: string;
  label: string;
  context?: string;
}

/**
 * Idempotent: seeds the Country table with the canonical catalog if empty.
 * Used by every screen that fans out per-country.
 */
async function ensureCountryCatalog(): Promise<void> {
  const total = await prisma.country.count();
  if (total > 0) return;
  for (const c of COUNTRIES) {
    await prisma.country.upsert({
      where: { iso3: c.iso3 },
      update: {},
      create: { iso3: c.iso3, iso2: c.iso2, name: c.name, flag: c.flag, region: c.region, subRegion: c.subRegion },
    });
  }
}

async function getItemsForScreen(screenType: ScreenType): Promise<DispatchItem[]> {
  switch (screenType) {
    case "mandate-corpus": {
      // Pull every GpssaPage and pack the page's markdown into the item context.
      // The mandate-corpus prompt extracts section/url/lang from the [section:...]
      // [url:...] [lang:...] markers prepended below.
      const pages = await prisma.gpssaPage.findMany({
        select: {
          id: true,
          slug: true,
          title: true,
          section: true,
          url: true,
          lang: true,
          markdown: true,
        },
        orderBy: { scrapedAt: "desc" },
      });
      if (pages.length === 0) return [];
      const MAX_CONTEXT_CHARS = 60_000;
      return pages.map((p) => {
        const header = `[section:${p.section ?? "unknown"}] [url:${p.url}] [lang:${p.lang}]\n`;
        const md = (p.markdown ?? "").slice(0, MAX_CONTEXT_CHARS - header.length);
        return {
          key: p.slug,
          label: p.title,
          context: `${header}${md}`,
        };
      });
    }

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

      await ensureCountryCatalog();

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
      await ensureCountryCatalog();
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

    case "products-innovation": {
      // Re-research existing innovations first (so iterative refinement works);
      // fall back to the canonical theme list when the table is empty.
      const existing = await prisma.productInnovation.findMany({
        where: { researchStatus: { in: ["pending", "failed"] } },
        select: { id: true, title: true, innovationType: true },
        orderBy: { title: "asc" },
      });
      if (existing.length > 0) {
        return existing.map((i) => ({
          key: i.id,
          label: i.title,
          context: i.innovationType ?? undefined,
        }));
      }
      return DEFAULT_INNOVATION_THEMES.map((t) => ({
        key: t.title,
        label: t.title,
        context: t.focus,
      }));
    }

    case "products-segments": {
      // Build a full Emirati matrix: every spine segment x every coverage column.
      // The agent gets one item per (segment, coverageType) pair so the matrix
      // is comprehensive rather than the previous 9-cell partial.
      const items: DispatchItem[] = [];
      const matrixSegments = LABOR_SEGMENTS.filter((s) =>
        (MATRIX_SEGMENT_SLUGS as readonly string[]).includes(s.slug)
      ).sort((a, b) => a.sortOrder - b.sortOrder);
      for (const seg of matrixSegments) {
        for (const col of COVERAGE_COLUMNS) {
          items.push({
            key: `${seg.label}::${col}`,
            label: seg.label,
            context: col,
          });
        }
      }
      return items;
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
    case "intl-services-channels": {
      const institutions = await prisma.institution.findMany({
        select: { id: true, name: true, country: true, countryCode: true },
        orderBy: { name: "asc" },
      });
      if (institutions.length > 0) {
        return institutions.map((i) => ({ key: i.id, label: i.name, context: i.country }));
      }
      return DEFAULT_INTL_INSTITUTIONS.map((i) => ({ key: i.key, label: i.label, context: i.country }));
    }

    case "intl-products-portfolio": {
      // Fan out across all 193 UN countries. Prefer institution-driven items
      // when an institution is on file for the country (gives the LLM a
      // concrete entity to research); otherwise dispatch the country itself
      // and let the LLM pick the principal social-security institution.
      // Pending-only filter: skip countries that already have InternationalProduct rows.
      await ensureCountryCatalog();
      const allCountries = await prisma.country.findMany({
        select: { iso3: true, name: true },
        orderBy: { name: "asc" },
      });
      const completedRows = await prisma.internationalProduct.groupBy({
        by: ["countryIso3"],
        where: { researchStatus: "completed" },
        _count: { _all: true },
      });
      const completedSet = new Set(completedRows.map((r) => r.countryIso3));
      const pendingCountries = allCountries.filter((c) => !completedSet.has(c.iso3));
      const target = pendingCountries.length > 0 ? pendingCountries : allCountries;

      const institutions = await prisma.institution.findMany({
        select: { id: true, name: true, country: true, countryCode: true },
      });
      const instByCountry = new Map<string, { id: string; name: string; country: string }>();
      for (const i of institutions) {
        if (i.countryCode) instByCountry.set(i.countryCode, i);
      }

      return target.map((c) => {
        const inst = instByCountry.get(c.iso3);
        return inst
          ? { key: inst.id, label: inst.name, context: c.name }
          : { key: c.iso3, label: c.name, context: c.name };
      });
    }

    case "intl-products-segments": {
      // Fan out across all 193 UN countries. One LLM call per country produces
      // the full segment x coverage-type matrix for that country.
      await ensureCountryCatalog();
      const allCountries = await prisma.country.findMany({
        select: { iso3: true, name: true, region: true },
        orderBy: { name: "asc" },
      });
      const completedRows = await prisma.internationalSegmentCoverage.groupBy({
        by: ["countryIso3"],
        where: { researchStatus: "completed" },
        _count: { _all: true },
      });
      const completedSet = new Set(completedRows.map((r) => r.countryIso3));
      const pending = allCountries.filter((c) => !completedSet.has(c.iso3));
      const target = pending.length > 0 ? pending : allCountries;
      return target.map((c) => ({ key: c.iso3, label: c.name, context: c.region ?? undefined }));
    }

    case "intl-delivery-channels": {
      await ensureCountryCatalog();
      const allCountries = await prisma.country.findMany({
        select: { iso3: true, name: true, region: true },
        orderBy: { name: "asc" },
      });
      const completedRows = await prisma.internationalDeliveryChannel.groupBy({
        by: ["countryIso3"],
        where: { researchStatus: "completed" },
        _count: { _all: true },
      });
      const completedSet = new Set(completedRows.map((r) => r.countryIso3));
      const pending = allCountries.filter((c) => !completedSet.has(c.iso3));
      const target = pending.length > 0 ? pending : allCountries;
      return target.map((c) => ({ key: c.iso3, label: c.name, context: c.region ?? undefined }));
    }

    case "intl-delivery-personas": {
      await ensureCountryCatalog();
      const allCountries = await prisma.country.findMany({
        select: { iso3: true, name: true, region: true },
        orderBy: { name: "asc" },
      });
      const completedRows = await prisma.internationalCustomerPersona.groupBy({
        by: ["countryIso3"],
        where: { researchStatus: "completed" },
        _count: { _all: true },
      });
      const completedSet = new Set(completedRows.map((r) => r.countryIso3));
      const pending = allCountries.filter((c) => !completedSet.has(c.iso3));
      const target = pending.length > 0 ? pending : allCountries;
      return target.map((c) => ({ key: c.iso3, label: c.name, context: c.region ?? undefined }));
    }

    case "intl-delivery-models": {
      await ensureCountryCatalog();
      const allCountries = await prisma.country.findMany({
        select: { iso3: true, name: true, region: true },
        orderBy: { name: "asc" },
      });
      const completedRows = await prisma.internationalDeliveryModel.groupBy({
        by: ["countryIso3"],
        where: { researchStatus: "completed" },
        _count: { _all: true },
      });
      const completedSet = new Set(completedRows.map((r) => r.countryIso3));
      const pending = allCountries.filter((c) => !completedSet.has(c.iso3));
      const target = pending.length > 0 ? pending : allCountries;
      return target.map((c) => ({ key: c.iso3, label: c.name, context: c.region ?? undefined }));
    }

    case "ilo-standards": {
      return DEFAULT_ILO_STANDARDS.map((s) => ({ key: s.code, label: s.title, context: s.category }));
    }

    case "standards-auditor": {
      // Audit GPSSA against every active canonical Standard from the library.
      const standards = await prisma.standard.findMany({
        where: { isActive: true },
        select: { slug: true, title: true, body: true, code: true, scope: true },
        orderBy: { sortOrder: "asc" },
      });
      if (standards.length === 0) return [];
      return standards.map((s) => ({
        key: s.slug,
        label: s.title,
        context: `${s.body}${s.code ? ` ${s.code}` : ""} · ${s.scope}`,
      }));
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

  return createScreenResearchJobForItems(agentConfigId, items, model);
}

export async function createScreenResearchJobForItems(
  agentConfigId: string,
  items: DispatchItem[],
  model?: string
): Promise<string> {
  const agent = await prisma.agentConfig.findUnique({ where: { id: agentConfigId } });
  if (!agent || !agent.targetScreen) {
    throw new Error("Agent not found or has no targetScreen assigned");
  }

  if (items.length === 0) {
    throw new Error(`No items provided for screen: ${agent.targetScreen}`);
  }

  const screenType = agent.targetScreen as ScreenType;

  const job = await prisma.researchJob.create({
    data: {
      type: screenType,
      status: "running",
      totalItems: items.length,
      model: model ?? agent.model,
      batchSize: (screenType === "atlas-worldmap" || screenType === "services-catalog" || screenType === "services-channels" || screenType === "mandate-corpus") ? 1 : Math.min(5, items.length),
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

// Canonical innovation themes for the GPSSA Product Innovation agent.
// These are deliberately broad starter themes — the agent translates each
// into a concrete, scored innovation idea (auto-enrolment wallet, parametric
// occupational insurance, etc.) on the products-innovation screen.
const DEFAULT_INNOVATION_THEMES = [
  { title: "Digital pension wallet for nationals & expats", focus: "digital" },
  { title: "Gig & platform-economy worker coverage", focus: "product" },
  { title: "Voluntary defined-contribution top-up", focus: "product" },
  { title: "Caregiver / non-working spouse coverage", focus: "product" },
  { title: "Self-employed Emirati onboarding flow", focus: "experience" },
  { title: "Long-term care benefit", focus: "product" },
  { title: "Parametric occupational injury insurance", focus: "product" },
  { title: "Pension-backed home financing", focus: "ecosystem" },
  { title: "Retiree health wallet", focus: "product" },
  { title: "Behavioural financial-wellness coaching", focus: "experience" },
];

// Mirrors STATIC_PRODUCTS in src/app/dashboard/products/portfolio/page.tsx
// so the agent researches exactly the products the screen renders.
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
