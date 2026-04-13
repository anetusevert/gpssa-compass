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

  // ── Export ──
  async exportAll() {
    const [services, institutions, opportunities, requirements, sources] =
      await Promise.all([
        this.listServicesWithSources(),
        this.listInstitutionsWithSources(),
        this.listOpportunitiesWithSources(),
        this.listRequirementsWithSources(),
        this.listSources(),
      ]);

    return {
      exportedAt: new Date().toISOString(),
      services,
      institutions,
      opportunities,
      requirements,
      sources,
    };
  }
}

export const dataService = new DataService();
