import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/admin-guard";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const service = await prisma.gPSSAService.findUnique({
      where: { id: params.id },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    let painPoints: string[] = [];
    let opportunities: string[] = [];
    try { painPoints = JSON.parse(service.painPoints as unknown as string) ?? []; } catch { /* keep default */ }
    try { opportunities = JSON.parse(service.opportunities as unknown as string) ?? []; } catch { /* keep default */ }

    const sampleAnalysis = {
      summary: `Analysis of ${service.name} within the ${service.category} category. This service presents ${painPoints.length} pain points and ${opportunities.length} improvement opportunities.`,
      digitalReadiness: {
        score: Math.floor(Math.random() * 40) + 40,
        assessment:
          "Moderate digital readiness with room for automation and self-service capabilities.",
      },
      recommendations: [
        {
          title: "Implement Digital Self-Service Portal",
          priority: "high",
          description: `Enable end-to-end digital processing for ${service.name} to reduce manual intervention and improve turnaround time.`,
        },
        {
          title: "AI-Powered Document Verification",
          priority: "medium",
          description:
            "Leverage AI/ML for automated document verification and validation to reduce processing errors.",
        },
        {
          title: "Mobile-First Experience",
          priority: "medium",
          description:
            "Design a mobile-optimized workflow to improve accessibility and user satisfaction.",
        },
        {
          title: "Real-Time Status Tracking",
          priority: "high",
          description:
            "Implement real-time application status tracking with proactive notifications.",
        },
      ],
      estimatedImpact: {
        processingTimeReduction: "40-60%",
        customerSatisfactionIncrease: "25-35%",
        costSavings: "20-30%",
      },
      generatedAt: new Date().toISOString(),
    };

    const analysis = await prisma.serviceAnalysis.create({
      data: {
        serviceId: params.id,
        analysis: JSON.stringify(sampleAnalysis),
        model: "gpt-4o (placeholder)",
      },
    });

    return NextResponse.json(analysis, { status: 201 });
  } catch (error) {
    console.error("Failed to analyze service:", error);
    return NextResponse.json(
      { error: "Failed to analyze service" },
      { status: 500 }
    );
  }
}
