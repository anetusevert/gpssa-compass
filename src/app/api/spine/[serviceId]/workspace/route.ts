import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { getLibraryEpisode, libraryForPersona } from "@/lib/spine/library";
import { filterEligibleEpisodes, isEpisodeEligible } from "@/lib/spine/eligibility";
import { personas } from "@/data/personas";

export async function GET(
  req: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const serviceId = params.serviceId;
  const lensPersona =
    req.nextUrl.searchParams.get("personaKey") ||
    req.nextUrl.searchParams.get("persona") ||
    null;

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

  const personaKey =
    lensPersona || config?.activePersonaKey || episodes.find((e) => e.isActive)?.personaKey || null;
  const persona = personaKey ? personas.find((p) => p.id === personaKey) : null;

  const eligible = filterEligibleEpisodes(episodes, personaKey);
  const active =
    (eligible.find((e) => e.isActive) ??
      episodes.find((e) => e.isActive && isEpisodeEligible(e, personaKey)) ??
      eligible[0] ??
      null);

  const catalogue = libraryForPersona(personaKey);

  // Journeys scoped to the active episode only (library outline + persona + applied).
  const journeyCandidates: {
    id: string;
    source: string;
    label: string;
    stages: { name: string; actor: string; outcome?: string | null }[];
  }[] = [];

  if (active?.stages.length) {
    journeyCandidates.push({
      id: `existing-${active.id}`,
      source: "applied",
      label: `Applied — ${active.name}`,
      stages: active.stages.map((s) => ({
        name: s.name,
        actor: s.actor,
        outcome: s.outcome,
      })),
    });
  }

  if (active?.libraryId) {
    const lib = getLibraryEpisode(active.libraryId);
    if (lib?.defaultStages.length) {
      journeyCandidates.push({
        id: `library-${lib.id}`,
        source: "library",
        label: `${lib.name} journey`,
        stages: lib.defaultStages.map((s) => ({
          name: s.name,
          actor: s.actor,
          outcome: s.outcome,
        })),
      });
    }
  }

  if (persona?.gpssaJourney.steps.length) {
    journeyCandidates.push({
      id: `persona-${persona.id}`,
      source: "persona",
      label: `${persona.name} research journey`,
      stages: persona.gpssaJourney.steps.map((s) => ({
        name: s.title,
        actor: "customer",
        outcome: s.description,
      })),
    });
  }

  let painPoints: string[] = [];
  try {
    painPoints = service.painPoints ? (JSON.parse(service.painPoints) as string[]) : [];
  } catch {
    painPoints = [];
  }

  const episodeRows = episodes.map((e) => ({
    id: e.id,
    name: e.name,
    description: e.description,
    isActive: e.isActive,
    personaKey: e.personaKey,
    libraryId: e.libraryId,
    lifecycleCategory: e.lifecycleCategory,
    stages: e.stages,
  }));

  const eligibleOnService = filterEligibleEpisodes(episodeRows, personaKey);
  const activatedLibraryIds = new Set(
    episodeRows.map((e) => e.libraryId).filter(Boolean) as string[]
  );

  return NextResponse.json({
    service: { id: service.id, name: service.name, category: service.category },
    config,
    episodes: episodeRows,
    eligibleEpisodes: eligibleOnService,
    /** Full catalogue for this persona — ready to activate even if not yet on the service. */
    catalogueEpisodes: catalogue.map((e) => ({
      id: e.id,
      name: e.name,
      description: e.description,
      category: e.category,
      suggestedPersonaKeys: e.suggestedPersonaKeys,
      stageCount: e.defaultStages.length,
      alreadyOnService: activatedLibraryIds.has(e.id),
    })),
    activeEpisodeId: active?.id ?? null,
    personaKey,
    persona: persona
      ? {
          id: persona.id,
          name: persona.name,
          tagline: persona.tagline,
          color: persona.color,
          avatarUrl: persona.avatarUrl,
        }
      : null,
    journeyCandidates,
    painPoints,
    systems,
    personas: personas.map((p) => ({
      id: p.id,
      name: p.name,
      tagline: p.tagline,
      color: p.color,
      avatarUrl: p.avatarUrl,
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

    // Create/activate episode only — Journey act owns outline + apply-journey.
    const existing = await prisma.customerEpisode.findFirst({
      where: { serviceId, libraryId: lib.id },
    });

    const episode = existing
      ? await prisma.customerEpisode.update({
          where: { id: existing.id },
          data: {
            isActive: true,
            ...(personaKey ? { personaKey } : {}),
          },
          include: { stages: { orderBy: { sortOrder: "asc" } } },
        })
      : await prisma.customerEpisode.create({
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
          },
          include: { stages: { orderBy: { sortOrder: "asc" } } },
        });

    await prisma.spineConfig.upsert({
      where: { serviceId },
      create: {
        serviceId,
        activeEpisodeId: episode.id,
        activePersonaKey: personaKey,
        activeJourneySource: null,
      },
      update: {
        activeEpisodeId: episode.id,
        activePersonaKey: personaKey,
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
    const current = await prisma.customerEpisode.findUnique({ where: { id: episodeId } });
    if (!current || current.serviceId !== serviceId) {
      return NextResponse.json({ error: "Episode not found" }, { status: 404 });
    }
    // Shared library episodes keep their stamp; only custom rows take the lens key.
    const stampPersona =
      personaKey && !current.libraryId ? personaKey : undefined;
    const episode = await prisma.customerEpisode.update({
      where: { id: episodeId },
      data: {
        isActive: true,
        ...(stampPersona ? { personaKey: stampPersona } : {}),
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
    // Persist lens on config only — do not rewrite shared episode.personaKey stamps.
    await prisma.spineConfig.upsert({
      where: { serviceId },
      create: { serviceId, activePersonaKey: personaKey },
      update: { activePersonaKey: personaKey },
    });

    const episodes = await prisma.customerEpisode.findMany({
      where: { serviceId },
      select: { id: true, isActive: true, personaKey: true, libraryId: true },
    });
    const eligible = filterEligibleEpisodes(episodes, personaKey);
    const active = episodes.find((e) => e.isActive) ?? null;
    if (active && !isEpisodeEligible(active, personaKey)) {
      await prisma.customerEpisode.updateMany({
        where: { serviceId },
        data: { isActive: false },
      });
      const next = eligible[0];
      if (next) {
        await prisma.customerEpisode.update({
          where: { id: next.id },
          data: { isActive: true },
        });
        await prisma.spineConfig.update({
          where: { serviceId },
          data: { activeEpisodeId: next.id },
        });
      } else {
        await prisma.spineConfig.update({
          where: { serviceId },
          data: { activeEpisodeId: null },
        });
      }
    }

    return NextResponse.json({
      ok: true,
      personaKey,
      activeEpisodeId:
        active && isEpisodeEligible(active, personaKey)
          ? active.id
          : eligible[0]?.id ?? null,
    });
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
