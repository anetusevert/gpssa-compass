/**
 * GPSSA public corpus scraper.
 *
 * Politely crawls a curated seed list of pages on gpssa.gov.ae plus any
 * PDF documents linked from the laws/regulations/circulars/policies page.
 *
 * Output: an array of GpssaPage upsert-ready records (one per HTML page or
 * PDF document) plus the sidecar PDF binaries written into public/mandate-pdfs/.
 *
 * Design constraints (see plan):
 *   - User-Agent identifies the project + a contact address.
 *   - Concurrency is throttled to 2 in-flight requests at a time.
 *   - Each request has a 12s timeout (network RTT to AE can be slow).
 *   - ETag / Last-Modified are honoured when cached values are passed in.
 *   - The English seeds are crawled by default; Arabic mirroring is
 *     parameterised but disabled for the demo.
 *   - The function never throws on a single page failure -- failures are
 *     captured per-page and reported in the result object.
 */

// MUST come before any other scraper import: installs the `File`/`Blob`
// globals on Node runtimes (Railway/Nixpacks containers) that don't expose
// them, so cheerio/pdf-parse don't throw at module-load time.
import "./polyfill";
import pLimit from "p-limit";
import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import { htmlToMarkdown, pdfToMarkdown, sha256 } from "./normalize";

const USER_AGENT = "GPSSACompass/1.0 (+contact@adlittle.com)";
const REQUEST_TIMEOUT_MS = 12_000;
const PAGE_CONCURRENCY = 2;

export type Lang = "en" | "ar";

interface SeedPage {
  slug: string;
  url: string;
  section: string;
  followPdfs?: boolean;
}

const SEED_PAGES_EN: SeedPage[] = [
  { slug: "laws-and-regulations", url: "https://gpssa.gov.ae/pages/en/laws-and-regulations", section: "legal", followPdfs: true },
  { slug: "about-overview", url: "https://gpssa.gov.ae/pages/en/about-us/overview", section: "about" },
  { slug: "about-strategic-plan", url: "https://gpssa.gov.ae/pages/en/about-us/strategic-plan", section: "governance" },
  { slug: "about-board-of-directors", url: "https://gpssa.gov.ae/pages/en/about-us/board-of-directors", section: "governance" },
  { slug: "about-organization-hierarchy", url: "https://gpssa.gov.ae/pages/en/about-us/organization-hierarchy", section: "governance" },
  { slug: "about-glossary", url: "https://gpssa.gov.ae/pages/en/about-us/glossary", section: "about" },
  { slug: "about-careers", url: "https://gpssa.gov.ae/pages/en/about-us/careers", section: "about" },
  { slug: "about-agreements", url: "https://gpssa.gov.ae/pages/en/about-us/agreements", section: "governance" },
  { slug: "about-sdg", url: "https://gpssa.gov.ae/pages/en/about-us/sustainable-development-goals", section: "governance" },
  { slug: "services-overview", url: "https://gpssa.gov.ae/pages/en/services/overview", section: "services" },
  { slug: "services-gcc-overview", url: "https://gpssa.gov.ae/pages/en/services/overview/gcc-overview", section: "services" },
  { slug: "services-all", url: "https://gpssa.gov.ae/pages/en/services/all-services", section: "services" },
  { slug: "tools-merge-years", url: "https://gpssa.gov.ae/pages/en/services/tools/merge-years-calculator", section: "services" },
  { slug: "tools-eos-calculator", url: "https://gpssa.gov.ae/pages/en/services/tools/end-of-service-calculator", section: "services" },
  { slug: "digital-participation-policy", url: "https://gpssa.gov.ae/pages/en/digital-participation/digital-participation-policy", section: "policy" },
  { slug: "open-data-policy", url: "https://gpssa.gov.ae/pages/en/open-data/open-data-policy", section: "policy" },
  { slug: "open-data-plan", url: "https://gpssa.gov.ae/pages/en/open-data/open-data-plan", section: "policy" },
  { slug: "more-news", url: "https://gpssa.gov.ae/pages/en/more/news", section: "news" },
  { slug: "more-press-kit", url: "https://gpssa.gov.ae/pages/en/more/press-kit", section: "news" },
  { slug: "more-contact-us", url: "https://gpssa.gov.ae/pages/en/more/contact-us", section: "about" },
];

const SEED_PAGES_AR: SeedPage[] = SEED_PAGES_EN.map((p) => ({
  ...p,
  slug: `${p.slug}-ar`,
  url: p.url.replace("/pages/en/", "/pages/ar/"),
}));

export interface ScrapedPage {
  slug: string;
  url: string;
  lang: Lang;
  title: string;
  section: string;
  contentType: "html" | "pdf";
  htmlSnapshot: string | null;
  markdown: string;
  etag: string | null;
  lastModified: string | null;
  pdfPath: string | null;
  hash: string;
}

export interface ScrapeError {
  slug: string;
  url: string;
  message: string;
}

export interface ScrapeResult {
  pages: ScrapedPage[];
  errors: ScrapeError[];
  startedAt: string;
  finishedAt: string;
}

export interface ScrapeOptions {
  langs?: Lang[];
  sectionFilter?: string[];
  followPdfs?: boolean;
  pdfOutputDir?: string;
  cachedEtags?: Record<string, string>;
  cachedLastModified?: Record<string, string>;
}

