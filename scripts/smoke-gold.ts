/**
 * Gold-path smoke checks for leave-behind readiness.
 *
 * Usage (app must be running, or pass BASE_URL):
 *   BASE_URL=http://localhost:3000 npx tsx scripts/smoke-gold.ts
 *
 * Auth-gated checks that need a cookie can be skipped; unauthenticated
 * research lock and public health are always verified.
 */

const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");

async function check(
  name: string,
  fn: () => Promise<void>
): Promise<boolean> {
  try {
    await fn();
    console.log(`  OK  ${name}`);
    return true;
  } catch (e) {
    console.error(`  FAIL ${name}: ${e instanceof Error ? e.message : String(e)}`);
    return false;
  }
}

async function main() {
  console.log(`Smoke gold @ ${BASE}\n`);
  let passed = 0;
  let failed = 0;

  const run = async (name: string, fn: () => Promise<void>) => {
    if (await check(name, fn)) passed += 1;
    else failed += 1;
  };

  await run("GET / returns 200", async () => {
    const r = await fetch(`${BASE}/`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
  });

  await run("POST /api/research/run-all is locked (401/403)", async () => {
    const r = await fetch(`${BASE}/api/research/run-all`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ background: true }),
    });
    if (r.status !== 401 && r.status !== 403) {
      throw new Error(`expected 401/403, got ${r.status}`);
    }
  });

  await run("GET /api/briefing/snapshot requires auth (401) or returns data", async () => {
    const r = await fetch(`${BASE}/api/briefing/snapshot`, { cache: "no-store" });
    if (r.status === 401 || r.status === 403) return;
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = (await r.json()) as {
      services?: { count?: number; channelCapabilities?: unknown[] };
      mandate?: { sourcePages?: number };
      opportunities?: { count?: number };
    };
    if ((data.services?.count ?? 0) < 1) {
      throw new Error("services.count < 1 — reseed");
    }
    if ((data.mandate?.sourcePages ?? 0) < 1) {
      throw new Error("mandate.sourcePages < 1 — corpus missing");
    }
  });

  await run("GET /api/quality/framework or scorecards reachable shape", async () => {
    const r = await fetch(`${BASE}/api/quality/scorecards`, { cache: "no-store" });
    if (r.status === 401 || r.status === 403) return;
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
  });

  await run("GET /api/fulfilment/cases locked or populated", async () => {
    const r = await fetch(`${BASE}/api/fulfilment/cases`, { cache: "no-store" });
    if (r.status === 401 || r.status === 403) return;
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
  });

  console.log(`\nDone: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
