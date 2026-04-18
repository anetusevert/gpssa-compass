/**
 * Normalisation helpers for the GPSSA corpus scraper.
 *
 * htmlToMarkdown: cheerio-based extraction of the meaningful content of a
 *   GPSSA page, stripping nav/footer/script/aside chrome and producing a
 *   readable markdown surface that the structuring LLM can chew through.
 *
 * pdfToMarkdown: pdf-parse based extraction with light formatting fixes.
 */

import * as cheerio from "cheerio";
import pdfParse from "pdf-parse";
import { createHash } from "crypto";

const STRIPPED_SELECTORS = [
  "script",
  "style",
  "noscript",
  "header",
  "footer",
  "nav",
  "aside",
  ".nav",
  ".footer",
  ".header",
  ".navbar",
  ".breadcrumbs",
  ".social-share",
  ".sidebar",
  ".accessibility",
  ".cookie",
  ".search-box",
  ".user-menu",
  ".language-switcher",
  ".voice-commands",
  "[role=navigation]",
  "[role=banner]",
  "[role=contentinfo]",
];

const CONTENT_SELECTORS = [
  "main",
  "article",
  "[role=main]",
  ".main-content",
  ".content",
  ".page-content",
  ".inner-content",
  "#main-content",
  "#content",
];

interface PdfLinkRef {
  url: string;
  text: string;
}

export interface HtmlExtraction {
  title: string;
  markdown: string;
  pdfLinks: PdfLinkRef[];
}

export function htmlToMarkdown(rawHtml: string, baseUrl: string): HtmlExtraction {
  const $ = cheerio.load(rawHtml);

  const title =
    ($("meta[property='og:title']").attr("content") ||
      $("title").first().text() ||
      $("h1").first().text() ||
      "")
      .replace(/\s+/g, " ")
      .trim();

  for (const sel of STRIPPED_SELECTORS) {
    $(sel).remove();
  }

  let $root: cheerio.Cheerio<cheerio.AnyNode> | null = null;
  for (const sel of CONTENT_SELECTORS) {
    const $candidate = $(sel).first();
    if ($candidate.length > 0) {
      $root = $candidate;
      break;
    }
  }
  if (!$root) $root = $("body");

  const pdfLinks: PdfLinkRef[] = [];
  $root.find("a[href]").each((_, el) => {
    const href = ($(el).attr("href") || "").trim();
    if (!href) return;
    if (!/\.pdf(\?|#|$)/i.test(href)) return;
    let abs = href;
    try {
      abs = new URL(href, baseUrl).toString();
    } catch {
      return;
    }
    const text = $(el).text().replace(/\s+/g, " ").trim() || abs.split("/").pop() || abs;
    pdfLinks.push({ url: abs, text });
  });

  const lines: string[] = [];
  $root.find("h1, h2, h3, h4, h5, h6, p, li, blockquote, td, th").each((_, el) => {
    const tag = el.tagName?.toLowerCase();
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (!text) return;
    if (tag === "h1") lines.push(`# ${text}`);
    else if (tag === "h2") lines.push(`## ${text}`);
    else if (tag === "h3") lines.push(`### ${text}`);
    else if (tag === "h4") lines.push(`#### ${text}`);
    else if (tag === "h5" || tag === "h6") lines.push(`##### ${text}`);
    else if (tag === "li") lines.push(`- ${text}`);
    else if (tag === "blockquote") lines.push(`> ${text}`);
    else lines.push(text);
  });

  const seen = new Set<string>();
  const dedup: string[] = [];
  for (const line of lines) {
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    dedup.push(line);
  }

  const markdown = dedup.join("\n\n").trim();
  return { title, markdown, pdfLinks };
}

export async function pdfToMarkdown(buf: Buffer): Promise<{ title: string; markdown: string }> {
  const parsed = await pdfParse(buf);
  const raw = parsed.text || "";
  const cleaned = raw
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.replace(/\s+$/g, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const firstLine = cleaned.split("\n").find((l) => l.trim().length > 0) || "";
  const title = firstLine.slice(0, 160);
  return { title, markdown: cleaned };
}

export function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}
