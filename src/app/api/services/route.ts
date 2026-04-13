import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  try {
    const services = await prisma.gPSSAService.findMany({
      include: { analyses: { orderBy: { createdAt: "desc" }, take: 1 } },
      orderBy: { category: "asc" },
    });
    return NextResponse.json(services);
  } catch (error) {
    console.error("Failed to fetch services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const service = await prisma.gPSSAService.create({
      data: {
        name: body.name,
        category: body.category,
        description: body.description ?? null,
        userTypes: body.userTypes ?? [],
        currentState: body.currentState ?? null,
        painPoints: body.painPoints ?? [],
        opportunities: body.opportunities ?? [],
      },
    });
    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("Failed to create service:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}
