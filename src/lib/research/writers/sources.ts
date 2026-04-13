import { prisma } from "@/lib/db";
import type { ResearchSource } from "../types";

type CitationTarget =
  | "service"
  | "institution"
  | "product"
  | "segment"
  | "innovation"
  | "channel"
  | "persona"
  | "deliveryModel";

export async function createSourcesAndCitations(
  sources: ResearchSource[],
  targetType: CitationTarget,
  targetId: string
): Promise<void> {
  if (!sources || sources.length === 0) return;

  for (const src of sources) {
    if (!src.title || !src.url) continue;

    let dataSource = await prisma.dataSource.findFirst({
      where: { url: src.url },
    });

    if (!dataSource) {
      dataSource = await prisma.dataSource.create({
        data: {
          title: src.title,
          url: src.url,
          publisher: src.publisher ?? null,
          sourceType: "research",
          publishedAt: src.publishedDate ? new Date(src.publishedDate) : null,
          accessedAt: new Date(),
        },
      });
    }

    try {
      switch (targetType) {
        case "service":
          await prisma.serviceSourceCitation.upsert({
            where: { serviceId_sourceId: { serviceId: targetId, sourceId: dataSource.id } },
            create: { serviceId: targetId, sourceId: dataSource.id, evidenceNote: src.evidenceNote },
            update: { evidenceNote: src.evidenceNote },
          });
          break;
        case "institution":
          await prisma.institutionSourceCitation.upsert({
            where: { institutionId_sourceId: { institutionId: targetId, sourceId: dataSource.id } },
            create: { institutionId: targetId, sourceId: dataSource.id, evidenceNote: src.evidenceNote },
            update: { evidenceNote: src.evidenceNote },
          });
          break;
        case "product":
          await prisma.productSourceCitation.upsert({
            where: { productId_sourceId: { productId: targetId, sourceId: dataSource.id } },
            create: { productId: targetId, sourceId: dataSource.id, evidenceNote: src.evidenceNote },
            update: { evidenceNote: src.evidenceNote },
          });
          break;
        case "segment":
          await prisma.segmentSourceCitation.upsert({
            where: { segmentId_sourceId: { segmentId: targetId, sourceId: dataSource.id } },
            create: { segmentId: targetId, sourceId: dataSource.id, evidenceNote: src.evidenceNote },
            update: { evidenceNote: src.evidenceNote },
          });
          break;
        case "innovation":
          await prisma.innovationSourceCitation.upsert({
            where: { innovationId_sourceId: { innovationId: targetId, sourceId: dataSource.id } },
            create: { innovationId: targetId, sourceId: dataSource.id, evidenceNote: src.evidenceNote },
            update: { evidenceNote: src.evidenceNote },
          });
          break;
        case "channel":
          await prisma.channelSourceCitation.upsert({
            where: { channelId_sourceId: { channelId: targetId, sourceId: dataSource.id } },
            create: { channelId: targetId, sourceId: dataSource.id, evidenceNote: src.evidenceNote },
            update: { evidenceNote: src.evidenceNote },
          });
          break;
        case "persona":
          await prisma.personaSourceCitation.upsert({
            where: { personaId_sourceId: { personaId: targetId, sourceId: dataSource.id } },
            create: { personaId: targetId, sourceId: dataSource.id, evidenceNote: src.evidenceNote },
            update: { evidenceNote: src.evidenceNote },
          });
          break;
        case "deliveryModel":
          await prisma.deliveryModelSourceCitation.upsert({
            where: { deliveryModelId_sourceId: { deliveryModelId: targetId, sourceId: dataSource.id } },
            create: { deliveryModelId: targetId, sourceId: dataSource.id, evidenceNote: src.evidenceNote },
            update: { evidenceNote: src.evidenceNote },
          });
          break;
      }
    } catch {
      // Citation already exists or constraint violation — skip
    }
  }
}
