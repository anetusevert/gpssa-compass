/**
 * CLI bootstrap for the GPSSA mandate corpus scraper.
 *
 * Usage:
 *   npx tsx scripts/scrape-gpssa.ts                 # English seeds, follow PDFs, write to DB + snapshot
 *   npx tsx scripts/scrape-gpssa.ts --no-pdfs       # skip PDF downloads
 *   npx tsx scripts/scrape-gpssa.ts --dry           # don't touch the DB or write snapshot
 *   npx tsx scripts/scrape-gpssa.ts --langs en,ar   # add Arabic mirror
 *
 * Output side-effects:
 *   - GpssaPage rows upserted by url
 *   - DataSource rows upserted by url
 *   - public/mandate-pdfs/*.pdf written
 *   - prisma/seeds/gpssa-corpus.json snapshot written
 */

import "dotenv/config";
import * as fs from "fs/promises";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { scrapeGpssaCorpus, type Lang, type ScrapedPage } from "../src/lib/research/scrapers/gpssa";

const prisma = new PrismaClient();

interface CliOptions {
  followPdfs: boolean;
  dry: boolean;
  langs: Lang[];
}

function parseCliArgs(argv: string[]): CliOptions {
  const opts: CliOptions = { followPdfs: true, dry: false, langs: ["en"] };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--no-pdfs") opts.followPdfs = false;
    else if (a === "--dry") opts.dry = true;
    else if (a === "--langs" && argv[i + 1]) {
      opts.langs = argv[i + 1]
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter((s): s is Lang => s === "en" || s === "ar");
      i++;
    }
  }
  return opts;
}

async function loadCachedHeaders() {
  const rows = await prisma.gpssaPage.findMany({
    select: { url: true, etag: true, lastModified: true },
  });
  const etags: Record<string, string> = {};
  const lastModified: Record<string, string> = {};
  for (const r of rows) {
    if (r.etag) etags[r.url] = r.etag;
    if (r.lastModified) lastModified[r.url] = r.lastModified;
  }
  return { etags, lastModified };
}

async function persistPages(pages: ScrapedPage[]) {
  for (const p of pages) {
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
}

async function writeSnapshot(pages: ScrapedPage[], errors: unknown) {
  const seedsDir = path.join(process.cwd(), "prisma", "seeds");
  await fs.mkdir(seedsDir, { recursive: true });
  const snap = {
    generatedAt: new Date().toISOString(),
    pageCount: pages.length,
    errors,
    pages,
  };
  const out = path.join(seedsDir, "gpssa-corpus.json");
  await fs.writeFile(out, JSON.stringify(snap, null, 2), "utf8");
  return out;
}

async function main() {
  const opts = parseCliArgs(process.argv);
  console.log(`[gpssa-scrape] starting langs=${opts.langs.join(",")} pdfs=${opts.followPdfs} dry=${opts.dry}`);

  const { etags, lastModified } = opts.dry ? { etags: {}, lastModified: {} } : await loadCachedHeaders();

  const result = await scrapeGpssaCorpus({
    langs: opts.langs,
    followPdfs: opts.followPdfs,
    pdfOutputDir: path.join(process.cwd(), "public", "mandate-pdfs"),
    cachedEtags: etags,
    cachedLastModified: lastModified,
  });

  console.log(`[gpssa-scrape] fetched ${result.pages.length} page(s), ${result.errors.length} error(s)`);
  for (const e of result.errors) {
    console.warn(`[gpssa-scrape] WARN  ${e.slug}  ${e.url}  ${e.message}`);
  }

  if (opts.dry) {
    console.log("[gpssa-scrape] dry mode -- skipping DB writes and snapshot");
    return;
  }

  await persistPages(result.pages);
  console.log(`[gpssa-scrape] persisted ${result.pages.length} GpssaPage row(s)`);

  const snapPath = await writeSnapshot(result.pages, result.errors);
  console.log(`[gpssa-scrape] wrote snapshot ${snapPath}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
