import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runAllPillars, PILLAR_ORDER, type PillarKey } from "@/lib/research/orchestrator";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RunAllRequestBody {
  pillars?: PillarKey[];
  /**
   * If true, returns immediately and runs orchestration in the background.
   * If false, awaits all pillars before returning the full result set.
   */
  background?: boolean;
}

function isPillarKey(v: unknown): v is PillarKey {
  return typeof v === "string" && (PILLAR_ORDER as readonly string[]).includes(v);
}

export async function POST(req: Request) {
  let body: RunAllRequestBody = {};
  try {
    body = (await req.json()) as RunAllRequestBody;
  } catch {
    body = {};
  }

  const pillars = Array.isArray(body.pillars)
    ? (body.pillars.filter(isPillarKey) as PillarKey[])
    : undefined;

  const background = body.background !== false; // default true

  // Capture an orchestration run record so the UI can correlate.
  const runRecord = await prisma.orchestratorRun.create({
    data: {
      status: "running",
      pillars: JSON.stringify(pillars ?? PILLAR_ORDER),
      startedAt: new Date(),
    },
  });

  if (background) {
    runAllPillars({ pillars })
      .then(async (results) => {
        await prisma.orchestratorRun.update({
          where: { id: runRecord.id },
          data: {
            status: "completed",
            completedAt: new Date(),
            results: JSON.stringify(results),
          },
        });
      })
      .catch(async (err) => {
        const message = err instanceof Error ? err.message : "orchestration_failed";
        await prisma.orchestratorRun.update({
          where: { id: runRecord.id },
          data: {
            status: "failed",
            completedAt: new Date(),
            lastError: message,
          },
        });
      });

    return NextResponse.json(
      { runId: runRecord.id, status: "running", pillars: pillars ?? PILLAR_ORDER },
      { status: 202 }
    );
  }

  try {
    const results = await runAllPillars({ pillars });
    await prisma.orchestratorRun.update({
      where: { id: runRecord.id },
      data: {
        status: "completed",
        completedAt: new Date(),
        results: JSON.stringify(results),
      },
    });
    return NextResponse.json({ runId: runRecord.id, results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "orchestration_failed";
    await prisma.orchestratorRun.update({
      where: { id: runRecord.id },
      data: {
        status: "failed",
        completedAt: new Date(),
        lastError: message,
      },
    });
    return NextResponse.json({ runId: runRecord.id, error: message }, { status: 500 });
  }
}

export async function GET() {
  const runs = await prisma.orchestratorRun.findMany({
    orderBy: { startedAt: "desc" },
    take: 20,
  });
  return NextResponse.json(runs);
}
