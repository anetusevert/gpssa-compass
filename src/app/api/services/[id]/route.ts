import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, requireAuth } from "@/lib/admin-guard";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service = await prisma.gPSSAService.findUnique({
      where: { id: params.id },
      include: { analyses: { orderBy: { createdAt: "desc" } } },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error("Failed to fetch service:", error);
    return NextResponse.json(
      { error: "Failed to fetch service" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await req.json();
    const service = await prisma.gPSSAService.update({
      where: { id: params.id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.userTypes !== undefined && { userTypes: body.userTypes }),
        ...(body.currentState !== undefined && {
          currentState: body.currentState,
        }),
        ...(body.painPoints !== undefined && { painPoints: body.painPoints }),
        ...(body.opportunities !== undefined && {
          opportunities: body.opportunities,
        }),
      },
    });
    return NextResponse.json(service);
  } catch (error) {
    console.error("Failed to update service:", error);
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    await prisma.serviceAnalysis.deleteMany({
      where: { serviceId: params.id },
    });
    await prisma.gPSSAService.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete service:", error);
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    );
  }
}
