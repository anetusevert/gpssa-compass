import { prisma } from "@/lib/db";
import { getAllComputedReferences } from "@/lib/references/computed";
import type {
  AtlasSection,
  BenchmarksSection,
  BriefingCompleteness,
  BriefingMeta,
  BriefingSnapshot,
  ChannelCapabilityCell,
  DeliverySection,
  OpportunitiesSection,
  ProductsSection,
  ServicesSection,
  SourcesSection,
  StandardsSection,
} from "./types";

const DIGITAL_LEVEL_TO_SCORE: Record<string, number> = {
  "AI-Integrated": 95,
  "Digital-First": 85,
  "Digital-Enabled": 65,
  "Partially Digital": 55,
  "Basic Digital": 45,
  Transitioning: 35,
  Traditional: 25,
  Manual: 20,
};

function safeAvg(values: number[]): number | null {
  const filtered = values.filter((v) => Number.isFinite(v));
  if (filtered.length === 0) return null;
  const sum = filtered.reduce((s, v) => s + v, 0);
  return Number((sum / filtered.length).toFixed(2));
}

async function buildMeta(): Promise<BriefingMeta> {
  const [agentExecAgg, lastJob, orchRunsCompleted] = await Promise.all([
    prisma.agentExecution.aggregate({
      _count: { _all: true },
      _sum: { tokensUsed: true },
    }),
    prisma.researchJob.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true, completedAt: true },
    }),
    prisma.orchestratorRun.count({ where: { status: "completed" } }),
  ]);

  return {
    now: new Date().toISOString(),
    agentExecutions: agentExecAgg._count._all ?? 0,
    totalTokens: agentExecAgg._sum.tokensUsed ?? 0,
    orchestratorRunsCompleted: orchRunsCompleted,
    lastResearchAt:
      (lastJob?.completedAt ?? lastJob?.updatedAt)?.toISOString() ?? null,
  };
}

async function buildCompleteness(): Promise<BriefingCompleteness> {
  const [
    countriesTotal,
    countriesDone,
    servicesTotal,
    servicesDone,
    productsTotal,
    productsDone,
    channelsTotal,
    channelsDone,
    personasTotal,
    personasDone,
    intlTotal,
    intlDone,
  ] = await Promise.all([
    prisma.country.count(),
    prisma.country.count({ where: { researchStatus: "completed" } }),
    prisma.gPSSAService.count(),
    prisma.gPSSAService.count({ where: { researchStatus: "completed" } }),
    prisma.product.count(),
    prisma.product.count({ where: { researchStatus: "completed" } }),
    prisma.deliveryChannel.count(),
    prisma.deliveryChannel.count({ where: { researchStatus: "completed" } }),
    prisma.customerPersona.count(),
    prisma.customerPersona.count({ where: { researchStatus: "completed" } }),
    prisma.internationalService.count(),
    prisma.internationalService.count({ where: { researchStatus: "completed" } }),
  ]);

  const ratios = [
    countriesTotal === 0 ? 0 : countriesDone / countriesTotal,
    servicesTotal === 0 ? 0 : servicesDone / servicesTotal,
    productsTotal === 0 ? 0 : productsDone / productsTotal,
    channelsTotal === 0 ? 0 : channelsDone / channelsTotal,
    personasTotal === 0 ? 0 : personasDone / personasTotal,
    intlTotal === 0 ? 0 : intlDone / intlTotal,
  ];
  const overall =
    ratios.length === 0 ? 0 : ratios.reduce((s, r) => s + r, 0) / ratios.length;

  return {
    countries: { done: countriesDone, total: countriesTotal },
    services: { done: servicesDone, total: servicesTotal },
    products: { done: productsDone, total: productsTotal },
    channels: { done: channelsDone, total: channelsTotal },
    personas: { done: personasDone, total: personasTotal },
    intlServices: { done: intlDone, total: intlTotal },
    overall: Number(overall.toFixed(3)),
  };
}

