/**
 * Runtime polyfills required by the GPSSA scraper.
 *
 * Several HTML/PDF dependencies (notably `pdf-parse`'s pdfjs sidecar and a
 * couple of cheerio v1 transitive deps) reference the `File` global at
 * module-load time. On Node < 20 — and on some Nixpacks-built Railway
 * containers even when `engines` requests Node 20 — that global is undefined,
 * which throws `ReferenceError: File is not defined` before our request
 * handler ever runs.
 *
 * Importing this module FIRST (before `cheerio` / `pdf-parse`) installs a
 * minimal stub so those imports survive. The stub is never instantiated by
 * our code paths — it just needs to exist as a constructor reference.
 */

const g = globalThis as unknown as { File?: unknown; Blob?: unknown };

if (typeof g.File === "undefined") {
  class FilePolyfill {
    name: string;
    lastModified: number;
    constructor(_bits: unknown[] = [], name = "", opts: { lastModified?: number } = {}) {
      this.name = name;
      this.lastModified = opts.lastModified ?? Date.now();
    }
  }
  g.File = FilePolyfill;
}

if (typeof g.Blob === "undefined") {
  class BlobPolyfill {
    constructor(_bits: unknown[] = [], _opts: Record<string, unknown> = {}) {
      void _bits;
      void _opts;
    }
  }
  g.Blob = BlobPolyfill;
}

export {};
