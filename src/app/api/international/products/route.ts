import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const countries = searchParams.get("countries");
    const tier = searchParams.get("tier");

    const where: Record<string, unknown> = {};

    if (countries) {
      const iso3List = countries.split(",").map((c) => c.trim().toUpperCase());
      where.countryIso3 = { in: iso3List };
    }

    if (tier && tier !== "All") {
      where.tier = tier;
    }

    const products = await prisma.internationalProduct.findMany({
      where,
      include: {
        institution: { select: { id: true, name: true, shortName: true, country: true } },
        sourceCitations: { include: { source: true }, take: 3 },
      },
      orderBy: [{ countryIso3: "asc" }, { tier: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(products);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch international products";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
