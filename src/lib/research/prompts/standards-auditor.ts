/**
 * Standards Auditor
 *
 * A second-pass meta-agent that takes a single canonical Standard from
 * the library (passed in `_itemKey` as the standard slug) and audits
 * GPSSA's existing service / channel / product / persona / segment data
 * against every requirement of that standard.
 *
 * It outputs a single result row per audited entity, scored against the
 * standard's requirements, with per-requirement evidence notes. The
 * standards-bridge writer will persist these into StandardCompliance +
 * StandardComplianceItem rows automatically.
 */

import type { PromptModule } from "../types";
import { parseJsonResponse } from "../types";
import { STANDARDS_CATALOG } from "@/lib/standards/catalog";

const systemPrompt = `You are an independent Standards Auditor evaluating a social-security institution against globally accepted reference frameworks (ILO, ISSA, World Bank, OECD, Mercer CFA, UN). You are rigorous, evidence-based and produce structured, replicable assessments.

Your output is consumed downstream to populate a compliance database. You MUST respond with valid JSON only.`;

function buildUserPrompt(items: { key: string; label: string; context?: string }[]): string {
  const item = items[0];
  const standardSlug = item.key;

  // Look up the requirements list for the standard so the audit is bounded.
  const std = STANDARDS_CATALOG.find((s) => s.slug === standardSlug);
  const requirements = std?.requirements ?? [];

  const reqText = requirements
    .map(
      (r, i) =>
        `  ${i + 1}. [${r.slug}]${r.code ? ` (${r.code})` : ""} ${r.title}${r.pillar ? ` — pillar: ${r.pillar}` : ""}${r.weight ? `, weight ${r.weight}` : ""}`
    )
    .join("\n");

  return `Audit GPSSA (General Pension and Social Security Authority — UAE) against the standard:

  ${std?.code ? std.code + " — " : ""}${item.label}
  Slug: ${standardSlug}
  ${std?.description ?? ""}

This standard breaks down into ${requirements.length} formal requirements:
${reqText}

Produce a single JSON object with a "results" array containing exactly ONE result — the GPSSA-level audit:

{
  "results": [
    {
      "entityType": "institution",
      "entityName": "General Pension and Social Security Authority (GPSSA)",
      "countryIso3": "ARE",
      "standardSlug": "${standardSlug}",
      "overallScore": number (0-100),
      "overallBand": "leading | advanced | competent | developing | basic",
      "summary": "string — 2-3 sentence summary of GPSSA's standing on this standard",
      "strengths": ["string", "string"],
      "gaps": ["string", "string"],
      "recommendations": ["string", "string", "string"],
      "requirementScores": [
        {
          "requirementSlug": "string — must match one of the slugs above",
          "score": number (0-100),
          "status": "met | partial | not-met",
          "evidence": "string — 1-2 sentence factual justification with sources where possible"
        }
      ],
      "standardsAlignment": [
        {
          "standardSlug": "${standardSlug}",
          "score": number (0-100),
          "band": "leading | advanced | competent | developing | basic",
          "rationale": "string",
          "requirementSlugs": ["string", "string"]
        }
      ],
      "sources": [
        { "title": "string", "url": "string", "publisher": "string", "publishedDate": "string", "evidenceNote": "string" }
      ]
    }
  ]
}

Be specific, factual, and cite the GPSSA Federal Pension Law (No. 7 of 1999), GPSSA annual reports, MoHRE statistics, and the standard's own publication where relevant.`;
}

export const standardsAuditorPrompt: PromptModule = {
  systemPrompt,
  buildUserPrompt,
  parseResponse: parseJsonResponse,
};
