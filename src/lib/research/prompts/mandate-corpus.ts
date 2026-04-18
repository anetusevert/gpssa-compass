import type { PromptModule } from "../types";
import { parseJsonResponse } from "../types";

const systemPrompt = `You are a senior legal-policy analyst structuring the public mandate corpus of the General Pension and Social Security Authority (GPSSA) of the United Arab Emirates.

You receive ONE GPSSA source document at a time (a webpage, a federal law, an executive regulation, a circular, or a policy). Your job is to extract a strictly typed, citation-ready JSON shape that the GPSSA Compass platform will persist into:
- the canonical Standards / StandardRequirement library
- the GPSSA timeline of milestones
- the bridge linking each statutory obligation to existing GPSSA services / products / channels / segments / personas

Operating principles:
1. Faithfulness over cleverness. NEVER invent article numbers, dates, or obligations not present in the source. If a number/article/date is unclear, OMIT it instead of guessing.
2. Plain-English explainers are MANDATORY for every requirement. Each "description" must explain in 1-2 sentences what the article means for an ordinary citizen, employer, or pensioner -- this is the educational layer the UI surfaces.
3. Use existing slugs when extending an already-known law. Slugs are kebab-case, stable, and unambiguous (e.g. "uae-fl-57-2023", "uae-fl-57-2023-art-12", "circular-1-2024").
4. The legal-foundation hierarchy you should preserve:
   - Federal Law No. 57 of 2023 ("uae-fl-57-2023") -- PRIMARY current law
   - Executive Regulations of Federal Law No. 57 of 2023 ("uae-fl-57-2023-exec-reg")
   - Federal Law No. 7 of 1999 ("uae-fl-7-1999") -- historical / partial applicability
   - Federal Law No. 6 of 1999 ("uae-fl-6-1999") -- establishment of GPSSA, historical
   - GPSSA Circulars ("circular-<n>-<year>")
   - GPSSA Policies ("policy-<slug>")
5. Categorise each Standard with one of: "legal-mandate" | "circular" | "policy". Set scope = "national", region = "AE".
6. Tag each requirement with a pillar so the UI can group obligations: one of "registration" | "contribution" | "pension" | "end-of-service" | "injury" | "death" | "gcc" | "advisory" | "complaint" | "governance" | "transparency" | "digital" | "other".
7. obligationLinks bridge a requirement to existing GPSSA app entities. entityType is one of: "gpssa-service" | "product" | "delivery-channel" | "segment" | "persona". entityRef is a human-readable reference name (the writer will resolve to ids by name lookup -- if no good match exists, OMIT the link rather than fabricate).
8. Milestones are extracted ONLY from clearly historical/news pages. Each milestone needs a year (Number, four digits) and a 1-2 sentence description.

You MUST respond with valid JSON only. Use the exact shape requested in the user prompt.`;

function buildUserPrompt(items: { key: string; label: string; context?: string }[]): string {
  const item = items[0];
  if (!item) return "Return: {\"results\": []}";

  const context = item.context || "";
  const sectionMatch = context.match(/^\[section:([^\]]+)\]/);
  const section = sectionMatch ? sectionMatch[1] : "unknown";
  const url = (() => {
    const m = context.match(/\[url:([^\]]+)\]/);
    return m ? m[1] : "";
  })();
  const lang = (() => {
    const m = context.match(/\[lang:([^\]]+)\]/);
    return m ? m[1] : "en";
  })();
  const markdown = context
    .replace(/^\[section:[^\]]+\]\s*/, "")
    .replace(/\[url:[^\]]+\]\s*/, "")
    .replace(/\[lang:[^\]]+\]\s*/, "")
    .trim();

  return `Source page metadata:
- Page slug: ${item.key}
- Page title: ${item.label}
- Section: ${section}
- URL: ${url}
- Language: ${lang}

Source content (verbatim, may include markdown):
"""
${markdown.slice(0, 60_000)}
"""

Extract a JSON object with this exact shape (omit any sub-array that has no entries -- do NOT pad with empty objects):
{
  "results": [
    {
      "_itemKey": ${JSON.stringify(item.key)},
      "_itemLabel": ${JSON.stringify(item.label)},
      "sourceUrl": ${JSON.stringify(url)},
      "standards": [
        {
          "slug": "kebab-case stable id (e.g. uae-fl-57-2023)",
          "code": "official short code (e.g. FL-57/2023) or null",
          "title": "official full title in English",
          "category": "legal-mandate" | "circular" | "policy",
          "scope": "national",
          "region": "AE",
          "description": "2-4 sentence summary of what this instrument does, in plain English",
          "rationale": "1-2 sentences explaining why this matters for GPSSA's mandate",
          "url": "canonical URL of the document",
          "publishedAt": "YYYY-MM-DD or null"
        }
      ],
      "requirements": [
        {
          "standardSlug": "matches one of the standards above",
          "slug": "kebab-case stable id, unique within the standard",
          "code": "Article 12 / Section 3.2 / null",
          "title": "short title of the article or obligation",
          "description": "MANDATORY plain-English 1-2 sentence explainer of what this means for citizens / employers / pensioners",
          "pillar": "registration" | "contribution" | "pension" | "end-of-service" | "injury" | "death" | "gcc" | "advisory" | "complaint" | "governance" | "transparency" | "digital" | "other",
          "sortOrder": 0
        }
      ],
      "milestones": [
        {
          "year": 1999,
          "date": "YYYY-MM-DD or null",
          "title": "short title of the milestone",
          "description": "1-2 sentence narrative of what happened and why it matters",
          "kind": "milestone" | "reform" | "agreement" | "award" | "press",
          "sourceUrl": "URL or null"
        }
      ],
      "obligationLinks": [
        {
          "requirementSlug": "matches a requirement.slug above",
          "entityType": "gpssa-service" | "product" | "delivery-channel" | "segment" | "persona",
          "entityRef": "exact name of the existing GPSSA entity (e.g. 'Apply for End of Service - Civil', 'Retirement / Pension Coverage')",
          "rationale": "1 sentence explaining why this entity fulfils this obligation"
        }
      ]
    }
  ]
}

Notes:
- For non-legal pages (about, news, governance), the standards/requirements arrays may be empty -- focus on milestones.
- For laws/regulations/circulars, the milestones array may be empty -- focus on standards/requirements.
- If the page has no extractable mandate content, return { "results": [{ "_itemKey": ${JSON.stringify(item.key)}, "_itemLabel": ${JSON.stringify(item.label)}, "sourceUrl": ${JSON.stringify(url)} }] }.`;
}

export const mandateCorpusPrompt: PromptModule = {
  systemPrompt,
  buildUserPrompt,
  parseResponse: parseJsonResponse,
};
