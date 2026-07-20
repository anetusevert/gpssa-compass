import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { getLibraryEpisode } from "@/lib/spine/library";
import { personas } from "@/data/personas";

export async function GET(
  _req: Request,
  { params }: { params: { serviceId: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const serviceId = params.serviceId;
  const [service, episodes, config, systems] = await Promise.all([
    prisma.gPSSAService.findUnique({ where: { id: serviceId } }),
    prisma.customerEpisode.findMany({
      where: { serviceId },
      include: { stages: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.spineConfig.findUnique({ where: { serviceId } }),
    prisma.backofficeSystem.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const active = episodes.find((e) => e.isActive) ?? episodes[0] ?? null;
  const personaKey = config?.activePersonaKey ?? active?.personaKey ?? null;
  const persona = personaKey ? personas.find((p) => p.id === personaKey) : null;

  const journeyCandidates = [
    ...(active?.stages.length
      ? [
          {
            id: `existing-${active.id}`,
            source: "gold" as const,
            label: "Active episode stages",
            stages: active.stages.map((s) => ({
              name: s.name,
              actor: s.actor,
              outcome: s.outcome,
            })),
          },
        ]
      : []),
    ...(persona
      ? [
          {
            id: `persona-${persona.id}`,
            source: "persona" as const,
            label: `${persona.name} journey`,
            stages: persona.gpssaJourney.steps.map((s) => ({
              name: s.title,
              actor: "customer",
              outcome: s.description,
            })),
          },
        ]
      : []),
  ];

  let painPoints: string[] = [];
  try {
    painPoints = service.painPoints ? (JSON.parse(service.painPoints) as string[]) : [];
  } catch {
    painPoints = [];
  }

  return NextResponse.json({
    service: { id: service.id, name: service.name, category: service.category },
    config,
    episodes,
    activeEpisodeId: active?.id ?? null,
    personaKey,
    persona: persona
      ? { id: persona.id, name: persona.name, tagline: persona.tagline }
      : null,
    journeyCandidates,
    painPoints,
    systems,
    personas: personas.map((p) => ({
      id: p.id,
      name: p.name,
      tagline: p.tagline,
      color: p.color,
    })),
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const serviceId = params.serviceId;
  const body = await req.json();
  const action = body.action as string;

  if (action === "activate-library") {
    const lib = getLibraryEpisode(body.libraryId);
    if (!lib) return NextResponse.json({ error: "Unknown library episode" }, { status: 400 });
    const personaKey = (body.personaKey as string) || lib.suggestedPersonaKeys[0];

    await prisma.customerEpisode.updateMany({
      where: { serviceId },
      data: { isActive: false },
    });

    const episode = await prisma.customerEpisode.create({
      data: {
        serviceId,
        name: lib.name,
        description: lib.description,
        lifecycleCategory: lib.category,
        personaKey,
        libraryId: lib.id,
        source: "library",
        isActive: true,
        sortOrder: 0,
        stages: {
          create: lib.defaultStages.map((s, i) => ({
            serviceId,
            name: s.name,
            actor: s.actor,
            outcome: s.outcome,
            source: "library",
            sortOrder: i,
          })),
        },
      },
      include: { stages: true },
    });

    await prisma.spineConfig.upsert({
      where: { serviceId },
      create: {
        serviceId,
        activeEpisodeId: episode.id,
        activePersonaKey: personaKey,
        activeJourneySource: "library",
      },
      update: {
        activeEpisodeId: episode.id,
        activePersonaKey: personaKey,
        activeJourneySource: "library",
      },
    });

    return NextResponse.json({ episode });
  }

  if (action === "activate-episode") {
    const episodeId = body.episodeId as string;
    const personaKey = body.personaKey as string | undefined;
    await prisma.customerEpisode.updateMany({
      where: { serviceId },
      data: { isActive: false },
    });
    const episode = await prisma.customerEpisode.update({
      where: { id: episodeId },
      data: {
        isActive: true,
        ...(personaKey ? { personaKey } : {}),
      },
    });
    await prisma.spineConfig.upsert({
      where: { serviceId },
      create: {
        serviceId,
        activeEpisodeId: episodeId,
        activePersonaKey: personaKey ?? episode.personaKey,
      },
      update: {
        activeEpisodeId: episodeId,
        ...(personaKey ? { activePersonaKey: personaKey } : {}),
      },
    });
    return NextResponse.json({ episode });
  }

  if (action === "set-persona") {
    const personaKey = body.personaKey as string;
    await prisma.spineConfig.upsert({
      where: { serviceId },
      create: { serviceId, activePersonaKey: personaKey },
      update: { activePersonaKey: personaKey },
    });
    const active = await prisma.customerEpisode.findFirst({
      where: { serviceId, isActive: true },
    });
    if (active) {
      await prisma.customerEpisode.update({
        where: { id: active.id },
        data: { personaKey },
      });
    }
    return NextResponse.json({ ok: true, personaKey });
  }

  if (action === "apply-journey") {
    const stages = body.stages as { name: string; actor: string; outcome?: string }[];
    const source = (body.source as string) || "custom";
    const active = await prisma.customerEpisode.findFirst({
      where: { serviceId, isActive: true },
    });
    if (!active) {
      return NextResponse.json({ error: "Activate an episode first" }, { status: 400 });
    }
    await prisma.journeyStage.deleteMany({ where: { episodeId: active.id } });
    await prisma.journeyStage.createMany({
      data: stages.map((s, i) => ({
        serviceId,
        episodeId: active.id,
        name: s.name,
        actor: s.actor || "agent",
        outcome: s.outcome,
        source,
        sortOrder: i,
      })),
    });
    await prisma.spineConfig.upsert({
      where: { serviceId },
      create: { serviceId, activeEpisodeId: active.id, activeJourneySource: source },
      update: { activeJourneySource: source },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
