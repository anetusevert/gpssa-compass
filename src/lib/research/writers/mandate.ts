/**
 * Writer for mandate-corpus research results.
 *
 * Persists the structured JSON produced by the mandate-corpus agent into:
 *   - Standard / StandardRequirement (the canonical legal library)
 *   - StandardSourceCitation (linking each Standard to its GpssaPage's DataSource)
 *   - GpssaMilestone (the historical timeline)
 *   - StandardCompliance (the bridge linking each statutory requirement to the
 *     concrete GPSSA service / product / channel / segment / persona that fulfils it)
 *
 * obligationLinks resolution:
 *   The agent emits entityRef as a human-readable name. We resolve to ids by
 *   exact name match first, then by case-insensitive contains. Unresolved links
 *   are silently dropped (the agent prompt instructs the model to omit rather
 *   than fabricate).
 */

import { prisma } from "@/lib/db";
import type { ScreenType } from "../types";

interface StandardSpec {
  slug?: string;
  code?: string | null;
  title?: string;
  category?: string;
  scope?: string;
  region?: string | null;
  description?: string | null;
  rationale?: string | null;
  url?: string | null;
  publishedAt?: string | null;
}

interface RequirementSpec {
  standardSlug?: string;
  slug?: string;
  code?: string | null;
  title?: string;
  description?: string | null;
  pillar?: string | null;
  sortOrder?: number | null;
}

interface MilestoneSpec {
  year?: number;
  date?: string | null;
  title?: string;
  description?: string;
  kind?: string;
  sourceUrl?: string | null;
}

interface ObligationLinkSpec {
  requirementSlug?: string;
  entityType?: string;
  entityRef?: string;
  rationale?: string | null;
}

interface MandateResult {
  _itemKey?: string;
  _itemLabel?: string;
  sourceUrl?: string;
  standards?: StandardSpec[];
  requirements?: RequirementSpec[];
  milestones?: MilestoneSpec[];
  obligationLinks?: ObligationLinkSpec[];
}

const ALLOWED_ENTITY_TYPES = new Set(["gpssa-service", "product", "delivery-channel", "segment", "persona"]);

