/**
 * Standards Bridge Writer
 *
 * Per-screen post-processor that walks a finished research result set,
 * resolves the natural keys back to the database row each pillar writer
 * just persisted, and creates `StandardCompliance` rows from the
 * `standardsAlignment` field.
 *
 * Lookup is case-insensitive and tolerant of slight name variations.
 */

import { prisma } from "@/lib/db";
import type { ScreenType } from "../types";
import { writeStandardsAlignment } from "./standards";
import type { ResearchSource } from "../types";

interface ResolvedEntity {
  entityType: string;
  entityId: string;
  entityLabel?: string;
  countryIso3?: string | null;
}

async function resolve(
  screenType: ScreenType,
  row: Record<string, unknown>
): Promise<ResolvedEntity | null> {
  switch (screenType) {
    case "atlas-worldmap":
    case "atlas-system":
    case "atlas-performance":
    case "atlas-insights": {
      const iso3 = String(row.iso3 ?? row.countryIso3 ?? row._itemKey ?? "");
      if (!iso3) return null;
      const c = await prisma.country.findUnique({ where: { iso3 } });
      if (!c) return null;
      return { entityType: "country", entityId: c.id, entityLabel: c.name, countryIso3: c.iso3 };
    }

    case "atlas-benchmarking": {
      const id = String(row.institutionId ?? row._itemKey ?? "");
      if (id) {
        const inst = await prisma.institution.findUnique({ where: { id } }).catch(() => null);
        if (inst) return { entityType: "institution", entityId: inst.id, entityLabel: inst.name, countryIso3: inst.countryCode };
      }
      const name = String(row.institutionName ?? row.name ?? "");
      if (!name) return null;
      const inst = await prisma.institution.findFirst({
        where: { name: { equals: name, mode: "insensitive" } },
      });
      if (!inst) return null;
      return { entityType: "institution", entityId: inst.id, entityLabel: inst.name, countryIso3: inst.countryCode };
    }

    case "services-catalog":
    case "services-channels":
    case "intl-services-catalog":
    case "intl-services-channels": {
      const countryIso3 = String(row.countryIso3 ?? row._itemKey ?? "");
      const name = String(row.serviceName ?? row.name ?? "");
      if (!name || !countryIso3) return null;
      const svc = await prisma.internationalService.findFirst({
        where: { name: { equals: name, mode: "insensitive" }, countryIso3 },
      });
      if (!svc) return null;
      return { entityType: "service", entityId: svc.id, entityLabel: svc.name, countryIso3: svc.countryIso3 };
    }

    case "products-portfolio":
    case "intl-products-portfolio": {
      const name = String(row.name ?? row.productName ?? "");
      if (!name) return null;
      const p = await prisma.product.findFirst({
        where: { name: { equals: name, mode: "insensitive" } },
      });
      if (!p) return null;
      return { entityType: "product", entityId: p.id, entityLabel: p.name };
    }

    case "products-segments":
    case "intl-products-segments": {
      const segment = String(row.segment ?? row.segmentName ?? "");
      const coverageType = String(row.coverageType ?? "");
      if (!segment) return null;
      const s = await prisma.segmentCoverage.findFirst({
        where: {
          segment: { equals: segment, mode: "insensitive" },
          ...(coverageType ? { coverageType: { equals: coverageType, mode: "insensitive" } } : {}),
        },
      }).catch(() => null);
      if (!s) return null;
      return { entityType: "segment", entityId: s.id, entityLabel: `${s.segment} / ${s.coverageType}` };
    }

    case "delivery-channels": {
      const name = String(row.name ?? row.channelName ?? "");
      if (!name) return null;
      const c = await prisma.deliveryChannel.findFirst({
        where: { name: { equals: name, mode: "insensitive" } },
      });
      if (!c) return null;
      return { entityType: "channel", entityId: c.id, entityLabel: c.name };
    }

    case "delivery-personas": {
      const name = String(row.name ?? row.personaName ?? "");
      if (!name) return null;
      const p = await prisma.customerPersona.findFirst({
        where: { name: { equals: name, mode: "insensitive" } },
      });
      if (!p) return null;
      return { entityType: "persona", entityId: p.id, entityLabel: p.name };
    }

    case "delivery-models": {
      const name = String(row.name ?? row.modelName ?? "");
      if (!name) return null;
      const m = await prisma.deliveryModel.findFirst({
        where: { name: { equals: name, mode: "insensitive" } },
      });
      if (!m) return null;
      return { entityType: "delivery-model", entityId: m.id, entityLabel: m.name };
    }

    default:
      return null;
  }
}

export async function writeComplianceForScreen(
  screenType: ScreenType,
  results: Record<string, unknown>[],
  agentLabel: string
): Promise<number> {
  let total = 0;
  for (const row of results) {
    if (!row || typeof row !== "object") continue;
    if (!Array.isArray(row.standardsAlignment) || row.standardsAlignment.length === 0) continue;
    const ref = await resolve(screenType, row);
    if (!ref) continue;
    total += await writeStandardsAlignment({
      ...ref,
      agentLabel,
      alignment: row.standardsAlignment,
      sources: Array.isArray(row.sources) ? (row.sources as ResearchSource[]) : undefined,
    });
  }
  return total;
}
