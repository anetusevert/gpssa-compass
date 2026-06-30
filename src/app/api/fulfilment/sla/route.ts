import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { seedFulfilment } from "@/lib/fulfilment/seed";

/**
 * GET /api/fulfilment/sla
 * Returns SLA definitions, resolving the OLA→SLA underpinning links so the UI
 * can render which internal OLAs underpin each customer SLA.
 */
export async function GET() {
  try {
    const count = await prisma.sLADefinition.count();
    if (count === 0) {
      await seedFulfilment(prisma);
    }

    const all = await prisma.sLADefinition.findMany({
      orderBy: [{ type: "asc" }, { tier: "asc" }, { targetHours: "asc" }],
      include: {
        underpins: { select: { id: true, name: true, serviceName: true, tier: true } },
        underpinnedBy: {
          select: { id: true, name: true, serviceName: true, targetHours: true, direction: true },
        },
      },
    });

    const slas = all
      .filter((s) => s.type === "sla")
      .map((s) => ({
        id: s.id,
        serviceName: s.serviceName,
        name: s.name,
        tier: s.tier,
        type: s.type,
        targetHours: s.targetHours,
        description: s.description,
        // OLAs that underpin THIS customer SLA.
        underpinnedBy: s.underpinnedBy.map((o) => ({
          id: o.id,
          name: o.name,
          serviceName: o.serviceName,
          targetHours: o.targetHours,
          direction: o.direction,
        })),
      }));

    const olas = all
      .filter((s) => s.type === "ola")
      .map((s) => ({
        id: s.id,
        serviceName: s.serviceName,
        name: s.name,
        tier: s.tier,
        type: s.type,
        targetHours: s.targetHours,
        direction: s.direction,
        description: s.description,
        underpinsSlaId: s.underpinsSlaId,
        underpins: s.underpins
          ? { id: s.underpins.id, name: s.underpins.name, serviceName: s.underpins.serviceName }
          : null,
      }));

    return NextResponse.json({ slas, olas });
  } catch (error) {
    console.error("Failed to fetch SLA definitions:", error);
    return NextResponse.json(
      { error: "Failed to fetch SLA definitions" },
      { status: 500 }
    );
  }
}
