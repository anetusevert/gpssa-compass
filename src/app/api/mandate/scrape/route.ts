import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { scrapeGpssaCorpus, type Lang } from "@/lib/research/scrapers/gpssa";

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
 *     "followPdfs": true,
 *     "force": false   // when true, ignores cached ETag/Last-Modified
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
  const followPdfs = body.followPdfs !== false;
  const force = !!body.force;

  let cachedEtags: Record<string, string> = {};
  let cachedLastModified: Record<string, string> = {};
  if (!force) {
    const rows = await prisma.gpssaPage.findMany({
      select: { url: true, etag: true, lastModified: true },
    });
    for (const r of rows) {
      if (r.etag) cachedEtags[r.url] = r.etag;
      if (r.lastModified) cachedLastModified[r.url] = r.lastModified;
    }
  }

  const result = await scrapeGpssaCorpus({
    langs,
    followPdfs,
    cachedEtags,
    cachedLastModified,
  });

  for (const p of result.pages) {
    await prisma.gpssaPage.upsert({
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
    });

    await prisma.dataSource.upsert({
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
    });
  }

  return NextResponse.json({
    ok: true,
    persisted: result.pages.length,
    errorCount: result.errors.length,
    errors: result.errors.slice(0, 25),
    startedAt: result.startedAt,
    finishedAt: result.finishedAt,
  });
}
