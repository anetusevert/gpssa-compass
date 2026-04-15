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
            intlServiceCitations: true,
            intlProductCitations: true,
            intlSegmentCitations: true,
          },
        },
      },
    });
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
