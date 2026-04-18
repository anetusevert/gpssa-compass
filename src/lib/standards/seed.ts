import type { PrismaClient } from "@prisma/client";
import { STANDARDS_CATALOG, STANDARDS_DATA_SOURCES } from "./catalog";

/**
 * Idempotently seed the Standards library, the canonical source documents
 * (DataSource rows), and the join-table linking each Standard to its source(s).
 */
export async function seedStandardsLibrary(prisma: PrismaClient): Promise<{
  standardsUpserted: number;
  requirementsUpserted: number;
  sourcesUpserted: number;
}> {
  // 1. Upsert reference DataSources (one per official standard URL).
  const sourceIdBySlug = new Map<string, string>();
  for (const src of STANDARDS_DATA_SOURCES) {
    const existing = await prisma.dataSource.findFirst({ where: { url: src.url } });
    const row = existing
      ? await prisma.dataSource.update({
          where: { id: existing.id },
          data: {
            title: src.title,
            publisher: src.publisher,
            region: src.region,
            sourceType: src.sourceType,
          },
        })
      : await prisma.dataSource.create({
          data: {
            title: src.title,
            url: src.url,
            publisher: src.publisher,
            region: src.region,
            sourceType: src.sourceType,
            accessedAt: new Date(),
          },
        });
    sourceIdBySlug.set(src.slug, row.id);
  }

  // 2. Upsert Standards + their Requirements.
  let standardsUpserted = 0;
  let requirementsUpserted = 0;
  for (const std of STANDARDS_CATALOG) {
    const standard = await prisma.standard.upsert({
      where: { slug: std.slug },
      update: {
        code: std.code,
        title: std.title,
        body: std.body,
        bodyShort: std.bodyShort,
        category: std.category,
        scope: std.scope,
        region: std.region,
        description: std.description,
        rationale: std.rationale,
        url: std.url,
        publishedAt: std.publishedYear ? new Date(`${std.publishedYear}-01-01`) : null,
        sortOrder: std.sortOrder ?? 0,
      },
      create: {
        slug: std.slug,
        code: std.code,
        title: std.title,
        body: std.body,
        bodyShort: std.bodyShort,
        category: std.category,
        scope: std.scope,
        region: std.region,
        description: std.description,
        rationale: std.rationale,
        url: std.url,
        publishedAt: std.publishedYear ? new Date(`${std.publishedYear}-01-01`) : null,
        sortOrder: std.sortOrder ?? 0,
      },
    });
    standardsUpserted += 1;

    for (const req of std.requirements) {
      await prisma.standardRequirement.upsert({
        where: { standardId_slug: { standardId: standard.id, slug: req.slug } },
        update: {
          code: req.code,
          title: req.title,
          description: req.description,
          weight: req.weight ?? 1.0,
          pillar: req.pillar,
          sortOrder: req.sortOrder ?? 0,
        },
        create: {
          standardId: standard.id,
          slug: req.slug,
          code: req.code,
          title: req.title,
          description: req.description,
          weight: req.weight ?? 1.0,
          pillar: req.pillar,
          sortOrder: req.sortOrder ?? 0,
        },
      });
      requirementsUpserted += 1;
    }

    // 3. Link Standard ↔ source(s)
    for (const sourceSlug of std.sourceSlugs ?? []) {
      const sourceId = sourceIdBySlug.get(sourceSlug);
      if (!sourceId) continue;
      await prisma.standardSourceCitation.upsert({
        where: { standardId_sourceId: { standardId: standard.id, sourceId } },
        update: {},
        create: { standardId: standard.id, sourceId, citation: std.title },
      });
    }
  }

  return {
    standardsUpserted,
    requirementsUpserted,
    sourcesUpserted: sourceIdBySlug.size,
  };
}