function safeDate(input: string | null | undefined): Date | null {
  if (!input) return null;
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function findOrCreateDataSourceFor(url: string | undefined, title: string | undefined): Promise<string | null> {
  if (!url) return null;
  const existing = await prisma.dataSource.findFirst({ where: { url } });
  if (existing) return existing.id;
  const created = await prisma.dataSource.create({
    data: {
      title: title || url,
      url,
      publisher: "General Pension and Social Security Authority",
      sourceType: "regulation",
      region: "AE",
      accessedAt: new Date(),
    },
  });
  return created.id;
}

async function resolveEntityId(entityType: string, entityRef: string): Promise<string | null> {
  const ref = entityRef.trim();
  if (!ref) return null;

  switch (entityType) {
    case "gpssa-service": {
      const exact = await prisma.gPSSAService.findFirst({ where: { name: ref } });
      if (exact) return exact.id;
      const fuzzy = await prisma.gPSSAService.findFirst({ where: { name: { contains: ref, mode: "insensitive" } } });
      return fuzzy?.id ?? null;
    }
    case "product": {
      const exact = await prisma.product.findFirst({ where: { name: ref } });
      if (exact) return exact.id;
      const fuzzy = await prisma.product.findFirst({ where: { name: { contains: ref, mode: "insensitive" } } });
      return fuzzy?.id ?? null;
    }
    case "delivery-channel": {
      const exact = await prisma.deliveryChannel.findFirst({ where: { name: ref } });
      if (exact) return exact.id;
      const fuzzy = await prisma.deliveryChannel.findFirst({ where: { name: { contains: ref, mode: "insensitive" } } });
      return fuzzy?.id ?? null;
    }
    case "segment": {
      const exact = await prisma.segmentCoverage.findFirst({ where: { segment: ref } });
      if (exact) return exact.id;
      const fuzzy = await prisma.segmentCoverage.findFirst({ where: { segment: { contains: ref, mode: "insensitive" } } });
      return fuzzy?.id ?? null;
    }
    case "persona": {
      const exact = await prisma.customerPersona.findFirst({ where: { name: ref } });
      if (exact) return exact.id;
      const fuzzy = await prisma.customerPersona.findFirst({ where: { name: { contains: ref, mode: "insensitive" } } });
      return fuzzy?.id ?? null;
    }
    default:
      return null;
  }
}

export async function writeMandateResults(
  _screenType: ScreenType,
  results: Record<string, unknown>[],
  agentLabel: string
): Promise<number> {
  let writtenStandards = 0;
  let writtenRequirements = 0;
  let writtenMilestones = 0;
  let writtenCompliances = 0;

  for (const r of results as MandateResult[]) {
    const sourceUrl = r.sourceUrl?.trim();
    const sourceId = await findOrCreateDataSourceFor(sourceUrl, r._itemLabel);
    const standardIdBySlug = new Map<string, string>();
    const requirementIdByCompositeSlug = new Map<string, string>();

    for (const std of r.standards ?? []) {
      if (!std?.slug || !std?.title) continue;
      const standard = await prisma.standard.upsert({
        where: { slug: std.slug },
        update: {
          code: std.code ?? null,
          title: std.title,
          body: "GPSSA",
          bodyShort: "GPSSA",
          category: std.category ?? "legal-mandate",
          scope: std.scope ?? "national",
          region: std.region ?? "AE",
          description: std.description ?? null,
          rationale: std.rationale ?? null,
          url: std.url ?? sourceUrl ?? null,
          publishedAt: safeDate(std.publishedAt),
          isActive: true,
        },
        create: {
          slug: std.slug,
          code: std.code ?? null,
          title: std.title,
          body: "GPSSA",
          bodyShort: "GPSSA",
          category: std.category ?? "legal-mandate",
          scope: std.scope ?? "national",
          region: std.region ?? "AE",
          description: std.description ?? null,
          rationale: std.rationale ?? null,
          url: std.url ?? sourceUrl ?? null,
          publishedAt: safeDate(std.publishedAt),
          isActive: true,
        },
      });
      writtenStandards += 1;
      standardIdBySlug.set(std.slug, standard.id);

      if (sourceId) {
        try {
          await prisma.standardSourceCitation.upsert({
            where: { standardId_sourceId: { standardId: standard.id, sourceId } },
            create: { standardId: standard.id, sourceId, evidenceNote: `Indexed by ${agentLabel}` },
            update: {},
          });
        } catch {
          // ignore duplicate citation conflicts
        }
      }
    }

    for (const req of r.requirements ?? []) {
      if (!req?.slug || !req?.title || !req?.standardSlug) continue;
      const standardId = standardIdBySlug.get(req.standardSlug);
      if (!standardId) continue;
      const requirement = await prisma.standardRequirement.upsert({
        where: { standardId_slug: { standardId, slug: req.slug } },
        update: {
          code: req.code ?? null,
          title: req.title,
          description: req.description ?? null,
          pillar: req.pillar ?? null,
          sortOrder: typeof req.sortOrder === "number" ? req.sortOrder : 0,
        },
        create: {
          standardId,
          slug: req.slug,
          code: req.code ?? null,
          title: req.title,
          description: req.description ?? null,
          pillar: req.pillar ?? null,
          sortOrder: typeof req.sortOrder === "number" ? req.sortOrder : 0,
        },
      });
      writtenRequirements += 1;
      requirementIdByCompositeSlug.set(`${req.standardSlug}::${req.slug}`, requirement.id);
      requirementIdByCompositeSlug.set(req.slug, requirement.id);
    }

    for (const m of r.milestones ?? []) {
      if (!m?.year || !m?.title || !m?.description) continue;
      const exists = await prisma.gpssaMilestone.findFirst({
        where: { year: m.year, title: m.title },
      });
      if (exists) {
        await prisma.gpssaMilestone.update({
          where: { id: exists.id },
          data: {
            date: m.date ?? null,
            description: m.description,
            kind: m.kind ?? "milestone",
            sourceUrl: m.sourceUrl ?? sourceUrl ?? null,
          },
        });
      } else {
        await prisma.gpssaMilestone.create({
          data: {
            year: m.year,
            date: m.date ?? null,
            title: m.title,
            description: m.description,
            kind: m.kind ?? "milestone",
            sourceUrl: m.sourceUrl ?? sourceUrl ?? null,
          },
        });
      }
      writtenMilestones += 1;
    }

    for (const link of r.obligationLinks ?? []) {
      if (!link?.requirementSlug || !link?.entityType || !link?.entityRef) continue;
      if (!ALLOWED_ENTITY_TYPES.has(link.entityType)) continue;
      const requirementId = requirementIdByCompositeSlug.get(link.requirementSlug);
      if (!requirementId) continue;
      const requirement = await prisma.standardRequirement.findUnique({ where: { id: requirementId } });
      if (!requirement) continue;
      const entityId = await resolveEntityId(link.entityType, link.entityRef);
      if (!entityId) continue;

      try {
        const compliance = await prisma.standardCompliance.upsert({
          where: {
            standardId_entityType_entityId: {
              standardId: requirement.standardId,
              entityType: link.entityType,
              entityId,
            },
          },
          update: {
            entityLabel: link.entityRef,
            rationale: link.rationale ?? null,
            computedBy: "agent:mandate-corpus",
            score: 100,
            band: "fulfils",
          },
          create: {
            standardId: requirement.standardId,
            entityType: link.entityType,
            entityId,
            entityLabel: link.entityRef,
            countryIso3: "ARE",
            rationale: link.rationale ?? null,
            computedBy: "agent:mandate-corpus",
            score: 100,
            band: "fulfils",
          },
        });
        writtenCompliances += 1;

        // Pin the requirement -> compliance edge so the alignment view can join
        // each statutory article directly to the entity that fulfils it.
        await prisma.standardComplianceItem.upsert({
          where: {
            complianceId_requirementId: {
              complianceId: compliance.id,
              requirementId: requirement.id,
            },
          },
          update: {
            score: 100,
            status: "fulfils",
            evidence: link.rationale ?? null,
          },
          create: {
            complianceId: compliance.id,
            requirementId: requirement.id,
            score: 100,
            status: "fulfils",
            evidence: link.rationale ?? null,
          },
        });
      } catch {
        // ignore conflicts
      }
    }
  }

  console.log(
    `[writers/mandate] standards=${writtenStandards} requirements=${writtenRequirements} milestones=${writtenMilestones} compliances=${writtenCompliances}`
  );
  return writtenStandards + writtenRequirements + writtenMilestones + writtenCompliances;
}
