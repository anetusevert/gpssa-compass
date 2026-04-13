import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") ?? "activity";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "25", 10)));
    const skip = (page - 1) * limit;

    if (type === "executions") {
      const [records, total] = await Promise.all([
        prisma.agentExecution.findMany({
          include: { agent: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.agentExecution.count(),
      ]);

      return NextResponse.json({
        records,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    }

    const [records, total] = await Promise.all([
      prisma.activity.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.activity.count(),
    ]);

    return NextResponse.json({
      records,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Failed to fetch activity:", err);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();

    const activity = await prisma.activity.create({
      data: {
        actor: body.actor,
        action: body.action,
        details: body.details ?? null,
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (err) {
    console.error("Failed to log activity:", err);
    return NextResponse.json(
      { error: "Failed to log activity" },
      { status: 500 }
    );
  }
}
