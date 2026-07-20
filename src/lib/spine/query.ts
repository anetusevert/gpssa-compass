import { prisma } from "@/lib/db";
import { GOLD_SPINE_SERVICE_NAME } from "./seed";
import type { SpineGraphPayload, SpineNodeId, SpineNodeLit, SpineServiceListItem } from "./types";

const NODE_META: { id: SpineNodeId; label: string }[] = [
  { id: "episode", label: "Episode" },
  { id: "journey", label: "Journey" },
  { id: "process", label: "Process & SOP" },
  { id: "systems", label: "Systems & Fulfilment" },
  { id: "qa", label: "QA & Improvement" },
];

export async function listSpineServices(): Promise<SpineServiceListItem[]> {
  const services = await prisma.gPSSAService.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          episodes: true,
          journeyStages: true,
          operatingProcesses: true,
          serviceCases: true,
          defects: true,
        },
      },
    },
  });

  const withSpine = services.filter(
    (s) =>
      s._count.episodes > 0 ||
      s._count.journeyStages > 0 ||
      s._count.operatingProcesses > 0 ||
      s._count.serviceCases > 0
  );

  const pool = withSpine.length ? withSpine : services.slice(0, 5);
  const items: SpineServiceListItem[] = [];
  for (const s of pool) {
    const g = await buildSpineGraph(s.id);
    if (!g) continue;
    items.push({
      id: s.id,
      name: s.name,
      category: s.category,
      isGoldPath: s.name === GOLD_SPINE_SERVICE_NAME,
      litNodes: g.nodes.filter((n) => n.lit).map((n) => n.id),
      counts: {
        episodes: g.episode ? 1 : 0,
        stages: g.stages.length,
        sopSteps: g.processes.reduce((n, p) => n + (p.sop?.steps.length ?? 0), 0),
        systems: g.processes.reduce((n, p) => n + p.systems.length, 0),
        openCases: g.fulfilment.cases.filter((c) => c.status !== "resolved").length,
        openCapas: g.quality.capas.filter((c) => c.status !== "closed").length,
      },
    });
  }

  items.sort((a, b) => Number(b.isGoldPath) - Number(a.isGoldPath) || a.name.localeCompare(b.name));
  return items;
}

