import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface StreamSnapshot {
  id: string;
  status: string;
  totalItems: number;
  completedItems: number;
  failedItems: number;
  targetScreen: string | null;
  agentConfigId: string | null;
  agentName: string | null;
  startedAt: string | null;
  completedAt: string | null;
  updatedAt: string;
}

const POLL_INTERVAL_MS = 3000;

async function fetchSnapshot(): Promise<StreamSnapshot[]> {
  const jobs = await prisma.researchJob.findMany({
    where: { type: { not: "country-research" } },
    include: {
      agentConfig: { select: { id: true, name: true, targetScreen: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return jobs.map((job) => ({
    id: job.id,
    status: job.status,
    totalItems: job.totalItems,
    completedItems: job.completedItems,
    failedItems: job.failedItems,
    targetScreen: job.agentConfig?.targetScreen ?? null,
    agentConfigId: job.agentConfigId,
    agentName: job.agentConfig?.name ?? null,
    startedAt: job.startedAt?.toISOString() ?? null,
    completedAt: job.completedAt?.toISOString() ?? null,
    updatedAt: job.updatedAt.toISOString(),
  }));
}

function snapshotKey(s: StreamSnapshot): string {
  return `${s.id}:${s.status}:${s.completedItems}:${s.failedItems}:${s.updatedAt}`;
}

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let lastKey = "";
      let closed = false;

      function send(event: string, data: unknown) {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          closed = true;
        }
      }

      try {
        const initial = await fetchSnapshot();
        send("snapshot", initial);
        lastKey = initial.map(snapshotKey).join("|");
      } catch (err) {
        const message = err instanceof Error ? err.message : "snapshot_failed";
        send("error", { message });
      }

      const interval = setInterval(async () => {
        if (closed) return;
        try {
          const snapshot = await fetchSnapshot();
          const key = snapshot.map(snapshotKey).join("|");
          if (key !== lastKey) {
            send("update", snapshot);
            lastKey = key;
          }
          // Keep-alive comment
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch (err) {
          const message = err instanceof Error ? err.message : "poll_failed";
          send("error", { message });
        }
      }, POLL_INTERVAL_MS);

      const cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(interval);
        try {
          controller.close();
        } catch {
          // already closed
        }
      };

      // Tie cleanup to stream cancellation
      (controller as unknown as { _cleanup?: () => void })._cleanup = cleanup;
    },
    cancel() {
      const c = this as unknown as { _cleanup?: () => void };
      c._cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
