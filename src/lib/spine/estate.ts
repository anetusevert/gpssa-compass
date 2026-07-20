import { prisma } from "@/lib/db";
import { personas } from "@/data/personas";
import { EPISODE_LIBRARY } from "@/lib/spine/library";
import { templateDraft } from "@/lib/spine/generate";
import { GOLD_SPINE_SERVICE_NAME } from "@/lib/spine/seed";
import type { MatrixCell, MatrixPayload } from "./estate-types";

export type { MatrixCell, MatrixPayload } from "./estate-types";

/** Persona × service coverage matrix for estate planning. */
export async function buildPersonaServiceMatrix(): Promise<MatrixPayload> {
  const services = await prisma.gPSSAService.findMany({
    select: {
      id: true,
      name: true,
      episodes: {
        select: {
          id: true,
          isActive: true,
          personaKey: true,
          stages: { select: { id: true } },
        },
      },
      operatingProcesses: {
        select: { sops: { select: { id: true } } },
      },
    },
    orderBy: { name: "asc" },
    take: 40,
  });

  const serviceRows = services.map((s) => ({
    id: s.id,
    name: s.name,
    isGoldPath: s.name === GOLD_SPINE_SERVICE_NAME,
  }));

  const personaRows = personas.map((p) => ({ id: p.id, name: p.name }));
  const cells: MatrixCell[] = [];

  for (const p of personas) {
    for (const s of services) {
      const eps = s.episodes.filter((e) => e.personaKey === p.id);
      const episodeCount = eps.length;
      const hasActiveEpisode = eps.some((e) => e.isActive);
      const hasStages = eps.some((e) => e.stages.length > 0);
      const hasSop = s.operatingProcesses.some((op) => op.sops.length > 0);
      let status: MatrixCell["status"] = "empty";
      if (hasSop && hasStages && episodeCount > 0) status = "ready";
      else if (episodeCount > 0 || hasStages) status = "partial";
      cells.push({
        personaId: p.id,
        personaName: p.name,
        serviceId: s.id,
        serviceName: s.name,
        episodeCount,
        hasActiveEpisode,
        hasStages,
        hasSop,
        status,
      });
    }
  }

  return { services: serviceRows, personas: personaRows, cells };
}

/**
 * Draft-only bulk generate for selected services:
 * activates a library episode per service (if none), applies persona journey stages,
 * and creates a draft SOP via template (not AI) — status draft until apply flow.
 */
export async function generateEstateDrafts(opts: {
  serviceIds: string[];
  personaKey: string;
}): Promise<{
  results: {
    serviceId: string;
    serviceName: string;
    episodeId: string | null;
    draftApplied: boolean;
    source: string;
    error?: string;
  }[];
}> {
  const persona = personas.find((p) => p.id === opts.personaKey);
  const lib =
    EPISODE_LIBRARY.find((e) => e.suggestedPersonaKeys.includes(opts.personaKey)) ??
    EPISODE_LIBRARY[0];

  const results: {
    serviceId: string;
    serviceName: string;
    episodeId: string | null;
    draftApplied: boolean;
    source: string;
    error?: string;
  }[] = [];

  const ids = opts.serviceIds.slice(0, 3);

  for (const serviceId of ids) {
    const service = await prisma.gPSSAService.findUnique({ where: { id: serviceId } });
    if (!service) {
      results.push({
        serviceId,
        serviceName: "?",
        episodeId: null,
        draftApplied: false,
        source: "none",
        error: "Service not found",
      });
      continue;
    }

    try {
      await prisma.customerEpisode.updateMany({
        where: { serviceId },
        data: { isActive: false },
      });

      const episode = await prisma.customerEpisode.create({
        data: {
          serviceId,
          name: lib.name,
          description: `[draft] ${lib.description}`,
          lifecycleCategory: lib.category,
          personaKey: opts.personaKey,
          libraryId: lib.id,
          source: "estate-draft",
          isActive: true,
          sortOrder: 0,
          stages: {
            create: (
              persona?.gpssaJourney.steps.map((s) => ({
                name: s.title,
                actor: "customer" as const,
                outcome: s.description,
              })) ?? lib.defaultStages
            ).map((s, i) => ({
              serviceId,
              name: s.name,
              actor: s.actor || "agent",
              outcome: s.outcome,
              source: "estate-draft",
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
          activePersonaKey: opts.personaKey,
          activeJourneySource: "estate-draft",
        },
        update: {
          activeEpisodeId: episode.id,
          activePersonaKey: opts.personaKey,
          activeJourneySource: "estate-draft",
        },
      });

      const draft = templateDraft({
        serviceName: service.name,
        episodeName: episode.name,
        personaName: persona?.name,
        stages: episode.stages.map((s) => ({ name: s.name, actor: s.actor })),
      });

      const process = await prisma.operatingProcess.create({
        data: {
          serviceId,
          name: `[draft] ${draft.processName}`,
          description: draft.processDescription,
          ownerHint: draft.ownerHint,
          sops: {
            create: {
              title: draft.sopTitle,
              version: "0.1-draft",
              status: "draft",
              steps: {
                create: draft.steps.map((st, i) => ({
                  sortOrder: i,
                  title: st.title,
                  instruction: st.instruction,
                  qaCheckpoint: st.qaCheckpoint,
                  checkpointNote: st.checkpointNote,
                })),
              },
            },
          },
        },
      });

      // Link stages to process
      for (const stage of episode.stages) {
        await prisma.stageProcessLink.create({
          data: { stageId: stage.id, processId: process.id },
        }).catch(() => undefined);
      }

      results.push({
        serviceId,
        serviceName: service.name,
        episodeId: episode.id,
        draftApplied: true,
        source: "template-estate-draft",
      });
    } catch (e) {
      results.push({
        serviceId,
        serviceName: service.name,
        episodeId: null,
        draftApplied: false,
        source: "none",
        error: e instanceof Error ? e.message : "Failed",
      });
    }
  }

  return { results };
}
