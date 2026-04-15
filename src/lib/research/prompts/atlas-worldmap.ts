import type { PromptModule } from "../types";
import { parseJsonResponse } from "../types";
import {
  RESEARCH_SYSTEM_PROMPT,
  buildUserPrompt as canonicalBuildUserPrompt,
  parseResearchResponse,
} from "@/lib/countries/prompts";

function buildUserPrompt(items: { key: string; label: string }[]): string {
  return canonicalBuildUserPrompt(
    items.map((item) => ({ name: item.label, iso3: item.key }))
  );
}

function parseResponse(raw: string): Record<string, unknown>[] {
  const extracted = parseJsonResponse(raw);
  if (extracted.length === 0) return [];

  try {
    const fakeJson = JSON.stringify(extracted);
    const typed = parseResearchResponse(fakeJson);
    return typed as unknown as Record<string, unknown>[];
  } catch {
    return extracted.filter(
      (r): r is Record<string, unknown> =>
        r != null && typeof r === "object" && !Array.isArray(r)
    );
  }
}

export const atlasWorldmapPrompt: PromptModule = {
  systemPrompt: RESEARCH_SYSTEM_PROMPT,
  buildUserPrompt,
  parseResponse,
};
