import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const countries = searchParams.get("countries");
    const category = searchParams.get("category");

    const where: Record<string, unknown> = {};

    if (countries) {
      const iso3List = countries.split(",").map((c) => c.trim().toUpperCase());
      where.countryIso3 = { in: iso3List };
    }

    if (category && category !== "All") {
      where.category = category;
    }

    const services = await prisma.internationalService.findMany({
      where,
      include: {
        institution: { select: { id: true, name: true, shortName: true, country: true } },
        sourceCitations: { include: { source: true }, take: 3 },
      },
      orderBy: [{ countryIso3: "asc" }, { category: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(services);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch international services";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
