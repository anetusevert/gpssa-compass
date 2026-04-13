import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const conceptSheet = await prisma.conceptSheet.findUnique({
      where: { opportunityId: id },
      include: { opportunity: true },
    });

    if (!conceptSheet) {
      return NextResponse.json(
        { error: "Concept sheet not found for this opportunity" },
        { status: 404 }
      );
    }

    return NextResponse.json(conceptSheet);
  } catch (error) {
    console.error("Failed to fetch concept sheet:", error);
    return NextResponse.json(
      { error: "Failed to fetch concept sheet" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
    });

    if (!opportunity) {
      return NextResponse.json(
        { error: "Opportunity not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const content = body.content ?? {
      problemStatement:
        "Auto-generated problem statement based on opportunity analysis.",
      proposedSolution:
        "AI-recommended solution leveraging digital transformation capabilities.",
      targetUsers: ["Insured", "Employer"],
      expectedOutcomes: [
        "Improved operational efficiency",
        "Enhanced user experience",
        "Reduced processing time by 40%",
      ],
      kpis: [
        "User adoption rate",
        "Processing time reduction",
        "Customer satisfaction score",
      ],
      dependencies: [
        "Core platform modernization",
        "API gateway implementation",
      ],
      risks: [
        "Integration complexity with legacy systems",
        "Change management resistance",
      ],
      implementationNotes:
        "Phased rollout recommended. Start with pilot group, gather feedback, then expand to full deployment.",
    };

    const conceptSheet = await prisma.conceptSheet.upsert({
      where: { opportunityId: id },
      create: {
        opportunityId: id,
        content,
      },
      update: {
        content,
      },
      include: { opportunity: true },
    });

    return NextResponse.json(conceptSheet, { status: 201 });
  } catch (error) {
    console.error("Failed to create/update concept sheet:", error);
    return NextResponse.json(
      { error: "Failed to create/update concept sheet" },
      { status: 500 }
    );
  }
}
