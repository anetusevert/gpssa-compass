import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import type { Lang } from "@/lib/research/scrapers/gpssa";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * POST /api/mandate/scrape
 *
 * Admin-only endpoint that runs the GPSSA public-corpus scraper, persists each
 * page (and any sidecar PDFs) into GpssaPage + DataSource, and returns a
 * summary the admin UI can render. This is the live, on-demand counterpart to
 * `npx tsx scripts/scrape-gpssa.ts` -- both produce the same persistence shape.
 *
 * Body (all fields optional):
 *   {
 *     "langs": ["en"] | ["en", "ar"],
 *     "followPdfs": false,   // opt-in only on the API; PDFs go to os.tmpdir() on the server
 *     "force": false         // when true, ignores cached ETag/Last-Modified
 *   }
 */
export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  let body: { langs?: string[]; followPdfs?: boolean; force?: boolean } = {};
  try {
    const text = await request.text();
    body = text ? JSON.parse(text) : {};
  } catch {
    body = {};
  }

  const langs: Lang[] =
    body.langs && body.langs.length > 0
      ? (body.langs.filter((l) => l === "en" || l === "ar") as Lang[])
      : ["en"];
  // PDFs default to OFF on the API to keep request times under proxy limits.
  // The admin UI exposes a "Follow PDFs" checkbox so an operator can opt-in.
  const followPdfs = body.followPdfs === true;
  const force = !!body.force;

  try {
    const cachedEtags: Record<string, string> = {};
    const cachedLastModified: Record<string, string> = {};
    if (!force) {
      const rows = await prisma.gpssaPage.findMany({
        select: { url: true, etag: true, lastModified: true },
      });
      for (const r of rows) {
        if (r.etag) cachedEtags[r.url] = r.etag;
        if (r.lastModified) cachedLastModified[r.url] = r.lastModified;
      }
    }

    const { scrapeGpssaCorpus } = await import("@/lib/research/scrapers/gpssa");
    const result = await scrapeGpssaCorpus({
      langs,
      followPdfs,
      cachedEtags,
      cachedLastModified,
    });

    const ops = result.pages.flatMap((p) => [
      prisma.gpssaPage.upsert({
        where: { url: p.url },
        update: {
          slug: p.slug,
          lang: p.lang,
          title: p.title,
          section: p.section,
          contentType: p.contentType,
          htmlSnapshot: p.htmlSnapshot,
          markdown: p.markdown,
          etag: p.etag,
          lastModified: p.lastModified,
          pdfPath: p.pdfPath,
          hash: p.hash,
          scrapedAt: new Date(),
        },
        create: {
          slug: p.slug,
          url: p.url,
          lang: p.lang,
          title: p.title,
          section: p.section,
          contentType: p.contentType,
          htmlSnapshot: p.htmlSnapshot,
          markdown: p.markdown,
          etag: p.etag,
          lastModified: p.lastModified,
          pdfPath: p.pdfPath,
          hash: p.hash,
        },
      }),
      prisma.dataSource.upsert({
        where: { id: `gpssa-${p.slug}` },
        update: {
          title: p.title,
          url: p.url,
          publisher: "General Pension and Social Security Authority",
          sourceType: p.contentType === "pdf" ? "regulation" : "website",
          region: "AE",
          accessedAt: new Date(),
        },
        create: {
          id: `gpssa-${p.slug}`,
          title: p.title,
          url: p.url,
          publisher: "General Pension and Social Security Authority",
          sourceType: p.contentType === "pdf" ? "regulation" : "website",
          region: "AE",
          accessedAt: new Date(),
        },
      }),
    ]);

    const BATCH = 25;
    for (let i = 0; i < ops.length; i += BATCH) {
      await prisma.$transaction(ops.slice(i, i + BATCH));
    }

    return NextResponse.json({
      ok: true,
      persisted: result.pages.length,
      errorCount: result.errors.length,
      errors: result.errors.slice(0, 25),
      startedAt: result.startedAt,
      finishedAt: result.finishedAt,
      followPdfs,
    });
  } catch (err) {
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as { code?: unknown }).code)
        : "UNKNOWN";
    const message = err instanceof Error ? err.message : String(err);

    if (code === "P2021") {
      return NextResponse.json(
        {
          ok: false,
          code,
          message:
            "GpssaPage / GpssaMilestone tables missing in the database. Redeploy with `prisma db push` so the new mandate schema is applied.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: false, code, message }, { status: 500 });
  }
}