async function buildAtlas(): Promise<AtlasSection> {
  const [countryCount, researchedCount, regionGroups, maturityGroups, top] =
    await Promise.all([
      prisma.country.count(),
      prisma.country.count({ where: { researchStatus: "completed" } }),
      prisma.country.groupBy({
        by: ["region"],
        _count: { _all: true },
        orderBy: { _count: { region: "desc" } },
      }),
      prisma.country.groupBy({
        by: ["maturityLabel"],
        _count: { _all: true },
        where: { maturityLabel: { not: null } },
      }),
      prisma.country.findMany({
        where: {
          maturityScore: { not: null },
          researchStatus: "completed",
        },
        orderBy: { maturityScore: "desc" },
        take: 10,
        select: {
          iso3: true,
          name: true,
          region: true,
          maturityScore: true,
          maturityLabel: true,
        },
      }),
    ]);

  return {
    countryCount,
    researchedCount,
    regions: regionGroups.map((g) => ({
      region: g.region ?? "Unknown",
      count: g._count._all,
    })),
    maturity: maturityGroups.map((g) => ({
      label: g.maturityLabel ?? "Unknown",
      count: g._count._all,
    })),
    top,
  };
}

async function buildServices(): Promise<ServicesSection> {
  const [services, capabilityRows] = await Promise.all([
    prisma.gPSSAService.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        digitalReadiness: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.serviceChannelCapability.findMany({
      select: {
        serviceId: true,
        channelName: true,
        capabilityLevel: true,
      },
    }),
  ]);

  // Service categories
  const catMap = new Map<
    string,
    { count: number; readiness: number[] }
  >();
  for (const s of services) {
    const entry = catMap.get(s.category) ?? { count: 0, readiness: [] };
    entry.count += 1;
    if (s.digitalReadiness != null) entry.readiness.push(s.digitalReadiness);
    catMap.set(s.category, entry);
  }
  const categories = Array.from(catMap.entries())
    .map(([category, v]) => ({
      category,
      count: v.count,
      averageReadiness: safeAvg(v.readiness),
    }))
    .sort((a, b) => b.count - a.count);

  // Capability levels
  const levelCounts: Record<string, number> = {};
  for (const c of capabilityRows) {
    levelCounts[c.capabilityLevel] =
      (levelCounts[c.capabilityLevel] ?? 0) + 1;
  }

  // Heatmap cells
  const serviceById = new Map(services.map((s) => [s.id, s]));
  const channelSet = new Set<string>();
  const cells: ChannelCapabilityCell[] = [];
  for (const row of capabilityRows) {
    const svc = serviceById.get(row.serviceId);
    if (!svc) continue;
    channelSet.add(row.channelName);
    cells.push({
      serviceId: svc.id,
      serviceName: svc.name,
      serviceCategory: svc.category,
      channelName: row.channelName,
      capabilityLevel: row.capabilityLevel,
    });
  }

  const channelOrder = [
    "Portal",
    "Mobile",
    "Mobile App",
    "Centers",
    "Service Centers",
    "Call",
    "Call Center",
    "Partner",
    "API",
    "Email",
    "WhatsApp",
  ];
  const channelNames = Array.from(channelSet).sort((a, b) => {
    const ai = channelOrder.indexOf(a);
    const bi = channelOrder.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const allReadiness = services
    .map((s) => s.digitalReadiness)
    .filter((v): v is number => v != null);

  return {
    count: services.length,
    averageReadiness: safeAvg(allReadiness),
    categories,
    capabilityLevelCounts: levelCounts,
    channelCapabilities: cells,
    channelNames,
    serviceNames: services.map((s) => s.name),
  };
}

async function buildProducts(): Promise<ProductsSection> {
  const [products, segments, innovations] = await Promise.all([
    prisma.product.groupBy({
      by: ["tier"],
      _count: { _all: true },
    }),
    prisma.segmentCoverage.groupBy({
      by: ["level"],
      _count: { _all: true },
    }),
    prisma.productInnovation.findMany({
      select: {
        id: true,
        title: true,
        targetSegment: true,
        impactScore: true,
        feasibilityScore: true,
      },
    }),
  ]);

  const totalCount = products.reduce((s, p) => s + p._count._all, 0);

  const sortedInnovations = innovations
    .map((i) => ({
      ...i,
      score: (i.impactScore ?? 0) * (i.feasibilityScore ?? 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ score: _score, ...rest }) => rest);

  return {
    count: totalCount,
    tiers: products.map((p) => ({
      tier: p.tier ?? "Other",
      count: p._count._all,
    })),
    segmentLevels: segments.map((s) => ({
      level: s.level ?? "Unknown",
      count: s._count._all,
    })),
    innovations: sortedInnovations,
  };
}

async function buildDelivery(): Promise<DeliverySection> {
  const [channels, personaCount, modelCount] = await Promise.all([
    prisma.deliveryChannel.findMany({
      select: {
        id: true,
        name: true,
        channelType: true,
        maturity: true,
        servicesAvailable: true,
        servicesTotal: true,
      },
      orderBy: { maturity: "desc" },
    }),
    prisma.customerPersona.count(),
    prisma.deliveryModel.count(),
  ]);

  return {
    channels,
    personaCount,
    modelCount,
  };
}

async function buildStandards(): Promise<StandardsSection> {
  const [standards, computedRefs, uaeCountry] = await Promise.all([
    prisma.standard.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        code: true,
        title: true,
        category: true,
        compliances: {
          select: {
            entityType: true,
            entityId: true,
            entityLabel: true,
            countryIso3: true,
            score: true,
          },
        },
      },
    }),
    getAllComputedReferences().catch(() => []),
    prisma.country.findUnique({
      where: { iso3: "ARE" },
      select: {
        maturityScore: true,
        coverageRate: true,
        replacementRate: true,
        sustainability: true,
        digitalLevel: true,
      },
    }),
  ]);

  const globalAvgRef = computedRefs.find(
    (r) => r.slug === "global-average"
  );
  const globalBestRef = computedRefs.find(
    (r) => r.slug === "global-best-practice"
  );

  const rows = standards.map((s) => {
    // GPSSA score: prefer institution=GPSSA, fall back to country=ARE.
    const gpssaCmp =
      s.compliances.find(
        (c) =>
          (c.entityLabel ?? "").toUpperCase().includes("GPSSA") ||
          (c.entityType === "country" && c.countryIso3 === "ARE")
      ) ?? null;

    const allScores = s.compliances.map((c) => c.score);
    const globalAverage = safeAvg(allScores);

    const sortedDesc = [...allScores].sort((a, b) => b - a);
    const cutoff = Math.max(1, Math.ceil(sortedDesc.length * 0.25));
    const topQuartile =
      sortedDesc.length === 0
        ? null
        : safeAvg(sortedDesc.slice(0, cutoff));

    // ILO category usually carries an implied 100% floor expectation.
    const floor = s.category?.toLowerCase().includes("ilo") ? 100 : null;

    return {
      slug: s.slug,
      code: s.code,
      title: s.title,
      category: s.category,
      gpssaScore: gpssaCmp?.score ?? null,
      globalAverage,
      topQuartile,
      floor,
    };
  });

  const evaluatedCount = rows.filter((r) => r.gpssaScore != null).length;

  // Build metric snapshots for the radar chart
  const gpssaMetrics: Record<string, number> | null = uaeCountry
    ? {
        maturityScore: uaeCountry.maturityScore ?? 0,
        coverageRate: uaeCountry.coverageRate ?? 0,
        replacementRate: uaeCountry.replacementRate ?? 0,
        sustainability: uaeCountry.sustainability ?? 0,
        digitalReadiness:
          uaeCountry.digitalLevel != null
            ? DIGITAL_LEVEL_TO_SCORE[uaeCountry.digitalLevel] ?? 0
            : 0,
      }
    : null;

  return {
    count: standards.length,
    evaluatedCount,
    rows: rows.sort((a, b) => a.title.localeCompare(b.title)),
    globalAverageMetrics: globalAvgRef
      ? (globalAvgRef.payload.metrics as unknown as Record<string, number>)
      : null,
    globalBestMetrics: globalBestRef
      ? (globalBestRef.payload.metrics as unknown as Record<string, number>)
      : null,
    gpssaMetrics,
  };
}

