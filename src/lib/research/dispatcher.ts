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
    case "atlas-worldmap": {
      let countries = await prisma.country.findMany({
        where: { researchStatus: { in: ["pending", "failed"] } },
        select: { iso3: true, name: true },
        orderBy: { name: "asc" },
      });
      if (countries.length === 0) {
        const total = await prisma.country.count();
        if (total === 0) {
          for (const c of COUNTRIES) {
            await prisma.country.upsert({
              where: { iso3: c.iso3 },
              update: {},
              create: { iso3: c.iso3, iso2: c.iso2, name: c.name, flag: c.flag, region: c.region, subRegion: c.subRegion },
            });
          }
          countries = await prisma.country.findMany({
            where: { researchStatus: { in: ["pending", "failed"] } },
            select: { iso3: true, name: true },
            orderBy: { name: "asc" },
          });
        }
      }
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

    case "services-catalog": {
      const services = await prisma.gPSSAService.findMany({
        where: { researchStatus: { in: ["pending", "failed"] } },
        select: { id: true, name: true, category: true },
        orderBy: { name: "asc" },
      });
      if (services.length > 0) {
        return services.map((s) => ({ key: s.id, label: s.name, context: s.category }));
      }
      return DEFAULT_SERVICES.map((s) => ({ key: s.name, label: s.name, context: s.category }));
    }

    case "services-channels": {
      const services = await prisma.gPSSAService.findMany({
        select: { id: true, name: true, category: true },
        orderBy: { name: "asc" },
      });
      if (services.length > 0) {
        return services.map((s) => ({ key: s.id, label: s.name, context: s.category }));
      }
      return DEFAULT_SERVICES.map((s) => ({ key: s.name, label: s.name, context: s.category }));
    }

    case "services-analysis": {
      return [
        { key: "digital", label: "Digital Transformation Readiness", context: "Portal, mobile, API maturity" },
        { key: "automation", label: "Process Automation Potential", context: "STP, decision engines, RPA" },
        { key: "cx", label: "Customer Experience Gaps", context: "Journey friction, NPS, drop-offs" },
        { key: "synergy", label: "Cross-Service Synergies", context: "Shared data, bundled journeys" },
      ];
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

    case "products-innovation": {
      const innovations = await prisma.productInnovation.findMany({
        where: { researchStatus: { in: ["pending", "failed"] } },
        select: { id: true, title: true, innovationType: true },
        orderBy: { title: "asc" },
      });
      if (innovations.length > 0) {
        return innovations.map((i) => ({ key: i.id, label: i.title, context: i.innovationType ?? undefined }));
      }
      return DEFAULT_INNOVATIONS.map((i) => ({ key: i.title, label: i.title, context: i.type }));
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
      batchSize: Math.min(5, items.length),
      agentConfigId,
      startedAt: new Date(),
      items: {
        create: items.map((item) => ({
          itemKey: item.key,
          itemLabel: item.label,
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

const DEFAULT_INNOVATIONS = [
  { title: "Gig Worker Pension Scheme", type: "New Product" },
  { title: "Expat End-of-Service Digital Platform", type: "Digital" },
  { title: "Micro-Pension for Informal Workers", type: "New Product" },
  { title: "GCC Pension Portability Framework", type: "Enhancement" },
  { title: "AI-Powered Pension Advisory", type: "Digital" },
  { title: "Voluntary Savings Top-Up Program", type: "Enhancement" },
  { title: "Digital Workplace Injury Claims", type: "Digital" },
  { title: "Cross-Border Benefit Settlement Engine", type: "Digital" },
  { title: "Portable Accrual Ledger for GCC Moves", type: "New Product" },
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
