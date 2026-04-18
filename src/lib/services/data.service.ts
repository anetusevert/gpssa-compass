import { prisma } from "@/lib/db";

export class DataService {
  // ── Sources ──
  async listSources() {
    return prisma.dataSource.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            serviceCitations: true,
            institutionCitations: true,
            opportunityCitations: true,
            requirementCitations: true,
            productCitations: true,
            segmentCitations: true,
            innovationCitations: true,
            channelCitations: true,
            personaCitations: true,
            deliveryModelCitations: true,
            intlServiceCitations: true,
            intlProductCitations: true,
            intlSegmentCitations: true,
            countryCitations: true,
          },
        },
      },
    });
  }

  /**
   * Drill-down: return every entity (across all citation tables) that links to a
   * given DataSource. Used by the Sources tab "linked entities" view.
   */
  async listLinkedEntities(sourceId: string) {
    const [
      services,
      institutions,
      opportunities,
      requirements,
      products,
      segments,
      innovations,
      channels,
      personas,
      deliveryModels,
      intlServices,
      intlProducts,
      intlSegments,
      countries,
    ] = await Promise.all([
      prisma.serviceSourceCitation.findMany({
        where: { sourceId },
        include: { service: { select: { id: true, name: true, category: true } } },
      }),
      prisma.institutionSourceCitation.findMany({
        where: { sourceId },
        include: {
          institution: {
            select: { id: true, name: true, shortName: true, country: true },
          },
        },
      }),
      prisma.opportunitySourceCitation.findMany({
        where: { sourceId },
        include: { opportunity: { select: { id: true, title: true, category: true } } },
      }),
      prisma.requirementSourceCitation.findMany({
        where: { sourceId },
        include: { requirement: { select: { id: true, title: true, category: true } } },
      }),
      prisma.productSourceCitation.findMany({
        where: { sourceId },
        include: { product: { select: { id: true, name: true, tier: true } } },
      }),
      prisma.segmentSourceCitation.findMany({
        where: { sourceId },
        include: {
          segment: { select: { id: true, segment: true, coverageType: true } },
        },
      }),
      prisma.innovationSourceCitation.findMany({
        where: { sourceId },
        include: {
          innovation: { select: { id: true, title: true, innovationType: true } },
        },
      }),
      prisma.channelSourceCitation.findMany({
        where: { sourceId },
        include: { channel: { select: { id: true, name: true, channelType: true } } },
      }),
      prisma.personaSourceCitation.findMany({
        where: { sourceId },
        include: { persona: { select: { id: true, name: true, segment: true } } },
      }),
      prisma.deliveryModelSourceCitation.findMany({
        where: { sourceId },
        include: { deliveryModel: { select: { id: true, name: true } } },
      }),
      prisma.intlServiceCitation.findMany({
        where: { sourceId },
        include: {
          service: {
            select: { id: true, name: true, countryIso3: true, category: true },
          },
        },
      }),
      prisma.intlProductCitation.findMany({
        where: { sourceId },
        include: {
          product: {
            select: { id: true, name: true, countryIso3: true, tier: true },
          },
        },
      }),
      prisma.intlSegmentCitation.findMany({
        where: { sourceId },
        include: {
          segment: { select: { id: true, segment: true, countryIso3: true } },
        },
      }),
      prisma.countrySourceCitation.findMany({
        where: { sourceId },
        include: {
          country: { select: { id: true, name: true, iso3: true, region: true } },
        },
      }),
    ]);

    return {
      services: services.map((c) => ({
        kind: "service" as const,
        citation: c.citation,
        evidenceNote: c.evidenceNote,
        entity: c.service,
      })),
      institutions: institutions.map((c) => ({
        kind: "institution" as const,
        citation: c.citation,
        evidenceNote: c.evidenceNote,
        entity: c.institution,
      })),
      opportunities: opportunities.map((c) => ({
        kind: "opportunity" as const,
        citation: c.citation,
        evidenceNote: c.evidenceNote,
        entity: c.opportunity,
      })),
      requirements: requirements.map((c) => ({
        kind: "requirement" as const,
        citation: c.citation,
        evidenceNote: c.evidenceNote,
        entity: c.requirement,
      })),
      products: products.map((c) => ({
        kind: "product" as const,
        citation: c.citation,
        evidenceNote: c.evidenceNote,
        entity: c.product,
      })),
      segments: segments.map((c) => ({
        kind: "segment" as const,
        citation: c.citation,
        evidenceNote: c.evidenceNote,
        entity: c.segment,
      })),
      innovations: innovations.map((c) => ({
        kind: "innovation" as const,
        citation: c.citation,
        evidenceNote: c.evidenceNote,
        entity: c.innovation,
      })),
      channels: channels.map((c) => ({
        kind: "channel" as const,
        citation: c.citation,
        evidenceNote: c.evidenceNote,
        entity: c.channel,
      })),
      personas: personas.map((c) => ({
        kind: "persona" as const,
        citation: c.citation,
        evidenceNote: c.evidenceNote,
        entity: c.persona,
      })),
      deliveryModels: deliveryModels.map((c) => ({
        kind: "deliveryModel" as const,
        citation: c.citation,
        evidenceNote: c.evidenceNote,
        entity: c.deliveryModel,
      })),
      intlServices: intlServices.map((c) => ({
        kind: "intlService" as const,
        citation: c.citation,
        evidenceNote: c.evidenceNote,
        entity: c.service,
      })),
      intlProducts: intlProducts.map((c) => ({
        kind: "intlProduct" as const,
        citation: c.citation,
        evidenceNote: c.evidenceNote,
        entity: c.product,
      })),
      intlSegments: intlSegments.map((c) => ({
        kind: "intlSegment" as const,
        citation: c.citation,
        evidenceNote: c.evidenceNote,
        entity: c.segment,
      })),
      countries: countries.map((c) => ({
        kind: "country" as const,
        citation: c.citation,
        evidenceNote: c.evidenceNote,
        entity: c.country,
      })),
    };
  }

  async createSource(data: {
    title: string;
    url: string;
    publisher?: string;
    sourceType?: string;
    description?: string;
    region?: string;
    publishedAt?: Date;
    accessedAt?: Date;
  }) {
    return prisma.dataSource.create({
      data: {
        title: data.title,
        url: data.url,
        publisher: data.publisher ?? null,
        sourceType: data.sourceType ?? "website",
        description: data.description ?? null,
        region: data.region ?? null,
        publishedAt: data.publishedAt ?? null,
        accessedAt: data.accessedAt ?? new Date(),
      },
    });
  }

  async updateSource(id: string, data: Partial<{
    title: string;
    url: string;
    publisher: string;
    sourceType: string;
    description: string;
    region: string;
  }>) {
    return prisma.dataSource.update({ where: { id }, data });
  }

  async deleteSource(id: string) {
    return prisma.dataSource.delete({ where: { id } });
  }

  // ── Citation linking ──
  async linkServiceSource(serviceId: string, sourceId: string, citation?: string, evidenceNote?: string) {
    return prisma.serviceSourceCitation.upsert({
      where: { serviceId_sourceId: { serviceId, sourceId } },
      update: { citation, evidenceNote },
      create: { serviceId, sourceId, citation, evidenceNote },
    });
  }

  async linkInstitutionSource(institutionId: string, sourceId: string, citation?: string, evidenceNote?: string) {
    return prisma.institutionSourceCitation.upsert({
      where: { institutionId_sourceId: { institutionId, sourceId } },
      update: { citation, evidenceNote },
      create: { institutionId, sourceId, citation, evidenceNote },
    });
  }

  async linkOpportunitySource(opportunityId: string, sourceId: string, citation?: string, evidenceNote?: string) {
    return prisma.opportunitySourceCitation.upsert({
      where: { opportunityId_sourceId: { opportunityId, sourceId } },
      update: { citation, evidenceNote },
      create: { opportunityId, sourceId, citation, evidenceNote },
    });
  }

  async linkRequirementSource(requirementId: string, sourceId: string, citation?: string, evidenceNote?: string) {
    return prisma.requirementSourceCitation.upsert({
      where: { requirementId_sourceId: { requirementId, sourceId } },
      update: { citation, evidenceNote },
      create: { requirementId, sourceId, citation, evidenceNote },
    });
  }

  // ── Services with sources ──
  async listServicesWithSources() {
    return prisma.gPSSAService.findMany({
      orderBy: { name: "asc" },
      include: {
        sourceCitations: { include: { source: true } },
      },
    });
  }

  async listInstitutionsWithSources() {
    return prisma.institution.findMany({
      orderBy: { name: "asc" },
      include: {
        sourceCitations: { include: { source: true } },
      },
    });
  }

  async listOpportunitiesWithSources() {
    return prisma.opportunity.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        sourceCitations: { include: { source: true } },
      },
    });
  }

  async listRequirementsWithSources() {
    return prisma.requirement.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        sourceCitations: { include: { source: true } },
      },
    });
  }

  // ── International Services ──
  async listInternationalServicesWithSources(countryIso3?: string) {
    return prisma.internationalService.findMany({
      where: countryIso3 ? { countryIso3 } : undefined,
      orderBy: [{ countryIso3: "asc" }, { name: "asc" }],
      include: {
        institution: { select: { id: true, name: true, shortName: true, country: true } },
        sourceCitations: { include: { source: true } },
      },
    });
  }

  // ── International Products ──
  async listInternationalProductsWithSources(countryIso3?: string) {
    return prisma.internationalProduct.findMany({
      where: countryIso3 ? { countryIso3 } : undefined,
      orderBy: [{ countryIso3: "asc" }, { name: "asc" }],
      include: {
        institution: { select: { id: true, name: true, shortName: true, country: true } },
        sourceCitations: { include: { source: true } },
      },
    });
  }

  // ── International Segment Coverage ──
  async listInternationalSegmentsWithSources(countryIso3?: string) {
    return prisma.internationalSegmentCoverage.findMany({
      where: countryIso3 ? { countryIso3 } : undefined,
      orderBy: [{ countryIso3: "asc" }, { segment: "asc" }],
      include: {
        sourceCitations: { include: { source: true } },
      },
    });
  }

  // ── ILO Standards ──
  async listILOStandards(category?: string) {
    return prisma.iLOStandard.findMany({
      where: category ? { category } : undefined,
      orderBy: { code: "asc" },
    });
  }

  // ── International citation linking ──
  async linkIntlServiceSource(serviceId: string, sourceId: string, citation?: string, evidenceNote?: string) {
    return prisma.intlServiceCitation.upsert({
      where: { serviceId_sourceId: { serviceId, sourceId } },
      update: { citation, evidenceNote },
      create: { serviceId, sourceId, citation, evidenceNote },
    });
  }

  async linkIntlProductSource(productId: string, sourceId: string, citation?: string, evidenceNote?: string) {
    return prisma.intlProductCitation.upsert({
      where: { productId_sourceId: { productId, sourceId } },
      update: { citation, evidenceNote },
      create: { productId, sourceId, citation, evidenceNote },
    });
  }

  async linkIntlSegmentSource(segmentId: string, sourceId: string, citation?: string, evidenceNote?: string) {
    return prisma.intlSegmentCitation.upsert({
      where: { segmentId_sourceId: { segmentId, sourceId } },
      update: { citation, evidenceNote },
      create: { segmentId, sourceId, citation, evidenceNote },
    });
  }

  // ── Export ──
  async exportAll() {
    const [
      services,
      institutions,
      opportunities,
      requirements,
      sources,
      intlServices,
      intlProducts,
      intlSegments,
      iloStandards,
    ] = await Promise.all([
      this.listServicesWithSources(),
      this.listInstitutionsWithSources(),
      this.listOpportunitiesWithSources(),
      this.listRequirementsWithSources(),
      this.listSources(),
      this.listInternationalServicesWithSources(),
      this.listInternationalProductsWithSources(),
      this.listInternationalSegmentsWithSources(),
      this.listILOStandards(),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      services,
      institutions,
      opportunities,
      requirements,
      sources,
      internationalServices: intlServices,
      internationalProducts: intlProducts,
      internationalSegments: intlSegments,
      iloStandards,
    };
  }
}

export const dataService = new DataService();