async function buildBenchmarks(): Promise<BenchmarksSection> {
  const [institutions, dimensions] = await Promise.all([
    prisma.institution.findMany({
      where: { isBenchmarkTarget: true },
      select: {
        id: true,
        name: true,
        shortName: true,
        country: true,
        countryCode: true,
        region: true,
        benchmarkScores: {
          select: { score: true, dimensionId: true },
        },
      },
    }),
    prisma.benchmarkDimension.count(),
  ]);

  // Also surface GPSSA itself if it exists as an Institution row
  const gpssaInst = await prisma.institution.findFirst({
    where: {
      OR: [
        { name: { contains: "GPSSA" } },
        { shortName: { contains: "GPSSA" } },
      ],
    },
    select: {
      id: true,
      name: true,
      shortName: true,
      country: true,
      countryCode: true,
      region: true,
      benchmarkScores: {
        select: { score: true, dimensionId: true },
      },
    },
  });

  const merged = [...institutions];
  if (gpssaInst && !merged.some((i) => i.id === gpssaInst.id)) {
    merged.unshift(gpssaInst);
  }

  const peers = merged.map((inst) => {
    const scores = inst.benchmarkScores.map((s) => s.score);
    const avg = safeAvg(scores);
    const isGpssa =
      inst.name.toUpperCase().includes("GPSSA") ||
      (inst.shortName ?? "").toUpperCase().includes("GPSSA");
    return {
      id: inst.id,
      name: inst.name,
      shortName: inst.shortName,
      country: inst.country,
      countryCode: inst.countryCode,
      region: inst.region,
      averageScore: avg,
      scoredDimensions: scores.length,
      isGpssa,
    };
  });

  // Sort: GPSSA first, then by score desc, nulls last
  peers.sort((a, b) => {
    if (a.isGpssa && !b.isGpssa) return -1;
    if (!a.isGpssa && b.isGpssa) return 1;
    const av = a.averageScore ?? -1;
    const bv = b.averageScore ?? -1;
    return bv - av;
  });

  return {
    peers,
    dimensions,
  };
}

