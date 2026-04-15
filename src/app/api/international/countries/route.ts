import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [serviceCounts, productCounts, segmentCounts] = await Promise.all([
      prisma.internationalService.groupBy({
        by: ["countryIso3"],
        _count: { id: true },
      }),
      prisma.internationalProduct.groupBy({
        by: ["countryIso3"],
        _count: { id: true },
      }),
      prisma.internationalSegmentCoverage.groupBy({
        by: ["countryIso3"],
        _count: { id: true },
      }),
    ]);

    const countryMap = new Map<string, { services: number; products: number; segments: number }>();

    for (const s of serviceCounts) {
      const entry = countryMap.get(s.countryIso3) ?? { services: 0, products: 0, segments: 0 };
      entry.services = s._count.id;
      countryMap.set(s.countryIso3, entry);
    }
    for (const p of productCounts) {
      const entry = countryMap.get(p.countryIso3) ?? { services: 0, products: 0, segments: 0 };
      entry.products = p._count.id;
      countryMap.set(p.countryIso3, entry);
    }
    for (const seg of segmentCounts) {
      const entry = countryMap.get(seg.countryIso3) ?? { services: 0, products: 0, segments: 0 };
      entry.segments = seg._count.id;
      countryMap.set(seg.countryIso3, entry);
    }

    const countries = await prisma.country.findMany({
      where: { iso3: { in: Array.from(countryMap.keys()) } },
      select: { iso3: true, name: true, flag: true, region: true },
      orderBy: { name: "asc" },
    });

    const result = countries.map((c) => ({
      ...c,
      dataCounts: countryMap.get(c.iso3) ?? { services: 0, products: 0, segments: 0 },
    }));

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch countries with data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
