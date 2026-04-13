import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const requirements = await prisma.requirement.findMany({
      where: category ? { category } : undefined,
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(requirements);
  } catch (error) {
    console.error("Failed to fetch requirements:", error);
    return NextResponse.json(
      { error: "Failed to fetch requirements" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const requirement = await prisma.requirement.create({
      data: {
        category: body.category,
        title: body.title,
        description: body.description ?? null,
        details: body.details ?? null,
        priority: body.priority ?? "medium",
        status: body.status ?? "identified",
      },
    });

    return NextResponse.json(requirement, { status: 201 });
  } catch (error) {
    console.error("Failed to create requirement:", error);
    return NextResponse.json(
      { error: "Failed to create requirement" },
      { status: 500 }
    );
  }
}
