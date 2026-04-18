"use client";

import { useEffect, useRef } from "react";

export interface ResearchJobSnapshot {
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

export interface UseResearchUpdatesOptions {
  /**
   * Restrict to specific target screens (e.g. ["delivery-channels", "intl-services-channels"]).
   * If omitted, every screen update will trigger the callback.
   */
  targetScreens?: string[];
  /**
   * Called when one of the watched screen-jobs reaches a "completed" status (transition).
   */
  onComplete?: (job: ResearchJobSnapshot) => void;
  /**
   * Called whenever the snapshot of watched jobs changes — useful for live progress UIs.
   */
  onUpdate?: (jobs: ResearchJobSnapshot[]) => void;
  /**
   * Polling fallback interval (ms). Used when SSE is not available or fails.
   */
  pollIntervalMs?: number;
  /**
   * Disable the hook entirely (e.g. when component is hidden).
   */
  enabled?: boolean;
}

const DEFAULT_POLL_MS = 30_000;
const STREAM_PATH = "/api/research/screen-jobs/stream";
const POLL_PATH = "/api/research/screen-jobs?latest=true";

function matchesTarget(job: ResearchJobSnapshot, targets?: string[]): boolean {
  if (!targets || targets.length === 0) return true;
  return !!job.targetScreen && targets.includes(job.targetScreen);
}

export function useResearchUpdates(opts: UseResearchUpdatesOptions = {}): void {
  const {
    targetScreens,
    onComplete,
    onUpdate,
    pollIntervalMs = DEFAULT_POLL_MS,
    enabled = true,
  } = opts;

  const lastStatusRef = useRef<Map<string, string>>(new Map());
  const optsRef = useRef({ targetScreens, onComplete, onUpdate });

  useEffect(() => {
    optsRef.current = { targetScreens, onComplete, onUpdate };
  }, [targetScreens, onComplete, onUpdate]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    let cancelled = false;
    let es: EventSource | null = null;
    let pollTimer: number | null = null;

    function handleSnapshot(jobs: ResearchJobSnapshot[]) {
      if (cancelled) return;
      const { targetScreens: ts, onComplete: oc, onUpdate: ou } = optsRef.current;
      const watched = jobs.filter((j) => matchesTarget(j, ts));
      if (watched.length === 0) return;

      ou?.(watched);

      if (oc) {
        for (const job of watched) {
          const prev = lastStatusRef.current.get(job.id);
          if (prev !== "completed" && job.status === "completed") {
            try {
              oc(job);
            } catch {
              // swallow consumer errors
            }
          }
          lastStatusRef.current.set(job.id, job.status);
        }
      } else {
        for (const job of watched) lastStatusRef.current.set(job.id, job.status);
      }
    }

    async function pollOnce() {
      try {
        const res = await fetch(POLL_PATH, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as Array<Record<string, unknown>>;
        if (!Array.isArray(data)) return;
        const mapped: ResearchJobSnapshot[] = data.map((j) => ({
          id: String(j.id),
          status: String(j.status ?? "pending"),
          totalItems: Number(j.totalItems ?? 0),
          completedItems: Number(j.completedItems ?? 0),
          failedItems: Number(j.failedItems ?? 0),
          targetScreen: ((j.agentConfig as Record<string, unknown> | null)?.targetScreen as string | null) ?? null,
          agentConfigId: (j.agentConfigId as string | null) ?? null,
          agentName: ((j.agentConfig as Record<string, unknown> | null)?.name as string | null) ?? null,
          startedAt: (j.startedAt as string | null) ?? null,
          completedAt: (j.completedAt as string | null) ?? null,
          updatedAt: String(j.updatedAt ?? new Date().toISOString()),
        }));
        handleSnapshot(mapped);
      } catch {
        // ignore poll errors
      }
    }

    function startPollFallback() {
      if (pollTimer != null) return;
      pollOnce();
      pollTimer = window.setInterval(pollOnce, pollIntervalMs);
    }

    try {
      es = new EventSource(STREAM_PATH);
      es.addEventListener("snapshot", (event) => {
        try {
          const data = JSON.parse((event as MessageEvent).data) as ResearchJobSnapshot[];
          handleSnapshot(data);
        } catch {
          // malformed event
        }
      });
      es.addEventListener("update", (event) => {
        try {
          const data = JSON.parse((event as MessageEvent).data) as ResearchJobSnapshot[];
          handleSnapshot(data);
        } catch {
          // malformed event
        }
      });
      es.addEventListener("error", () => {
        // EventSource auto-reconnects; if persistently failing, also keep poll fallback running.
        startPollFallback();
      });
    } catch {
      startPollFallback();
    }

    // Always run a slow poll fallback in addition to SSE so that any missed events still surface.
    startPollFallback();

    return () => {
      cancelled = true;
      es?.close();
      if (pollTimer != null) window.clearInterval(pollTimer);
    };
  }, [enabled, pollIntervalMs]);
}
