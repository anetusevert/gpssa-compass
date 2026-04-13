import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const opportunities = await prisma.opportunity.findMany({
      include: { conceptSheet: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(opportunities);
  } catch (error) {
    console.error("Failed to fetch opportunities:", error);
    return NextResponse.json(
      { error: "Failed to fetch opportunities" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { title, category, description, impact, effort, strategicFit, feasibility, sourceSection } = body as {
      title: string;
      category: string;
      description?: string;
      impact?: string;
      effort?: string;
      strategicFit?: number;
      feasibility?: number;
      sourceSection?: string;
    };

    if (!title || !category) {
      return NextResponse.json(
        { error: "Title and category are required" },
        { status: 400 }
      );
    }

    const opportunity = await prisma.opportunity.create({
      data: {
        title,
        category,
        description,
        impact: impact ?? "medium",
        effort: effort ?? "medium",
        strategicFit,
        feasibility,
        sourceSection,
      },
    });

    return NextResponse.json(opportunity, { status: 201 });
  } catch (error) {
    console.error("Failed to create opportunity:", error);
    return NextResponse.json(
      { error: "Failed to create opportunity" },
      { status: 500 }
    );
  }
}