async function buildOpportunities(): Promise<OpportunitiesSection> {
  const [allOpps, count] = await Promise.all([
    prisma.opportunity.findMany({
      where: { status: { not: "rejected" } },
      select: {
        id: true,
        title: true,
        category: true,
        description: true,
        impact: true,
        effort: true,
        strategicFit: true,
        feasibility: true,
        sourceSection: true,
      },
    }),
    prisma.opportunity.count(),
  ]);

  const ranked = allOpps
    .map((o) => ({
      ...o,
      score: (o.strategicFit ?? 0.5) * (o.feasibility ?? 0.5),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ score: _score, ...rest }) => rest);

  return {
    count,
    top: ranked,
  };
}

async function buildSources(): Promise<SourcesSection> {
  const [count, allPubs] = await Promise.all([
    prisma.dataSource.count(),
    prisma.dataSource.findMany({
      select: { publisher: true },
      where: { publisher: { not: null } },
    }),
  ]);
  const publishers = new Set(
    allPubs.map((p) => (p.publisher ?? "").trim()).filter(Boolean)
  ).size;
  return { count, publishers };
}

/**
 * Build the full briefing snapshot in one call. All sections run in parallel,
 * so latency is dominated by the single slowest aggregation.
 */
export async function buildBriefingSnapshot(): Promise<BriefingSnapshot> {
  const [
    meta,
    completeness,
    atlas,
    services,
    products,
    delivery,
    standards,
    benchmarks,
    opportunities,
    sources,
  ] = await Promise.all([
    buildMeta(),
    buildCompleteness(),
    buildAtlas(),
    buildServices(),
    buildProducts(),
    buildDelivery(),
    buildStandards(),
    buildBenchmarks(),
    buildOpportunities(),
    buildSources(),
  ]);

  return {
    meta,
    completeness,
    atlas,
    services,
    products,
    delivery,
    standards,
    benchmarks,
    opportunities,
    sources,
  };
}
