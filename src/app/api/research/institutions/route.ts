import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  const institutions = await prisma.institution.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json(institutions);
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();

  const institution = await prisma.institution.create({
    data: {
      name: body.name,
      country: body.country,
      countryCode: body.countryCode,
      region: body.region,
      description: body.description ?? null,
      services: body.services ?? null,
      digitalMaturity: body.digitalMaturity ?? null,
      keyInnovations: body.keyInnovations ?? null,
      aiAnalysis: body.aiAnalysis ?? null,
      websiteUrl: body.websiteUrl ?? null,
    },
  });

  return NextResponse.json(institution, { status: 201 });
}