export async function buildSpineGraph(serviceId: string): Promise<SpineGraphPayload | null> {
  const service = await prisma.gPSSAService.findUnique({ where: { id: serviceId } });
  if (!service) return null;

  const [episodes, stages, processes, slas, cases, breaches, scorecards, reviews, defects] =
    await Promise.all([
      prisma.customerEpisode.findMany({ where: { serviceId }, orderBy: { sortOrder: "asc" } }),
      prisma.journeyStage.findMany({ where: { serviceId }, orderBy: { sortOrder: "asc" } }),
      prisma.operatingProcess.findMany({
        where: { serviceId },
        include: {
          sops: { include: { steps: { orderBy: { sortOrder: "asc" } } }, take: 1, orderBy: { createdAt: "desc" } },
          systemLinks: { include: { system: true } },
        },
      }),
      prisma.sLADefinition.findMany({ where: { serviceId } }),
      prisma.serviceCase.findMany({
        where: { serviceId },
        orderBy: { openedAt: "desc" },
        take: 20,
      }),
      prisma.breach.count({
        where: { case: { serviceId } },
      }),
      prisma.qAScorecard.findMany({ where: { serviceId } }),
      prisma.qAReview.count({ where: { scorecard: { serviceId } } }),
      prisma.defect.findMany({
        where: { serviceId },
        include: { correctiveActions: true },
        take: 20,
      }),
    ]);

  const sopStepCount = processes.reduce(
    (n, p) => n + (p.sops[0]?.steps.length ?? 0),
    0
  );
  const systemCount = processes.reduce((n, p) => n + p.systemLinks.length, 0);
  const capas = defects.flatMap((d) => d.correctiveActions);

  const litFlags: Record<SpineNodeId, boolean> = {
    episode: episodes.length > 0,
    journey: stages.length > 0,
    process: processes.length > 0 && sopStepCount > 0,
    systems: systemCount > 0 || cases.length > 0 || slas.length > 0,
    qa: scorecards.length > 0 || defects.length > 0 || reviews > 0,
  };

  const nodes: SpineNodeLit[] = NODE_META.map((m) => {
    let count = 0;
    let summary = "No data yet";
    switch (m.id) {
      case "episode":
        count = episodes.length;
        summary = episodes[0]?.name ?? summary;
        break;
      case "journey":
        count = stages.length;
        summary = `${stages.length} stages`;
        break;
      case "process":
        count = sopStepCount;
        summary = `${processes.length} process · ${sopStepCount} SOP steps`;
        break;
      case "systems":
        count = systemCount + cases.length;
        summary = `${systemCount} systems · ${cases.length} cases · ${breaches} breaches`;
        break;
      case "qa":
        count = scorecards.length + capas.length;
        summary = `${scorecards.length} scorecards · ${reviews} reviews · ${capas.length} CAPAs`;
        break;
    }
    return {
      id: m.id,
      label: m.label,
      lit: litFlags[m.id],
      count,
      summary,
    };
  });

  const edgePairs: [SpineNodeId, SpineNodeId][] = [
    ["episode", "journey"],
    ["journey", "process"],
    ["process", "systems"],
    ["systems", "qa"],
  ];
  const edges = edgePairs.map(([from, to]) => ({
    from,
    to,
    lit: litFlags[from] && litFlags[to],
  }));

  const episode = episodes[0]
    ? { id: episodes[0].id, name: episodes[0].name, description: episodes[0].description }
    : null;

  return {
    service: {
      id: service.id,
      name: service.name,
      category: service.category,
      description: service.description,
    },
    isGoldPath: service.name === GOLD_SPINE_SERVICE_NAME,
    nodes,
    edges,
    episode,
    stages: stages.map((s) => ({
      id: s.id,
      name: s.name,
      actor: s.actor,
      outcome: s.outcome,
      sortOrder: s.sortOrder,
    })),
    processes: processes.map((p) => {
      const sop = p.sops[0] ?? null;
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        ownerHint: p.ownerHint,
        sop: sop
          ? {
              id: sop.id,
              title: sop.title,
              version: sop.version,
              steps: sop.steps.map((st) => ({
                id: st.id,
                title: st.title,
                instruction: st.instruction,
                qaCheckpoint: st.qaCheckpoint,
                checkpointNote: st.checkpointNote,
                sortOrder: st.sortOrder,
              })),
            }
          : null,
        systems: p.systemLinks.map((l) => ({
          id: l.system.id,
          code: l.system.code,
          name: l.system.name,
          kind: l.system.kind,
          role: l.role,
        })),
      };
    }),
    fulfilment: {
      slas: slas.map((s) => ({
        id: s.id,
        name: s.name,
        tier: s.tier,
        targetHours: s.targetHours,
      })),
      cases: cases.map((c) => ({
        id: c.id,
        caseRef: c.caseRef,
        status: c.status,
        breachRiskLevel: c.breachRiskLevel,
        breached: c.breached,
        owner: c.owner,
      })),
      breachCount: breaches,
    },
    quality: {
      scorecards: scorecards.map((s) => ({ id: s.id, name: s.name, status: s.status })),
      reviewCount: reviews,
      defects: defects.map((d) => ({
        id: d.id,
        severity: d.severity,
        status: d.status,
        caseRef: d.caseRef,
      })),
      capas: capas.map((c) => ({
        id: c.id,
        title: c.title,
        status: c.status,
        owner: c.owner,
      })),
    },
    deepLinks: [
      { label: "Case board", href: "/dashboard/fulfilment/cases" },
      { label: "QA scorecards", href: "/dashboard/quality/scorecards" },
      { label: "CAPA", href: "/dashboard/quality/capa" },
      { label: "Service catalog", href: "/dashboard/services/catalog" },
      { label: "Blueprint", href: `/dashboard/services/operating/${service.id}` },
    ],
  };
}