async function fetchWithTimeout(url: string, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/pdf,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        ...(init.headers || {}),
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

function safePdfFilename(url: string, slugPrefix: string): string {
  const tail = (url.split("/").pop() || "document.pdf").split("?")[0].split("#")[0];
  const safe = tail.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(-80);
  return `${slugPrefix}--${safe}`;
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

async function downloadPdf(
  url: string,
  outDir: string,
  slugPrefix: string
): Promise<{ pdfPath: string; relPath: string; buffer: Buffer; etag: string | null; lastModified: string | null } | null> {
  const res = await fetchWithTimeout(url);
  if (!res.ok) return null;
  const ab = await res.arrayBuffer();
  const buf = Buffer.from(ab);
  await ensureDir(outDir);
  const fileName = safePdfFilename(url, slugPrefix);
  const fullPath = path.join(outDir, fileName);
  await fs.writeFile(fullPath, buf);
  const relPath = `/mandate-pdfs/${fileName}`;
  return {
    pdfPath: fullPath,
    relPath,
    buffer: buf,
    etag: res.headers.get("etag"),
    lastModified: res.headers.get("last-modified"),
  };
}

export async function scrapeGpssaCorpus(opts: ScrapeOptions = {}): Promise<ScrapeResult> {
  const langs: Lang[] = opts.langs && opts.langs.length > 0 ? opts.langs : ["en"];
  const sectionFilter = opts.sectionFilter && opts.sectionFilter.length > 0 ? new Set(opts.sectionFilter) : null;
  const followPdfs = opts.followPdfs !== false;
  const pdfOutputDir = opts.pdfOutputDir || path.join(os.tmpdir(), "gpssa-pdfs");
  const cachedEtags = opts.cachedEtags || {};
  const cachedLastModified = opts.cachedLastModified || {};

  const startedAt = new Date().toISOString();
  const pages: ScrapedPage[] = [];
  const errors: ScrapeError[] = [];

  const seeds: { lang: Lang; page: SeedPage }[] = [];
  for (const lang of langs) {
    const seedSet = lang === "en" ? SEED_PAGES_EN : SEED_PAGES_AR;
    for (const page of seedSet) {
      if (sectionFilter && !sectionFilter.has(page.section)) continue;
      seeds.push({ lang, page });
    }
  }

  const limit = pLimit(PAGE_CONCURRENCY);

  await Promise.all(
    seeds.map((seed) =>
      limit(async () => {
        const { lang, page } = seed;
        try {
          const headers: Record<string, string> = {};
          if (cachedEtags[page.url]) headers["If-None-Match"] = cachedEtags[page.url];
          if (cachedLastModified[page.url]) headers["If-Modified-Since"] = cachedLastModified[page.url];

          const res = await fetchWithTimeout(page.url, { headers });
          if (res.status === 304) return;
          if (!res.ok) {
            errors.push({ slug: page.slug, url: page.url, message: `HTTP ${res.status}` });
            return;
          }
          const html = await res.text();
          const { title, markdown, pdfLinks } = htmlToMarkdown(html, page.url);
          const safeTitle = title || page.slug;
          const hash = sha256(markdown);

          pages.push({
            slug: page.slug,
            url: page.url,
            lang,
            title: safeTitle,
            section: page.section,
            contentType: "html",
            htmlSnapshot: html,
            markdown,
            etag: res.headers.get("etag"),
            lastModified: res.headers.get("last-modified"),
            pdfPath: null,
            hash,
          });

          if (followPdfs && page.followPdfs && pdfLinks.length > 0) {
            const pdfLimit = pLimit(2);
            await Promise.all(
              pdfLinks.map((link) =>
                pdfLimit(async () => {
                  try {
                    const downloaded = await downloadPdf(link.url, pdfOutputDir, page.slug);
                    if (!downloaded) {
                      errors.push({ slug: page.slug, url: link.url, message: "PDF download failed" });
                      return;
                    }
                    const { title: pdfTitle, markdown: pdfMd } = await pdfToMarkdown(downloaded.buffer);
                    const pdfSlug = `${page.slug}--pdf-${sha256(link.url).slice(0, 8)}`;
                    pages.push({
                      slug: pdfSlug,
                      url: link.url,
                      lang,
                      title: link.text || pdfTitle || pdfSlug,
                      section: page.section,
                      contentType: "pdf",
                      htmlSnapshot: null,
                      markdown: pdfMd,
                      etag: downloaded.etag,
                      lastModified: downloaded.lastModified,
                      pdfPath: downloaded.relPath,
                      hash: sha256(pdfMd),
                    });
                  } catch (err) {
                    errors.push({
                      slug: page.slug,
                      url: link.url,
                      message: err instanceof Error ? err.message : String(err),
                    });
                  }
                })
              )
            );
          }
        } catch (err) {
          errors.push({
            slug: page.slug,
            url: page.url,
            message: err instanceof Error ? err.message : String(err),
          });
        }
      })
    )
  );

  return {
    pages,
    errors,
    startedAt,
    finishedAt: new Date().toISOString(),
  };
}

export const GPSSA_SEED_SECTIONS = ["legal", "about", "governance", "services", "policy", "news"] as const;
